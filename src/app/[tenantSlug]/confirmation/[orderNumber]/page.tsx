import { notFound } from 'next/navigation'
import { getTenantBySlug } from '@/lib/tenant'
import { prisma } from '@/lib/prisma'
import GeorgiaPlate from '@/components/designer/GeorgiaPlate'

type Props = { params: Promise<{ tenantSlug: string; orderNumber: string }> }

export default async function ConfirmationPage({ params }: Props) {
  const { tenantSlug, orderNumber } = await params
  const tenant = await getTenantBySlug(tenantSlug)
  if (!tenant) notFound()
  const order = await prisma.order.findUnique({
    where: { orderNumber },
    include: { design: { include: { tenantTemplate: { include: { baseTemplate: true } } } } }
  })
  if (!order) notFound()
  const placements = order.design.zonePlacements as { zoneId: string; value: string }[]
  const mainText = placements.find((p) => p.zoneId === 'main-text')?.value ?? ''
  const tenantName = tenant.name
  const backHref = '/' + tenantSlug
  const plateText = mainText || 'ABC 123'
  const plateTextUpper = plateText.toUpperCase()
  const amountDisplay = order.amountPaid ? '$' + (order.amountPaid / 100).toFixed(2) : null
  const renderConfig = (order.design.renderConfig ?? {}) as Record<string, string>
  const scene = (renderConfig.scene as 'peach' | 'mountain' | 'coast') || 'peach'
  const slug = tenant.slug

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f7', fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', sans-serif" }}>
      <style>{`
        * { box-sizing: border-box; }
        .cf-nav { background: #ffffff; border-bottom: 1px solid #d2d2d7; height: 64px; padding: 0 2rem; display: flex; align-items: center; }
        .cf-nav-inner { max-width: 1000px; margin: 0 auto; width: 100%; display: flex; align-items: center; justify-content: space-between; }
        .cf-body { max-width: 560px; margin: 0 auto; padding: 3rem 1.25rem; }
        .cf-card { background: #ffffff; border-radius: 18px; box-shadow: 0 2px 20px rgba(0,0,0,0.08); padding: 2rem; margin-bottom: 1.25rem; }
        .cf-row { display: flex; justify-content: space-between; align-items: center; padding: 0.65rem 0; border-bottom: 1px solid #f5f5f7; gap: 1rem; }
        .cf-row:last-child { border-bottom: none; }
        .cf-footer { background: #ffffff; border-top: 1px solid #d2d2d7; padding: 1.5rem 2rem; }
        .cf-footer-inner { max-width: 1000px; margin: 0 auto; display: flex; flex-direction: row; justify-content: space-between; align-items: center; }
        @media (max-width: 639px) {
          .cf-body { padding: 2rem 1.25rem; }
        }
      `}</style>

      {/* NAV */}
      <nav className="cf-nav">
        <div className="cf-nav-inner">
          <span style={{ fontSize: '15px', fontWeight: '600', color: '#1d1d1f' }}>{tenantName}</span>
          <a href={'/' + slug + '/order-status'} style={{ color: '#1d6f3b', fontSize: '14px', textDecoration: 'none' }}>Check order status →</a>
        </div>
      </nav>

      <div className="cf-body">
        {/* Success indicator */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '3rem' }}>
          <div style={{ width: '72px', height: '72px', borderRadius: '50%', backgroundColor: '#34c759', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h1 style={{ margin: '0 0 0.75rem', fontSize: '36px', fontWeight: '800', letterSpacing: '-0.03em', color: '#1d1d1f', textAlign: 'center' }}>
            You&apos;re all set.
          </h1>
          <p style={{ margin: '0 0 0', fontSize: '16px', color: '#6e6e73', textAlign: 'center', lineHeight: '1.6', maxWidth: '420px' }}>
            Your order has been submitted to {tenantName}. You&apos;ll hear back by email within 2–3 business days.
          </p>
        </div>

        {/* Plate preview card */}
        <div className="cf-card" style={{ display: 'flex', justifyContent: 'center' }}>
          <div style={{ width: '100%', maxWidth: '300px' }}>
            <GeorgiaPlate plateText={plateTextUpper} countyName={tenantName} width={600} height={300} scene={scene} />
          </div>
        </div>

        {/* Order summary card */}
        <div className="cf-card">
          <p style={{ margin: '0 0 1.25rem', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#6e6e73' }}>ORDER SUMMARY</p>
          <div>
            <div className="cf-row">
              <span style={{ fontSize: '14px', color: '#6e6e73', flexShrink: 0 }}>Order number</span>
              <strong style={{ fontFamily: 'monospace', fontSize: '14px', color: '#1d6f3b' }}>{order.orderNumber}</strong>
            </div>
            <div className="cf-row">
              <span style={{ fontSize: '14px', color: '#6e6e73', flexShrink: 0 }}>Plate text</span>
              <strong style={{ fontFamily: 'monospace', letterSpacing: '0.1em', fontSize: '14px', color: '#1d1d1f' }}>{plateTextUpper}</strong>
            </div>
            <div className="cf-row">
              <span style={{ fontSize: '14px', color: '#6e6e73', flexShrink: 0 }}>Template</span>
              <span style={{ fontSize: '14px', color: '#1d1d1f', textAlign: 'right' }}>{order.design.tenantTemplate.name}</span>
            </div>
            <div className="cf-row">
              <span style={{ fontSize: '14px', color: '#6e6e73', flexShrink: 0 }}>Customer</span>
              <span style={{ fontSize: '14px', color: '#1d1d1f', textAlign: 'right' }}>{order.customerName}</span>
            </div>
            <div className="cf-row">
              <span style={{ fontSize: '14px', color: '#6e6e73', flexShrink: 0 }}>Email</span>
              <span style={{ fontSize: '14px', color: '#1d1d1f', textAlign: 'right', wordBreak: 'break-all' }}>{order.customerEmail}</span>
            </div>
            {amountDisplay && (
              <div className="cf-row">
                <span style={{ fontSize: '14px', color: '#6e6e73', flexShrink: 0 }}>Amount paid</span>
                <strong style={{ fontSize: '14px', color: '#1d1d1f' }}>{amountDisplay}</strong>
              </div>
            )}
            <div className="cf-row">
              <span style={{ fontSize: '14px', color: '#6e6e73', flexShrink: 0 }}>Status</span>
              <span style={{ backgroundColor: '#fef9c3', color: '#854d0e', padding: '4px 12px', borderRadius: '999px', fontSize: '12px', fontWeight: '700', letterSpacing: '0.04em' }}>SUBMITTED</span>
            </div>
          </div>
        </div>

        {/* What happens next card */}
        <div className="cf-card" style={{ marginBottom: '1.5rem' }}>
          <p style={{ margin: '0 0 1.25rem', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#6e6e73' }}>WHAT HAPPENS NEXT</p>

          {/* Step 1 */}
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '0' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#34c759', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <div style={{ width: '1px', flex: 1, backgroundColor: '#d2d2d7', marginTop: '6px', minHeight: '24px' }} />
            </div>
            <div style={{ paddingTop: '4px', paddingBottom: '1.25rem' }}>
              <p style={{ margin: '0 0 0.2rem', fontWeight: '600', fontSize: '15px', color: '#1d1d1f' }}>Payment confirmed</p>
              <p style={{ margin: 0, fontSize: '13px', color: '#6e6e73', lineHeight: '1.5' }}>Received and logged as {order.orderNumber}</p>
            </div>
          </div>

          {/* Step 2 */}
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '0' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#f5f5f7', border: '2px solid #d2d2d7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '14px', fontWeight: '700', color: '#6e6e73' }}>2</div>
              <div style={{ width: '1px', flex: 1, backgroundColor: '#d2d2d7', marginTop: '6px', minHeight: '24px' }} />
            </div>
            <div style={{ paddingTop: '4px', paddingBottom: '1.25rem' }}>
              <p style={{ margin: '0 0 0.2rem', fontWeight: '600', fontSize: '15px', color: '#1d1d1f' }}>Staff review</p>
              <p style={{ margin: 0, fontSize: '13px', color: '#6e6e73', lineHeight: '1.5' }}>City staff will review your design within 2–3 business days</p>
            </div>
          </div>

          {/* Step 3 */}
          <div style={{ display: 'flex', gap: '1rem' }}>
            <div style={{ flexShrink: 0 }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#f5f5f7', border: '2px solid #d2d2d7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: '700', color: '#6e6e73' }}>3</div>
            </div>
            <div style={{ paddingTop: '4px' }}>
              <p style={{ margin: '0 0 0.2rem', fontWeight: '600', fontSize: '15px', color: '#1d1d1f' }}>Decision emailed</p>
              <p style={{ margin: 0, fontSize: '13px', color: '#6e6e73', lineHeight: '1.5' }}>You will hear back at {order.customerEmail}</p>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <a
          href={'/' + tenantSlug + '/order-status?q=' + encodeURIComponent(order.orderNumber)}
          style={{ display: 'block', textAlign: 'center', backgroundColor: '#ffffff', color: '#1d1d1f', border: '1.5px solid #d2d2d7', padding: '0.9rem', borderRadius: '12px', fontWeight: '600', textDecoration: 'none', fontSize: '15px', marginBottom: '0.75rem' }}
        >
          Check order status
        </a>
        <a
          href={backHref}
          style={{ display: 'block', textAlign: 'center', backgroundColor: '#1d6f3b', color: '#ffffff', padding: '0.9rem', borderRadius: '12px', fontWeight: '600', textDecoration: 'none', fontSize: '15px' }}
        >
          Back to portal
        </a>

        <div style={{ height: '3rem' }} />
      </div>

      {/* FOOTER */}
      <footer className="cf-footer">
        <div className="cf-footer-inner">
          <p style={{ margin: 0, fontSize: '12px', color: '#6e6e73' }}>Powered by <strong style={{ color: '#6e6e73' }}>CivicPlate OS</strong></p>
          <p style={{ margin: 0, fontSize: '12px', color: '#6e6e73' }}>Questions? Contact your city office.</p>
        </div>
      </footer>
    </div>
  )
}
