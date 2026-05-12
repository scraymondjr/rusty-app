import 'server-only'
import { getAdminStorage } from '@/lib/firebase/admin'

export async function uploadFile(
  storagePath: string,
  buffer: Buffer,
  contentType: string,
): Promise<string> {
  const bucket = getAdminStorage().bucket()
  const file = bucket.file(storagePath)
  await file.save(buffer, { contentType, resumable: false })
  return storagePath
}

export async function getSignedUrl(storagePath: string): Promise<string> {
  const bucket = getAdminStorage().bucket()
  const file = bucket.file(storagePath)
  const [url] = await file.getSignedUrl({
    action: 'read',
    expires: Date.now() + 60 * 60 * 1000, // 1 hour
  })
  return url
}

export async function deleteStorageFile(storagePath: string): Promise<void> {
  const bucket = getAdminStorage().bucket()
  await bucket.file(storagePath).delete({ ignoreNotFound: true })
}
