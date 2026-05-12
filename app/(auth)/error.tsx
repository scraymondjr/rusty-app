'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function AuthError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Auth layout error:', error)
  }, [error])

  const isPermission =
    error.message?.toLowerCase().includes('permission') ||
    error.message?.toLowerCase().includes('unauthorized') ||
    error.message?.toLowerCase().includes('missing or insufficient')

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 py-16 text-center">
      <p className="text-4xl mb-4">{isPermission ? '🔒' : '⚠️'}</p>
      <h2 className="text-lg font-semibold text-gray-800 mb-2">
        {isPermission ? 'Access denied' : 'Something went wrong'}
      </h2>
      <p className="text-sm text-gray-500 mb-6 max-w-xs">
        {isPermission
          ? "You don't have permission to view this page."
          : 'An unexpected error occurred. Try refreshing.'}
      </p>
      <div className="flex gap-3">
        <button
          onClick={reset}
          className="bg-brand-600 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-brand-700 transition-colors"
        >
          Try again
        </button>
        <Link
          href="/dashboard"
          className="bg-white border border-gray-300 text-gray-700 rounded-lg px-4 py-2 text-sm font-medium hover:bg-gray-50 transition-colors"
        >
          Back to dashboard
        </Link>
      </div>
    </div>
  )
}
