import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth/session'
import { PhotoCarousel } from '@/components/photo-carousel'
import Link from 'next/link'

// Add real photos here when available, e.g. { src: '/photos/rusty-1.jpg', alt: 'Rusty at the park' }
const CAROUSEL_SLIDES: { src: string; alt: string }[] = []

export default async function HomePage() {
  const session = await getSession()
  if (session) redirect('/dashboard')

  return (
    <div className="min-h-screen bg-gradient-to-b from-brand-50 to-white">
      {/* Navbar */}
      <header className="flex items-center justify-between px-6 py-4 max-w-2xl mx-auto">
        <div className="flex items-center gap-2 text-brand-800 font-semibold">
          <span className="text-xl">🐾</span>
          <span>Rusty</span>
        </div>
        <Link
          href="/login"
          className="bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors shadow-sm"
        >
          Sign In →
        </Link>
      </header>

      <main className="max-w-2xl mx-auto px-6 pb-16">
        {/* Hero */}
        <div className="text-center mt-6 mb-10">
          <div className="w-32 h-32 rounded-full bg-gradient-to-br from-brand-200 to-brand-400 mx-auto mb-6 flex items-center justify-center text-6xl shadow-md">
            🐕
          </div>
          <h1 className="text-5xl font-bold text-brand-800 mb-3">Rusty</h1>
          <p className="text-xl text-brand-700 font-medium mb-4">Golden Retriever</p>
          <p className="text-gray-500 max-w-md mx-auto leading-relaxed">
            Meet Rusty — a happy, tail-wagging Golden Retriever who loves fetch, long walks, and belly rubs.
            This is his personal care page, where family and caregivers can stay up to date on everything Rusty.
          </p>
        </div>

        {/* Photo carousel */}
        <section aria-label="Photos of Rusty">
          <h2 className="text-lg font-semibold text-gray-700 mb-4 text-center">Photos</h2>
          <PhotoCarousel slides={CAROUSEL_SLIDES} />
        </section>

        {/* CTA footer */}
        <div className="mt-12 text-center">
          <p className="text-sm text-gray-400 mb-3">Rusty&apos;s care team? Sign in to access the full dashboard.</p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-medium px-6 py-3 rounded-xl transition-colors shadow"
          >
            Sign In to Dashboard
          </Link>
        </div>
      </main>
    </div>
  )
}
