import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { prisma } from '@/lib/prisma'
import { getTenantBySlug } from '@/lib/tenant'
import { sendOrderConfirmationEmail } from '@/lib/emails'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string)

function generateOrderNumber(entitySlug: string): string {
  const year = new Date().getFullYear()
  const random = Math.floor(Math.random() * 9000) + 1000
  const prefix = entitySlug.toUpperCase().slice(0, 3)
  return `${prefix}-${year}-${random}`
}

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')

  if (!sig) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 })
  }

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET as string)
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  if (event.type !== 'checkout.session.completed') {
    return NextResponse.json({ received: true })
  }

  const session = event.data.object as Stripe.Checkout.Session

  if (session.payment_status !== 'paid') {
    return NextResponse.json({ received: true })
  }

  // Idempotency guard — Stripe may deliver the same event more than once
  const existing = await prisma.order.findFirst({
    where: { stripeSessionId: session.id },
  })
  if (existing) {
    return NextResponse.json({ received: true })
  }

  const meta = session.metadata as {
    tenantSlug: string
    customerName: string
    customerEmail: string
    designData: string
  }

  const tenant = await getTenantBySlug(meta.tenantSlug)
  if (!tenant) {
    console.error('Webhook: tenant not found for slug', meta.tenantSlug)
    return NextResponse.json({ error: 'Tenant not found' }, { status: 400 })
  }

  const designData = JSON.parse(meta.designData)
  const amountPaid = session.amount_total ?? 0
  const plateTextFinal = (designData.plateText || '').toUpperCase().trim()

  if (plateTextFinal) {
    const duplicate = await prisma.order.findFirst({
      where: { plateText: plateTextFinal },
      select: { id: true },
    })
    if (duplicate) {
      console.error('Webhook: duplicate plate text', plateTextFinal, 'for session', session.id)
      return NextResponse.json({ received: true })
    }
  }

  const design = await prisma.design.create({
    data: {
      tenantTemplateId: designData.tenantTemplateId,
      zonePlacements: designData.zonePlacements,
      renderConfig: { scale: 1, quality: 'high', scene: designData.scene || 'peach' },
      status: 'FINAL',
      guestEmail: meta.customerEmail,
    },
  })

  let orderNumber = generateOrderNumber(meta.tenantSlug)
  let attempts = 0
  while (attempts < 5) {
    const collision = await prisma.order.findUnique({ where: { orderNumber } })
    if (!collision) break
    orderNumber = generateOrderNumber(meta.tenantSlug)
    attempts++
  }

  const order = await prisma.order.create({
    data: {
      designId: design.id,
      entityId: tenant.id,
      orderNumber,
      status: 'SUBMITTED',
      customerName: meta.customerName,
      customerEmail: meta.customerEmail,
      stripeSessionId: session.id,
      amountPaid,
      plateText: plateTextFinal,
      notificationLog: [
        { type: 'payment', message: 'Payment confirmed via Stripe', timestamp: new Date().toISOString() },
      ],
    },
  })

  try {
    await sendOrderConfirmationEmail({
      to: meta.customerEmail,
      orderId: order.orderNumber,
      plateText: designData.plateText || 'your plate',
      cityName: designData.cityName || 'your city',
    })
  } catch (err) {
    console.error('Confirmation email failed:', err)
  }

  return NextResponse.json({ received: true })
}
