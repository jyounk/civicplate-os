-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('SUPER_ADMIN', 'ENTITY_ADMIN');

-- CreateEnum
CREATE TYPE "FulfillmentMode" AS ENUM ('INTERNAL', 'EXTERNAL', 'HYBRID');

-- CreateEnum
CREATE TYPE "DesignStatus" AS ENUM ('DRAFT', 'FINAL');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'IN_REVIEW', 'APPROVED', 'REJECTED', 'COMPLETED');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "entityId" TEXT,
ADD COLUMN     "role" "UserRole" NOT NULL DEFAULT 'ENTITY_ADMIN';

-- CreateTable
CREATE TABLE "GovernmentEntity" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "logoUrl" TEXT,
    "primaryColor" TEXT NOT NULL DEFAULT '#000000',
    "secondaryColor" TEXT NOT NULL DEFAULT '#ffffff',
    "fulfillmentMode" "FulfillmentMode" NOT NULL DEFAULT 'INTERNAL',
    "requireCitizenAuth" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GovernmentEntity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BaseTemplate" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "backgroundImageUrl" TEXT,
    "width" INTEGER NOT NULL DEFAULT 1200,
    "height" INTEGER NOT NULL DEFAULT 600,
    "textZones" JSONB NOT NULL DEFAULT '[]',
    "safeZones" JSONB NOT NULL DEFAULT '[]',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BaseTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TenantTemplate" (
    "id" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "baseTemplateId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "overrideImageUrl" TEXT,
    "overrideTextZones" JSONB,
    "overrideColors" JSONB,
    "price" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TenantTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RuleSet" (
    "id" TEXT NOT NULL,
    "tenantTemplateId" TEXT NOT NULL,
    "minChars" INTEGER NOT NULL DEFAULT 1,
    "maxChars" INTEGER NOT NULL DEFAULT 7,
    "allowedPattern" TEXT,
    "bannedTerms" JSONB NOT NULL DEFAULT '[]',
    "profanityFilter" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RuleSet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Design" (
    "id" TEXT NOT NULL,
    "tenantTemplateId" TEXT NOT NULL,
    "zonePlacements" JSONB NOT NULL DEFAULT '[]',
    "renderConfig" JSONB NOT NULL DEFAULT '{}',
    "status" "DesignStatus" NOT NULL DEFAULT 'DRAFT',
    "guestEmail" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Design_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL,
    "designId" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "orderNumber" TEXT NOT NULL,
    "status" "OrderStatus" NOT NULL DEFAULT 'SUBMITTED',
    "customerName" TEXT NOT NULL,
    "customerEmail" TEXT NOT NULL,
    "pdfUrl" TEXT,
    "notificationLog" JSONB NOT NULL DEFAULT '[]',
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "orderId" TEXT,
    "action" TEXT NOT NULL,
    "before" JSONB,
    "after" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GovernmentEntity_slug_key" ON "GovernmentEntity"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Order_designId_key" ON "Order"("designId");

-- CreateIndex
CREATE UNIQUE INDEX "Order_orderNumber_key" ON "Order"("orderNumber");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_entityId_fkey" FOREIGN KEY ("entityId") REFERENCES "GovernmentEntity"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TenantTemplate" ADD CONSTRAINT "TenantTemplate_entityId_fkey" FOREIGN KEY ("entityId") REFERENCES "GovernmentEntity"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TenantTemplate" ADD CONSTRAINT "TenantTemplate_baseTemplateId_fkey" FOREIGN KEY ("baseTemplateId") REFERENCES "BaseTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RuleSet" ADD CONSTRAINT "RuleSet_tenantTemplateId_fkey" FOREIGN KEY ("tenantTemplateId") REFERENCES "TenantTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Design" ADD CONSTRAINT "Design_tenantTemplateId_fkey" FOREIGN KEY ("tenantTemplateId") REFERENCES "TenantTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_designId_fkey" FOREIGN KEY ("designId") REFERENCES "Design"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_entityId_fkey" FOREIGN KEY ("entityId") REFERENCES "GovernmentEntity"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE SET NULL ON UPDATE CASCADE;
