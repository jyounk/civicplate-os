import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const text = (searchParams.get('text') ?? '').toUpperCase().trim()

  if (!text || text.length < 1) {
    return NextResponse.json({ available: true })
  }

  const pool = new Pool({ connectionString: process.env.DATABASE_URL })
  const adapter = new PrismaPg(pool)
  const prisma = new PrismaClient({ adapter })

  try {
    const existing = await prisma.order.findFirst({
      where: { plateText: text },
      select: { id: true },
    })
    return NextResponse.json({ available: existing === null })
  } catch (err) {
    console.error('[check-plate]', err)
    return NextResponse.json({ available: true })
  } finally {
    await pool.end()
  }
}