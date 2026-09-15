

function SanctuaryCardSkeleton() {
  return (
    <div className="border-b border-gray-200 bg-white px-3 pb-2 pt-[max(0.5rem,env(safe-area-inset-top))]">
      <div className="flex items-center justify-between animate-pulse">
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-full bg-gray-200" />

          <div className="space-y-2">
            <div className="h-4 w-24 rounded bg-gray-200" />
            <div className="h-3 w-16 rounded bg-gray-200" />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="h-7 w-16 rounded-full bg-gray-200" />
          <div className="h-9 w-9 rounded-full bg-gray-200" />
        </div>
      </div>

      <div className="mt-3 flex items-center gap-3">
        <div className="h-7 w-16 rounded-full bg-gray-200" />
        <div className="h-2 flex-1 rounded-full bg-gray-200" />
        <div className="h-4 w-20 rounded bg-gray-200" />
      </div>
    </div>
  );
}

export default SanctuaryCardSkeleton;