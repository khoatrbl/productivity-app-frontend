import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Sprout } from "lucide-react";
import type { DailyQuoteData } from "../../types/DailyQuoteData";

function QuoteIcon() {
  return (
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-orange-100 text-orange-500">
      <Sprout className="h-4 w-4" />
    </div>
  );
}

// ---------- Full-screen intro ----------

interface QuoteIntroOverlayProps {
  data: DailyQuoteData;
  duration?: number;
  onDismiss: () => void;
}

export function QuoteIntroOverlay({ data, duration = 5000, onDismiss }: QuoteIntroOverlayProps) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, duration);
    return () => clearTimeout(timer);
  }, [duration, onDismiss]);

  return createPortal(
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-40 bg-black/30 backdrop-blur-md"
      />
      <motion.div
        layoutId="daily-quote-card"
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
        className="fixed left-1/2 top-1/2 z-50 flex min-h-[33vh] w-[85%] max-w-md -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center gap-4 rounded-3xl border border-orange-200 bg-orange-50 px-6 py-10 text-center shadow-xl"
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 text-orange-500">
          <Sprout className="h-5 w-5" />
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-orange-500">{data.label}</p>
          <p className="mt-1 text-lg font-bold text-gray-900">{data.title}</p>
        </div>

        <p className="text-base italic leading-snug text-gray-700">"{data.quote}"</p>

        <p className="flex items-center gap-1.5 text-xs font-medium text-gray-500">
          <span className="h-1 w-1 rounded-full bg-gray-400" />
          {data.author}
        </p>

        <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
          +{data.calmXp} Calm XP
        </span>

        <div className="mt-1 h-1 w-full max-w-[180px] overflow-hidden rounded-full bg-orange-200">
          <motion.div
            className="h-full rounded-full bg-orange-400"
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: duration / 1000, ease: "linear" }}
          />
        </div>

        <button
          onClick={onDismiss}
          className="rounded-full border border-orange-400 px-4 py-1.5 text-xs font-medium text-orange-500 transition-colors duration-200 hover:bg-orange-400 hover:text-white"
        >
          Claim Reward!
        </button>
      </motion.div>
    </>,
    document.body
  );
}

// ---------- Collapsible inline card ----------

export function QuoteCardInline({ data }: { data: DailyQuoteData }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div
      layoutId="daily-quote-card"
      style={{ position: "relative", zIndex: 10 }}
      className="w-full rounded-xl border border-gray-100 bg-[#f6f3ec] px-4 py-3"
    >
      <button
        type="button"
        onClick={() => setExpanded((e) => !e)}
        className="flex w-full items-center gap-3 text-left"
      >
        <QuoteIcon />
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-orange-500">{data.label}</p>
          <p className="truncate text-base font-semibold text-gray-900">{data.title}</p>
        </div>
        <motion.span
          animate={{ rotate: expanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="shrink-0 text-gray-400"
        >
          <ChevronDown className="h-4 w-4" />
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="mt-3 border-t border-orange-200 pt-3">
              <p className="text-sm italic leading-snug text-gray-700">"{data.quote}"</p>

              <div className="mt-3 flex items-center justify-between gap-2">
                <p className="flex items-center gap-1.5 text-xs font-medium text-gray-500">
                  <span className="h-1 w-1 rounded-full bg-gray-400" />
                  {data.author}
                </p>
                <span className="shrink-0 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700">
                  +{data.calmXp} Calm XP
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}