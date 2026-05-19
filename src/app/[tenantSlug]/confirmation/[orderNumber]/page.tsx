import { notFound } from 'next/navigation'
import { getTenantBySlug } from '@/lib/tenant'
import { prisma } from '@/lib/prisma'

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
  const primary = tenant.primaryColor
  const secondary = tenant.secondaryColor
  const tenantName = tenant.name
  const tenantNameUpper = tenant.name.toUpperCase()
  const backHref = '/' + tenantSlug
  const plateText = mainText || 'ABC 123'
  const plateTextUpper = plateText.toUpperCase()
  const amountDisplay = order.amountPaid ? '$' + (order.amountPaid / 100).toFixed(2) : null
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f4f6f9', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <style>{`
        .cf-hero { padding: 2rem 1.25rem; text-align: center; }
        .cf-body { max-width: 580px; margin: 0 auto; padding: 1.5rem 1.25rem; }
        @media (min-width: 640px) {
          .cf-hero { padding: 2.5rem 2rem; }
          .cf-body { padding: 2rem 1.5rem; }
        }
      `}</style>

      <div className='cf-hero' style={{ backgroundColor: primary }}>
        <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: secondary, margin: '0 auto 1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width='28' height='28' viewBox='0 0 24 24' fill='none' stroke={primary} strokeWidth='2.5' strokeLinecap='round' strokeLinejoin='round'><polyline points='20 6 9 17 4 12'/></svg>
        </div>
        <h1 style={{ margin: '0 0 0.4rem', fontSize: '1.6rem', fontWeight: '700', color: secondary }}>Payment Received!</h1>
        <p style={{ margin: 0, color: secondary, opacity: 0.75, fontSize: '0.9rem' }}>{tenantName} License Plate Portal</p>
      </div>

      <div className='cf-body'>

        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e6ea', borderRadius: '12px', padding: '1.5rem', marginBottom: '1.25rem', display: 'flex', justifyContent: 'center' }}>
          <div style={{ width: '100%', maxWidth: '260px', aspectRatio: '2/1', backgroundColor: '#ffffff', border: '4px solid ' + primary, borderRadius: '10px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', boxShadow: '0 2px 8px rgba(0,0,0,0.12)' }}>
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#cbd5e0', position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#cbd5e0', position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)' }} />
            <span style={{ fontSize: 'clamp(1.1rem, 5vw, 1.6rem)', fontWeight: '800', color: primary, letterSpacing: '0.18em', fontFamily: 'monospace' }}>{plateTextUpper}</span>
            <span style={{ fontSize: '0.6rem', fontWeight: '600', color: primary, letterSpacing: '0.12em', marginTop: '6px', opacity: 0.7 }}>{tenantNameUpper}</span>
          </div>
        </div>

        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e6ea', borderRadius: '12px', padding: '1.5rem', marginBottom: '1.25rem' }}>
          <p style={{ margin: '0 0 1rem', fontSize: '0.72rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.06em', color: '#a0aec0' }}>Order Details</p>
          <div style={{ display: 'grid', gap: '0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.65rem 0', borderBottom: '1px solid #f1f5f9', gap: '1rem' }}>
              <span style={{ fontSize: '0.875rem', color: '#718096', flexShrink: 0 }}>Order number</span>
              <strong style={{ color: primary, fontFamily: 'monospace', fontSize: '0.9rem', textAlign: 'right' }}>{order.orderNumber}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.65rem 0', borderBottom: '1px solid #f1f5f9', gap: '1rem' }}>
              <span style={{ fontSize: '0.875rem', color: '#718096', flexShrink: 0 }}>Plate text</span>
              <strong style={{ fontFamily: 'monospace', letterSpacing: '0.1em', fontSize: '0.95rem', color: '#1a202c' }}>{plateTextUpper}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.65rem 0', borderBottom: '1px solid #f1f5f9', gap: '1rem' }}>
              <span style={{ fontSize: '0.875rem', color: '#718096', flexShrink: 0 }}>Template</span>
              <span style={{ fontSize: '0.875rem', color: '#1a202c', textAlign: 'right' }}>{order.design.tenantTemplate.name}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.65rem 0', borderBottom: '1px solid #f1f5f9', gap: '1rem' }}>
              <span style={{ fontSize: '0.875rem', color: '#718096', flexShrink: 0 }}>Customer</span>
              <span style={{ fontSize: '0.875rem', color: '#1a202c', textAlign: 'right' }}>{order.customerName}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.65rem 0', borderBottom: '1px solid #f1f5f9', gap: '1rem' }}>
              <span style={{ fontSize: '0.875rem', color: '#718096', flexShrink: 0 }}>Email</span>
              <span style={{ fontSize: '0.8rem', color: '#1a202c', textAlign: 'right', wordBreak: 'break-all' }}>{order.customerEmail}</span>
            </div>
            {amountDisplay && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.65rem 0', borderBottom: '1px solid #f1f5f9', gap: '1rem' }}>
                <span style={{ fontSize: '0.875rem', color: '#718096', flexShrink: 0 }}>Amount paid</span>
                <strong style={{ fontSize: '0.95rem', color: '#1a202c' }}>{amountDisplay}</strong>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.65rem 0', gap: '1rem' }}>
              <span style={{ fontSize: '0.875rem', color: '#718096', flexShrink: 0 }}>Status</span>
              <span style={{ backgroundColor: '#fef9c3', color: '#854d0e', padding: '0.2rem 0.75rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: '700', letterSpacing: '0.04em' }}>SUBMITTED</span>
            </div>
          </div>
        </div>

        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e6ea', borderRadius: '12px', padding: '1.5rem', marginBottom: '1.25rem' }}>
          <p style={{ margin: '0 0 1.25rem', fontSize: '0.72rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.06em', color: '#a0aec0' }}>What happens next</p>
          <div style={{ display: 'flex', gap: '1rem', paddingBottom: '1.25rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: primary, color: secondary, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2.5' strokeLinecap='round' strokeLinejoin='round'><polyline points='20 6 9 17 4 12'/></svg>
              </div>
              <div style={{ width: '1px', flex: 1, backgroundColor: '#e2e6ea', marginTop: '6px' }} />
            </div>
            <div style={{ paddingTop: '4px', paddingBottom: '1rem' }}>
              <p style={{ margin: '0 0 0.2rem', fontWeight: '600', fontSize: '0.9rem', color: '#1a202c' }}>Payment confirmed</p>
              <p style={{ margin: 0, fontSize: '0.82rem', color: '#718096' }}>Your payment has been received and your order logged as {order.orderNumber}</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '1rem', paddingBottom: '1.25rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#e2e6ea', color: '#718096', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '0.85rem', fontWeight: '700' }}>2</div>
              <div style={{ width: '1px', flex: 1, backgroundColor: '#e2e6ea', marginTop: '6px' }} />
            </div>
            <div style={{ paddingTop: '4px', paddingBottom: '1rem' }}>
              <p style={{ margin: '0 0 0.2rem', fontWeight: '600', fontSize: '0.9rem', color: '#1a202c' }}>Staff review</p>
              <p style={{ margin: 0, fontSize: '0.82rem', color: '#718096' }}>City staff will review your design within 2-3 business days</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#e2e6ea', color: '#718096', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '0.85rem', fontWeight: '700' }}>3</div>
            <div style={{ paddingTop: '4px' }}>
              <p style={{ margin: '0 0 0.2rem', fontWeight: '600', fontSize: '0.9rem', color: '#1a202c' }}>Decision emailed to you</p>
              <p style={{ margin: 0, fontSize: '0.82rem', color: '#718096' }}>You will hear back at {order.customerEmail}</p>
            </div>
          </div>
        </div>

        <a href={'/' + tenantSlug + '/order-status?q=' + encodeURIComponent(order.orderNumber)} style={{ display: 'block', textAlign: 'center', backgroundColor: '#ffffff', color: primary, border: '1px solid ' + primary, padding: '0.9rem', borderRadius: '8px', fontWeight: '600', textDecoration: 'none', fontSize: '0.95rem', marginBottom: '0.75rem' }}>Check your order status</a>
        <a href={backHref} style={{ display: 'block', textAlign: 'center', backgroundColor: primary, color: secondary, padding: '0.9rem', borderRadius: '8px', fontWeight: '600', textDecoration: 'none', fontSize: '0.95rem' }}>Back to Portal</a>
        <div style={{ height: '2rem' }} />
      </div>
    </div>
  )
}