'use client'

import { removePhoto } from './actions'
import type { Photo } from '@/types/db'

export function PhotoGrid({ photos }: { photos: Photo[] }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {photos.map((photo) => (
        <div key={photo.id} className="relative group rounded-xl overflow-hidden border border-gray-200 bg-gray-100 aspect-square">
          {photo.storageUrl ? (
            <img src={photo.storageUrl} alt={photo.caption ?? 'Rusty'} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">No preview</div>
          )}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex flex-col justify-end p-2 opacity-0 group-hover:opacity-100">
            {photo.caption && (
              <p className="text-white text-xs font-medium line-clamp-2">{photo.caption}</p>
            )}
            <div className="flex items-center justify-between mt-1">
              {photo.isPublic && (
                <span className="text-xs bg-white/20 text-white rounded px-1.5 py-0.5">Public</span>
              )}
              <button
                onClick={async () => {
                  if (!confirm('Delete this photo?')) return
                  await removePhoto(photo.id, photo.storageRef)
                }}
                className="text-xs text-red-300 hover:text-red-100 ml-auto"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
