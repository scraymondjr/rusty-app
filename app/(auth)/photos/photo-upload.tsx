'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { savePhoto } from './actions'

const inputClass = 'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent'

export function PhotoUpload() {
  const router = useRouter()
  const formRef = useRef<HTMLFormElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null
    setFile(f)
    if (f) setPreview(URL.createObjectURL(f))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) return
    setUploading(true)
    setError(null)
    try {
      const uploadData = new FormData()
      uploadData.append('file', file)
      uploadData.append('path', `dogs/rusty/photos/${Date.now()}_${file.name}`)
      const res = await fetch('/api/upload', { method: 'POST', body: uploadData })
      if (!res.ok) throw new Error('Upload failed')
      const { path } = await res.json()

      const formData = new FormData(formRef.current!)
      formData.set('storageRef', path)
      await savePhoto(formData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
      setUploading(false)
    }
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit}
      className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
      <h2 className="text-sm font-semibold text-gray-700">Upload Photo</h2>
      <div className="flex gap-4 items-start">
        <div className="flex-1 space-y-3">
          <input type="file" accept="image/*" onChange={handleFileChange} required
            className="block w-full text-sm text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100" />
          <input name="caption" type="text" placeholder="Caption (optional)" className={inputClass} />
          <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
            <input name="isPublic" type="checkbox" value="true"
              className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500" />
            Show on public page
          </label>
        </div>
        {preview && (
          <img src={preview} alt="Preview" className="w-24 h-24 object-cover rounded-lg border border-gray-200 shrink-0" />
        )}
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button type="submit" disabled={!file || uploading}
        className="bg-brand-600 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-brand-700 disabled:opacity-60 transition-colors">
        {uploading ? 'Uploading…' : 'Upload Photo'}
      </button>
    </form>
  )
}
