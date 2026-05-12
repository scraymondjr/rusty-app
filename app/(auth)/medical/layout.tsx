import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth/session'

export default async function MedicalLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession()
  if (!session || !['owner', 'family', 'vet'].includes(session.role)) redirect('/dashboard')
  return <>{children}</>
}
