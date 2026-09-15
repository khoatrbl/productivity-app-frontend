function CollapsedTaskCardSkeleton() {
  return (
    <div className="flex w-full items-center gap-3 rounded-3xl border border-gray-100 bg-white px-4 py-3.5 shadow-sm animate-pulse">
      {/* Checkbox */}
      <div className="h-5 w-5 shrink-0 rounded-full bg-gray-200" />

      <div className="min-w-0 flex-1">
        {/* Title */}
        <div className="h-4 w-3/5 rounded-full bg-gray-200" />

        {/* Metadata */}
        <div className="mt-2 flex items-center gap-2">
          {/* Estimate */}
          <div className="h-3 w-7 rounded-full bg-gray-100" />

          {/* Due date */}
          <div className="h-3 w-20 rounded-full bg-gray-100" />

          {/* Steps */}
          <div className="h-5 w-16 rounded-full bg-emerald-50" />
        </div>
      </div>

      {/* Chevron */}
      <div className="h-4 w-4 shrink-0 rounded bg-gray-100" />
    </div>
  );
}

export default CollapsedTaskCardSkeleton;