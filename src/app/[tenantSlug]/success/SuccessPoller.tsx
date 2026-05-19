'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'

const POLL_INTERVAL_MS = 2000
const TIMEOUT_MS = 30000

export default function SuccessPoller({
  sessionId,
  tenantSlug,
}: {
  sessionId: string
  tenantSlug: string
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

  if (timedOut) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f4f6f9', fontFamily: 'system-ui, -apple-system, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
        <div style={{ maxWidth: '480px', width: '100%', backgroundColor: '#ffffff', border: '1px solid #e2e6ea', borderRadius: '12px', padding: '2rem', textAlign: 'center' }}>
          <p style={{ fontSize: '1rem', fontWeight: '600', color: '#1a202c', marginBottom: '0.5rem' }}>Something went wrong</p>
          <p style={{ fontSize: '0.875rem', color: '#718096', marginBottom: '1.5rem' }}>We could not confirm your order. If you were charged, please contact support with your payment confirmation email.</p>
          <a href={`/${tenantSlug}`} style={{ display: 'inline-block', backgroundColor: '#1a202c', color: '#ffffff', padding: '0.75rem 1.5rem', borderRadius: '8px', fontWeight: '600', textDecoration: 'none', fontSize: '0.9rem' }}>Return to portal</a>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f4f6f9', fontFamily: 'system-ui, -apple-system, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
      <div style={{ maxWidth: '480px', width: '100%', backgroundColor: '#ffffff', border: '1px solid #e2e6ea', borderRadius: '12px', padding: '2rem', textAlign: 'center' }}>
        <div style={{ width: '48px', height: '48px', margin: '0 auto 1.25rem', border: '3px solid #e2e6ea', borderTopColor: '#1a202c', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <p style={{ fontSize: '1rem', fontWeight: '600', color: '#1a202c', marginBottom: '0.4rem' }}>Processing your order&hellip;</p>
        <p style={{ fontSize: '0.875rem', color: '#718096', margin: 0 }}>This usually takes just a moment.</p>
      </div>
    </div>
  )
}
