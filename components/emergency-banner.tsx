import Link from 'next/link'
import { getEmergencyContacts } from '@/lib/db/emergency-contacts'

export async function EmergencyBanner() {
  let primaryContact: { name: string; phone: string; role: string } | null = null

  try {
    const contacts = await getEmergencyContacts()
    primaryContact = contacts[0] ?? null
  } catch {
    // Fail gracefully — Firestore may not have the collection yet
  }

  return (
    <div className="bg-red-600 text-white px-4 py-2 text-sm font-medium text-center shrink-0">
      {primaryContact ? (
        <>
          Emergency — {primaryContact.name} ({primaryContact.role}):{' '}
          <a
            href={`tel:${primaryContact.phone.replace(/\D/g, '')}`}
            className="underline font-bold tracking-wide hover:text-red-100 transition-colors"
          >
            {primaryContact.phone}
          </a>
        </>
      ) : (
        <>
          No emergency contact set.{' '}
          <Link href="/care" className="underline font-bold hover:text-red-100 transition-colors">
            Add one →
          </Link>
        </>
      )}
    </div>
  )
}
