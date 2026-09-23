import { useEffect, useRef } from "react";

interface WheelPickerProps<T> {
  items: T[];
  value: T;
  onChange: (value: T) => void;
  renderItem?: (item: T) => React.ReactNode;
  itemHeight?: number;
  visibleCount?: number;
}

function WheelPicker<T extends string | number>({
  items, value, onChange, renderItem, itemHeight = 40, visibleCount = 5,
}: WheelPickerProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const isUserScrolling = useRef(false);
  const scrollTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const containerHeight = itemHeight * visibleCount;
  const paddingY = (containerHeight - itemHeight) / 2;

  useEffect(() => {
    if (isUserScrolling.current) return;
    const index = items.indexOf(value);
    if (index === -1 || !containerRef.current) return;
    containerRef.current.scrollTo({ top: index * itemHeight, behavior: "auto" });
  }, [value, items, itemHeight]);

  function handleScroll() {
    isUserScrolling.current = true;
    if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
    scrollTimeout.current = setTimeout(() => {
      isUserScrolling.current = false;
      const el = containerRef.current;
      if (!el) return;
      const index = Math.min(Math.max(Math.round(el.scrollTop / itemHeight), 0), items.length - 1);
      el.scrollTo({ top: index * itemHeight, behavior: "smooth" });
      if (items[index] !== value) onChange(items[index]);
    }, 120);
  }

  return (
    <div className="relative" style={{ height: containerHeight }}>
      <div
        className="pointer-events-none absolute left-0 right-0 rounded-xl bg-emerald-50"
        style={{ top: paddingY, height: itemHeight }}
      />
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="relative h-full snap-y snap-mandatory overflow-y-scroll [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        style={{ paddingTop: paddingY, paddingBottom: paddingY }}
      >
        {items.map((item) => (
          <div
            key={item}
            className={`flex snap-center items-center justify-center text-base ${
              item === value ? "font-semibold text-gray-900" : "text-gray-400"
            }`}
            style={{ height: itemHeight }}
          >
            {renderItem ? renderItem(item) : item}
          </div>
        ))}
      </div>
    </div>
  );
}

export default WheelPicker;