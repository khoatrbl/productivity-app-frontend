function UnlocksSkeleton() {
  return (
    <div className="w-full rounded-2xl border border-amber-200 bg-white/60 p-3" aria-hidden>
      <div className="h-3 w-28 animate-pulse rounded-full bg-amber-100" />
      <div className="mt-3 space-y-2">
        {[70, 55, 62].map((width, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="h-7 w-7 animate-pulse rounded-lg bg-amber-100" />
            <div className="h-3 animate-pulse rounded-full bg-amber-100" style={{ width: `${width}%` }} />
          </div>
        ))}
      </div>
      <div className="mt-3 h-8 w-full animate-pulse rounded-full bg-amber-100" />
    </div>
  );
}

export default UnlocksSkeleton;