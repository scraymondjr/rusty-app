export default function AuthLoading() {
  return (
    <div className="flex-1 max-w-5xl mx-auto w-full px-4 py-6 pb-24 md:pb-8 animate-pulse">
      <div className="h-8 w-48 bg-gray-200 rounded-lg mb-2" />
      <div className="h-4 w-32 bg-gray-100 rounded mb-8" />
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-10">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-gray-100 rounded-xl h-24" />
        ))}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-gray-100 rounded-xl h-20" />
        ))}
      </div>
    </div>
  )
}
