'use client'

import { useState, useCallback } from 'react'
import { validatePlateText, RuleSet, ValidationResult } from './rules'
import { submitPlateOrder } from '@/lib/actions'

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
type Props = { template: Template; ruleSets: RuleSet[]; tenant: Tenant }

export default function PlateDesigner({ template, ruleSets, tenant }: Props) {
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
  const [customerName, setCustomerName] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')
  const bgColor = template.overrideColors?.background ?? tenant.primaryColor
  const textColor = template.overrideColors?.text ?? tenant.secondaryColor
  const borderColor = template.overrideColors?.border ?? tenant.secondaryColor
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
    const formData = new FormData()
    formData.append('tenantTemplateId', template.id)
    formData.append('entityId', tenant.entityId)
    formData.append('entitySlug', tenant.slug)
    formData.append('customerName', customerName)
    formData.append('customerEmail', customerEmail)
    const placements = template.textZones.map((z) => ({ zoneId: z.id, value: zoneValues[z.id] ?? '' }))
    formData.append('zonePlacements', JSON.stringify(placements))
    await submitPlateOrder(formData)
  }
  const canSubmit = isValid && mainValue.length > 0
  const canSend = !!customerName && !!customerEmail && !submitting
  return (
    <div style={{ marginTop: '1rem' }}>
      <style>{`
        .pd-svg-wrap { background: #f5f5f5; border-radius: 12px; padding: 1.25rem; display: flex; justify-content: center; margin-bottom: 1.5rem; }
        .pd-svg-wrap svg { width: 100%; max-width: 540px; height: auto; border-radius: 12px; border: 6px solid; box-shadow: 0 8px 32px rgba(0,0,0,0.18); }
        .pd-card { background: #fff; border-radius: 12px; padding: 1.25rem; border: 1px solid #e5e7eb; margin-bottom: 1.25rem; }
        .pd-submit-row { display: flex; gap: 0.75rem; }
        .pd-input { width: 100%; padding: 0.75rem 1rem; font-size: 1rem; border: 2px solid #d1d5db; border-radius: 8px; outline: none; box-sizing: border-box; }
        .pd-plate-input { width: 100%; padding: 0.75rem 1rem; font-size: 1.1rem; font-family: Arial Black, Arial, sans-serif; letter-spacing: 0.08em; border-radius: 8px; outline: none; box-sizing: border-box; text-transform: uppercase; }
      `}</style>

      {/* SVG PLATE — uses viewBox so it scales on all screen sizes */}
      <div className='pd-svg-wrap'>
        <svg viewBox={'0 0 ' + template.width + ' ' + template.height} style={{ borderColor: borderColor }}>
          <rect x={0} y={0} width={template.width} height={template.height} fill={bgColor} />
        <rect x={16} y={16} width={template.width - 32} height={template.height - 32} fill='none' stroke={borderColor} strokeWidth={4} opacity={0.4} rx={8} />
          <circle cx={60} cy={template.height / 2} r={14} fill={borderColor} opacity={0.3} />
          <circle cx={template.width - 60} cy={template.height / 2} r={14} fill={borderColor} opacity={0.3} />
          {template.textZones.map((zone) => {
            const value = zoneValues[zone.id] ?? ''
            const textAnchor = zone.align === 'center' ? 'middle' : zone.align === 'right' ? 'end' : 'start'
            const xPos = zone.align === 'center' ? zone.x + zone.width / 2 : zone.align === 'right' ? zone.x + zone.width : zone.x
            return (
              <text key={zone.id} x={xPos} y={zone.y + zone.height / 2} textAnchor={textAnchor} dominantBaseline='central' fill={textColor} fontSize={zone.fontSize} fontWeight={zone.fontWeight} fontFamily='Arial Black, Arial, sans-serif' letterSpacing={zone.id === 'main-text' ? '0.08em' : '0.02em'}>
                {value || (zone.id === 'main-text' ? 'ABC 123' : zone.label)}
              </text>
            )
          })}
        </svg>
      </div>

      {/* CUSTOMIZE INPUTS */}
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

      {/* SUBMIT FLOW */}
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
          <div className='pd-submit-row'>
            <button onClick={() => setShowForm(false)} style={{ flex: 1, padding: '1rem', backgroundColor: '#f3f4f6', color: '#374151', border: 'none', borderRadius: '8px', fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer' }}>Back</button>
            <button disabled={!canSend} onClick={handleSubmit} style={{ flex: 2, padding: '1rem', backgroundColor: canSend ? tenant.primaryColor : '#9ca3af', color: tenant.secondaryColor, border: 'none', borderRadius: '8px', fontSize: '1rem', fontWeight: 'bold', cursor: canSend ? 'pointer' : 'not-allowed', transition: 'background-color 0.15s' }}>{submitting ? 'Submitting...' : 'Submit Plate Request'}</button>
          </div>
        </div>
      )}
      <div style={{ height: '2rem' }} />
    </div>
  )
}