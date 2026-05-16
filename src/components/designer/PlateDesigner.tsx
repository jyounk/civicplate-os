'use client'

import { useState, useCallback } from 'react'
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
type Props = { template: Template; ruleSets: RuleSet[]; tenant: Tenant; price: number }

export default function PlateDesigner({ template, ruleSets, tenant, price }: Props) {
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
  const priceInCents = Math.round(price * 100)
  const priceLabel = '$' + price.toFixed(2)
  const handleChange = useCallback((zoneId: string, value: string) => {
    const upper = value.toUpperCase()
    setZoneValues((prev) => ({ ...prev, [zoneId]: upper }))
    const result = validatePlateText(upper, ruleSets)
    setValidations((prev) => ({ ...prev, [zoneId]: result }))
  }, [ruleSets])
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
  const canSubmit = isValid && mainValue.length > 0
  const canSend = !!customerName && !!customerEmail && !submitting
  const payLabel = submitting ? 'Redirecting to payment...' : 'Pay Now — ' + priceLabel
  const countyName = tenant.name
  return (
    <div style={{ marginTop: '1rem' }}>
      <style>{`
        .pd-svg-wrap { background: #f0f0f0; border-radius: 12px; padding: 1.25rem; display: flex; justify-content: center; margin-bottom: 1.5rem; }
        .pd-card { background: #fff; border-radius: 12px; padding: 1.25rem; border: 1px solid #e5e7eb; margin-bottom: 1.25rem; }
        .pd-submit-row { display: flex; gap: 0.75rem; }
        .pd-input { width: 100%; padding: 0.75rem 1rem; font-size: 1rem; border: 2px solid #d1d5db; border-radius: 8px; outline: none; box-sizing: border-box; color: #1a202c; }
        .pd-ple-input { width: 100%; padding: 0.75rem 1rem; font-size: 1.1rem; font-family: Arial Black, Arial, sans-serif; letter-spacing: 0.08em; border-radius: 8px; outline: none; box-sizing: border-box; text-transform: uppercase; color: #1a202c; }
      `}</style>

      <div className='pd-svg-wrap'>
        <GeorgiaPlate plateText={mainValue} countyName={countyName} width={template.width} height={template.height} />
      </div>

      <div className='pd-card'>
        <h3 style={{ margin: '0 0 1rem', color: '#111', fontSize: '1rem' }}>Customize Your Plate</h3>
        {template.textZones.map((zone) => {
          const validation = validations[zone.id]
          const value = zoneValues[zone.id] ?? ''
          const borderCol = validation ? (validation.valid ? '#22c55e' : '#ef4444') : '#d1d5db'
          return (
            <div key={zone.id} style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', color: '#444', marginBottom: '0.4rem' }}>{zone.label}</label>
              <div style={{ position: 'relative' }}>
                <input type='text' value={value} onChange={(e) => handleChange(zone.id, e.target.value)} maxLength={ruleSet?.maxChars ?? 7} placeholder={zone.id === 'main-text' ? 'Enter plate text (max ' + (ruleSet?.maxChars ?? 7) + ' characters)' : zone.label} className='pd-plate-input' style={{ border: '2px solid ' + borderCol }} />
                <span style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', fontSize: '0.75rem', color: '#9ca3af', pointerEvents: 'none' }}>{value.length}/{ruleSet?.maxChars ?? 7}</span>
              </div>
              {validation && validation.errors.length > 0 && (
                <ul style={{ margin: '0.4rem 0 0', padding: '0 0 0 1rem' }}>
                  {validation.errors.map((err, i) => <li key={i} style={{ color: '#ef4444', fontSize: '0.8rem' }}>{err}</li>)}
                </ul>
              )}
              {validation && validation.valid && <p style={{ margin: '0.4rem 0 0', color: '#22c55e', fontSize: '0.8rem' }}>Looks good!</p>}
            </div>
          )
        })}
      </div>

      {!showForm ? (
        <button disabled={!canSubmit} onClick={() => setShowForm(true)} style={{ width: '100%', padding: '1rem', backgroundColor: canSubmit ? tenant.primaryColor : '#9ca3af', color: tenant.secondaryColor, border: 'none', borderRadius: '8px', fontSize: '1rem', fontWeight: 'bold', cursor: canSubmit ? 'pointer' : 'not-allowed', transition: 'background-color 0.15s' }}>Continue to Submit</button>
      ) : (
        <div className='pd-card'>
          <h3 style={{ margin: '0 0 1rem', color: '#111', fontSize: '1rem' }}>Your Information</h3>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', color: '#444', marginBottom: '0.4rem' }}>Full Name</label>
            <input type='text' value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder='Jane Doe' className='pd-input' />
          </div>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', color: '#444', marginBottom: '0.4rem' }}>Email Address</label>
            <input type='email' value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} placeholder='jane@example.com' className='pd-input' />
          </div>
          {error && (
            <div style={{ marginBottom: '1rem', padding: '0.75rem 1rem', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', color: '#dc2626', fontSize: '0.875rem' }}>{error}</div>
          )}
          <div className='pd-submit-row'>
            <button onClick={() => setShowForm(false)} style={{ flex: 1, padding: '1rem', backgroundColor: '#f3f4f6', color: '#374151', border: 'none', borderRadius: '8px', fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer' }}>Back</button>
            <button disabled={!canSend} onClick={handleSubmit} style={{ flex: 2, padding: '1rem', backgroundColor: canSend ? tenant.primaryColor : '#9ca3af', color: tenant.secondaryColor, border: 'none', borderRadius: '8px', fontSize: '1rem', fontWeight: 'bold', cursor: canSend ? 'pointer' : 'not-allowed', transition: 'background-color 0.15s' }}>{payLabel}</button>
          </div>
          <p style={{ margin: '0.75rem 0 0', fontSize: '0.75rem', color: '#9ca3af', textAlign: 'center' }}>You will be redirected to Stripe to complete your payment securely.</p>
        </div>
      )}
      <div style={{ height: '2rem' }} />
    </div>
  )
}