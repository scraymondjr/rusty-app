'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { requireRole } from '@/lib/auth/authorize'
import { addPhoto, updatePhoto, deletePhoto, getPhoto } from '@/lib/db/photos'
import { deleteStorageFile } from '@/lib/storage'

export async function savePhoto(formData: FormData) {
  await requireRole(['owner', 'family'])

  const storageRef = formData.get('storageRef') as string
  if (!storageRef?.startsWith('dogs/rusty/photos/')) {
    throw new Error('invalid_storage_ref')
  }

  await addPhoto({
    storageRef,
    caption:    (formData.get('caption') as string) || undefined,
    isPublic:   formData.get('isPublic') === 'true',
    source:     'manual',
  })

  revalidatePath('/photos')
  redirect('/photos')
}

export async function editPhoto(id: string, formData: FormData) {
  await requireRole(['owner', 'family'])

  await updatePhoto(id, {
    caption:  (formData.get('caption') as string) || undefined,
    isPublic: formData.get('isPublic') === 'true',
  })

  revalidatePath('/photos')
}

export async function removePhoto(id: string) {
  await requireRole(['owner', 'family'])

  const photo = await getPhoto(id)
  await deletePhoto(id)
  if (photo?.storageRef) await deleteStorageFile(photo.storageRef).catch((err) => {
    console.error('Failed to delete photo storage file:', err)
  })

  revalidatePath('/photos')
}
