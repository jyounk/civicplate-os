import { NextRequest, NextResponse } from 'next/server'
import { renderToBuffer } from '@react-pdf/renderer'
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import React from 'react'

const styles = StyleSheet.create({
  page: { backgroundColor: '#FFFFFF', padding: 48, fontFamily: 'Helvetica' },
  header: { backgroundColor: '#1B3A6B', padding: 24, marginBottom: 32, borderRadius: 4 },
  headerTitle: { color: '#FFFFFF', fontSize: 22, fontFamily: 'Helvetica-Bold' },
  headerSub: { color: '#C8A84B', fontSize: 11, marginTop: 4 },
  stamp: { border: '4px solid #16a34a', borderRadius: 6, padding: '8 16', alignSelf: 'flex-start', marginBottom: 24 },
  stampText: { color: '#16a34a', fontSize: 18, fontFamily: 'Helvetica-Bold', letterSpacing: 4 },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 9, fontFamily: 'Helvetica-Bold', color: '#64748B', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8, paddingBottom: 4, borderBottom: '1px solid #E2E8F0' },
  row: { flexDirection: 'row', marginBottom: 6 },
  label: { fontSize: 10, color: '#64748B', width: 140 },
  value: { fontSize: 10, color: '#0F172A', flex: 1 },
  plateBox: { backgroundColor: '#F1F5F9', borderRadius: 4, padding: 24, alignItems: 'center', marginBottom: 8 },
  plateInner: { border: '4px solid #1E293B', borderRadius: 4, paddingVertical: 12, paddingHorizontal: 32 },
  plateText: { fontSize: 32, fontFamily: 'Helvetica-Bold', letterSpacing: 6, color: '#0F172A' },
  footer: { position: 'absolute', bottom: 32, left: 48, right: 48, borderTop: '1px solid #E2E8F0', paddingTop: 12, flexDirection: 'row', justifyContent: 'space-between' },
  footerText: { fontSize: 8, color: '#94A3B8' },
})

interface Props {
  params: Promise<{ orderId: string }>
}

export async function GET(request: NextRequest, { params }: Props) {
  const { orderId } = await params

  const pool = new Pool({ connectionString: process.env.DATABASE_URL })
  const adapter = new PrismaPg(pool)
  const prisma = new PrismaClient({ adapter })

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      design: { include: { tenantTemplate: true } },
      entity: true,
    },
  })

  if (!order || order.status !== 'APPROVED') {
    return new NextResponse('Not found or not approved', { status: 404 })
  }

  const raw = order.design.zonePlacements
  const zones = Array.isArray(raw) ? raw : JSON.parse(raw as string)
  const plateText = (zones as any[])[0]?.value ?? 'N/A'

  const approvedDate = new Date(order.updatedAt).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric'
  })

  const submittedDate = new Date(order.submittedAt).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric'
  })

  const entityName = order.entity?.name ?? 'CivicPlate OS'

  const MyDoc = () => (
    React.createElement(Document, null,
      React.createElement(Page, { size: 'LETTER', style: styles.page },
        React.createElement(View, { style: styles.header },
          React.createElement(Text, { style: styles.headerTitle }, 'CivicPlate OS'),
          React.createElement(Text, { style: styles.headerSub }, entityName + ' — Official Plate Approval Document'),
        ),
        React.createElement(View, { style: styles.stamp },
          React.createElement(Text, { style: styles.stampText }, 'APPROVED'),
        ),
        React.createElement(View, { style: styles.section },
          React.createElement(Text, { style: styles.sectionTitle }, 'Order Information'),
          React.createElement(View, { style: styles.row },
            React.createElement(Text, { style: styles.label }, 'Order Number'),
          React.createElement(Text, { style: styles.value }, order.orderNumber),
          ),
          React.createElement(View, { style: styles.row },
            React.createElement(Text, { style: styles.label }, 'Date Submitted'),
            React.createElement(Text, { style: styles.value }, submittedDate),
          ),
          React.createElement(View, { style: styles.row },
            React.createElement(Text, { style: styles.label }, 'Date Approved'),
            React.createElement(Text, { style: styles.value }, approvedDate),
          ),
          React.createElement(View, { style: styles.row },
            React.createElement(Text, { style: styles.label }, 'Status'),
            React.createElement(Text, { style: styles.value }, 'APPROVED'),
          ),
        ),
        React.createElement(View, { style: styles.section },
          React.createElement(Text, { style: styles.sectionTitle }, 'Customer Information'),
          React.createElement(View, { style: styles.row },
            React.createElement(Text, { style: styles.label }, 'Name'),
            React.createElement(Text, { style: styles.value }, order.customerName),
          ),
          React.createElement(View, { style: styles.row },
            React.createElement(Text, { style: styles.label }, 'Email'),
            React.createElement(Text, { style: styles.value }, order.customerEmail),
          ),
        ),
        React.createElement(View, { style: styles.section },
          React.createElement(Text, { style: styles.sectionTitle }, 'Plate Design'),
          React.createElement(View, { style: styles.plateBox },
            React.createElement(View, { style: styles.plateInner },
              React.createElement(Text, { style: styles.plateText }, plateText),
            ),
          ),
          React.createElement(View, { style: styles.row },
            React.createElement(Text, { style: styles.label }, 'Template'),
            React.createElement(Text, { style: styles.value }, order.design.tenantTemplate.name),
          ),
          React.createElement(View, { style: styles.row },
            React.createElement(Text, { style: styles.label }, 'Price'),
            React.createElement(Text, { style: styles.value }, '$' + Number(order.design.tenantTemplate.price).toFixed(2)),
          ),
        ),
        React.createElement(View, { style: styles.footer },
          React.createElement(Text, { style: styles.footerText }, 'Generated by CivicPlate OS — ' + entityName),
          React.createElement(Text, { style: styles.footerText }, 'Order ' + order.orderNumber + ' — ' + approvedDate),
        ),
      )
    )
  )

  const buffer = await renderToBuffer(React.createElement(MyDoc))

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${order.orderNumber}-approval.pdf"`,
    },
  })
}