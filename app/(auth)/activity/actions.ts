'use server'

import { revalidatePath } from 'next/cache'
import { requireRole } from '@/lib/auth/authorize'
import { addActivityEntry } from '@/lib/db/activity'

const VALID_TYPES = ['note', 'feeding', 'walk', 'medication', 'grooming', 'incident'] as const

export async function logActivity(formData: FormData) {
  const session = await requireRole(['owner', 'family', 'vet', 'sitter'])

  const content = (formData.get('content') as string)?.trim()
  if (!content) throw new Error('Content is required')

  const type = formData.get('type') as string
  const validType = VALID_TYPES.includes(type as typeof VALID_TYPES[number]) ? type : 'note'

  await addActivityEntry({
    authorEmail: session.email,
    authorName:  session.name,
    type:        validType,
    content,
  })

  revalidatePath('/activity')
}
