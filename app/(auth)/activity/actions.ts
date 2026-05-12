'use server'

import { revalidatePath } from 'next/cache'
import { getSession } from '@/lib/auth/session'
import { addActivityEntry } from '@/lib/db/activity'

export async function logActivity(formData: FormData) {
  const session = await getSession()
  if (!session) throw new Error('Unauthorized')

  const content = (formData.get('content') as string)?.trim()
  if (!content) throw new Error('Content is required')

  await addActivityEntry({
    authorEmail: session.email,
    type:        (formData.get('type') as string) || 'note',
    content,
  })

  revalidatePath('/activity')
}
