import { notFound } from 'next/navigation'
import { getTenantBySlug } from '@/lib/tenant'
import { prisma } from '@/lib/prisma'
import PlateDesigner from '@/components/designer/PlateDesigner'

type Props = { params: Promise<{ tenantSlug: string; templateId: string }> }

export default async function DesignPage({ params }: Props) {
  const { tenantSlug, templateId } = await params
  const tenant = await getTenantBySlug(tenantSlug)
  if (!tenant) notFound()
  const template = await prisma.tenantTemplate.findFirst({
    where: { id: templateId, entityId: tenant.id, isActive: true },
    include: { baseTemplate: true, ruleSets: true },
  })
  if (!template) notFound()
  const primary = tenant.primaryColor
  const secondary = tenant.secondaryColor
  const backHref = '/' + tenant.slug
  const tenantName = tenant.name
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f4f6f9', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <style>{`
        .dp-nav { background: #fff; border-bottom: 1px solid #e2e6ea; padding: 0 1.25rem; }
        .dp-nav-inner { max-width: 900px; margin: 0 auto; height: 52px; display: flex; align-items: center; justify-content: space-between; }
        .dp-header { padding: 1.5rem 1.25rem; }
        .dp-header-inner { max-width: 900px; margin: 0 auto; display: flex; align-items: center; justify-content: space-between; gap: 1rem; }
        .dp-body { max-width: 900px; margin: 0 auto; padding: 1.5rem 1.25rem; }
        .dp-footer { border-top: 1px solid #e2e6ea; background: #fff; padding: 1.25rem; margin-top: 1rem; }
        .dp-footer-inner { max-width: 900px; margin: 0 auto; }
        @media (min-width: 640px) {
          .dp-nav { padding: 0 2rem; }
          .dp-header { padding: 1.75rem 2rem; }
          .dp-body { padding: 2rem; }
          .dp-footer { padding: 1.25rem 2rem; }
        }
      `}</style>

      <div className='dp-nav'>
        <div className='dp-nav-inner'>
          <a href={backHref} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: primary, fontSize: '0.875rem', fontWeight: '500', textDecoration: 'none' }}>
            <svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2.5' strokeLinecap='round' strokeLinejoin='round'><line x1='19' y1='12' x2='5' y2='12'/><polyline points='12 19 5 12 12 5'/></svg>
            Back to templates
          </a>
          <span style={{ fontSize: '0.8rem', color: '#a0aec0' }}>{tenantName}</span>
        </div>
      </div>

      <div className='dp-header' style={{ backgroundColor: primary }}>
        <div className='dp-header-inner'>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.3rem', fontWeight: '700', color: secondary }}>{template.name}</h1>
            <p style={{ margin: '0.25rem 0 0', color: secondary, opacity: 0.7, fontSize: '0.85rem' }}>{template.baseTemplate.description}</p>
          </div>
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <span style={{ fontSize: '1.4rem', fontWeight: '700', color: secondary }}>${template.price.toFixed(2)}</span>
            <p style={{ margin: '0.1rem 0 0', color: secondary, opacity: 0.6, fontSize: '0.72rem' }}>per plate</p>
          </div>
        </div>
      </div>

      <div className='dp-body'>
        <PlateDesigner
          template={{
            id: template.id,
            name: template.name,
            width: template.baseTemplate.width,
            height: template.baseTemplate.height,
            textZones: template.baseTemplate.textZones as any,
            overrideTextZones: template.overrideTextZones as any,
            overrideColors: template.overrideColors as any,
          }}
          ruleSets={template.ruleSets.map((r) => ({
            minChars: r.minChars,
            maxChars: r.maxChars,
            allowedPattern: r.allowedPattern,
            bannedTerms: r.bannedTerms as string[],
            profanityFilter: r.profanityFilter,
          }))}
          tenant={{
            slug: tenant.slug,
            name: tenant.name,
            primaryColor: tenant.primaryColor,
            secondaryColor: tenant.secondaryColor,
            entityId: tenant.id,
          }}
        />
      </div>

      <div className='dp-footer'>
        <div className='dp-footer-inner'>
          <p style={{ margin: 0, fontSize: '0.78rem', color: '#a0aec0' }}>{tenantName} — Powered by CivicPlate OS</p>
        </div>
      </div>
    </div>
  )
}