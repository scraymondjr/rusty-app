import type { Metadata } from 'next'
import { PageShell } from '@/components/page-shell'
import { EmptyState } from '@/components/ui/empty-state'
import { getInsurancePolicies } from '@/lib/db/insurance'
import { InsuranceForm } from './insurance-form'

export const metadata: Metadata = { title: 'Insurance' }

export default async function InsurancePage() {
  const policies = await getInsurancePolicies()
  const policy = policies[0] ?? null // v1 supports one policy

  return (
    <PageShell title="Insurance">
      <div className="max-w-xl">
        {!policy ? (
          <EmptyState
            icon="🛡️"
            title="No insurance on file"
            description="Add your pet insurance policy details."
          />
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6 space-y-3">
            <Field label="Provider"      value={policy.provider} />
            <Field label="Policy Number" value={policy.policyNumber} />
            {policy.coverage && <Field label="Coverage" value={policy.coverage} />}
          </div>
        )}
        <InsuranceForm policy={policy} />
      </div>
    </PageShell>
  )
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-0.5">{label}</p>
      <p className="text-sm text-gray-800">{value}</p>
    </div>
  )
}
