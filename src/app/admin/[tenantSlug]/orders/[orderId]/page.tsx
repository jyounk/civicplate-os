import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import { updateOrderStatus } from '@/lib/admin-actions'

const STATUS_COLORS: Record<string, string> = {
  DRAFT:      'bg-slate-100 text-slate-600',
  SUBMITTED:  'bg-blue-100 text-blue-700',
  IN_REVIEW:  'bg-yellow-100 text-yellow-700',
  APPROVED:   'bg-green-100 text-green-700',
  REJECTED:   'bg-red-100 text-red-700',
  COMPLETED:  'bg-purple-100 text-purple-700',
}

interface Props {
  params: Promise<{ tenantSlug: string; orderId: string }>
  searchParams: Promise<{ updated?: string }>
}

export default async function OrderDetailPage({ params, searchParams }: Props) {
  const { tenantSlug, orderId } = await params
  const sp = await searchParams

  const pool = new Pool({ connectionString: process.env.DATABASE_URL })
  const adapter = new PrismaPg(pool)
  const prisma = new PrismaClient({ adapter })

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      design: { include: { tenantTemplate: { include: { baseTemplate: true } } } },
    },
  })

  if (!order) {
    return <div className="p-8 text-red-600">Order not found</div>
  }

  const auditLogs = await prisma.auditLog.findMany({
    where: { orderId: orderId },
    orderBy: { createdAt: 'desc' },
  })

  const raw = order.design.zonePlacements
  const zones = Array.isArray(raw) ? raw : JSON.parse(raw as string)
  const plateText = (zones as any[])[0]?.value ?? 'N/A'

  const canApprove = ['SUBMITTED', 'IN_REVIEW'].includes(order.status)
  const canReject  = ['SUBMITTED', 'IN_REVIEW', 'APPROVED'].includes(order.status)
  const pdfUrl = '/api/orders/' + orderId + '/pdf'

  return (
    <div className="p-8 max-w-4xl">
      {sp.updated && (
        <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded px-4 py-3 mb-6">
          Order status updated successfully.
        </div>
      )}

      <div className="mb-6 flex items-center gap-4">
        <a href={'/admin/' + tenantSlug} className="text-slate-400 hover:text-slate-600 text-sm">&larr; All Orders</a>
        <span className="text-slate-300">|</span>
        <h1 className="text-xl font-bold text-slate-900">Order {order.orderNumber}</h1>
        <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${STATUS_COLORS[order.status] ?? ''}`}>
          {order.status}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-8">
        <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4">Plate Design</h2>
          <div className="bg-slate-100 rounded p-4 text-center mb-4">
            <div className="inline-block border-4 border-slate-700 rounded px-8 py-4">
              <div className="text-3xl font-black tracking-widest" style={{ fontFamily: 'monospace' }}>
                {plateText}
              </div>
            </div>
          </div>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-slate-500">Template</dt>
              <dd className="text-slate-900 font-medium">{order.design.tenantTemplate.name}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500">Price</dt>
              <dd className="text-slate-900 font-medium">${Number(order.design.tenantTemplate.price).toFixed(2)}</dd>
            </div>
          </dl>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4">Customer</h2>
          <dl className="space-y-3 text-sm">
            <div>
              <dt className="text-slate-500 text-xs mb-0.5">Name</dt>
              <dd className="text-slate-900 font-semibold">{order.customerName}</dd>
            </div>
            <div>
              <dt className="text-slate-500 text-xs mb-0.5">Email</dt>
              <dd className="text-slate-900">{order.customerEmail}</dd>
            </div>
            <div>
              <dt className="text-slate-500 text-xs mb-0.5">Submitted</dt>
              <dd className="text-slate-900">{order.submittedAt ? new Date(order.submittedAt).toLocaleString() : 'N/A'}</dd>
            </div>
            <div>
              <dt className="text-slate-500 text-xs mb-0.5">Last Updated</dt>
              <dd className="text-slate-900">{new Date(order.updatedAt).toLocaleString()}</dd>
            </div>
          </dl>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm mb-8">
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4">Actions</h2>
        <div className="flex gap-3 flex-wrap">
          {canApprove && (
            <form action={updateOrderStatus}>
              <input type="hidden" name="orderId" value={order.id} />
              <input type="hidden" name="status" value="APPROVED" />
              <input type="hidden" name="tenantSlug" value={tenantSlug} />
              <button type="submit" className="bg-green-600 hover:bg-green-500 text-white font-semibold px-5 py-2 rounded text-sm transition-colors">
                Approve Order
              </button>
            </form>
          )}
          {canReject && (
            <form action={updateOrderStatus}>
              <input type="hidden" name="orderId" value={order.id} />
              <input type="hidden" name="status" value="REJECTED" />
              <input type="hidden" name="tenantSlug" value={tenantSlug} />
              <button type="submit" className="bg-red-600 hover:bg-red-500 text-white font-semibold px-5 py-2 rounded text-sm transition-colors">
                Reject Order
              </button>
            </form>
          )}
          {order.status === 'APPROVED' && (
            <a href={pdfUrl} className="bg-slate-700 hover:bg-slate-600 text-white font-semibold px-5 py-2 rounded text-sm transition-colors inline-block">
              Download Approval PDF
            </a>
          )}
          {!canApprove && !canReject && order.status !== 'APPROVED' && (
            <p className="text-slate-400 text-sm">No actions available for this status.</p>
          )}
        </div>
      </div>

      {auditLogs.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4">Audit Log</h2>
          <div className="space-y-3">
            {auditLogs.map((log) => (
              <div key={log.id} className="flex items-start gap-3 text-sm">
                <div className="w-2 h-2 rounded-full bg-blue-400 mt-1.5 shrink-0"></div>
                <div>
                  <span className="font-mono text-slate-700">{log.action}</span>
                  <span className="text-slate-400 ml-3 text-xs">{new Date(log.createdAt).toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}