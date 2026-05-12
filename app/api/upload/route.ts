import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'
import { uploadFile } from '@/lib/storage'

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'application/pdf']
const MAX_SIZE_BYTES = 20 * 1024 * 1024 // 20 MB

// Strict allowlist: only single filename segment (no slashes) after the known prefix
const VALID_PATH = /^dogs\/rusty\/(photos|medications|medical)\/[^/]+$/

// Roles allowed to write to each sub-path
const PATH_ROLES: Record<string, string[]> = {
  'dogs/rusty/photos/':      ['owner', 'family'],
  'dogs/rusty/medications/': ['owner', 'vet'],
  'dogs/rusty/medical/':     ['owner', 'vet'],
}

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

  // Reject traversal attempts and paths outside the known sub-directories
  if (!VALID_PATH.test(path)) {
    return NextResponse.json({ error: 'invalid_path' }, { status: 400 })
  }

  // Enforce role-based write access per storage sub-path
  const allowedPrefix = Object.keys(PATH_ROLES).find((p) => path.startsWith(p))
  if (!allowedPrefix || !PATH_ROLES[allowedPrefix].includes(session.role)) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 })
  }

  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)
  const storagePath = await uploadFile(path, buffer, file.type)

  return NextResponse.json({ path: storagePath })
}
