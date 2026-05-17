import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

const PIPELINE_STEPS = [
  { key: 'SUBMITTED', label: 'Submitted', color: '#2563eb', bg: '#eff6ff' },
  { key: 'IN_REVIEW', label: 'In Review', color: '#d97706', bg: '#fffbeb' },
  { key: 'APPROVED',  label: 'Approved',  color: '#16a34a', bg: '#f0fdf4' },
  { key: 'REJECTED',  label: 'Rejected',  color: '#dc2626', bg: '#fef2f2' },
  { key: 'COMPLETED', label: 'Completed', color: '#7c3aed', bg: '#f5f3ff' },
]

function getPlateText(order: any): string {
  if (order.plateText) return order.plateText
  try {
    const z = Array.isArray(order.design.zonePlacements) ? order.design.zonePlacements : JSON.parse(order.design.zonePlacements)
    return z[0]?.value ?? '—'
  } catch {
    return '—'
  }
}

interface Props {
  params: Promise<{ tenantSlug: string }>
  searchParams: Promise<{ status?: string }>
}

export default async function AdminOrdersPage({ params, searchParams }: Props) {
  const { tenantSlug } = await params
  const sp = await searchParams
  const activeFilter = sp.status ?? 'ALL'
  const pool = new Pool({ connectionString: process.env.DATABASE_URL })
  const adapter = new PrismaPg(pool)
  const prisma = new PrismaClient({ adapter })
  const tenant = await prisma.governmentEntity.findUnique({ where: { slug: tenantSlug } })
  if (!tenant) {
    return <div style={{ padding: '2rem', color: 'red' }}>Tenant not found: {tenantSlug}</div>
  }
  const allOrders = await prisma.order.findMany({
    where: { design: { tenantTemplate: { entityId: tenant.id } } },
    include: { design: { include: { tenantTemplate: true } } },
    orderBy: { submittedAt: 'desc' },
  })
  const counts: Record<string, number> = { ALL: allOrders.length }
  PIPELINE_STEPS.forEach((s) => { counts[s.key] = allOrders.filter((o) => o.status === s.key).length })
  const orders = activeFilter === 'ALL' ? allOrders : allOrders.filter((o) => o.status === activeFilter)
  const filterHref = (key: string) => '/admin/' + tenantSlug + (key === 'ALL' ? '' : '?status=' + key)
  return (
    <div style={{ padding: '1.5rem' }}>
      <style>{`
        @media (min-width: 768px) { .ao-wrap { padding: 2rem; } }
        .ao-pipe { display: flex; gap: 0.5rem; flex-wrap: wrap; margin-bottom: 1.5rem; }
        .ao-pipe-btn { padding: 0.4rem 0.9rem; border-radius: 999px; font-size: 0.78rem; font-weight: 600; border: none; cursor: pointer; text-decoration: none; display: inline-flex; align-items: center; gap: 0.4rem; transition: opacity 0.15s; }
        .ao-pipe-btn:hover { opacity: 0.85; }
        .ao-table-wrap { overflow-x: auto; -webkit-overflow-scrolling: touch; background: #fff; border-radius: 10px; border: 1px solid #e2e8f0; box-shadow: 0 1px 3px rgba(0,0,0,0.06); }
        .ao-col-template { display: none; }
        .ao-col-date { display: none; }
        @media (min-width: 640px) { .ao-col-date { display: table-cell; } }
        @media (min-width: 768px) { .ao-col-template { display: table-cell; } }
        .ao-row:hover { background: #f8fafc; }
      `}</style>

      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ margin: '0 0 4px', fontSize: '1.4rem', fontWeight: '700', color: '#0f172a' }}>Orders</h1>
        <p style={{ margin: 0, fontSize: '0.875rem', color: '#64748b' }}>{tenant.name} &mdash; {allOrders.length} total</p>
      </div>

      <div className='ao-pipe'>
        <a href={filterHref('ALL')} className='ao-pipe-btn' style={{ background: activeFilter === 'ALL' ? '#0f172a' : '#f1f5f9', color: activeFilter === 'ALL' ? '#fff' : '#475569' }}>All <span style={{ opacity: 0.7 }}>{counts['ALL']}</span></a>
        {PIPELINE_STEPS.map((s) => {
          const isActive = activeFilter === s.key
          return (
            <a key={s.key} href={filterHref(s.key)} className='ao-pipe-btn' style={{ background: isActive ? s.color : s.bg, color: isActive ? '#fff' : s.color }}>
              {s.label} <span style={{ opacity: 0.7 }}>{counts[s.key]}</span>
            </a>
          )
        })}
      </div>

      <div className='ao-table-wrap'>
        <table style={{ width: '100%', fontSize: '0.875rem', borderCollapse: 'collapse', minWidth: '480px' }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
              <th style={{ textAlign: 'left', padding: '0.75rem 1rem', fontWeight: '600', color: '#475569', fontSize: '0.8rem' }}>Order #</th>
              <th style={{ textAlign: 'left', padding: '0.75rem 1rem', fontWeight: '600', color: '#475569', fontSize: '0.8rem' }}>Customer</th>
              <th style={{ textAlign: 'left', padding: '0.75rem 1rem', fontWeight: '600', color: '#475569', fontSize: '0.8rem' }}>Plate</th>
              <th style={{ textAlign: 'left', padding: '0.75rem 1rem', fontWeight: '600', color: '#475569', fontSize: '0.8rem' }} className='ao-col-template'>Template</th>
              <th style={{ textAlign: 'left', padding: '0.75rem 1rem', fontWeight: '600', color: '#475569', fontSize: '0.8rem' }}>Status</th>
              <th style={{ textAlign: 'left', padding: '0.75rem 1rem', fontWeight: '600', color: '#475569', fontSize: '0.8rem' }} className='ao-col-date'>Submitted</th>
              <th style={{ padding: '0.75rem 1rem' }}></th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 && (
              <tr><td colSpan={7} style={{ textAlign: 'center', padding: '4rem 1rem' }}>
                <p style={{ margin: '0 0 4px', color: '#94a3b8', fontWeight: '500' }}>No orders found</p>
                <p style={{ margin: 0, color: '#cbd5e1', fontSize: '0.8rem' }}>{activeFilter === 'ALL' ? 'Orders will appear here once citizens submit requests' : 'No orders with this status'}</p>
              </td></tr>
            )}
            {orders.map((order) => {
              const pt = getPlateText(order)
              const reviewHref = '/admin/' + tenantSlug + '/orders/' + order.id
              const step = PIPELINE_STEPS.find((s) => s.key === order.status)
              const badgeBg = step ? step.bg : '#f1f5f9'
              const badgeColor = step ? step.color : '#475569'
              const statusLabel = order.status.replace('_', ' ')
              return (
                <tr key={order.id} className='ao-row' style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '0.75rem 1rem', fontFamily: 'monospace', color: '#475569', fontSize: '0.75rem' }}>{order.orderNumber}</td>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    <div style={{ fontWeight: '500', color: '#1e293b', fontSize: '0.8rem' }}>{order.customerName}</div>
                    <div style={{ color: '#94a3b8', fontSize: '0.75rem' }}>{order.customerEmail}</div>
                  </td>
                  <td style={{ padding: '0.75rem 1rem', fontFamily: 'monospace', fontWeight: '700', color: '#0f172a', fontSize: '0.8rem' }}>{pt}</td>
                  <td style={{ padding: '0.75rem 1rem', color: '#475569', fontSize: '0.8rem' }} className='ao-col-template'>{order.design.tenantTemplate.name}</td>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    <span style={{ display: 'inline-block', padding: '0.2rem 0.6rem', borderRadius: '999px', fontSize: '0.72rem', fontWeight: '600', background: badgeBg, color: badgeColor }}>{statusLabel}</span>
                  </td>
                  <td style={{ padding: '0.75rem 1rem', color: '#94a3b8', fontSize: '0.75rem' }} className='ao-col-date'>{new Date(order.submittedAt).toLocaleDateString()}</td>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    <a href={reviewHref} style={{ color: '#2563eb', fontWeight: '500', fontSize: '0.75rem', textDecoration: 'none', whiteSpace: 'nowrap' }}>Review &rarr;</a>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <div style={{ height: '2rem' }} />
    </div>
  )
}