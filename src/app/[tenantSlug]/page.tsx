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
  const heroBg = 'linear-gradient(135deg, ' + primary + ' 0%, ' + primary + 'cc 100%)'
  const stepIconBg = primary + '18'
  const cardImgBg = 'linear-gradient(135deg, #f7f5f0 0%, #eeeae2 100%)'
  const plateBorder = '3px solid ' + secondary + '44'
  const iconStyle = { width: '36px', height: '36px', borderRadius: '10px', backgroundColor: stepIconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 as const }
  const stepTitleStyle = { margin: 0, fontWeight: '700', fontSize: '0.9rem', color: '#1a1a1a' }
  const stepSubStyle = { margin: '2px 0 0', fontSize: '0.8rem', color: '#888', lineHeight: '1.4' }
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#fafaf8', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <style>{`
        * { box-sizing: border-box; }
        .cp-hero { padding: 3rem 1.5rem 2.5rem; }
        .cp-hero-inner { max-width: 880px; margin: 0 auto; }
        .cp-steps-outer { padding: 0 1.5rem; margin-top: -1.25rem; margin-bottom: 0.5rem; }
        .cp-steps-inner { max-width: 880px; margin: 0 auto; display: grid; grid-template-columns: 1fr; gap: 0.75rem; }
        .cp-step-card { background: #ffffff; border-radius: 14px; padding: 1.25rem 1.5rem; display: flex; align-items: center; gap: 1rem; box-shadow: 0 1px 4px rgba(0,0,0,0.06); border: 1px solid #f0ede8; }
        .cp-cards-outer { max-width: 880px; margin: 0 auto; padding: 2.5rem 1.5rem; }
        .cp-cards-grid { display: grid; grid-template-columns: 1fr; gap: 1.25rem; }
        .cp-card { background: #ffffff; border-radius: 18px; overflow: hidden; box-shadow: 0 2px 12px rgba(0,0,0,0.07); border: 1px solid #f0ede8; display: flex; flex-direction: column; transition: box-shadow 0.2s, transform 0.2s; }
        .cp-card:hover { box-shadow: 0 8px 28px rgba(0,0,0,0.12); transform: translateY(-2px); }
        .cp-cta { display: inline-flex; align-items: center; gap: 6px; padding: 0.65rem 1.25rem; border-radius: 10px; font-weight: 600; text-decoration: none; font-size: 0.9rem; transition: opacity 0.15s; }
        .cp-cta:hover { opacity: 0.88; }
        .cp-footer { border-top: 1px solid #f0ede8; background: #ffffff; padding: 1.5rem; }
        .cp-footer-inner { max-width: 880px; margin: 0 auto; display: flex; flex-direction: column; gap: 0.25rem; align-items: center; text-align: center; }
        @media (min-width: 640px) {
          .cp-hero { padding: 4rem 2rem 3rem; }
          .cp-steps-outer { padding: 0 2rem; }
          .cp-steps-inner { grid-template-columns: repeat(3, 1fr); gap: 1rem; }
          .cp-cards-outer { padding: 3rem 2rem; }
          .cp-cards-grid { grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); }
          .cp-footer-inner { flex-direction: row; justify-content: space-between; text-align: left; }
        }
      `}</style>

      <div className='cp-hero' style={{ background: heroBg }}>
        <div className='cp-hero-inner'>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: '100px', padding: '6px 14px', marginBottom: '1.25rem' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: secondary }} />
            <span style={{ fontSize: '0.78rem', fontWeight: '600', color: secondary, letterSpacing: '0.05em' }}>{tenantNameUpper}</span>
          </div>
          <h1 style={{ margin: '0 0 0.75rem', fontSize: 'clamp(1.75rem, 5vw, 2.5rem)', fontWeight: '800', color: secondary, lineHeight: '1.1' }}>Design Your Custom Plate</h1>
          <p style={{ margin: '0', color: secondary, opacity: 0.8, fontSize: '1.05rem', maxWidth: '480px', lineHeight: '1.6' }}>Choose a style, personalize your text, and submit your request in just a few minutes.</p>
        </div>
      </div>

      <div className='cp-steps-outer'>
        <div className='cp-steps-inner'>
          <div className='cp-step-card'>
            <div style={iconStyle}><span style={{ fontSize: '1.1rem' }}>🎨</span></div>
            <div><p style={stepTitleStyle}>Pick a style</p><p style={stepSubStyle}>Choose from available templates</p></div>
          </div>
          <div className='cp-step-card'>
            <div style={iconStyle}><span style={{ fontSize: '1.1rem' }}>✏️</span></div>
            <div><p style={stepTitleStyle}>Personalize it</p><p style={stepSubStyle}>Type in your plate text and preview it live</p></div>
          </div>
          <div className='cp-step-card'>
            <div style={iconStyle}><span style={{ fontSize: '1.1rem' }}>📬</span></div>
    <div><p style={stepTitleStyle}>Submit your request</p><p style={stepSubStyle}>City staff reviews within 2-3 business days</p></div>
          </div>
        </div>
      </div>

      <div className='cp-cards-outer'>
        <h2 style={{ margin: '0 0 0.4rem', fontSize: '1.2rem', fontWeight: '700', color: '#1a1a1a' }}>Available Plates</h2>
        <p style={{ margin: '0 0 1.75rem', fontSize: '0.88rem', color: '#888' }}>Tap any plate to start customizing</p>
        <div className='cp-cards-grid'>
          {templates.map((template) => {
            const href = '/' + slug + '/design/' + template.id
            return (
              <div key={template.id} className='cp-card'>
                <div style={{ background: cardImgBg, padding: '2rem 1.5rem', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  <div style={{ width: '180px', height: '90px', backgroundColor: primary, borderRadius: '10px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', boxShadow: '0 4px 16px rgba(0,0,0,0.18)', border: plateBorder }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: secondary, opacity: 0.4, position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: secondary, opacity: 0.4, position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)' }} />
                    <span style={{ fontSize: '1.25rem', fontWeight: '900', color: secondary, letterSpacing: '0.15em', fontFamily: 'Arial Black, Arial, sans-serif' }}>ABC 123</span>
                    <span style={{ fontSize: '0.55rem', fontWeight: '700', color: secondary, letterSpacing: '0.12em', marginTop: '5px', opacity: 0.7 }}>{tenantNameUpper}</span>
                  </div>
                </div>
                <div style={{ padding: '1.4rem 1.5rem 1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <h3 style={{ margin: '0 0 0.35rem', fontSize: '1.05rem', fontWeight: '700', color: '#1a1a1a' }}>{template.name}</h3>
                  <p style={{ margin: '0 0 1.25rem', fontSize: '0.85rem', color: '#888', lineHeight: '1.55', flex: 1 }}>{template.baseTemplate.description}</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <span style={{ fontSize: '1.5rem', fontWeight: '800', color: '#1a1a1a' }}>${template.price.toFixed(2)}</span>
                      <span style={{ fontSize: '0.78rem', color: '#aaa', marginLeft: '4px' }}>/ plate</span>
                    </div>
                    <a href={href} className='cp-cta' style={{ backgroundColor: primary, color: secondary }}>Customize</a>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className='cp-footer'>
        <div className='cp-footer-inner'>
          <p style={{ margin: 0, fontSize: '0.78rem', color: '#bbb' }}>Powered by <strong style={{ color: '#999' }}>CivicPlate OS</strong></p>
          <p style={{ margin: 0, fontSize: '0.78rem', color: '#bbb' }}>Questions? Contact your city office.</p>
        </div>
      </div>
    </div>
  )
}