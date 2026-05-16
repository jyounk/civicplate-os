import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

const STATUS_COLORS: Record<string, string> = {
  DRAFT:     'bg-slate-100 text-slate-600',
  SUBMITTED: 'bg-blue-100 text-blue-700',
  IN_REVIEW: 'bg-yellow-100 text-yellow-700',
  APPROVED:  'bg-green-100 text-green-700',
  REJECTED:  'bg-red-100 text-red-700',
  COMPLETED: 'bg-purple-100 text-purple-700',
}

interface Props { params: Promise<{ tenantSlug: string }> }

export default async function AdminOrdersPage({ params }: Props) {
  const { tenantSlug } = await params
  const pool = new Pool({ connectionString: process.env.DATABASE_URL })
  const adapter = new PrismaPg(pool)
  const prisma = new PrismaClient({ adapter })
  const tenant = await prisma.governmentEntity.findUnique({ where: { slug: tenantSlug } })
  if (!tenant) { return <div style={{ padding: '2rem', color: 'red' }}>Tenant not found: {tenantSlug}</div> }
  const orders = await prisma.order.findMany({
    where: { design: { tenantTemplate: { entityId: tenant.id } } },
    include: { design: { include: { tenantTemplate: true } } },
    orderBy: { updatedAt: 'desc' },
  })
  const total = orders.length
  const submitted = orders.filter(o => o.status === 'SUBMITTED').length
  const inReview = orders.filter(o => o.status === 'IN_REVIEW').length
  const approved = orders.filter(o => o.status === 'APPROVED').length
  const rejected = orders.filter(o => o.status === 'REJECTED').length
  const statCard = (label: string, value: number, color: string) => (
    <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0.75rem 1rem' }}>
      <p style={{ margin: '0 0 4px', fontSize: '0.7rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.06em', color: '#94a3b8' }}>{label}</p>
      <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: '700', color }}>{value}</p>
    </div>
  )
  return (
    <div style={{ padding: '1.5rem' }}>
      <style>{`
        @media (min-width: 768px) { .ao-pad { padding: 2rem; } }
        .ao-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.75rem; margin-bottom: 1.25rem; }
        @media (min-width: 640px) { .ao-stats { grid-template-columns: repeat(5, 1fr); } }
        .ao-table-wrap { overflow-x: auto; -webkit-overflow-scrolling: touch; background: #fff; border-radius: 8px; border: 1px solid #e2e8f0; box-shadow: 0 1px 3px rgba(0,0,0,0.06); }
        .ao-col-template { display: none; }
        .ao-col-date { display: none; }
        @media (min-width: 640px) { .ao-col-date { display: table-cell; } }
        @media (min-width: 768px) { .ao-col-template { display: table-cell; } }
      `}</style>

      <div style={{ marginBottom: '1.25rem' }}>
        <h1 style={{ margin: '0 0 4px', fontSize: '1.4rem', fontWeight: '700', color: '#0f172a' }}>Orders</h1>
        <p style={{ margin: 0, fontSize: '0.875rem', color: '#64748b' }}>{tenant.name} &mdash; {total} total</p>
      </div>

      <div className='ao-stats'>
        {statCard('Total', total, '#0f172a')}
        {statCard('Submitted', submitted, '#2563eb')}
        {statCard('In Review', inReview, '#d97706')}
        {statCard('Approved', approved, '#16a34a')}
        {statCard('Rejected', rejected, '#ef4444')}
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
                <p style={{ margin: '0 0 4px', color: '#94a3b8', fontWeight: '500' }}>No orders yet</p>
                <p style={{ margin: 0, color: '#cbd5e1', fontSize: '0.8rem' }}>Orders will appear here once citizens submit requests</p>
              </td></tr>
            )}
            {orders.map((order) => {
              const plateText = (() => { try { const raw = order.design.zonePlacements; const z = Array.isArray(raw) ? raw : JSON.parse(raw as string); return (z as any[])[0]?.value ?? '—'; } catch { return '—'; } })()
          const reviewHref = '/admin/' + tenantSlug + '/orders/' + order.id
              const statusClass = STATUS_COLORS[order.status] ?? 'bg-slate-100 text-slate-600'
              return (
                <tr key={order.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '0.75rem 1rem', fontFamily: 'monospace', color: '#475569', fontSize: '0.75rem' }}>{order.orderNumber}</td>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    <div style={{ fontWeight: '500', color: '#1e293b', fontSize: '0.8rem' }}>{order.customerName}</div>
                    <div style={{ color: '#94a3b8', fontSize: '0.75rem' }}>{order.customerEmail}</div>
                  </td>
                  <td style={{ padding: '0.75rem 1rem', fontFamily: 'monospace', fontWeight: '700', color: '#0f172a', fontSize: '0.8rem' }}>{plateText}</td>
                  <td style={{ padding: '0.75rem 1rem', color: '#475569', fontSize: '0.8rem' }} className='ao-col-template'>{order.design.tenantTemplate.name}</td>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    <span className={'inline-block px-2 py-0.5 rounded text-xs font-semibold ' + statusClass}>{order.status}</span>
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
    </div>
  )
}