'use client'

export function EmergencyBanner() {
  return (
    <div className="bg-red-600 text-white px-4 py-2 text-sm font-medium text-center">
      Emergency vet:{' '}
      <a
        href="tel:+15555550100"
        className="underline font-bold tracking-wide hover:text-red-100 transition-colors"
      >
        (555) 555-0100
      </a>
      {' '}· BluePearl Pet Hospital — open 24 hrs
    </div>
  )
}
