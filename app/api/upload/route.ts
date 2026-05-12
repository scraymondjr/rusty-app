import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'
import { uploadFile } from '@/lib/storage'

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'application/pdf']
const MAX_SIZE_BYTES = 20 * 1024 * 1024 // 20 MB

export async function POST(request: NextRequest) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const formData = await request.formData()
  const file = formData.get('file') as File | null
  const path = formData.get('path') as string | null

  if (!file || !path) {
    return NextResponse.json({ error: 'missing_file_or_path' }, { status: 400 })
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({ error: 'invalid_file_type' }, { status: 400 })
  }

  if (file.size > MAX_SIZE_BYTES) {
    return NextResponse.json({ error: 'file_too_large' }, { status: 400 })
  }

  // Prevent path traversal and writes to unrecognized dogs
  if (path.includes('..') || !path.startsWith('dogs/rusty/')) {
    return NextResponse.json({ error: 'invalid_path' }, { status: 400 })
  }

  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)
  const storagePath = await uploadFile(path, buffer, file.type)

  return NextResponse.json({ path: storagePath })
}
