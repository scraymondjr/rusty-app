import type { Metadata } from 'next'
import Link from 'next/link'
import { getSession } from '@/lib/auth/session'
import { SignOutButton } from '@/components/sign-out-button'
import { getLatestMedicalRecord } from '@/lib/db/medical'
import { countActiveMedications, getMedications } from '@/lib/db/medications'

export const metadata: Metadata = { title: 'Dashboard' }

const ALL_FEATURE_CARDS = [
  { href: '/medical',         label: 'Medical Records',   icon: '🏥', desc: 'Visits, vaccinations, weight',  roles: ['owner', 'family', 'vet'] },
  { href: '/medications',     label: 'Medications',       icon: '💊', desc: 'Active prescriptions',          roles: ['owner', 'family', 'vet', 'sitter'] },
  { href: '/insurance',       label: 'Insurance',         icon: '🛡️', desc: 'Policy & claims',               roles: ['owner', 'family'] },
  { href: '/care',            label: 'Care Instructions', icon: '📋', desc: 'Feeding, walks, quirks',        roles: ['owner', 'family', 'vet', 'sitter'] },
  { href: '/photos',          label: 'Photos',            icon: '📷', desc: 'Gallery & public page',         roles: ['owner', 'family', 'vet', 'sitter'] },
  { href: '/activity',        label: 'Activity Log',      icon: '📓', desc: 'Care entries',                  roles: ['owner', 'family', 'vet', 'sitter'] },
  { href: '/settings/access', label: 'Access',            icon: '👥', desc: 'Invite & manage people',        roles: ['owner'] },
]

export default async function DashboardPage() {
  const [session, lastRecord, activeMedCount, activeMeds] = await Promise.all([
    getSession(),
    getLatestMedicalRecord().catch(() => null),
    countActiveMedications().catch(() => 0),
    getMedications(true).catch(() => []),
  ])

  const featureCards = ALL_FEATURE_CARDS.filter((c) =>
    session ? c.roles.includes(session.role) : false,
  )

  const nextRefill = activeMeds.find(
    (m) => m.refillsRemaining !== undefined && m.refillsRemaining <= 2,
  )

  const canSeeMedical = session && ['owner', 'family', 'vet'].includes(session.role)

  const metrics = [
    ...(canSeeMedical ? [
      {
        label: 'Last Checkup',
        value: lastRecord
          ? new Date(lastRecord.visitDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
          : '—',
        sub: lastRecord ? lastRecord.reason : 'No records yet',
        icon: '📅',
        href: '/medical',
      },
    ] : []),
    {
      label: 'Active Medications',
      value: String(activeMedCount),
      sub: activeMedCount === 0 ? 'None on file' : `${activeMedCount} medication${activeMedCount !== 1 ? 's' : ''}`,
      icon: '💊',
      href: '/medications',
    },
    {
      label: 'Refills',
      value: nextRefill ? '⚠' : '✓',
      sub: nextRefill
        ? `${nextRefill.name}${nextRefill.refillsRemaining === 0 ? ' — none left' : ` — ${nextRefill.refillsRemaining} left`}`
        : 'All stocked',
      icon: '📦',
      href: '/medications',
      alert: !!nextRefill,
    },
    ...(canSeeMedical ? [
      {
        label: 'Next Vet Visit',
        value: '—',
        sub: 'Not scheduled',
        icon: '🏥',
        href: '/medical',
      },
    ] : []),
  ]

  return (
    <div className="flex-1 max-w-5xl mx-auto w-full px-4 py-6 pb-24 md:pb-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">
            {session?.name ? `Hi, ${session.name.split(' ')[0]}` : "Rusty's Dashboard"}
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {session?.email}
            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-brand-100 text-brand-800">
              {session?.role}
            </span>
          </p>
        </div>
        <SignOutButton />
      </div>

      <section className="mb-10">
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">At a Glance</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {metrics.map((card) => (
            <Link
              key={card.label}
              href={card.href}
              className={`bg-white rounded-xl border p-4 flex flex-col gap-1 hover:shadow-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 ${
                card.alert ? 'border-amber-300 bg-amber-50' : 'border-gray-200'
              }`}
            >
              <span className="text-xl">{card.icon}</span>
              <span className={`text-lg font-bold ${card.alert ? 'text-amber-700' : 'text-gray-800'}`}>
                {card.value}
              </span>
              <span className="text-xs font-medium text-gray-600">{card.label}</span>
              <span className="text-xs text-gray-400">{card.sub}</span>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Quick Links</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {featureCards.map((card) => (
            <Link
              key={card.href}
              href={card.href}
              className="bg-white rounded-xl border border-gray-200 p-4 hover:border-brand-300 hover:shadow-sm transition-all group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
            >
              <span className="text-2xl block mb-2">{card.icon}</span>
              <span className="text-sm font-semibold text-gray-800 group-hover:text-brand-700 block">{card.label}</span>
              <span className="text-xs text-gray-400">{card.desc}</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
