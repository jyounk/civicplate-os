'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

export async function updateOrderStatus(formData: FormData) {
  const orderId = formData.get('orderId') as string
  const status = formData.get('status') as any
  const tenantSlug = formData.get('tenantSlug') as string

  const pool = new Pool({ connectionString: process.env.DATABASE_URL })
  const adapter = new PrismaPg(pool)
  const prisma = new PrismaClient({ adapter })

  await prisma.$transaction(async (tx) => {
    await tx.order.update({
      where: { id: orderId },
      data: { status },
    })

    await tx.auditLog.create({
      data: {
        action: `STATUS_CHANGED_TO_${status}`,
        orderId: orderId,
      },
    })
  })

  revalidatePath(`/admin/${tenantSlug}/orders/${orderId}`)
  revalidatePath(`/admin/${tenantSlug}`)
  redirect(`/admin/${tenantSlug}/orders/${orderId}?updated=1`)
}