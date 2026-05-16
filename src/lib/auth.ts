import { cookies } from 'next/headers'

const ADMIN_COOKIE = 'civicplate_admin_session'
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? 'demo1234'
const SESSION_VALUE = 'authenticated'

export function verifyPassword(password: string): boolean {
  return password === ADMIN_PASSWORD
}

export async function setAdminSession() {
  const cookieStore = await cookies()
  cookieStore.set(ADMIN_COOKIE, SESSION_VALUE, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 8, // 8 hours
    path: '/',
  })
}

export async function clearAdminSession() {
  const cookieStore = await cookies()
  cookieStore.delete(ADMIN_COOKIE)
}

export function isAdminAuthenticated(cookieHeader: string | null): boolean {
  if (!cookieHeader) return false
  return cookieHeader.includes(`${ADMIN_COOKIE}=${SESSION_VALUE}`)
}