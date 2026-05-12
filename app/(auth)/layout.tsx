import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth/session'
import { UserProvider } from '@/components/user-provider'
import { EmergencyBanner } from '@/components/emergency-banner'

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession()

  if (!session) {
    redirect('/')
  }

  return (
    <UserProvider user={session}>
      <div className="min-h-screen flex flex-col">
        <EmergencyBanner />
        {children}
      </div>
    </UserProvider>
  )
}
