import type { Metadata } from 'next'
import { PageShell } from '@/components/page-shell'

export const dynamic = 'force-dynamic'
import { EmptyState } from '@/components/ui/empty-state'
import { getPhotos } from '@/lib/db/photos'
import { PhotoUpload } from './photo-upload'
import { PhotoGrid } from './photo-grid'

export const metadata: Metadata = { title: 'Photos' }

export default async function PhotosPage() {
  const photos = await getPhotos()

  return (
    <PageShell title="Photos">
      <div className="max-w-3xl space-y-6">
        <PhotoUpload />
        {photos.length === 0 ? (
          <EmptyState icon="📷" title="No photos yet" description="Upload photos of Rusty to build the gallery." />
        ) : (
          <PhotoGrid photos={photos} />
        )}
      </div>
    </PageShell>
  )
}
