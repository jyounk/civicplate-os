'use server'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { sendOrderConfirmationEmail } from '@/lib/emails'

function generateOrderNumber(entitySlug: string): string {
  const year = new Date().getFullYear()
  const random = Math.floor(Math.random() * 9000) + 1000
  const prefix = entitySlug.toUpperCase().slice(0, 3)
  return prefix + '-' + year + '-' + random
}

export async function submitPlateOrder(formData: FormData) {
  const tenantTemplateId = formData.get('tenantTemplateId') as string
  const entityId = formData.get('entityId') as string
  const entitySlug = formData.get('entitySlug') as string
  const customerName = formData.get('customerName') as string
  const customerEmail = formData.get('customerEmail') as string
  const zonePlacementsRaw = formData.get('zonePlacements') as string
  const cityName = formData.get('cityName') as string
  const plateText = formData.get('plateText') as string

  if (!tenantTemplateId || !entityId || !customerName || !customerEmail) {
    throw new Error('Missing required fields')
  }

  const zonePlacements = JSON.parse(zonePlacementsRaw || '[]')

  const design = await prisma.design.create({
    data: {
      tenantTemplateId,
      zonePlacements,
      renderConfig: { scale: 1, quality: 'high' },
      status: 'FINAL',
      guestEmail: customerEmail,
    },
  })

  let orderNumber = generateOrderNumber(entitySlug)
  let attempts = 0
  while (attempts < 5) {
    const existing = await prisma.order.findUnique({ where: { orderNumber } })
    if (!existing) break
    orderNumber = generateOrderNumber(entitySlug)
    attempts++
  }

  const order = await prisma.order.create({
    data: {
      designId: design.id,
      entityId,
      orderNumber,
      status: 'SUBMITTED',
      customerName,
      customerEmail,
      notificationLog: [
        { type: 'stub', message: 'Order received', timestamp: new Date().toISOString() }
      ],
    },
  })

  try {
    await sendOrderConfirmationEmail({
      to: customerEmail,
      orderId: order.orderNumber,
      plateText: plateText || 'your plate',
      cityName: cityName || 'your city',
    })
  } catch (err) {
    console.error('Confirmation email failed:', err)
  }

  redirect('/' + entitySlug + '/confirmation/' + order.orderNumber)
}