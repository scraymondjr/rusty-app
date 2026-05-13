import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth/session'
import { SignInButton } from '@/components/sign-in-button'
import Link from 'next/link'

export default async function LoginPage() {
  const session = await getSession()
  if (session) redirect('/dashboard')

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-brand-50 to-white px-4">
      <Link
        href="/"
        className="absolute top-6 left-6 text-sm text-brand-700 hover:text-brand-900 font-medium flex items-center gap-1"
      >
        ← Back
      </Link>
      <div className="text-center max-w-sm w-full">
        <div className="w-20 h-20 rounded-full bg-brand-200 mx-auto mb-5 flex items-center justify-center text-4xl">
          🐾
        </div>
        <h1 className="text-3xl font-bold text-brand-800 mb-1">Sign In</h1>
        <p className="text-gray-500 mb-8 text-sm">Access Rusty&apos;s care dashboard</p>
        <SignInButton />
        <p className="mt-6 text-xs text-gray-400">Access is by invitation only.</p>
      </div>
    </main>
  )
}
