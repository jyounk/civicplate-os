import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get('session_id')
  if (!sessionId) {
    return NextResponse.json({ error: 'Missing session_id' }, { status: 400 })
  }

  const order = await prisma.order.findFirst({
    where: { stripeSessionId: sessionId },
    select: { orderNumber: true },
  })

  if (!order) {
    return NextResponse.json({ found: false })
  }

  return NextResponse.json({ found: true, orderNumber: order.orderNumber })
}
