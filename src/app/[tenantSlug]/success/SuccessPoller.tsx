'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'

const POLL_INTERVAL_MS = 2000
const TIMEOUT_MS = 30000

export default function SuccessPoller({
  sessionId,
  tenantSlug,
  tenantName,
}: {
  sessionId: string
  tenantSlug: string
  tenantName: string
}) {
  const router = useRouter()
  const [timedOut, setTimedOut] = useState(false)
  const activeRef = useRef(true)

  useEffect(() => {
    activeRef.current = true
    const startedAt = Date.now()

    async function poll() {
      if (!activeRef.current) return
      if (Date.now() - startedAt > TIMEOUT_MS) {
        setTimedOut(true)
        return
      }
      try {
        const res = await fetch(`/api/orders/poll?session_id=${encodeURIComponent(sessionId)}`)
        const data = await res.json()
        if (data.found) {
          router.replace(`/${tenantSlug}/confirmation/${data.orderNumber}`)
          return
        }
      } catch {
        // network hiccup — keep polling
      }
      setTimeout(poll, POLL_INTERVAL_MS)
    }

    poll()
    return () => {
      activeRef.current = false
    }
  }, [sessionId, tenantSlug, router])

  const pageStyle: React.CSSProperties = {
    minHeight: '100vh',
    backgroundColor: '#f5f5f7',
    fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', sans-serif",
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '1.5rem',
  }

  const cardStyle: React.CSSProperties = {
    maxWidth: '400px',
    width: '100%',
    backgroundColor: '#ffffff',
    borderRadius: '18px',
    boxShadow: '0 2px 20px rgba(0,0,0,0.08)',
    padding: '2.5rem',
    textAlign: 'center',
  }

  if (timedOut) {
    return (
      <div style={pageStyle}>
        <div style={cardStyle}>
          <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>⚠️</div>
          <p style={{ fontSize: '18px', fontWeight: '700', letterSpacing: '-0.02em', color: '#1d1d1f', marginBottom: '0.5rem', marginTop: 0 }}>Something went wrong</p>
          <p style={{ fontSize: '14px', color: '#6e6e73', marginBottom: '1.5rem', lineHeight: '1.6', marginTop: 0 }}>
            We could not confirm your order. If you were charged, please contact support with your payment confirmation email.
          </p>
          <a
            href={`/${tenantSlug}`}
            style={{ display: 'inline-block', backgroundColor: '#1d6f3b', color: '#ffffff', padding: '0.75rem 2rem', borderRadius: '999px', fontWeight: '600', textDecoration: 'none', fontSize: '15px' }}
          >
            Return to portal
          </a>
        </div>
      </div>
    )
  }

  return (
    <div style={pageStyle}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <div style={cardStyle}>
        <div style={{ width: '48px', height: '48px', margin: '0 auto 1.5rem', border: '3px solid #d2d2d7', borderTopColor: '#1d6f3b', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <p style={{ fontSize: '18px', fontWeight: '700', letterSpacing: '-0.02em', color: '#1d1d1f', marginBottom: '0.4rem', marginTop: 0 }}>Finalizing your order&hellip;</p>
        <p style={{ fontSize: '14px', color: '#6e6e73', margin: 0 }}>This usually takes just a moment.</p>
      </div>
    </div>
  )
}
