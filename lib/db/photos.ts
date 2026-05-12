import 'server-only'
import { FieldValue } from 'firebase-admin/firestore'
import { dogRef, toISO } from './index'
import { getSignedUrl } from '@/lib/storage'
import type { Photo } from '@/types/db'

export async function getPhotos(publicOnly = false): Promise<Photo[]> {
  let query = dogRef().collection('photos').orderBy('addedAt', 'desc') as FirebaseFirestore.Query
  if (publicOnly) query = query.where('isPublic', '==', true)
  const snap = await query.get()
  return Promise.all(
    snap.docs.map(async (doc) => {
      const d = doc.data()
      return {
        id: doc.id,
        storageRef: d.storageRef ?? '',
        storageUrl: d.storageRef ? await getSignedUrl(d.storageRef).catch((err) => { console.error('signed URL failed for photo:', err); return undefined; }) : undefined,
        caption: d.caption,
        isPublic: d.isPublic ?? false,
        source: d.source ?? 'manual',
        addedAt: toISO(d.addedAt),
      } satisfies Photo
    }),
  )
}

export async function addPhoto(data: Omit<Photo, 'id' | 'addedAt' | 'storageUrl'>): Promise<string> {
  const ref = await dogRef().collection('photos').add({
    ...data,
    addedAt: FieldValue.serverTimestamp(),
  })
  return ref.id
}

export async function updatePhoto(
  id: string,
  data: Partial<Pick<Photo, 'caption' | 'isPublic'>>,
): Promise<void> {
  await dogRef().collection('photos').doc(id).update(data)
}

export async function getPhoto(id: string): Promise<Photo | null> {
  const doc = await dogRef().collection('photos').doc(id).get()
  if (!doc.exists) return null
  const d = doc.data()!
  return {
    id: doc.id,
    storageRef: d.storageRef ?? '',
    storageUrl: undefined,
    caption: d.caption,
    isPublic: d.isPublic ?? false,
    source: d.source ?? 'manual',
    addedAt: toISO(d.addedAt),
  }
}

export async function deletePhoto(id: string): Promise<void> {
  await dogRef().collection('photos').doc(id).delete()
}
