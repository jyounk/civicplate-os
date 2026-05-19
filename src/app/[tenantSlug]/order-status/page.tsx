import { notFound } from 'next/navigation'
import { getTenantBySlug } from '@/lib/tenant'
import { prisma } from '@/lib/prisma'

type Props = {
  params: Promise<{ tenantSlug: string }>
  searchParams: Promise<{ q?: string }>
}

const STATUS_STYLES: Record<string, { label: string; bg: string; color: string }> = {
  DRAFT:     { label: 'DRAFT',      bg: '#f1f5f9', color: '#475569' },
  SUBMITTED: { label: 'SUBMITTED',  bg: '#fef9c3', color: '#854d0e' },
  IN_REVIEW: { label: 'IN REVIEW',  bg: '#dbeafe', color: '#1e40af' },
  APPROVED:  { label: 'APPROVED',   bg: '#dcfce7', color: '#166534' },
  REJECTED:  { label: 'REJECTED',   bg: '#fee2e2', color: '#991b1b' },
  COMPLETED: { label: 'COMPLETED',  bg: '#dcfce7', color: '#166534' },
}

function formatDate(d: Date) {
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}

function statusMessage(status: string, primary: string) {
  if (status === 'APPROVED') {
    return (
      <div style={{ marginTop: '1rem', padding: '0.85rem 1rem', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px' }}>
        <p style={{ margin: 0, fontSize: '0.875rem', color: '#166534', fontWeight: '600' }}>Your plate has been approved!</p>
        <p style={{ margin: '0.25rem 0 0', fontSize: '0.825rem', color: '#166534' }}>You will receive an email with next steps for production and delivery.</p>
      </div>
    )
  }
  if (status === 'REJECTED') {
    return (
      <div style={{ marginTop: '1rem', padding: '0.85rem 1rem', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px' }}>
        <p style={{ margin: 0, fontSize: '0.875rem', color: '#991b1b', fontWeight: '600' }}>Your order was not approved.</p>
        <p style={{ margin: '0.25rem 0 0', fontSize: '0.825rem', color: '#991b1b' }}>Please contact your county office if you have questions or need a refund.</p>
      </div>
    )
  }
  return (
    <div style={{ marginTop: '1rem', padding: '0.85rem 1rem', backgroundColor: '#fffbeb', border: '1px solid #fde68a', borderRadius: '8px' }}>
      <p style={{ margin: 0, fontSize: '0.875rem', color: '#92400e' }}>Your order is being reviewed — you will be emailed when a decision is made.</p>
    </div>
  )
}

export default async function OrderStatusPage({ params, searchParams }: Props) {
  const { tenantSlug } = await params
  const { q } = await searchParams
  const tenant = await getTenantBySlug(tenantSlug)
  if (!tenant) notFound()

  const primary = tenant.primaryColor
  const secondary = tenant.secondaryColor
  const query = q?.trim() ?? ''
  const isEmail = query.includes('@')

  type OrderResult = {
    orderNumber: string
    status: string
    customerName: string
    customerEmail: string
    plateText: string | null
    amountPaid: number | null
    submittedAt: Date
    updatedAt: Date
    design: { tenantTemplate: { name: string } }
  }

  let orders: OrderResult[] = []
  let searched = false

  if (query) {
    searched = true
    if (isEmail) {
      orders = await prisma.order.findMany({
        where: {
          customerEmail: { equals: query, mode: 'insensitive' },
          entityId: tenant.id,
        },
        select: {
          orderNumber: true,
          status: true,
          customerName: true,
          customerEmail: true,
          plateText: true,
          amountPaid: true,
          submittedAt: true,
          updatedAt: true,
          design: { select: { tenantTemplate: { select: { name: true } } } },
        },
        orderBy: { submittedAt: 'desc' },
      })
    } else {
      const order = await prisma.order.findFirst({
        where: {
          orderNumber: { equals: query.toUpperCase() },
          entityId: tenant.id,
        },
        select: {
          orderNumber: true,
          status: true,
          customerName: true,
          customerEmail: true,
          plateText: true,
          amountPaid: true,
          submittedAt: true,
          updatedAt: true,
          design: { select: { tenantTemplate: { select: { name: true } } } },
        },
      })
      if (order) orders = [order]
    }
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f4f6f9', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <style>{`
        * { box-sizing: border-box; }
        .os-hero { padding: 2rem 1.25rem; text-align: center; }
        .os-body { max-width: 580px; margin: 0 auto; padding: 1.5rem 1.25rem; }
        .os-card { background: #fff; border: 1px solid #e2e6ea; border-radius: 12px; padding: 1.5rem; margin-bottom: 1.25rem; }
        .os-row { display: flex; justify-content: space-between; align-items: center; padding: 0.6rem 0; border-bottom: 1px solid #f1f5f9; gap: 1rem; }
        .os-row:last-child { border-bottom: none; }
        .os-label { font-size: 0.875rem; color: #718096; flex-shrink: 0; }
        .os-value { font-size: 0.875rem; color: #1a202c; text-align: right; }
        @media (min-width: 640px) {
          .os-hero { padding: 2.5rem 2rem; }
          .os-body { padding: 2rem 1.5rem; }
        }
      `}</style>

      <div className="os-hero" style={{ backgroundColor: primary }}>
        <h1 style={{ margin: '0 0 0.4rem', fontSize: '1.5rem', fontWeight: '700', color: secondary }}>Order Status</h1>
        <p style={{ margin: 0, color: secondary, opacity: 0.75, fontSize: '0.9rem' }}>{tenant.name} License Plate Portal</p>
      </div>

      <div className="os-body">
        <div className="os-card">
          <p style={{ margin: '0 0 1rem', fontSize: '0.72rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.06em', color: '#a0aec0' }}>Look up your order</p>
          <form method="GET" action={'/' + tenantSlug + '/order-status'}>
            <input
              name="q"
              type="text"
              defaultValue={query}
              placeholder="Order number (e.g. NEW-2026-1234) or email address"
              style={{ width: '100%', padding: '0.75rem 1rem', border: '1px solid #e2e6ea', borderRadius: '8px', fontSize: '0.9rem', color: '#1a202c', outline: 'none', marginBottom: '0.75rem', fontFamily: 'inherit' }}
              autoComplete="off"
            />
            <button
              type="submit"
              style={{ width: '100%', padding: '0.75rem', backgroundColor: primary, color: secondary, border: 'none', borderRadius: '8px', fontWeight: '600', fontSize: '0.9rem', cursor: 'pointer', fontFamily: 'inherit' }}
            >
              Look up order
            </button>
          </form>
        </div>

        {searched && orders.length === 0 && (
          <div className="os-card" style={{ textAlign: 'center' }}>
            <p style={{ margin: '0 0 0.25rem', fontWeight: '600', color: '#1a202c', fontSize: '0.95rem' }}>No order found</p>
            <p style={{ margin: 0, fontSize: '0.85rem', color: '#718096' }}>
              {isEmail
                ? 'No orders are associated with that email address.'
                : 'No order matched that order number. Check for typos and try again.'}
            </p>
          </div>
        )}

        {orders.map((order) => {
          const badge = STATUS_STYLES[order.status] ?? STATUS_STYLES.SUBMITTED
          const plateDisplay = (order.plateText || '').toUpperCase() || '—'
          const amount = order.amountPaid ? '$' + (order.amountPaid / 100).toFixed(2) : null
          return (
            <div key={order.orderNumber} className="os-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <p style={{ margin: 0, fontSize: '0.72rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.06em', color: '#a0aec0' }}>Order details</p>
                <span style={{ backgroundColor: badge.bg, color: badge.color, padding: '0.2rem 0.75rem', borderRadius: '999px', fontSize: '0.72rem', fontWeight: '700', letterSpacing: '0.04em' }}>
                  {badge.label}
                </span>
              </div>

              <div>
                <div className="os-row">
                  <span className="os-label">Order number</span>
                  <strong className="os-value" style={{ fontFamily: 'monospace', color: primary }}>{order.orderNumber}</strong>
                </div>
                <div className="os-row">
                  <span className="os-label">Plate text</span>
                  <strong className="os-value" style={{ fontFamily: 'monospace', letterSpacing: '0.1em' }}>{plateDisplay}</strong>
                </div>
                <div className="os-row">
                  <span className="os-label">Template</span>
                  <span className="os-value">{order.design.tenantTemplate.name}</span>
                </div>
                <div className="os-row">
                  <span className="os-label">Customer</span>
                  <span className="os-value">{order.customerName}</span>
                </div>
                {amount && (
                  <div className="os-row">
                    <span className="os-label">Amount paid</span>
                    <strong className="os-value">{amount}</strong>
                  </div>
                )}
                <div className="os-row">
                  <span className="os-label">Submitted</span>
                  <span className="os-value">{formatDate(order.submittedAt)}</span>
                </div>
                <div className="os-row">
                  <span className="os-label">Last updated</span>
                  <span className="os-value">{formatDate(order.updatedAt)}</span>
                </div>
              </div>

              {statusMessage(order.status, primary)}
            </div>
          )
        })}

        <a href={'/' + tenantSlug} style={{ display: 'block', textAlign: 'center', backgroundColor: primary, color: secondary, padding: '0.9rem', borderRadius: '8px', fontWeight: '600', textDecoration: 'none', fontSize: '0.95rem' }}>Back to Portal</a>
        <div style={{ height: '2rem' }} />
      </div>
    </div>
  )
}
