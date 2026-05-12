'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { requireRole } from '@/lib/auth/authorize'
import { addPhoto, updatePhoto, deletePhoto } from '@/lib/db/photos'
import { deleteStorageFile } from '@/lib/storage'

export async function savePhoto(formData: FormData) {
  await requireRole(['owner', 'family'])

  await addPhoto({
    storageRef: formData.get('storageRef') as string,
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

export async function removePhoto(id: string, storageRef: string) {
  await requireRole(['owner', 'family'])

  await deletePhoto(id)
  if (storageRef) await deleteStorageFile(storageRef).catch(() => {})

  revalidatePath('/photos')
}
