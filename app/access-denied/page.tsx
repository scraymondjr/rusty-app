import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = { title: 'Access Denied' }

export default function AccessDeniedPage({
  searchParams,
}: {
  searchParams: { email?: string }
}) {
  const email = searchParams.email ?? ''
  const ownerEmail = process.env.OWNER_EMAIL ?? ''

  const mailtoHref = ownerEmail
    ? `mailto:${ownerEmail}?subject=Access%20request%20for%20Rusty&body=Hi%2C%20I%27d%20like%20access%20to%20Rusty%27s%20dashboard.%20My%20Google%20account%20email%20is%20${encodeURIComponent(email)}.`
    : undefined

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <div className="text-center max-w-sm">
        <div className="text-5xl mb-4">🔒</div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h1>
        <p className="text-gray-500 mb-6">
          <strong>{email || 'Your account'}</strong> hasn&apos;t been granted access yet.
        </p>
        {mailtoHref && (
          <a
            href={mailtoHref}
            className="inline-block bg-brand-600 text-white rounded-lg px-6 py-3 font-medium hover:bg-brand-700 transition-colors mb-4"
          >
            Request Access
          </a>
        )}
        <div>
          <Link href="/" className="text-sm text-gray-400 hover:text-gray-600 transition-colors">
            ← Back to home
          </Link>
        </div>
      </div>
    </main>
  )
}
