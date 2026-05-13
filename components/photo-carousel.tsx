'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'

interface CarouselSlide {
  src: string
  alt: string
}

interface PhotoCarouselProps {
  slides: CarouselSlide[]
}

function PlaceholderSlide({ index }: { index: number }) {
  const emojis = ['🐕', '🦴', '🐾', '🌳', '🎾']
  const labels = ['Nap time', 'Treat time', 'Adventure', 'Park day', 'Fetch!']
  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-brand-100 to-brand-200 select-none">
      <span className="text-6xl mb-3">{emojis[index % emojis.length]}</span>
      <span className="text-brand-700 font-medium text-sm">{labels[index % labels.length]}</span>
      <span className="text-brand-500 text-xs mt-1">Photo coming soon</span>
    </div>
  )
}

export function PhotoCarousel({ slides }: PhotoCarouselProps) {
  const [current, setCurrent] = useState(0)
  const count = slides.length || 5

  const next = useCallback(() => setCurrent((c) => (c + 1) % count), [count])
  const prev = () => setCurrent((c) => (c - 1 + count) % count)

  useEffect(() => {
    const id = setInterval(next, 4000)
    return () => clearInterval(id)
  }, [next])

  return (
    <div className="w-full">
      <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden shadow-md bg-brand-100">
        {slides.length > 0 ? (
          slides.map((slide, i) => (
            <div
              key={slide.src}
              className={`absolute inset-0 transition-opacity duration-700 ${i === current ? 'opacity-100' : 'opacity-0'}`}
            >
              <Image
                src={slide.src}
                alt={slide.alt}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 600px"
                priority={i === 0}
              />
            </div>
          ))
        ) : (
          Array.from({ length: count }).map((_, i) => (
            <div
              key={i}
              className={`absolute inset-0 transition-opacity duration-700 ${i === current ? 'opacity-100' : 'opacity-0'}`}
            >
              <PlaceholderSlide index={i} />
            </div>
          ))
        )}

        <button
          onClick={prev}
          aria-label="Previous photo"
          className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/70 hover:bg-white flex items-center justify-center text-gray-700 shadow transition-colors"
        >
          ‹
        </button>
        <button
          onClick={next}
          aria-label="Next photo"
          className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/70 hover:bg-white flex items-center justify-center text-gray-700 shadow transition-colors"
        >
          ›
        </button>
      </div>

      <div className="flex justify-center gap-2 mt-3">
        {Array.from({ length: count }).map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            aria-label={`Go to photo ${i + 1}`}
            className={`w-2 h-2 rounded-full transition-colors ${i === current ? 'bg-brand-600' : 'bg-brand-200'}`}
          />
        ))}
      </div>
    </div>
  )
}
