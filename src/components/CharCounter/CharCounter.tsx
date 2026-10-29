interface CharCounterProps {
  length: number;
  max: number;
  warnAt?: number; // characters remaining when the counter turns amber
  className?: string;
}

function CharCounter({
  length,
  max,
  warnAt = 5,
  className = "",
}: CharCounterProps) {
  const remaining = max - length;
  const color =
    remaining <= 0
      ? "text-red-500"
      : remaining <= warnAt
        ? "text-amber-500"
        : "text-gray-400";

  return (
    <span
      className={`text-[11px] font-medium tabular-nums ${color} ${className}`}
      aria-live="polite"
    >
      {length}/{max}
    </span>
  );
}

export default CharCounter;
