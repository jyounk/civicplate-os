import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import { updateOrderStatus } from '@/lib/admin-actions'
import DeleteOrderButton from '@/components/admin/DeleteOrderButton'
import GeorgiaPlate from '@/components/designer/GeorgiaPlate'

const PIPELINE = [
  { key: 'SUBMITTED', label: 'Submitted', color: '#2563eb', light: '#eff6ff' },
  { key: 'IN_REVIEW', label: 'In Review', color: '#d97706', light: '#fffbeb' },
  { key: 'APPROVED',  label: 'Approved',  color: '#16a34a', light: '#f0fdf4' },
  { key: 'COMPLETED', label: 'Completed', color: '#7c3aed', light: '#f5f3ff' },
]

const STATUS_ORDER = ['SUBMITTED', 'IN_REVIEW', 'APPROVED', 'COMPLETED']

interface Props {
  params: Promise<{ tenantSlug: string; orderId: string }>
  searchParams: Promise<{ updated?: string }>
}

function actionLabel(action: string): string {
  if (action === 'STATUS_CHANGED_TO_SUBMITTED') return 'Order submitted'
  if (action === 'STATUS_CHANGED_TO_IN_REVIEW') return 'Moved to In Review'
  if (action === 'STATUS_CHANGED_TO_APPROVED') return 'Order approved'
  if (action === 'STATUS_CHANGED_TO_REJECTED') return 'Order rejected'
  if (action === 'STATUS_CHANGED_TO_COMPLETED') return 'Order completed'
  return action
}

function actionColor(action: string): string {
  if (action.includes('APPROVED')) return '#16a34a'
  if (action.includes('REJECTED')) return '#dc2626'
  if (action.includes('IN_REVIEW')) return '#d97706'
  if (action.includes('COMPLETED')) return '#7c3aed'
  return '#2563eb'
}

export default async function OrderDetailPage({ params, searchParams }: Props) {
  const { tenantSlug, orderId } = await params
  const sp = await searchParams
  const pool = new Pool({ connectionString: process.env.DATABASE_URL })
  const adapter = new PrismaPg(pool)
  const prisma = new PrismaClient({ adapter })
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      design: { include: { tenantTemplate: { include: { baseTemplate: true, entity: true } } } },
    },
  })
  if (!order) {
    return <div className='p-8 text-red-600'>Order not found</div>
  }
  const auditLogs = await prisma.auditLog.findMany({
    where: { orderId: orderId },
    orderBy: { createdAt: 'asc' },
  })
  const raw = order.design.zonePlacements
  const zones = Array.isArray(raw) ? raw : JSON.parse(raw as string)
  const plateText = (zones as any[]).find((z: any) => z.zoneId === 'main-text')?.value ?? 'N/A'
  const countyName = order.design.tenantTemplate.entity.name
  const tmpl = order.design.tenantTemplate.baseTemplate
  const plateW = tmpl?.width ?? 600
  const plateH = tmpl?.height ?? 300
  const canMarkReview = order.status === 'SUBMITTED'
  const canApprove = ['SUBMITTED', 'IN_REVIEW'].includes(order.status)
  const canReject = ['SUBMITTED', 'IN_REVIEW', 'APPROVED'].includes(order.status)
  const pdfUrl = '/api/orders/' + orderId + '/pdf'
  const isRejected = order.status === 'REJECTED'
  const currentIdx = isRejected ? -1 : STATUS_ORDER.indexOf(order.status)
  return (
    <div style={{ padding: '1.5rem', maxWidth: '56rem' }}>
      <style>{`
        .od-grid { display: grid; grid-template-columns: 1fr; gap: 1.5rem; margin-bottom: 1.5rem; }
        @media (min-width: 768px) { .od-grid { grid-template-columns: 1fr 1fr; } }
        .od-card { background: #fff; border: 1px solid #e2e8f0; border-radius: 10px; padding: 1.5rem; box-shadow: 0 1px 3px rgba(0,0,0,0.06); }
        .od-label { font-size: 0.7rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.06em; color: #94a3b8; margin-bottom: 1rem; margin-top: 0; }
        .od-action-btn { font-size: 0.875rem; font-weight: 600; padding: 0.6rem 1.25rem; border-radius: 6px; border: none; cursor: pointer; }
      `}</style>

      {sp.updated && (
        <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#15803d', fontSize: '0.875rem', borderRadius: '8px', padding: '0.75rem 1rem', marginBottom: '1.25rem' }}>Order status updated successfully.</div>
      )}

      <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
        <a href={'/admin/' + tenantSlug} style={{ color: '#94a3b8', fontSize: '0.875rem', textDecoration: 'none' }}>&larr; All Orders</a>
        <span style={{ color: '#e2e8f0' }}>|</span>
        <h1 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '700', color: '#0f172a' }}>Order {order.orderNumber}</h1>
      </div>

      <div className='od-card' style={{ marginBottom: '1.5rem' }}>
        <p className='od-label'>Order Pipeline</p>
        {isRejected && (
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontSize: '1.5rem' }}>✗</span>
            <div>
              <p style={{ margin: '0 0 2px', fontWeight: '700', color: '#dc2626' }}>Order Rejected</p>
              <p style={{ margin: 0, fontSize: '0.8rem', color: '#ef4444' }}>This order has been rejected and the citizen has been notified.</p>
            </div>
          </div>
        )}
        {!isRejected && (
          <div style={{ display: 'flex', alignItems: 'flex-start' }}>
            {STATUS_ORDER.map((key, idx) => {
            const step = PIPELINE.find((p) => p.key === key)!
              const done = idx <= currentIdx
              const active = idx === currentIdx
              const dotBg = done ? step.color : '#e2e8f0'
              const dotColor = done ? '#fff' : '#94a3b8'
              const lineBg = idx < currentIdx ? step.color : '#e2e8f0'
              return (
                <div key={key} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{ width: '2rem', height: '2rem', borderRadius: '50%', background: dotBg, color: dotColor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: '700', border: active ? '3px solid ' + step.color : 'none', boxSizing: 'border-box', boxShadow: active ? '0 0 0 3px ' + step.light : 'none' }}>
                      {done ? '✓' : String(idx + 1)}
                    </div>
                    <span style={{ fontSize: '0.6rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.04em', color: done ? step.color : '#94a3b8', marginTop: '0.3rem', whiteSpace: 'nowrap' }}>{step.label}</span>
                  </div>
                  {idx < STATUS_ORDER.length - 1 && (
                    <div style={{ flex: 1, height: '2px', background: lineBg, margin: '0 0.25rem', marginBottom: '1.2rem' }} />
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      <div className='od-grid'>
        <div className='od-card'>
          <p className='od-label'>Plate Preview</p>
          <div style={{ background: '#f8fafc', borderRadius: '8px', padding: '1rem', display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
            <GeorgiaPlate plateText={plateText} countyName={countyName} width={plateW} height={plateH} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#475569', marginBottom: '0.5rem' }}>
            <span>Template</span><span style={{ fontWeight: '600', color: '#0f172a' }}>{order.design.tenantTemplate.name}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#475569' }}>
            <span>Amount Paid</span><span style={{ fontWeight: '600', color: '#0f172a' }}>${((order.amountPaid ?? 0) / 100).toFixed(2)}</span>
          </div>
        </div>

        <div className='od-card'>
          <p className='od-label'>Customer</p>
          <div style={{ marginBottom: '1rem' }}>
            <p style={{ margin: '0 0 2px', fontSize: '0.75rem', color: '#94a3b8' }}>Name</p>
            <p style={{ margin: 0, fontWeight: '600', color: '#0f172a' }}>{order.customerName}</p>
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <p style={{ margin: '0 0 2px', fontSize: '0.75rem', color: '#94a3b8' }}>Email</p>
            <p style={{ margin: 0, color: '#0f172a' }}>{order.customerEmail}</p>
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <p style={{ margin: '0 0 2px', fontSize: '0.75rem', color: '#94a3b8' }}>Submitted</p>
            <p style={{ margin: 0, color: '#0f172a', fontSize: '0.875rem' }}>{order.submittedAt ? new Date(order.submittedAt).toLocaleString() : 'N/A'}</p>
          </div>
          <div>
            <p style={{ margin: '0 0 2px', fontSize: '0.75rem', color: '#94a3b8' }}>Last Updated</p>
            <p style={{ margin: 0, color: '#0f172a', fontSize: '0.875rem' }}>{new Date(order.updatedAt).toLocaleString()}</p>
          </div>
        </div>
      </div>

      <div className='od-card' style={{ marginBottom: '1.5rem' }}>
        <p className='od-label'>Actions</p>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          {canMarkReview && (
            <form action={updateOrderStatus}>
              <input type='hidden' name='orderId' value={order.id} />
              <input type='hidden' name='status' value='IN_REVIEW' />
              <input type='hidden' name='tenantSlug' value={tenantSlug} />
              <button type='submit' className='od-action-btn' style={{ background: '#fef3c7', color: '#92400e' }}>Mark In Review</button>
            </form>
          )}
          {canApprove && (
            <form action={updateOrderStatus}>
              <input type='hidden' name='orderId' value={order.id} />
              <input type='hidden' name='status' value='APPROVED' />
              <input type='hidden' name='tenantSlug' value={tenantSlug} />
              <button type='submit' className='od-action-btn' style={{ background: '#16a34a', color: '#fff' }}>Approve Order</button>
            </form>
          )}
          {canReject && (
            <form action={updateOrderStatus}>
              <input type='hidden' name='orderId' value={order.id} />
              <input type='hidden' name='status' value='REJECTED' />
              <input type='hidden' name='tenantSlug' value={tenantSlug} />
              <button type='submit' className='od-action-btn' style={{ background: '#dc2626', color: '#fff' }}>Reject Order</button>
            </form>
          )}
          {order.status === 'APPROVED' && (
            <a href={pdfUrl} className='od-action-btn' style={{ background: '#0f172a', color: '#fff', textDecoration: 'none', display: 'inline-block' }}>Download Approval PDF</a>
          )}
          {!canMarkReview && !canApprove && !canReject && order.status !== 'APPROVED' && (
            <p style={{ color: '#94a3b8', fontSize: '0.875rem', margin: 0 }}>No actions available for this status.</p>
          )}
        </div>
        <DeleteOrderButton orderId={order.id} orderNumber={order.orderNumber} tenantSlug={tenantSlug} />
      </div>

      {auditLogs.length > 0 && (
        <div className='od-card'>
          <p className='od-label'>Activity Timeline</p>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {auditLogs.map((log, idx) => (
              <div key={log.id} style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{ width: '0.65rem', height: '0.65rem', borderRadius: '50%', background: actionColor(log.action), marginTop: '0.2rem', flexShrink: 0 }} />
                  {idx < auditLogs.length - 1 && <div style={{ width: '2px', flex: 1, background: '#e2e8f0', margin: '0.25rem 0' }} />}
                </div>
                <div style={{ paddingBottom: idx < auditLogs.length - 1 ? '1rem' : '0' }}>
                  <p style={{ margin: '0 0 2px', fontSize: '0.875rem', fontWeight: '600', color: '#0f172a' }}>{actionLabel(log.action)}</p>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: '#94a3b8' }}>{new Date(log.createdAt).toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      <div style={{ height: '2rem' }} />
    </div>
  )
}