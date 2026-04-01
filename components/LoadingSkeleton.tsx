export default function LoadingSkeleton({ type = 'card', count = 3 }: { type?: 'card' | 'header' | 'league'; count?: number }) {
  if (type === 'header') {
    return (
      <div className="bg-card rounded-xl p-6 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="skeleton w-16 h-16 rounded-full" />
            <div className="space-y-2">
              <div className="skeleton h-6 w-32 rounded" />
              <div className="skeleton h-4 w-20 rounded" />
            </div>
          </div>
          <div className="skeleton h-12 w-24 rounded-lg" />
          <div className="flex items-center gap-4">
            <div className="space-y-2 text-right">
              <div className="skeleton h-6 w-32 rounded" />
              <div className="skeleton h-4 w-20 rounded" />
            </div>
            <div className="skeleton w-16 h-16 rounded-full" />
          </div>
        </div>
      </div>
    );
  }

  if (type === 'league') {
    return (
      <div className="mb-4">
        <div className="flex items-center gap-3 bg-secondary rounded-t-xl px-4 py-3">
          <div className="skeleton w-8 h-8 rounded-full" />
          <div className="skeleton h-5 w-40 rounded" />
          <div className="skeleton h-4 w-16 rounded ml-auto" />
        </div>
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="bg-card border-t border-white/5 px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="skeleton w-8 h-8 rounded-full" />
              <div className="skeleton h-4 w-28 rounded flex-1" />
              <div className="skeleton h-6 w-14 rounded" />
              <div className="skeleton h-4 w-28 rounded flex-1" />
              <div className="skeleton w-8 h-8 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-card rounded-xl px-4 py-3 flex items-center gap-3">
          <div className="skeleton w-10 h-10 rounded-full" />
          <div className="flex-1 space-y-2">
            <div className="skeleton h-4 w-3/4 rounded" />
            <div className="skeleton h-3 w-1/2 rounded" />
          </div>
          <div className="skeleton h-8 w-16 rounded-lg" />
          <div className="flex-1 space-y-2">
            <div className="skeleton h-4 w-3/4 rounded" />
            <div className="skeleton h-3 w-1/2 rounded" />
          </div>
          <div className="skeleton w-10 h-10 rounded-full" />
        </div>
      ))}
    </div>
  );
}
