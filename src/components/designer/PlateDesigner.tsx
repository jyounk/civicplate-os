'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { validatePlateText, RuleSet, ValidationResult } from './rules'
import GeorgiaPlate from './GeorgiaPlate'

type TextZone = {
  id: string; label: string; x: number; y: number; width: number; height: number
  fontSize: number; align: 'left' | 'center' | 'right'; fontWeight: 'normal' | 'bold'; defaultValue?: string
}
type Template = {
  id: string; name: string; width: number; height: number; textZones: TextZone[]
  overrideTextZones: { id: string; defaultValue?: string }[] | null
  overrideColors: { background?: string; text?: string; border?: string } | null
}
type Tenant = { slug: string; name: string; primaryColor: string; secondaryColor: string; entityId: string }
type Scene = 'peach' | 'mountain' | 'coast'
type Props = { template: Template; ruleSets: RuleSet[]; tenant: Tenant; price: number; showSceneSelector?: boolean }

const SCENES: { id: Scene; label: string }[] = [
  { id: 'peach', label: 'Peach' },
  { id: 'mountain', label: 'Mountain' },
  { id: 'coast', label: 'Coast' },
]

export default function PlateDesigner({ template, ruleSets, tenant, price, showSceneSelector = false }: Props) {
  const getDefaultValue = (zone: TextZone): string => {
    if (template.overrideTextZones) {
      const override = template.overrideTextZones.find((o) => o.id === zone.id)
      if (override?.defaultValue) return override.defaultValue
    }
    return zone.defaultValue ?? ''
  }
  const initialValues: Record<string, string> = {}
  template.textZones.forEach((zone) => { initialValues[zone.id] = getDefaultValue(zone) })
  const [zoneValues, setZoneValues] = useState<Record<string, string>>(initialValues)
  const [validations, setValidations] = useState<Record<string, ValidationResult>>({})
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [customerName, setCustomerName] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')
  const [plateAvailable, setPlateAvailable] = useState<boolean | null>(null)
  const [checkingPlate, setCheckingPlate] = useState(false)
  const [scene, setScene] = useState<Scene>('peach')
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const priceInCents = Math.round(price * 100)
  const priceLabel = '$' + price.toFixed(2)

  const handleChange = useCallback((zoneId: string, value: string) => {
    const upper = value.toUpperCase()
    setZoneValues((prev) => ({ ...prev, [zoneId]: upper }))
    const result = validatePlateText(upper, ruleSets)
    setValidations((prev) => ({ ...prev, [zoneId]: result }))
    if (zoneId === 'main-text') {
      setPlateAvailable(null)
      setCheckingPlate(false)
      if (debounceRef.current) clearTimeout(debounceRef.current)
      if (upper.length > 0) {
        setCheckingPlate(true)
        debounceRef.current = setTimeout(async () => {
          try {
            const res = await fetch('/api/check-plate?text=' + encodeURIComponent(upper))
            const data = await res.json()
            setPlateAvailable(data.available)
          } catch {
            setPlateAvailable(true)
          } finally {
            setCheckingPlate(false)
          }
        }, 500)
      }
    }
  }, [ruleSets])

  useEffect(() => {
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [])

  const mainZone = template.textZones.find((z) => z.id === 'main-text')
  const mainValidation = mainZone ? validations[mainZone.id] : null
  const isValid = !mainValidation || mainValidation.valid
  const mainValue = mainZone ? zoneValues[mainZone.id] ?? '' : ''
  const ruleSet = ruleSets[0]

  const handleSubmit = async () => {
    if (!customerName || !customerEmail) return
    setSubmitting(true)
    setError(null)
    try {
      const placements = template.textZones.map((z) => ({ zoneId: z.id, value: zoneValues[z.id] ?? '' }))
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantSlug: tenant.slug,
          customerName,
          customerEmail,
          amount: priceInCents,
          designData: {
            tenantTemplateId: template.id,
            entityId: tenant.entityId,
            entitySlug: tenant.slug,
            cityName: tenant.name,
            plateText: mainValue,
            zonePlacements: placements,
            scene: showSceneSelector ? scene : 'peach',
          },
        }),
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        setError(data.error || 'Something went wrong. Please try again.')
        setSubmitting(false)
      }
    } catch (err) {
      setError('Something went wrong. Please try again.')
      setSubmitting(false)
    }
  }

  const canSubmit = isValid && mainValue.length > 0 && plateAvailable === true
  const canSend = !!customerName && !!customerEmail && !submitting
  const countyName = tenant.name

  return (
    <div className="pd-root" style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', sans-serif", minHeight: '100vh', backgroundColor: '#f5f5f7' }}>
      <style>{`
        * { box-sizing: border-box; }
        .pd-grid { display: grid; grid-template-columns: 1fr; }
        .pd-left { background: #f5f5f7; padding: 2rem 1.5rem; display: flex; align-items: flex-start; justify-content: center; }
        .pd-left-sticky { width: 100%; max-width: 520px; }
        .pd-right { background: #ffffff; padding: 2rem 1.5rem; }

        @media (min-width: 768px) {
          .pd-grid { grid-template-columns: 3fr 2fr; min-height: 100vh; }
          .pd-left { padding: 3rem 2.5rem; }
          .pd-left-sticky { position: sticky; top: 2rem; }
          .pd-right { padding: 2.5rem 2rem; border-left: 1px solid #d2d2d7; overflow-y: auto; }
        }
      `}</style>

      <div className="pd-grid">
        {/* LEFT: plate preview panel */}
        <div className="pd-left">
          <div className="pd-left-sticky">
            <a
              href={'/' + tenant.slug}
              style={{ display: 'block', marginBottom: '1.5rem', fontSize: '14px', color: '#6e6e73', textDecoration: 'none' }}
            >
              ← {template.name}
            </a>

            <div style={{ backgroundColor: '#ffffff', borderRadius: '18px', padding: '2.5rem', boxShadow: '0 2px 20px rgba(0,0,0,0.08)' }}>
              <GeorgiaPlate plateText={mainValue} countyName={countyName} width={template.width} height={template.height} scene={showSceneSelector ? scene : 'peach'} />
            </div>

            {showSceneSelector && (
              <div style={{ marginTop: '1.25rem' }}>
                <p style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: '600', color: '#6e6e73', textAlign: 'center', marginBottom: '0.75rem', marginTop: 0 }}>
                  Choose your background
                </p>
                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
                  {SCENES.map((s) => {
                    const selected = scene === s.id
                    return (
                      <button
                        key={s.id}
                        onClick={() => setScene(s.id)}
                        style={{
                          position: 'relative',
                          border: selected ? '2px solid #1d6f3b' : '2px solid #d2d2d7',
                          borderRadius: '10px',
                          padding: '4px',
                          background: 'transparent',
                          cursor: 'pointer',
                          transition: 'border-color 0.15s',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        <div style={{ width: '80px', pointerEvents: 'none' }}>
                          <GeorgiaPlate plateText="" countyName={countyName} width={160} height={80} scene={s.id} noShadow hideText />
                        </div>
                        <span style={{ fontSize: '11px', fontWeight: selected ? '700' : '500', color: selected ? '#1d6f3b' : '#6e6e73' }}>{s.label}</span>
                        {selected && (
                          <div style={{ position: 'absolute', top: '-8px', right: '-8px', width: '20px', height: '20px', borderRadius: '50%', backgroundColor: '#1d6f3b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          </div>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            <p style={{ fontSize: '12px', textAlign: 'center', color: '#6e6e73', marginTop: '1rem', marginBottom: 0 }}>
              Live preview — updates as you type
            </p>
          </div>
        </div>

        {/* RIGHT: controls panel */}
        <div className="pd-right">
          {/* Template name + price header */}
          <div style={{ paddingBottom: '1.5rem', borderBottom: '1px solid #d2d2d7', marginBottom: '2rem' }}>
            <p style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#6e6e73', margin: '0 0 0.4rem' }}>{template.name}</p>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem' }}>
              <span style={{ fontSize: '32px', fontWeight: '800', letterSpacing: '-0.03em', color: '#1d1d1f' }}>${price.toFixed(2)}</span>
              <span style={{ fontSize: '14px', color: '#6e6e73' }}>per plate</span>
            </div>
          </div>

          {/* Plate text zones */}
          {template.textZones.map((zone) => {
            const isMain = zone.id === 'main-text'
            const validation = validations[zone.id]
            const value = zoneValues[zone.id] ?? ''
            let borderColor = '#d2d2d7'
            if (validation) {
              if (!validation.valid) {
                borderColor = '#ff3b30'
              } else if (isMain && plateAvailable === false) {
                borderColor = '#ff3b30'
              } else {
                borderColor = '#34c759'
              }
            }

            return (
              <div key={zone.id} style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: '600', color: '#6e6e73', marginBottom: '0.6rem' }}>
                  {zone.label}
                </label>

                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    value={value}
                    onChange={(e) => handleChange(zone.id, e.target.value)}
                    maxLength={ruleSet?.maxChars ?? 7}
                    placeholder={isMain ? 'e.g. NEWTON1' : zone.label}
                    style={{
                      width: '100%',
                      padding: isMain ? '1rem 3.5rem 1rem 1.25rem' : '0.875rem 1rem',
                      fontSize: isMain ? '1.4rem' : '1rem',
                      fontFamily: isMain ? '"SF Mono", "Fira Code", "Menlo", monospace' : 'inherit',
                      letterSpacing: isMain ? '0.15em' : 'normal',
                      textTransform: 'uppercase',
                      border: '2px solid ' + borderColor,
                      borderRadius: '12px',
                      outline: 'none',
                      color: '#1d1d1f',
                      background: '#ffffff',
                      transition: 'border-color 0.15s',
                      boxSizing: 'border-box',
                    }}
                  />
                  {isMain && (
                    <span style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', fontSize: '12px', color: '#6e6e73', pointerEvents: 'none' }}>
                      {value.length}/{ruleSet?.maxChars ?? 7}
                    </span>
                  )}
                </div>

                <div style={{ marginTop: '0.4rem', minHeight: '1.25rem' }}>
                  {isMain && checkingPlate && <span style={{ fontSize: '12px', color: '#6e6e73' }}>Checking availability...</span>}
                  {isMain && !checkingPlate && plateAvailable === true && validation?.valid && (
                    <span style={{ fontSize: '12px', color: '#34c759', fontWeight: '600' }}>✓ Available</span>
                  )}
                  {isMain && !checkingPlate && plateAvailable === false && (
                    <span style={{ fontSize: '12px', color: '#ff3b30', fontWeight: '600' }}>✗ Already taken — choose different text</span>
                  )}
                  {validation && validation.errors.length > 0 && (
                    <span style={{ fontSize: '12px', color: '#ff3b30' }}>{validation.errors[0]}</span>
                  )}
                </div>
              </div>
            )
          })}

          {/* Customer info: smooth slide-in when showForm is true */}
          <div style={{
            overflow: 'hidden',
            maxHeight: showForm ? '600px' : '0px',
            opacity: showForm ? 1 : 0,
            transition: 'max-height 0.4s ease, opacity 0.3s ease',
          }}>
            <div style={{ borderTop: '1px solid #d2d2d7', paddingTop: '1.5rem', marginTop: '0.5rem' }}>
              <p style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: '600', color: '#6e6e73', marginBottom: '1.25rem', marginTop: 0 }}>Your information</p>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ fontSize: '13px', fontWeight: '500', color: '#1d1d1f', display: 'block', marginBottom: '0.4rem' }}>Full Name</label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Jane Doe"
                  style={{ width: '100%', padding: '0.875rem 1rem', fontSize: '1rem', border: '1.5px solid #d2d2d7', borderRadius: '12px', outline: 'none', color: '#1d1d1f', fontFamily: 'inherit', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ fontSize: '13px', fontWeight: '500', color: '#1d1d1f', display: 'block', marginBottom: '0.4rem' }}>Email Address</label>
                <input
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="jane@example.com"
                  style={{ width: '100%', padding: '0.875rem 1rem', fontSize: '1rem', border: '1.5px solid #d2d2d7', borderRadius: '12px', outline: 'none', color: '#1d1d1f', fontFamily: 'inherit', boxSizing: 'border-box' }}
                />
              </div>
            </div>
          </div>

          {/* Error banner */}
          {error && (
            <div style={{ backgroundColor: '#fff2f2', border: '1px solid #ffd0d0', borderRadius: '12px', padding: '0.875rem 1rem', marginBottom: '1rem', color: '#ff3b30', fontSize: '14px' }}>
              {error}
            </div>
          )}

          {/* CTA button */}
          {!showForm ? (
            <button
              disabled={!canSubmit}
              onClick={() => setShowForm(true)}
              style={{
                width: '100%',
                padding: '1rem',
                backgroundColor: canSubmit ? '#1d6f3b' : '#d2d2d7',
                color: canSubmit ? '#ffffff' : '#6e6e73',
                border: 'none',
                borderRadius: '999px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: canSubmit ? 'pointer' : 'not-allowed',
                transition: 'background-color 0.15s',
                letterSpacing: '-0.01em',
                fontFamily: 'inherit',
              }}
            >
              Continue to Submit
            </button>
          ) : (
            <>
              <button
                disabled={!canSend}
                onClick={handleSubmit}
                style={{
                  width: '100%',
                  padding: '1rem',
                  backgroundColor: canSend ? '#1d6f3b' : '#d2d2d7',
                  color: canSend ? '#ffffff' : '#6e6e73',
                  border: 'none',
                  borderRadius: '999px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: canSend ? 'pointer' : 'not-allowed',
                  transition: 'background-color 0.15s',
                  letterSpacing: '-0.01em',
                  marginBottom: '0.75rem',
                  fontFamily: 'inherit',
                }}
              >
                {submitting ? 'Redirecting to payment...' : 'Pay Now — ' + priceLabel}
              </button>
              <button
                onClick={() => setShowForm(false)}
                style={{ width: '100%', padding: '0.75rem', backgroundColor: 'transparent', color: '#6e6e73', border: 'none', fontSize: '14px', cursor: 'pointer', fontFamily: 'inherit' }}
              >
                ← Back
              </button>
            </>
          )}

          <p style={{ fontSize: '12px', color: '#6e6e73', textAlign: 'center', marginTop: '1rem', marginBottom: 0 }}>
            Payments are processed securely through Stripe.
          </p>
        </div>
      </div>
    </div>
  )
}
