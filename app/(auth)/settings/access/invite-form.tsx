'use client'

import { useState, useTransition } from 'react'
import { inviteUser } from './actions'
import type { AccessRole } from '@/types'

const ROLES: { value: AccessRole; label: string; description: string }[] = [
  { value: 'family',  label: 'Family',  description: 'Full read, can add activity & photos' },
  { value: 'vet',     label: 'Vet',     description: 'Medical records, can upload documents' },
  { value: 'sitter',  label: 'Sitter',  description: 'Care instructions & medications (read-only)' },
  { value: 'owner',   label: 'Owner',   description: 'Full access including settings' },
]

export function InviteForm() {
  const [email, setEmail]   = useState('')
  const [role, setRole]     = useState<AccessRole>('family')
  const [error, setError]   = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    startTransition(async () => {
      try {
        await inviteUser(email.trim(), role)
        setSuccess(`Invitation sent to ${email.trim()}`)
        setEmail('')
        setRole('family')
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong')
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
      <h2 className="text-sm font-semibold text-gray-900">Invite someone</h2>

      <div className="space-y-1">
        <label htmlFor="invite-email" className="block text-xs font-medium text-gray-700">
          Google account email
        </label>
        <input
          id="invite-email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="name@example.com"
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
      </div>

      <div className="space-y-1">
        <label htmlFor="invite-role" className="block text-xs font-medium text-gray-700">
          Role
        </label>
        <select
          id="invite-role"
          value={role}
          onChange={(e) => setRole(e.target.value as AccessRole)}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
        >
          {ROLES.map((r) => (
            <option key={r.value} value={r.value}>{r.label} — {r.description}</option>
          ))}
        </select>
      </div>

      {error   && <p className="text-xs text-red-600">{error}</p>}
      {success && <p className="text-xs text-green-600">{success}</p>}

      <button
        type="submit"
        disabled={pending}
        className="w-full bg-brand-600 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-brand-700 disabled:opacity-50 transition-colors"
      >
        {pending ? 'Sending…' : 'Send invite'}
      </button>
    </form>
  )
}
