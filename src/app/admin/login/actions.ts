'use server'

import { redirect } from 'next/navigation'
import { verifyPassword, setAdminSession } from '@/lib/auth'

export async function loginAction(formData: FormData) {
  const password = formData.get('password') as string
  const tenantSlug = formData.get('tenantSlug') as string

  if (!verifyPassword(password)) {
    redirect(`/admin/login?error=1&tenant=${tenantSlug}`)
  }

  await setAdminSession()
  redirect(`/admin/${tenantSlug}`)
}

export async function logoutAction(formData: FormData) {
  const { clearAdminSession } = await import('@/lib/auth')
  await clearAdminSession()
  const tenantSlug = formData.get('tenantSlug') as string
  redirect(`/admin/login?tenant=${tenantSlug}`)
}