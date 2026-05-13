'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
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
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const drawerRef = useRef<HTMLElement>(null)

  const items = allNavItems.filter((item) => (item.roles as string[]).includes(role))
  const mobileItems = items.slice(0, 4)

  const isActive = (href: string) =>
    href === '/dashboard' ? pathname === href : pathname.startsWith(href)

  const linkClass = (href: string) =>
    `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 ${
      isActive(href)
        ? 'bg-brand-100 text-brand-800'
        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
    }`

  // Move focus into drawer when it opens
  useEffect(() => {
    if (open) closeButtonRef.current?.focus()
  }, [open])

  // Close drawer when route changes
  useEffect(() => {
    setOpen(false)
  }, [pathname])

  const handleDrawerKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') setOpen(false)

    // Trap Tab focus within the drawer
    if (e.key === 'Tab') {
      const focusable = drawerRef.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled])',
      )
      if (!focusable || focusable.length === 0) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
  }

  return (
    <>
      {/* Desktop sidebar */}
      <nav className="hidden md:flex flex-col w-56 shrink-0 border-r border-gray-200 bg-white px-3 py-4 gap-1">
        <div className="px-3 mb-4">
          <span className="text-lg font-bold text-brand-700">🐾 Rusty</span>
        </div>
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={linkClass(item.href)}
            aria-current={isActive(item.href) ? 'page' : undefined}
          >
            <span className="text-base" aria-hidden="true">{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>

      {/* Mobile top bar */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200">
        <span className="text-base font-bold text-brand-700">🐾 Rusty</span>
        <button
          onClick={() => setOpen(true)}
          className="p-1.5 rounded-lg text-gray-600 hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
          aria-label="Open navigation menu"
          aria-expanded={open}
          aria-haspopup="dialog"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="md:hidden fixed inset-0 z-50 flex" onKeyDown={handleDrawerKeyDown}>
          <div
            className="fixed inset-0 bg-black/40"
            aria-hidden="true"
            onClick={() => setOpen(false)}
          />
          <nav
            ref={drawerRef}
            role="dialog"
            aria-modal="true"
            aria-label="Navigation menu"
            className="relative w-64 bg-white h-full px-3 py-4 flex flex-col gap-1 shadow-xl"
          >
            <div className="flex items-center justify-between px-3 mb-4">
              <span className="text-lg font-bold text-brand-700">🐾 Rusty</span>
              <button
                ref={closeButtonRef}
                onClick={() => setOpen(false)}
                className="p-1 rounded text-gray-400 hover:text-gray-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                aria-label="Close navigation menu"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            {items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={linkClass(item.href)}
                aria-current={isActive(item.href) ? 'page' : undefined}
                onClick={() => setOpen(false)}
              >
                <span className="text-base" aria-hidden="true">{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      )}

      {/* Mobile bottom bar (quick access to first 4 items) */}
      <nav aria-label="Quick navigation" className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white border-t border-gray-200 flex pb-safe">
        {mobileItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            aria-current={isActive(item.href) ? 'page' : undefined}
            className={`flex-1 flex flex-col items-center py-3 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-inset ${
              isActive(item.href) ? 'text-brand-700' : 'text-gray-500'
            }`}
          >
            <span className="text-lg leading-none mb-0.5" aria-hidden="true">{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>
    </>
  )
}
