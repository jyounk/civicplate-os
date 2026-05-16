import { prisma } from './prisma'

export type TenantData = {
  id: string
  name: string
  slug: string
  logoUrl: string | null
  primaryColor: string
  secondaryColor: string
  requireCitizenAuth: boolean
  tenantTemplates: {
    id: string
    name: string
    price: number
    isActive: boolean
    baseTemplate: {
      id: string
      name: string
      description: string | null
      width: number
      height: number
      textZones: unknown
      safeZones: unknown
    }
    overrideColors: unknown
    overrideTextZones: unknown
  }[]
}

export async function getTenantBySlug(
  slug: string
): Promise<TenantData | null> {
  const entity = await prisma.governmentEntity.findUnique({
    where: { slug, isActive: true },
    select: {
      id: true,
      name: true,
      slug: true,
      logoUrl: true,
      primaryColor: true,
      secondaryColor: true,
      requireCitizenAuth: true,
      tenantTemplates: {
        where: { isActive: true },
        select: {
          id: true,
          name: true,
          price: true,
          isActive: true,
          overrideColors: true,
          overrideTextZones: true,
          baseTemplate: {
            select: {
              id: true,
              name: true,
              description: true,
              width: true,
              height: true,
              textZones: true,
              safeZones: true,
            },
          },
        },
      },
    },
  })

  if (!entity) return null

  return {
    ...entity,
    tenantTemplates: entity.tenantTemplates.map((t) => ({
      ...t,
      price: Number(t.price),
    })),
  }
}
