import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth/session'
import { UserProvider } from '@/components/user-provider'
import { EmergencyBanner } from '@/components/emergency-banner'
import { Nav } from '@/components/nav'

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession()

  if (!session) {
    redirect('/')
  }

  return (
    <UserProvider user={session}>
      <div className="min-h-[100dvh] flex flex-col">
        <EmergencyBanner />
        <div className="flex flex-1 overflow-hidden">
          <Nav />
          <main className="flex-1 overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
    </UserProvider>
  )
}
