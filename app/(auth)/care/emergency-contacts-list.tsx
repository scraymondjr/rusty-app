'use client'

import { useState } from 'react'
import { addEmergencyContact, removeEmergencyContact } from './actions'
import type { EmergencyContact } from '@/types/db'

const inputClass = 'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent'

export function EmergencyContactsList({ contacts }: { contacts: EmergencyContact[] }) {
  const [adding, setAdding] = useState(false)
  const [saving, setSaving] = useState(false)

  const handleAdd = async (formData: FormData) => {
    setSaving(true)
    try {
      await addEmergencyContact(formData)
      setAdding(false)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
      {contacts.length === 0 && !adding && (
        <div className="px-5 py-4 text-sm text-gray-400">
          No emergency contacts yet. The banner above will prompt you to add one.
        </div>
      )}
      {contacts.map((c) => (
        <div key={c.id} className="flex items-center justify-between px-5 py-3">
          <div>
            <p className="text-sm font-semibold text-gray-800">{c.name}</p>
            <p className="text-xs text-gray-500">{c.role} · <a href={`tel:${c.phone.replace(/\D/g,'')}`} className="underline">{c.phone}</a></p>
          </div>
          <button
            onClick={async () => {
              if (!confirm(`Remove ${c.name}?`)) return
              await removeEmergencyContact(c.id)
            }}
            className="text-xs text-red-500 hover:text-red-700 transition-colors"
          >
            Remove
          </button>
        </div>
      ))}
      {adding ? (
        <form action={handleAdd} className="px-5 py-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <input name="name"     required placeholder="Name"  className={inputClass} />
            <input name="role"     required placeholder="Role (e.g. Vet, Neighbor)" className={inputClass} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input name="phone"    required placeholder="Phone" className={inputClass} />
            <input name="priority" type="number" defaultValue={contacts.length + 1}
              placeholder="Priority (1 = first)" className={inputClass} />
          </div>
          <div className="flex gap-2">
            <button type="submit" disabled={saving}
              className="bg-brand-600 text-white rounded-lg px-3 py-1.5 text-sm font-medium hover:bg-brand-700 disabled:opacity-60 disabled:cursor-not-allowed">
              {saving ? 'Adding…' : 'Add'}
            </button>
            <button type="button" onClick={() => setAdding(false)}
              className="text-sm text-gray-500 hover:text-gray-700">
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <button
          onClick={() => setAdding(true)}
          className="w-full text-left px-5 py-3 text-sm text-brand-600 hover:bg-brand-50 transition-colors rounded-b-xl font-medium"
        >
          + Add Contact
        </button>
      )}
    </div>
  )
}
