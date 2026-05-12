'use client'

import { useState } from 'react'
import { saveInsurancePolicy } from './actions'
import type { InsurancePolicy } from '@/types/db'

const inputClass = 'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent'
const labelClass = 'block text-sm font-medium text-gray-700 mb-1'

export function InsuranceForm({ policy }: { policy: InsurancePolicy | null }) {
  const [open, setOpen] = useState(!policy)
  const [saving, setSaving] = useState(false)

  if (!open) {
    return (
      <button onClick={() => setOpen(true)}
        className="text-sm text-brand-600 hover:text-brand-800 font-medium transition-colors">
        Edit policy details →
      </button>
    )
  }

  const handleAction = async (formData: FormData) => {
    setSaving(true)
    try {
      if (policy) formData.set('id', policy.id)
      await saveInsurancePolicy(formData)
    } finally {
      setSaving(false)
    }
  }

  return (
    <form action={handleAction} className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
      <h2 className="text-sm font-semibold text-gray-700">{policy ? 'Edit Policy' : 'Add Policy'}</h2>
      <div>
        <label className={labelClass}>Insurance Provider *</label>
        <input name="provider" required defaultValue={policy?.provider ?? ''}
          placeholder="e.g. Trupanion, Healthy Paws" className={inputClass} />
      </div>
      <div>
        <label className={labelClass}>Policy Number *</label>
        <input name="policyNumber" required defaultValue={policy?.policyNumber ?? ''}
          placeholder="e.g. TP-12345678" className={inputClass} />
      </div>
      <div>
        <label className={labelClass}>Coverage Summary</label>
        <textarea name="coverage" rows={3} defaultValue={policy?.coverage ?? ''}
          placeholder="e.g. Accidents and illnesses, 90% reimbursement, $200 deductible" className={inputClass} />
      </div>
      <div className="flex gap-3">
        <button type="submit" disabled={saving}
          className="bg-brand-600 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-brand-700 disabled:opacity-60 transition-colors">
          {saving ? 'Saving…' : 'Save'}
        </button>
        {policy && (
          <button type="button" onClick={() => setOpen(false)}
            className="bg-white border border-gray-300 text-gray-700 rounded-lg px-4 py-2 text-sm font-medium hover:bg-gray-50 transition-colors">
            Cancel
          </button>
        )}
      </div>
    </form>
  )
}
