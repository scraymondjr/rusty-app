import type { Metadata } from 'next'
import { PageShell } from '@/components/page-shell'
import { getCareInstructions } from '@/lib/db/care'
import { getEmergencyContacts } from '@/lib/db/emergency-contacts'
import { CareForm } from './care-form'
import { EmergencyContactsList } from './emergency-contacts-list'

export const metadata: Metadata = { title: 'Care Instructions' }

export default async function CarePage() {
  const [care, contacts] = await Promise.all([
    getCareInstructions(),
    getEmergencyContacts(),
  ])

  return (
    <PageShell title="Care Instructions">
      <div className="max-w-2xl space-y-6">
        <section>
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
            Emergency Contacts
          </h2>
          <EmergencyContactsList contacts={contacts} />
        </section>

        <section>
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
            Care Guide
          </h2>
          <CareForm initialData={care} />
        </section>
      </div>
    </PageShell>
  )
}
