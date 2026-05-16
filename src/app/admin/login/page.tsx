import { loginAction } from './actions'

interface Props {
  searchParams: Promise<{ error?: string; tenant?: string }>
}

export default async function AdminLoginPage({ searchParams }: Props) {
  const params = await searchParams
  const tenant = params.tenant ?? 'newton'
  const hasError = params.error === '1'

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-8 w-full max-w-sm shadow-2xl">
        <div className="mb-8 text-center">
          <div className="text-2xl font-bold text-white tracking-tight">CivicPlate OS</div>
          <div className="text-slate-400 text-sm mt-1">Admin Portal</div>
        </div>

        {hasError && (
          <div className="bg-red-900/40 border border-red-700 text-red-300 text-sm rounded px-4 py-3 mb-6">
            Incorrect password. Please try again.
          </div>
        )}

        <form action={loginAction}>
          <input type="hidden" name="tenantSlug" value={tenant} />

          <div className="mb-4">
            <label className="block text-slate-300 text-sm font-medium mb-1">
              Password
            </label>
            <input
              type="password"
              name="password"
              autoComplete="current-password"
              required
              className="w-full bg-slate-700 border border-slate-600 text-white rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter admin password"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2 px-4 rounded text-sm transition-colors"
          >
            Sign In
          </button>
        </form>

        <p className="text-slate-500 text-xs text-center mt-6">
          {tenant}.civicplate.gov &mdash; Authorized personnel only
        </p>
      </div>
    </div>
  )
}