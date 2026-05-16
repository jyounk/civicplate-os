import { notFound } from 'next/navigation'
import { getTenantBySlug } from '@/lib/tenant'

type Props = { params: Promise<{ tenantSlug: string }> }

export default async function TenantHomePage({ params }: Props) {
  const { tenantSlug } = await params
  const tenant = await getTenantBySlug(tenantSlug)
  if (!tenant) { notFound() }
  const primary = tenant.primaryColor
  const secondary = tenant.secondaryColor
  const slug = tenant.slug
  const tenantName = tenant.name
  const tenantNameUpper = tenant.name.toUpperCase()
  const templates = tenant.tenantTemplates
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f4f6f9', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <style>{`
        .cp-hero { padding: 2.5rem 1.25rem; }
        .cp-hero-inner { max-width: 860px; margin: 0 auto; }
        .cp-steps { background: #fff; border-bottom: 1px solid #e2e6ea; }
        .cp-steps-inner { max-width: 860px; margin: 0 auto; padding: 1.25rem; display: flex; flex-direction: column; gap: 1rem; }
        .cp-step { display: flex; align-items: flex-start; gap: 0.75rem; }
        .cp-step-divider { display: none; }
        .cp-cards-outer { max-width: 860px; margin: 0 auto; padding: 2rem 1.25rem; }
        .cp-cards-grid { display: grid; grid-template-columns: 1fr; gap: 1.25rem; }
        .cp-footer-inner { max-width: 860px; margin: 0 auto; display: flex; flex-direction: column; gap: 0.25rem; }
        @media (min-width: 640px) {
          .cp-hero { padding: 3rem 2rem; }
          .cp-steps-inner { flex-direction: row; padding: 1.5rem 2rem; }
          .cp-step-divider { display: block; width: 1px; background: #e2e6ea; align-self: stretch; margin: 0 1rem; }
          .cp-cards-outer { padding: 2.5rem 2rem; }
          .cp-cards-grid { grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); }
          .cp-footer-inner { flex-direction: row; justify-content: space-between; align-items: center; }
        }
      `}</style>

      {/* HERO */}
      <div className='cp-hero' style={{ backgroundColor: primary }}>
        <div className='cp-hero-inner'>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
            <div style={{ width: '52px', height: '52px', borderRadius: '50%', backgroundColor: secondary, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width='28' height='28' viewBox='0 0 24 24' fill='none' stroke={primary} strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
                <rect x='2' y='7' width='20' height='10' rx='2'/>
                <circle cx='6' cy='12' r='1' fill={primary}/>
                <circle cx='18' cy='12' r='1' fill={primary}/>
                <line x1='9' y1='12' x2='15' y2='12'/>
              </svg>
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: '1.75rem', fontWeight: '700', color: secondary, lineHeight: '1.1' }}>{tenantName}</h1>
              <p style={{ margin: '0.25rem 0 0', color: secondary, opacity: 0.75, fontSize: '0.9rem' }}>License Plate Customization Portal</p>
            </div>
          </div>
          <p style={{ margin: 0, color: secondary, opacity: 0.7, fontSize: '0.9rem', maxWidth: '520px' }}>Design and submit your custom license plate request online. Orders are reviewed and approved by city staff.</p>
        </div>
      </div>

      {/* HOW IT WORKS */}
      <div className='cp-steps'>
        <div className='cp-steps-inner'>
          <div className='cp-step'>
            <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: primary, color: secondary, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: '700', flexShrink: 0 }}>1</div>
            <div><p style={{ margin: 0, fontWeight: '600', fontSize: '0.875rem', color: '#1a202c' }}>Choose a template</p><p style={{ margin: '0.2rem 0 0', fontSize: '0.8rem', color: '#718096' }}>Pick the plate style that suits you</p></div>
          </div>
          <div className='cp-step-divider' />
          <div className='cp-step'>
            <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: primary, color: secondary, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: '700', flexShrink: 0 }}>2</div>
            <div><p style={{ margin: 0, fontWeight: '600', fontSize: '0.875rem', color: '#1a202c' }}>Customize your text</p><p style={{ margin: '0.2rem 0 0', fontSize: '0.8rem', color: '#718096' }}>Enter your plate number and options</p></div>
          </div>
          <div className='cp-step-divider' />
          <div className='cp-step'>
            <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: primary, color: secondary, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: '700', flexShrink: 0 }}>3</div>
            <div><p style={{ margin: 0, fontWeight: '600', fontSize: '0.875rem', color: '#1a202c' }}>Submit for approval</p><p style={{ margin: '0.2rem 0 0', fontSize: '0.8rem', color: '#718096' }}>City staff reviews within 2-3 business days</p></div>
          </div>
        </div>
      </div>

      {/* TEMPLATE CARDS */}
      <div className='cp-cards-outer'>
        <h2 style={{ margin: '0 0 1.5rem', fontSize: '1.1rem', fontWeight: '600', color: '#1a202c' }}>Available Plate Templates</h2>
        <div className='cp-cards-grid'>
          {templates.map((template) => {
            const href = '/' + slug + '/design/' + template.id
            return (
              <div key={template.id} style={{ backgroundColor: '#ffffff', border: '1px solid #e2e6ea', borderRadius: '12px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                <div style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e6ea', padding: '1.5rem', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  <div style={{ width: '160px', height: '80px', backgroundColor: '#ffffff', border: '3px solid ' + primary, borderRadius: '8px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', boxShadow: '0 1px 4px rgba(0,0,0,0.12)' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#cbd5e0', position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)' }} />
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#cbd5e0', position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)' }} />
                    <span style={{ fontSize: '1.1rem', fontWeight: '800', color: primary, letterSpacing: '0.15em', fontFamily: 'monospace' }}>ABC 123</span>
                    <span style={{ fontSize: '0.55rem', fontWeight: '600', color: primary, letterSpacing: '0.1em', marginTop: '4px', opacity: 0.7 }}>{tenantNameUpper}</span>
                  </div>
                </div>
                <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <h3 style={{ margin: '0 0 0.4rem', fontSize: '1rem', fontWeight: '600', color: '#1a202c' }}>{template.name}</h3>
                  <p style={{ margin: '0 0 1rem', fontSize: '0.85rem', color: '#718096', lineHeight: '1.5', flex: 1 }}>{template.baseTemplate.description}</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div><span style={{ fontSize: '1.3rem', fontWeight: '700', color: primary }}>${template.price.toFixed(2)}</span><span style={{ fontSize: '0.8rem', color: '#a0aec0', marginLeft: '4px' }}>/ plate</span></div>
                    <a href={href} style={{ backgroundColor: primary, color: secondary, padding: '0.55rem 1.1rem', borderRadius: '6px', fontWeight: '600', textDecoration: 'none', fontSize: '0.875rem' }}>Customize &rarr;</a>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* FOOTER */}
      <div style={{ borderTop: '1px solid #e2e6ea', backgroundColor: '#ffffff', padding: '1.25rem' }}>
        <div className='cp-footer-inner'>
          <p style={{ margin: 0, fontSize: '0.78rem', color: '#a0aec0' }}>{tenantName} — Powered by CivicPlate OS</p>
          <p style={{ margin: 0, fontSize: '0.78rem', color: '#a0aec0' }}>Questions? Contact your city office.</p>
        </div>
      </div>
    </div>
  )
}