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

function statusMessage(status: string) {
  if (status === 'APPROVED') {
    return (
      <div style={{ marginTop: '1rem', padding: '0.85rem 1rem', backgroundColor: 'rgba(52,199,89,0.1)', border: '1px solid rgba(52,199,89,0.3)', borderRadius: '12px' }}>
        <p style={{ margin: 0, fontSize: '0.875rem', color: '#1d6f3b', fontWeight: '600' }}>Your plate has been approved!</p>
        <p style={{ margin: '0.25rem 0 0', fontSize: '0.825rem', color: '#1d6f3b' }}>You will receive an email with next steps for production and delivery.</p>
      </div>
    )
  }
  if (status === 'REJECTED') {
    return (
      <div style={{ marginTop: '1rem', padding: '0.85rem 1rem', backgroundColor: 'rgba(255,59,48,0.08)', border: '1px solid rgba(255,59,48,0.2)', borderRadius: '12px' }}>
        <p style={{ margin: 0, fontSize: '0.875rem', color: '#ff3b30', fontWeight: '600' }}>Your order was not approved.</p>
        <p style={{ margin: '0.25rem 0 0', fontSize: '0.825rem', color: '#ff3b30' }}>Please contact your county office if you have questions or need a refund.</p>
      </div>
    )
  }
  return (
    <div style={{ marginTop: '1rem', padding: '0.85rem 1rem', backgroundColor: 'rgba(255,204,0,0.1)', border: '1px solid rgba(255,204,0,0.3)', borderRadius: '12px' }}>
      <p style={{ margin: 0, fontSize: '0.875rem', color: '#856404' }}>Your order is being reviewed — you will be emailed when a decision is made.</p>
    </div>
  )
}

export default async function OrderStatusPage({ params, searchParams }: Props) {
  const { tenantSlug } = await params
  const { q } = await searchParams
  const tenant = await getTenantBySlug(tenantSlug)
  if (!tenant) notFound()

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
    <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f7', fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', sans-serif" }}>
      <style>{`
        * { box-sizing: border-box; }
        .os-nav { background: #ffffff; border-bottom: 1px solid #d2d2d7; height: 64px; padding: 0 2rem; display: flex; align-items: center; }
        .os-nav-inner { max-width: 1000px; margin: 0 auto; width: 100%; display: flex; align-items: center; justify-content: space-between; }
        .os-body { max-width: 560px; margin: 0 auto; padding: 3rem 1.25rem; }
        .os-card { background: #ffffff; border-radius: 18px; box-shadow: 0 2px 20px rgba(0,0,0,0.08); padding: 2rem; margin-bottom: 1.5rem; }
        .os-row { display: flex; justify-content: space-between; align-items: center; padding: 0.6rem 0; border-bottom: 1px solid #f5f5f7; gap: 1rem; }
        .os-row:last-child { border-bottom: none; }
        .os-label { font-size: 14px; color: #6e6e73; flex-shrink: 0; }
        .os-value { font-size: 14px; color: #1d1d1f; text-align: right; }
        .os-footer { background: #ffffff; border-top: 1px solid #d2d2d7; padding: 1.5rem 2rem; }
        .os-footer-inner { max-width: 1000px; margin: 0 auto; display: flex; flex-direction: row; justify-content: space-between; align-items: center; }
      `}</style>

      {/* NAV */}
      <nav className="os-nav">
        <div className="os-nav-inner">
          <span style={{ fontSize: '15px', fontWeight: '600', color: '#1d1d1f' }}>{tenant.name}</span>
          <a href={'/' + tenantSlug + '/order-status'} style={{ color: '#1d6f3b', fontSize: '14px', textDecoration: 'none' }}>Check order status →</a>
        </div>
      </nav>

      <div className="os-body">
        {/* Page header */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <p style={{ margin: '0 0 0.5rem', fontSize: '11px', fontWeight: '700', letterSpacing: '0.1em', color: '#6e6e73', textTransform: 'uppercase' }}>ORDER STATUS</p>
          <h1 style={{ margin: '0 0 0.5rem', fontSize: '32px', fontWeight: '800', letterSpacing: '-0.03em', color: '#1d1d1f' }}>Track your order</h1>
          <p style={{ margin: 0, fontSize: '15px', color: '#6e6e73' }}>Enter your order number or email to see your current status.</p>
        </div>

        {/* Search card */}
        <div className="os-card">
          <form method="GET" action={'/' + tenantSlug + '/order-status'}>
            <input
              name="q"
              type="text"
              defaultValue={query}
              placeholder="Order number (e.g. NEW-2026-1234) or email address"
              style={{ width: '100%', padding: '1rem 1.25rem', border: '1.5px solid #d2d2d7', borderRadius: '12px', fontSize: '15px', color: '#1d1d1f', outline: 'none', marginBottom: '0.75rem', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', fontFamily: 'inherit', boxSizing: 'border-box' }}
              autoComplete="off"
            />
            <button
              type="submit"
              style={{ width: '100%', padding: '1rem', backgroundColor: '#1d6f3b', color: '#ffffff', border: 'none', borderRadius: '999px', fontSize: '15px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit' }}
            >
              Look up order
            </button>
          </form>
        </div>

        {/* No results */}
        {searched && orders.length === 0 && (
          <div className="os-card" style={{ textAlign: 'center' }}>
            <p style={{ margin: '0 0 0.25rem', fontWeight: '700', color: '#1d1d1f', fontSize: '17px' }}>No order found</p>
            <p style={{ margin: 0, fontSize: '14px', color: '#6e6e73' }}>
              {isEmail
                ? 'No orders are associated with that email address.'
                : 'No order matched that order number. Check for typos and try again.'}
            </p>
          </div>
        )}

        {/* Results */}
        {orders.map((order) => {
          const badge = STATUS_STYLES[order.status] ?? STATUS_STYLES.SUBMITTED
          const plateDisplay = (order.plateText || '').toUpperCase() || '—'
          const amount = order.amountPaid ? '$' + (order.amountPaid / 100).toFixed(2) : null
          return (
            <div key={order.orderNumber} className="os-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <p style={{ margin: 0, fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#6e6e73' }}>ORDER DETAILS</p>
                <span style={{ backgroundColor: badge.bg, color: badge.color, padding: '0.35rem 1rem', borderRadius: '999px', fontSize: '13px', fontWeight: '700', letterSpacing: '0.04em' }}>
                  {badge.label}
                </span>
              </div>

              <div>
                <div className="os-row">
                  <span className="os-label">Order number</span>
                  <strong className="os-value" style={{ fontFamily: 'monospace', color: '#1d6f3b' }}>{order.orderNumber}</strong>
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

              {statusMessage(order.status)}
            </div>
          )
        })}

        {/* Back link */}
        <a href={'/' + tenantSlug} style={{ display: 'block', textAlign: 'center', color: '#1d6f3b', fontSize: '14px', textDecoration: 'none', padding: '1rem', marginBottom: '2rem' }}>
          ← Back to portal
        </a>
      </div>

      {/* FOOTER */}
      <footer className="os-footer">
        <div className="os-footer-inner">
          <p style={{ margin: 0, fontSize: '12px', color: '#6e6e73' }}>Powered by <strong style={{ color: '#6e6e73' }}>CivicPlate OS</strong></p>
          <p style={{ margin: 0, fontSize: '12px', color: '#6e6e73' }}>Questions? Contact your city office.</p>
        </div>
      </footer>
    </div>
  )
}
