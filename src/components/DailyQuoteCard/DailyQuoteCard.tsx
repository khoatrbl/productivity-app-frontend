// QuoteCard.tsx
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, ChevronDown, ArrowRight } from "lucide-react";
import { createPortal } from "react-dom";

const TRUNCATE_THRESHOLD = 45;

function QuoteContent({ quote, mode }: { quote: string; mode: "intro" | "card" }) {
  const [expanded, setExpanded] = useState(false);
  const isLong = quote.length > TRUNCATE_THRESHOLD;

  if (mode === "intro") {
    return (
      <>
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-orange-100 text-orange-500">
          <Sparkles className="h-5 w-5" />
        </div>
        <p className="text-sm font-semibold text-orange-500">Daily Pulse</p>
        <p className="text-lg font-medium leading-snug text-gray-800">"{quote}"</p>
      </>
    );
  }

  return (
    <>
      <Sparkles className="h-4 w-4 shrink-0 text-orange-500" />
      <p className="shrink-0 text-xs font-semibold text-orange-500">Daily Pulse:</p>
      <p className={`flex-1 text-sm text-gray-700 ${expanded ? "" : "truncate"}`}>"{quote}"</p>
      {isLong && (
        <button
          onClick={() => setExpanded((e) => !e)}
          className="shrink-0 rounded-full p-1 text-gray-400 hover:bg-orange-100 hover:text-gray-600"
          aria-label={expanded ? "Collapse quote" : "Expand quote"}
        >
          <ChevronDown className={`h-4 w-4 transition-transform ${expanded ? "rotate-180" : ""}`} />
        </button>
      )}
    </>
  );
}

interface QuoteIntroOverlayProps {
  quote: string;
  duration?: number; // ms
  onDismiss: () => void;
}

// Fixed, full-screen — only rendered during the intro
export function QuoteIntroOverlay({ quote, duration = 5000, onDismiss }: QuoteIntroOverlayProps) {
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
        className="fixed left-1/2 top-1/2 z-50 flex min-h-[33vh] w-[85%] max-w-md -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center gap-5 rounded-3xl border border-orange-200 bg-orange-50 px-6 py-6 text-center shadow-xl"
      >
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-orange-100 text-orange-500">
          <Sparkles className="h-5 w-5" />
        </div>
        <p className="text-sm font-semibold text-orange-500">Daily Pulse</p>
        <p className="text-lg font-medium leading-snug text-gray-800">"{quote}"</p>
        <p className="text-sm text-gray-800 leading-snug">- Unknown</p>

        {/* Countdown progress bar */}
        <div className="h-1 w-full max-w-[250px] overflow-hidden rounded-full bg-[#8DB498] my-3">
          <motion.div
            className="h-full rounded-full bg-[#41664E]"
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: duration / 1000, ease: "linear" }}
          />
        </div>

        <button
          onClick={onDismiss}
          className="flex justify-center gap-2 rounded-full w-full border border-[#41664E] px-4 py-1.5 text-base font-medium text-[#41664E] transition-colors duration-200 hover:bg-[#41664E] hover:text-white"
        >
          Step into Dashboard 
          <span>
            <ArrowRight/>
          </span>
        </button>
      </motion.div>
    </>,
    document.body
  );
}

// Normal in-flow element — takes up real space in the layout
export function QuoteCardInline({ quote }: { quote: string }) {
  return (
    <motion.div
      layoutId="daily-quote-card"
      className="mb-2 z-10 flex w-full items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-4 py-2 shadow-sm"
      style={{position: "relative", zIndex: 10 }}
    >
      <QuoteContent quote={quote} mode="card" />
    </motion.div>
  );
}