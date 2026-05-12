import type { Metadata } from 'next'
import Link from 'next/link'
import { getSession } from '@/lib/auth/session'
import { SignOutButton } from '@/components/sign-out-button'

export const metadata: Metadata = { title: 'Dashboard' }

const metricCards = [
  { label: 'Next Dose',        value: '—', sub: 'No medications set up',    icon: '💊' },
  { label: 'Next Vet Visit',   value: '—', sub: 'No appointment scheduled', icon: '🏥' },
  { label: 'Active Meds',      value: '0', sub: 'None on file',             icon: '📋' },
  { label: 'Supplies Status',  value: '—', sub: 'No subscriptions yet',     icon: '📦' },
  { label: 'Last Checkup',     value: '—', sub: 'No records uploaded',      icon: '📅' },
]

const featureCards = [
  { href: '/medical',      label: 'Medical Records',  icon: '🏥', desc: 'Visits, vaccinations, weight' },
  { href: '/medications',  label: 'Medications',      icon: '💊', desc: 'Active prescriptions' },
  { href: '/insurance',    label: 'Insurance',        icon: '🛡️', desc: 'Policy & claims' },
  { href: '/care',         label: 'Care Instructions',icon: '📋', desc: 'Feeding, walks, quirks' },
  { href: '/supplies',     label: 'Supplies',         icon: '📦', desc: 'Subscriptions & inventory' },
  { href: '/photos',       label: 'Photos',           icon: '📷', desc: 'Gallery & public page' },
  { href: '/activity',     label: 'Activity Log',     icon: '📓', desc: 'Care entries' },
  { href: '/settings/access', label: 'Access',        icon: '👥', desc: 'Invite & manage people' },
]

export default async function DashboardPage() {
  const session = await getSession()

  return (
    <div className="flex-1 max-w-5xl mx-auto w-full px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {session?.name ? `Hi, ${session.name.split(' ')[0]}` : 'Dashboard'}
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {session?.email}
            {session?.role && (
              <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-brand-100 text-brand-800">
                {session.role}
              </span>
            )}
          </p>
        </div>
        <SignOutButton />
      </div>

      {/* Metric cards */}
      <section className="mb-10">
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
          At a Glance
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {metricCards.map((card) => (
            <div
              key={card.label}
              className="bg-white rounded-xl border border-gray-200 p-4 flex flex-col gap-1"
            >
              <span className="text-xl">{card.icon}</span>
              <span className="text-lg font-bold text-gray-800">{card.value}</span>
              <span className="text-xs font-medium text-gray-600">{card.label}</span>
              <span className="text-xs text-gray-400">{card.sub}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Feature cards */}
      <section>
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
          Rusty&apos;s Info
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {featureCards.map((card) => (
            <Link
              key={card.href}
              href={card.href}
              className="bg-white rounded-xl border border-gray-200 p-4 hover:border-brand-300 hover:shadow-sm transition-all group"
            >
              <span className="text-2xl block mb-2">{card.icon}</span>
              <span className="text-sm font-semibold text-gray-800 group-hover:text-brand-700 block">
                {card.label}
              </span>
              <span className="text-xs text-gray-400">{card.desc}</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
