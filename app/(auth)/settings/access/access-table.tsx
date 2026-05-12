'use client'

import { useState, useTransition } from 'react'
import { revokeUser, updateUserRole } from './actions'
import type { AccessRole } from '@/types'

interface AccessEntry {
  email: string
  role: AccessRole
  lastSeenAt?: string
  invitedAt?: string
}

const ROLES: AccessRole[] = ['owner', 'family', 'vet', 'sitter']

const ROLE_COLORS: Record<AccessRole, string> = {
  owner:  'bg-brand-50 text-brand-700',
  family: 'bg-blue-50 text-blue-700',
  vet:    'bg-purple-50 text-purple-700',
  sitter: 'bg-amber-50 text-amber-700',
}

export function AccessTable({
  entries,
  currentEmail,
}: {
  entries: AccessEntry[]
  currentEmail: string
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
      {entries.map((entry) => (
        <AccessRow
          key={entry.email}
          entry={entry}
          isSelf={entry.email === currentEmail}
        />
      ))}
    </div>
  )
}

function AccessRow({ entry, isSelf }: { entry: AccessEntry; isSelf: boolean }) {
  const [role, setRole]   = useState<AccessRole>(entry.role)
  const [error, setError] = useState<string | null>(null)
  const [pendingRole, startRoleTransition]     = useTransition()
  const [pendingRevoke, startRevokeTransition] = useTransition()

  function handleRoleChange(newRole: AccessRole) {
    setError(null)
    startRoleTransition(async () => {
      try {
        await updateUserRole(entry.email, newRole)
        setRole(newRole)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to update role')
      }
    })
  }

  function handleRevoke() {
    if (!confirm(`Remove ${entry.email}'s access? This takes effect immediately.`)) return
    setError(null)
    startRevokeTransition(async () => {
      try {
        await revokeUser(entry.email)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to revoke access')
      }
    })
  }

  return (
    <div className="px-5 py-3 space-y-1">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">
            {entry.email}
            {isSelf && <span className="ml-1.5 text-xs text-gray-400">(you)</span>}
          </p>
          {entry.lastSeenAt && (
            <p className="text-xs text-gray-400">Last seen {entry.lastSeenAt}</p>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {isSelf ? (
            <span className={`text-xs font-medium rounded-full px-2.5 py-0.5 capitalize ${ROLE_COLORS[role]}`}>
              {role}
            </span>
          ) : (
            <select
              value={role}
              disabled={pendingRole}
              onChange={(e) => handleRoleChange(e.target.value as AccessRole)}
              className="text-xs rounded-full border border-gray-200 px-2 py-0.5 capitalize focus:outline-none focus:ring-2 focus:ring-brand-500 disabled:opacity-50"
            >
              {ROLES.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          )}

          {!isSelf && (
            <button
              onClick={handleRevoke}
              disabled={pendingRevoke}
              className="text-xs text-red-500 hover:text-red-700 disabled:opacity-50 transition-colors"
            >
              {pendingRevoke ? 'Removing…' : 'Remove'}
            </button>
          )}
        </div>
      </div>

      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  )
}
