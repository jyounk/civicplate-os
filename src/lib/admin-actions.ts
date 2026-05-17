'use server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import { sendOrderStatusEmail } from '@/lib/emails'

export async function updateOrderStatus(formData: FormData) {
  const orderId = formData.get('orderId') as string
  const status = formData.get('status') as 'IN_REVIEW' | 'APPROVED' | 'REJECTED'
  type EmailStatus = 'APPROVED' | 'REJECTED'
  const tenantSlug = formData.get('tenantSlug') as string
  const pool = new Pool({ connectionString: process.env.DATABASE_URL })
  const adapter = new PrismaPg(pool)
  const prisma = new PrismaClient({ adapter })
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      design: { include: { tenantTemplate: { include: { entity: true } } } },
    },
  })
  await prisma.$transaction(async (tx) => {
    await tx.order.update({
      where: { id: orderId },
      data: { status },
    })
    await tx.auditLog.create({
      data: {
        action: 'STATUS_CHANGED_TO_' + status,
        orderId: orderId,
      },
    })
  })
  const emailStatuses = ['APPROVED', 'REJECTED']
  if (order && emailStatuses.includes(status)) {
    const plateText = (order.design.zonePlacements as any[]).find((z: any) => z.zoneId === 'main-text')?.value || 'your plate'
    const cityName = order.design.tenantTemplate.entity.name
    try {
      await sendOrderStatusEmail({
        to: order.customerEmail,
        orderId: order.orderNumber,
        plateText,
        cityName,
        status: status as EmailStatus,
      })
    } catch (err) {
      console.error('Status email failed:', err)
    }
  }
  revalidatePath('/admin/' + tenantSlug + '/orders/' + orderId)
  revalidatePath('/admin/' + tenantSlug)
  redirect('/admin/' + tenantSlug + '/orders/' + orderId + '?updated=1')
}