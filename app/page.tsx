import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth/session'
import { SignInButton } from '@/components/sign-in-button'

export default async function HomePage() {
  const session = await getSession()
  if (session) redirect('/dashboard')

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-brand-50 to-white px-4">
      <div className="text-center max-w-sm w-full">
        <div className="w-24 h-24 rounded-full bg-brand-200 mx-auto mb-6 flex items-center justify-center text-5xl">
          🐾
        </div>
        <h1 className="text-4xl font-bold text-brand-800 mb-2">Rusty</h1>
        <p className="text-gray-500 mb-10">Golden Retriever · Care Dashboard</p>
        <SignInButton />
        <p className="mt-6 text-xs text-gray-400">
          Access is by invitation only.
        </p>
      </div>
    </main>
  )
}
