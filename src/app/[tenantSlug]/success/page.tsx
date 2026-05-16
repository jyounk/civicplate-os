import { redirect } from 'next/navigation'
import { getTenantBySlug } from '@/lib/tenant'
import { prisma } from '@/lib/prisma'
import Stripe from 'stripe'
import { sendOrderConfirmationEmail } from '@/lib/emails'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string)

function generateOrderNumber(entitySlug: string): string {
  const year = new Date().getFullYear()
  const random = Math.floor(Math.random() * 9000) + 1000
  const prefix = entitySlug.toUpperCase().slice(0, 3)
  return prefix + '-' + year + '-' + random
}

type Props = { searchParams: Promise<{ session_id?: string }>; params: Promise<{ tenantSlug: string }> }

export default async function SuccessPage({ params, searchParams }: Props) {
  const { tenantSlug } = await params
  const { session_id } = await searchParams

  if (!session_id) redirect('/' + tenantSlug)

  const tenant = await getTenantBySlug(tenantSlug)
  if (!tenant) redirect('/' + tenantSlug)

  // Check if order already exists for this session (prevents duplicates on refresh)
  const existing = await prisma.order.findFirst({
    where: { stripeSessionId: session_id },
  })
  if (existing) redirect('/' + tenantSlug + '/confirmation/' + existing.orderNumber)

  // Verify payment with Stripe
  let session
  try {
    session = await stripe.checkout.sessions.retrieve(session_id)
  } catch (err) {
    redirect('/' + tenantSlug)
  }

  if (session.payment_status !== 'paid') redirect('/' + tenantSlug)

  // Extract metadata saved when checkout session was created
  const meta = session.metadata as {
    tenantSlug: string
    customerName: string
    customerEmail: string
    designData: string
  }

  const designData = JSON.parse(meta.designData)

  // Save design
  const design = await prisma.design.create({
    data: {
      tenantTemplateId: designData.tenantTemplateId,
      zonePlacements: designData.zonePlacements,
      renderConfig: { scale: 1, quality: 'high' },
      status: 'FINAL',
      guestEmail: meta.customerEmail,
    },
  })

  // Generate unique order number
  let orderNumber = generateOrderNumber(tenantSlug)
  let attempts = 0
  while (attempts < 5) {
    const existing = await prisma.order.findUnique({ where: { orderNumber } })
    if (!existing) break
    orderNumber = generateOrderNumber(tenantSlug)
    attempts++
  }

  // Save order
  const order = await prisma.order.create({
    data: {
      designId: design.id,
      entityId: tenant.id,
      orderNumber,
      status: 'SUBMITTED',
      customerName: meta.customerName,
      customerEmail: meta.customerEmail,
      stripeSessionId: session_id,
      notificationLog: [
        { type: 'payment', message: 'Payment confirmed via Stripe', timestamp: new Date().toISOString() }
      ],
    },
  })

  // Send confirmation email
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

  redirect('/' + tenantSlug + '/confirmation/' + order.orderNumber)
}