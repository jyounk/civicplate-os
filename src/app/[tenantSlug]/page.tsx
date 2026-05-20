import { notFound } from 'next/navigation'
import { getTenantBySlug } from '@/lib/tenant'
import GeorgiaPlate from '@/components/designer/GeorgiaPlate'

type Props = { params: Promise<{ tenantSlug: string }>; searchParams: Promise<{ plate_taken?: string }> }

export default async function TenantHomePage({ params, searchParams }: Props) {
  const { tenantSlug } = await params
  const sp = await searchParams
  const plateTaken = sp.plate_taken === '1'
  const tenant = await getTenantBySlug(tenantSlug)
  if (!tenant) { notFound() }

  const slug = tenant.slug
  const tenantName = tenant.name
  const templates = tenant.tenantTemplates

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f7', fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', sans-serif" }}>
      <style>{`
        * { box-sizing: border-box; }

        .lp-nav { background: #ffffff; border-bottom: 1px solid #d2d2d7; height: 64px; padding: 0 2rem; display: flex; align-items: center; justify-content: space-between; }
        .lp-nav-inner { max-width: 1000px; margin: 0 auto; width: 100%; display: flex; align-items: center; justify-content: space-between; }

        .lp-hero { background: #f5f5f7; padding: 5rem 2rem 6rem; }
        .lp-hero-inner { max-width: 680px; margin: 0 auto; text-align: center; }

        .lp-steps { background: #ffffff; padding: 5rem 2rem; }
        .lp-steps-inner { max-width: 1000px; margin: 0 auto; }
        .lp-steps-grid { display: grid; grid-template-columns: 1fr; gap: 3rem; }

        .lp-cards-outer { background: #f5f5f7; padding: 5rem 2rem; }
        .lp-cards-inner { max-width: 1000px; margin: 0 auto; }
        .lp-cards-grid { display: grid; grid-template-columns: 1fr; gap: 1.5rem; }
        .lp-card { background: #ffffff; border-radius: 18px; overflow: hidden; border: 1px solid #d2d2d7; box-shadow: 0 2px 20px rgba(0,0,0,0.08); display: flex; flex-direction: column; position: relative; transition: box-shadow 0.2s, transform 0.2s; }
        .lp-card:hover { box-shadow: 0 8px 32px rgba(0,0,0,0.12); transform: translateY(-3px); }
        .lp-card-popular { border: 1.5px solid #34c759; }

        .lp-footer { background: #ffffff; border-top: 1px solid #d2d2d7; padding: 1.5rem 2rem; }
        .lp-footer-inner { max-width: 1000px; margin: 0 auto; display: flex; flex-direction: row; justify-content: space-between; align-items: center; }

        @media (min-width: 640px) {
          .lp-steps-grid { grid-template-columns: repeat(3, 1fr); }
          .lp-cards-grid { grid-template-columns: repeat(3, 1fr); }
        }
      `}</style>

      {plateTaken && (
        <div style={{ background: '#fef2f2', borderBottom: '1px solid #fecaca', padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '1.25rem' }}>⚠️</span>
          <div>
            <p style={{ margin: '0 0 2px', fontWeight: '700', color: '#dc2626', fontSize: '0.95rem' }}>Plate text already taken</p>
            <p style={{ margin: 0, color: '#ef4444', fontSize: '0.825rem' }}>Someone else secured that plate while you were checking out. Please choose a different plate text and try again. Contact your city office regarding a refund.</p>
          </div>
        </div>
      )}

      {/* NAV */}
      <nav className="lp-nav">
        <div className="lp-nav-inner">
          <span style={{ fontSize: '15px', fontWeight: '600', color: '#1d1d1f' }}>{tenantName}</span>
          <a href={'/' + slug + '/order-status'} style={{ color: '#1d6f3b', fontSize: '14px', textDecoration: 'none' }}>Check order status →</a>
        </div>
      </nav>

      {/* HERO */}
      <section className="lp-hero">
        <div className="lp-hero-inner">
          <div style={{ display: 'inline-block', backgroundColor: 'rgba(29,111,59,0.08)', border: '1px solid rgba(29,111,59,0.2)', borderRadius: '999px', padding: '5px 14px', marginBottom: '1.75rem' }}>
            <span style={{ fontSize: '12px', fontWeight: '600', color: '#1d6f3b' }}>Official License Plate Portal</span>
          </div>
          <h1 style={{ margin: '0 0 1.25rem', fontSize: 'clamp(2rem, 8vw, 3.5rem)', fontWeight: '800', letterSpacing: '-0.03em', color: '#1d1d1f', lineHeight: '1.1' }}>
            Your plate, your way.
          </h1>
          <p style={{ margin: '0 auto 2.5rem', fontSize: '20px', color: '#6e6e73', lineHeight: '1.6', maxWidth: '500px' }}>
            {tenantName}&apos;s official custom license plate portal. Design yours in minutes.
          </p>
          <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', flexWrap: 'wrap', alignItems: 'center' }}>
            <a href="#plates" style={{ backgroundColor: '#1d6f3b', color: '#ffffff', fontSize: '16px', fontWeight: '600', borderRadius: '999px', padding: '1rem 2.5rem', textDecoration: 'none' }}>
              Browse plate styles
            </a>
            <a href={'/' + slug + '/order-status'} style={{ color: '#1d6f3b', fontSize: '16px', textDecoration: 'none', background: 'none' }}>
              Check order status →
            </a>
          </div>
        </div>
      </section>

      {/* STEPS */}
      <section className="lp-steps">
        <div className="lp-steps-inner">
          <p style={{ margin: '0 0 0.75rem', fontSize: '11px', fontWeight: '700', letterSpacing: '0.1em', color: '#6e6e73', textTransform: 'uppercase' }}>HOW IT WORKS</p>
          <h2 style={{ margin: '0 0 4rem', fontSize: '36px', fontWeight: '800', letterSpacing: '-0.03em', color: '#1d1d1f' }}>Simple from start to finish</h2>
          <div className="lp-steps-grid">
            <div>
              <div style={{ width: '52px', height: '52px', borderRadius: '50%', backgroundColor: 'rgba(52,199,89,0.12)', color: '#34c759', fontSize: '22px', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>1</div>
              <h3 style={{ margin: '0 0 0.5rem', fontSize: '18px', fontWeight: '700', letterSpacing: '-0.02em', color: '#1d1d1f' }}>Pick a style</h3>
              <p style={{ margin: 0, fontSize: '15px', color: '#6e6e73', lineHeight: '1.6' }}>Choose from available templates</p>
            </div>
            <div>
              <div style={{ width: '52px', height: '52px', borderRadius: '50%', backgroundColor: 'rgba(52,199,89,0.12)', color: '#34c759', fontSize: '22px', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>2</div>
              <h3 style={{ margin: '0 0 0.5rem', fontSize: '18px', fontWeight: '700', letterSpacing: '-0.02em', color: '#1d1d1f' }}>Personalize it</h3>
              <p style={{ margin: 0, fontSize: '15px', color: '#6e6e73', lineHeight: '1.6' }}>Preview your plate live as you type</p>
            </div>
            <div>
              <div style={{ width: '52px', height: '52px', borderRadius: '50%', backgroundColor: 'rgba(52,199,89,0.12)', color: '#34c759', fontSize: '22px', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>3</div>
              <h3 style={{ margin: '0 0 0.5rem', fontSize: '18px', fontWeight: '700', letterSpacing: '-0.02em', color: '#1d1d1f' }}>Submit your request</h3>
              <p style={{ margin: 0, fontSize: '15px', color: '#6e6e73', lineHeight: '1.6' }}>Staff reviews within 2–3 business days</p>
            </div>
          </div>
        </div>
      </section>

      {/* PLATE CARDS */}
      <section id="plates" className="lp-cards-outer">
        <div className="lp-cards-inner">
          <p style={{ margin: '0 0 0.75rem', fontSize: '11px', fontWeight: '700', letterSpacing: '0.1em', color: '#6e6e73', textTransform: 'uppercase' }}>AVAILABLE PLATES</p>
          <h2 style={{ margin: '0 0 3rem', fontSize: '36px', fontWeight: '800', letterSpacing: '-0.03em', color: '#1d1d1f' }}>Choose your style</h2>
          <div className="lp-cards-grid">
            {templates.map((template, idx) => {
              const isPopular = idx === 1
              const href = '/' + slug + '/design/' + template.id
              return (
                <div key={template.id} className={'lp-card' + (isPopular ? ' lp-card-popular' : '')}>
                  {isPopular && (
                    <div style={{ position: 'absolute', top: '14px', right: '14px', backgroundColor: '#34c759', color: '#0a3d1a', fontSize: '11px', fontWeight: '700', letterSpacing: '0.04em', padding: '4px 12px', borderRadius: '999px', zIndex: 1 }}>
                      Most popular
                    </div>
                  )}
                  <div style={{ backgroundColor: '#f0f5f1', padding: '2rem 1.5rem', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <div style={{ width: '100%', maxWidth: '240px' }}>
                      <GeorgiaPlate plateText="ABC 1234" countyName={tenantName} width={400} height={200} />
                    </div>
                  </div>
                  <div style={{ padding: '1.75rem 1.75rem 2rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <h3 style={{ margin: '0 0 0.4rem', fontSize: '18px', fontWeight: '700', letterSpacing: '-0.02em', color: '#1d1d1f' }}>{template.name}</h3>
                    <p style={{ margin: '0 0 1.5rem', fontSize: '14px', color: '#6e6e73', lineHeight: '1.6', flex: 1 }}>{template.baseTemplate.description}</p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                        <span style={{ fontSize: '28px', fontWeight: '800', color: '#1d1d1f' }}>${template.price.toFixed(2)}</span>
                        <span style={{ fontSize: '13px', color: '#6e6e73' }}> / plate</span>
                      </div>
                      <a href={href} style={{ backgroundColor: '#1d6f3b', color: '#ffffff', padding: '0.7rem 1.4rem', borderRadius: '12px', fontWeight: '600', fontSize: '14px', textDecoration: 'none', border: 'none', whiteSpace: 'nowrap', flexShrink: 0 }}>
                        Customize →
                      </a>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="lp-footer">
        <div className="lp-footer-inner">
          <p style={{ margin: 0, fontSize: '12px', color: '#6e6e73' }}>Powered by <strong style={{ color: '#6e6e73' }}>CivicPlate OS</strong></p>
          <p style={{ margin: 0, fontSize: '12px', color: '#6e6e73' }}>Questions? Contact your city office.</p>
        </div>
      </footer>
    </div>
  )
}
