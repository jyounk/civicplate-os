'use client'
import { deleteOrder } from '@/lib/admin-actions'

export default function DeleteOrderButton({ orderId, orderNumber, tenantSlug }: { orderId: string; orderNumber: string; tenantSlug: string }) {
  return (
    <div style={{ marginTop: '1.25rem', paddingTop: '1.25rem', borderTop: '1px solid #f1f5f9' }}>
      <p style={{ margin: '0 0 0.75rem', fontSize: '0.75rem', color: '#94a3b8' }}>Danger Zone</p>
      <form action={deleteOrder} onSubmit={(e) => { if (!confirm('Permanently delete order ' + orderNumber + '? This cannot be undone.')) e.preventDefault() }}>
        <input type='hidden' name='orderId' value={orderId} />
        <input type='hidden' name='tenantSlug' value={tenantSlug} />
        <button type='submit' style={{ fontSize: '0.875rem', fontWeight: '600', padding: '0.6rem 1.25rem', borderRadius: '6px', cursor: 'pointer', background: '#fff', color: '#dc2626', border: '1px solid #fecaca' }}>Delete Order</button>
      </form>
    </div>
  )
}