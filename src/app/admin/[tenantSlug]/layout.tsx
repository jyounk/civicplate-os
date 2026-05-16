import { logoutAction } from '../login/actions'

interface Props {
  children: React.ReactNode
  params: Promise<{ tenantSlug: string }>
}

export default async function AdminLayout({ children, params }: Props) {
  const { tenantSlug } = await params
  const ordersHref = '/admin/' + tenantSlug
  const portalHref = '/' + tenantSlug
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f1f5f9' }}>
      <style>{`
        .al-topbar { display: flex; align-items: center; justify-content: space-between; background: #0f172a; padding: 0 1.25rem; height: 52px; }
        .al-wrap { display: flex; min-height: 100vh; }
        .al-sidebar { display: none; }
        .al-main { flex: 1; overflow: auto; }
        @media (min-width: 768px) {
          .al-topbar { display: none; }
          .al-sidebar { display: flex; flex-direction: column; width: 224px; background: #0f172a; flex-shrink: 0; }
        }
      `}</style>

      {/* MOBILE TOP BAR */}
      <div className='al-topbar'>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ color: '#ffffff', fontWeight: '700', fontSize: '0.82rem', letterSpacing: '0.05em' }}>CivicPlate OS</span>
          <span style={{ color: '#94a3b8', fontSize: '0.7rem', textTransform: 'capitalize' }}>{tenantSlug} Admin</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          <a href={ordersHref} style={{ color: '#cbd5e1', fontSize: '0.8rem', fontWeight: '500', textDecoration: 'none', padding: '0.4rem 0.75rem', borderRadius: '6px' }}>Orders</a>
          <a href={portalHref} target='_blank' style={{ color: '#cbd5e1', fontSize: '0.8rem', fontWeight: '500', textDecoration: 'none', padding: '0.4rem 0.75rem', borderRadius: '6px' }}>Portal ↗</a>
          <form action={logoutAction} style={{ display: 'inline' }}>
            <input type='hidden' name='tenantSlug' value={tenantSlug} />
            <button type='submit' style={{ color: '#94a3b8', fontSize: '0.8rem', background: 'none', border: 'none', cursor: 'pointer', padding: '0.4rem 0.75rem', borderRadius: '6px' }}>Sign out</button>
          </form>
        </div>
      </div>

      {/* DESKTOP SIDEBAR + MAIN */}
      <div className='al-wrap'>
        <aside className='al-sidebar'>
          <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #1e293b' }}>
            <div style={{ color: '#ffffff', fontWeight: '700', fontSize: '0.875rem', letterSpacing: '0.05em' }}>CivicPlate OS</div>
            <div style={{ color: '#94a3b8', fontSize: '0.75rem', marginTop: '2px', textTransform: 'capitalize' }}>{tenantSlug} Admin</div>
          </div>
          <nav style={{ flex: 1, padding: '1rem 0.75rem', display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <a href={ordersHref} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0.5rem 0.75rem', borderRadius: '6px', fontSize: '0.875rem', color: '#cbd5e1', textDecoration: 'none' }}>&#9776; Orders</a>
            <a href={portalHref} target='_blank' style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0.5rem 0.75rem', borderRadius: '6px', fontSize: '0.875rem', color: '#cbd5e1', textDecoration: 'none' }}>&#8599; View Portal</a>
          </nav>
          <div style={{ padding: '0.75rem', borderTop: '1px solid #1e293b' }}>
            <form action={logoutAction}>
              <input type='hidden' name='tenantSlug' value={tenantSlug} />
              <button type='submit' style={{ width: '100%', textAlign: 'left', padding: '0.5rem 0.75rem', borderRadius: '6px', fontSize: '0.875rem', color: '#94a3b8', background: 'none', border: 'none', cursor: 'pointer' }}>Sign out</button>
            </form>
          </div>
        </aside>
        <main className='al-main'>
          {children}
        </main>
      </div>
    </div>
  )
}