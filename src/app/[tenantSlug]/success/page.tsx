import { redirect } from 'next/navigation'
import { getTenantBySlug } from '@/lib/tenant'
import SuccessPoller from './SuccessPoller'

type Props = { searchParams: Promise<{ session_id?: string }>; params: Promise<{ tenantSlug: string }> }

export default async function SuccessPage({ params, searchParams }: Props) {
  const { tenantSlug } = await params
  const { session_id } = await searchParams
  if (!session_id) redirect('/' + tenantSlug)
  const tenant = await getTenantBySlug(tenantSlug)
  if (!tenant) redirect('/' + tenantSlug)

  return <SuccessPoller sessionId={session_id} tenantSlug={tenantSlug} />
}
