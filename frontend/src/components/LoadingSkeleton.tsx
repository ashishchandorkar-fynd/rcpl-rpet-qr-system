export default function LoadingSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      {/* Header skeleton */}
      <div className="bg-blue-800 p-4 rounded-t-xl">
        <div className="h-4 bg-blue-600 rounded w-1/3 mb-2" />
        <div className="h-6 bg-blue-600 rounded w-2/3" />
      </div>
      {/* Cards skeleton */}
      {[1, 2, 3].map(i => (
        <div key={i} className="bg-white rounded-xl p-4 shadow-sm">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-3" />
          {[1, 2, 3].map(j => (
            <div key={j} className="flex gap-2 mb-2">
              <div className="h-3 bg-gray-100 rounded w-1/4" />
              <div className="h-3 bg-gray-200 rounded w-2/4" />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
