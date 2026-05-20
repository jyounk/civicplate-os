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
  const tenantName = tenant.name
  const templatePrice = Number(template.price)
  const isSpecialty = template.name.toLowerCase().includes('specialty')
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f7', fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', sans-serif" }}>
      <style>{`
        * { box-sizing: border-box; }
        .dp-nav { background: #ffffff; border-bottom: 1px solid #d2d2d7; height: 64px; padding: 0 2rem; display: flex; align-items: center; }
        .dp-nav-inner { max-width: 1000px; margin: 0 auto; width: 100%; display: flex; align-items: center; justify-content: space-between; }
        .dp-footer { background: #ffffff; border-top: 1px solid #d2d2d7; padding: 1.5rem 2rem; }
        .dp-footer-inner { max-width: 1000px; margin: 0 auto; display: flex; flex-direction: row; justify-content: space-between; align-items: center; }
      `}</style>

      <nav className="dp-nav">
        <div className="dp-nav-inner">
          <a href={'/' + tenant.slug} style={{ fontSize: '15px', fontWeight: '600', color: '#1d1d1f', textDecoration: 'none' }}>{tenantName}</a>
          <a href={'/' + tenant.slug + '/order-status'} style={{ color: '#1d6f3b', fontSize: '14px', textDecoration: 'none' }}>Check order status →</a>
        </div>
      </nav>

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
        price={templatePrice}
        showSceneSelector={isSpecialty}
      />

      <footer className="dp-footer">
        <div className="dp-footer-inner">
          <p style={{ margin: 0, fontSize: '12px', color: '#6e6e73' }}>Powered by <strong style={{ color: '#6e6e73' }}>CivicPlate OS</strong></p>
          <p style={{ margin: 0, fontSize: '12px', color: '#6e6e73' }}>Questions? Contact your city office.</p>
        </div>
      </footer>
    </div>
  )
}
