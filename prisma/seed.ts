import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import 'dotenv/config'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('🌱 Seeding CivicPlate OS...')

  // ============================
  // SUPER ADMIN
  // ============================

  const superAdmin = await prisma.user.upsert({
    where: { email: 'admin@civicplate.com' },
    update: {},
    create: {
      email: 'admin@civicplate.com',
      name: 'CivicPlate Admin',
      role: 'SUPER_ADMIN',
    },
  })

  console.log('✅ Super admin created:', superAdmin.email)

  // ============================
  // CITY OF NEWTON DEMO TENANT
  // ============================

  const newton = await prisma.governmentEntity.upsert({
    where: { slug: 'newton' },
    update: {},
    create: {
      name: 'City of Newton',
      slug: 'newton',
      primaryColor: '#1B3A6B',
      secondaryColor: '#C8A84B',
      fulfillmentMode: 'INTERNAL',
      requireCitizenAuth: false,
    },
  })

  console.log('✅ Tenant created:', newton.name)

  // ============================
  // NEWTON ENTITY ADMIN
  // ============================

  const newtonAdmin = await prisma.user.upsert({
    where: { email: 'admin@newton.gov' },
    update: {},
    create: {
      email: 'admin@newton.gov',
      name: 'Newton Admin',
      role: 'ENTITY_ADMIN',
      entityId: newton.id,
    },
  })

  console.log('✅ Entity admin created:', newtonAdmin.email)

  // ============================
  // BASE TEMPLATES
  // ============================

  const baseStandard = await prisma.baseTemplate.upsert({
    where: { id: 'base-standard-plate' },
    update: {},
    create: {
      id: 'base-standard-plate',
      name: 'Standard Plate',
      description: 'Standard government issue license plate',
      width: 1200,
      height: 600,
      textZones: [
        {
          id: 'main-text',
          label: 'Plate Text',
          x: 300,
          y: 200,
          width: 600,
          height: 200,
          fontSize: 120,
          align: 'center',
          fontWeight: 'bold',
        },
      ],
      safeZones: [
        { x: 50, y: 50, width: 1100, height: 500 },
      ],
    },
  })

  const baseSpecialty = await prisma.baseTemplate.upsert({
    where: { id: 'base-specialty-plate' },
    update: {},
    create: {
      id: 'base-specialty-plate',
      name: 'Specialty Plate',
      description: 'Specialty plate with slogan zone',
      width: 1200,
      height: 600,
      textZones: [
        {
          id: 'main-text',
          label: 'Plate Text',
          x: 300,
          y: 160,
          width: 600,
          height: 180,
          fontSize: 120,
          align: 'center',
          fontWeight: 'bold',
        },
        {
          id: 'slogan',
          label: 'Slogan',
          x: 200,
          y: 460,
          width: 800,
          height: 80,
          fontSize: 40,
          align: 'center',
          fontWeight: 'normal',
        },
      ],
      safeZones: [
        { x: 50, y: 50, width: 1100, height: 500 },
      ],
    },
  })

  const baseUniversity = await prisma.baseTemplate.upsert({
    where: { id: 'base-university-plate' },
    update: {},
    create: {
      id: 'base-university-plate',
      name: 'University Plate',
      description: 'University affiliation plate',
      width: 1200,
      height: 600,
      textZones: [
        {
          id: 'main-text',
          label: 'Plate Text',
          x: 350,
          y: 160,
          width: 500,
          height: 180,
          fontSize: 120,
          align: 'center',
          fontWeight: 'bold',
        },
        {
          id: 'university-name',
          label: 'University',
          x: 200,
          y: 460,
          width: 800,
          height: 80,
          fontSize: 36,
          align: 'center',
          fontWeight: 'normal',
        },
      ],
      safeZones: [
        { x: 50, y: 50, width: 1100, height: 500 },
      ],
    },
  })

  console.log('✅ Base templates created')

  // ============================
  // NEWTON TENANT TEMPLATES
  // ============================

  const newtonStandard = await prisma.tenantTemplate.upsert({
    where: { id: 'newton-standard' },
    update: {},
    create: {
      id: 'newton-standard',
      entityId: newton.id,
      baseTemplateId: baseStandard.id,
      name: 'Newton Standard Plate',
      price: 25.00,
      overrideColors: {
        background: '#1B3A6B',
        text: '#FFFFFF',
        border: '#C8A84B',
      },
    },
  })

  const newtonSpecialty = await prisma.tenantTemplate.upsert({
    where: { id: 'newton-specialty' },
    update: {},
    create: {
      id: 'newton-specialty',
      entityId: newton.id,
      baseTemplateId: baseSpecialty.id,
      name: 'Newton Specialty Plate',
      price: 45.00,
      overrideColors: {
        background: '#FFFFFF',
        text: '#1B3A6B',
        border: '#1B3A6B',
      },
      overrideTextZones: [
        {
          id: 'slogan',
          defaultValue: 'City of Newton',
        },
      ],
    },
  })

  const newtonUniversity = await prisma.tenantTemplate.upsert({
    where: { id: 'newton-university' },
    update: {},
    create: {
      id: 'newton-university',
      entityId: newton.id,
      baseTemplateId: baseUniversity.id,
      name: 'Newton University Plate',
      price: 55.00,
      overrideColors: {
        background: '#C8A84B',
        text: '#1B3A6B',
        border: '#1B3A6B',
      },
    },
  })

  console.log('✅ Tenant templates created')

  // ============================
  // RULE SETS
  // ============================

  await prisma.ruleSet.upsert({
    where: { id: 'rules-newton-standard' },
    update: {},
    create: {
      id: 'rules-newton-standard',
      tenantTemplateId: newtonStandard.id,
      minChars: 2,
      maxChars: 7,
      allowedPattern: '^[A-Z0-9 ]+$',
      bannedTerms: ['HATE', 'KILL', 'DRUG'],
      profanityFilter: true,
    },
  })

  await prisma.ruleSet.upsert({
    where: { id: 'rules-newton-specialty' },
    update: {},
    create: {
      id: 'rules-newton-specialty',
      tenantTemplateId: newtonSpecialty.id,
      minChars: 2,
      maxChars: 6,
      allowedPattern: '^[A-Z0-9 ]+$',
      bannedTerms: ['HATE', 'KILL', 'DRUG'],
      profanityFilter: true,
    },
  })

  await prisma.ruleSet.upsert({
    where: { id: 'rules-newton-university' },
    update: {},
    create: {
      id: 'rules-newton-university',
      tenantTemplateId: newtonUniversity.id,
      minChars: 2,
      maxChars: 7,
      allowedPattern: '^[A-Z0-9 ]+$',
      bannedTerms: ['HATE', 'KILL', 'DRUG'],
      profanityFilter: true,
    },
  })

  console.log('✅ Rule sets created')

  // ============================
  // DEMO DESIGNS + ORDERS
  // ============================

  const design1 = await prisma.design.upsert({
    where: { id: 'demo-design-1' },
    update: {},
    create: {
      id: 'demo-design-1',
      tenantTemplateId: newtonStandard.id,
      zonePlacements: [
        { zoneId: 'main-text', value: 'NWT 001' },
      ],
      renderConfig: { scale: 1, quality: 'high' },
      status: 'FINAL',
      guestEmail: 'jane.doe@email.com',
    },
  })

  const design2 = await prisma.design.upsert({
    where: { id: 'demo-design-2' },
    update: {},
    create: {
      id: 'demo-design-2',
      tenantTemplateId: newtonSpecialty.id,
      zonePlacements: [
        { zoneId: 'main-text', value: 'NEWTON' },
        { zoneId: 'slogan', value: 'City of Newton' },
      ],
      renderConfig: { scale: 1, quality: 'high' },
      status: 'FINAL',
      guestEmail: 'john.smith@email.com',
    },
  })

  const design3 = await prisma.design.upsert({
    where: { id: 'demo-design-3' },
    update: {},
    create: {
      id: 'demo-design-3',
      tenantTemplateId: newtonUniversity.id,
      zonePlacements: [
        { zoneId: 'main-text', value: 'UNI 42' },
        { zoneId: 'university-name', value: 'Newton University' },
      ],
      renderConfig: { scale: 1, quality: 'high' },
      status: 'FINAL',
      guestEmail: 'student@newton.edu',
    },
  })

  console.log('✅ Demo designs created')

  await prisma.order.upsert({
    where: { orderNumber: 'NWT-2026-0001' },
    update: {},
    create: {
      designId: design1.id,
      entityId: newton.id,
      orderNumber: 'NWT-2026-0001',
      status: 'APPROVED',
      customerName: 'Jane Doe',
      customerEmail: 'jane.doe@email.com',
      notificationLog: [
        { type: 'stub', message: 'Order received', timestamp: new Date().toISOString() },
        { type: 'stub', message: 'Order approved', timestamp: new Date().toISOString() },
      ],
    },
  })

  await prisma.order.upsert({
    where: { orderNumber: 'NWT-2026-0002' },
    update: {},
    create: {
      designId: design2.id,
      entityId: newton.id,
      orderNumber: 'NWT-2026-0002',
      status: 'IN_REVIEW',
      customerName: 'John Smith',
      customerEmail: 'john.smith@email.com',
      notificationLog: [
        { type: 'stub', message: 'Order received', timestamp: new Date().toISOString() },
      ],
    },
  })

  await prisma.order.upsert({
    where: { orderNumber: 'NWT-2026-0003' },
    update: {},
    create: {
      designId: design3.id,
      entityId: newton.id,
      orderNumber: 'NWT-2026-0003',
      status: 'SUBMITTED',
      customerName: 'Alex Student',
      customerEmail: 'student@newton.edu',
      notificationLog: [
        { type: 'stub', message: 'Order received', timestamp: new Date().toISOString() },
      ],
    },
  })

  console.log('✅ Demo orders created')
  console.log('🎉 Seeding complete!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })