import Link from 'next/link'

interface PageShellProps {
  title: string
  backHref?: string
  action?: { label: string; href: string }
  children: React.ReactNode
}

export function PageShell({ title, backHref, action, children }: PageShellProps) {
  return (
    <div className="flex-1 max-w-4xl mx-auto w-full px-4 py-6 pb-24 md:pb-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          {backHref && (
            <Link
              href={backHref}
              className="p-2 -ml-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              aria-label="Back"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
          )}
          <h1 className="text-xl font-bold text-gray-900">{title}</h1>
        </div>
        {action && (
          <Link
            href={action.href}
            className="bg-brand-600 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-brand-700 transition-colors"
          >
            {action.label}
          </Link>
        )}
      </div>
      {children}
    </div>
  )
}
