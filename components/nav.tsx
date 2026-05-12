'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { useUser } from '@/components/user-provider'

const allNavItems = [
  { href: '/dashboard',       label: 'Dashboard',        icon: '🏠', roles: ['owner', 'family', 'vet', 'sitter'] },
  { href: '/medical',         label: 'Medical',          icon: '🏥', roles: ['owner', 'family', 'vet'] },
  { href: '/medications',     label: 'Medications',      icon: '💊', roles: ['owner', 'family', 'vet', 'sitter'] },
  { href: '/insurance',       label: 'Insurance',        icon: '🛡️', roles: ['owner', 'family'] },
  { href: '/care',            label: 'Care',             icon: '📋', roles: ['owner', 'family', 'vet', 'sitter'] },
  { href: '/photos',          label: 'Photos',           icon: '📷', roles: ['owner', 'family', 'vet', 'sitter'] },
  { href: '/activity',        label: 'Activity',         icon: '📓', roles: ['owner', 'family', 'vet', 'sitter'] },
  { href: '/settings/access', label: 'Settings',         icon: '⚙️', roles: ['owner'] },
]

export function Nav() {
  const { role } = useUser()
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  const items = allNavItems.filter((item) => (item.roles as string[]).includes(role))
  const mobileItems = items.slice(0, 4)

  const isActive = (href: string) =>
    href === '/dashboard' ? pathname === href : pathname.startsWith(href)

  const linkClass = (href: string) =>
    `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
      isActive(href)
        ? 'bg-brand-100 text-brand-800'
        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
    }`

  return (
    <>
      {/* Desktop sidebar */}
      <nav className="hidden md:flex flex-col w-56 shrink-0 border-r border-gray-200 bg-white px-3 py-4 gap-1">
        <div className="px-3 mb-4">
          <span className="text-lg font-bold text-brand-700">🐾 Rusty</span>
        </div>
        {items.map((item) => (
          <Link key={item.href} href={item.href} className={linkClass(item.href)}>
            <span className="text-base">{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>

      {/* Mobile top bar */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200">
        <span className="text-base font-bold text-brand-700">🐾 Rusty</span>
        <button
          onClick={() => setOpen(true)}
          className="p-1.5 rounded-lg text-gray-600 hover:bg-gray-100"
          aria-label="Open menu"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <nav className="relative w-64 bg-white h-full px-3 py-4 flex flex-col gap-1 shadow-xl">
            <div className="flex items-center justify-between px-3 mb-4">
              <span className="text-lg font-bold text-brand-700">🐾 Rusty</span>
              <button onClick={() => setOpen(false)} className="p-1 rounded text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            {items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={linkClass(item.href)}
                onClick={() => setOpen(false)}
              >
                <span className="text-base">{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      )}

      {/* Mobile bottom bar (quick access to first 4 items) */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white border-t border-gray-200 flex pb-safe">
        {mobileItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex-1 flex flex-col items-center py-3 text-xs font-medium transition-colors ${
              isActive(item.href) ? 'text-brand-700' : 'text-gray-500'
            }`}
          >
            <span className="text-lg leading-none mb-0.5">{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>
    </>
  )
}
