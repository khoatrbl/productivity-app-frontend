// QuoteCard.tsx
import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, ChevronDown } from "lucide-react";

const TRUNCATE_THRESHOLD = 55;

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

// Fixed, full-screen — only rendered during the intro
export function QuoteIntroOverlay({ quote }: { quote: string }) {
  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-40 bg-black/30 backdrop-blur-md"
      />
      <motion.div
        layoutId="daily-quote-card"
        className="fixed left-1/2 top-1/2 z-50 flex h-1/3 w-[85%] max-w-md -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center gap-3 rounded-3xl border border-orange-200 bg-orange-50 px-6 text-center shadow-xl"
      >
        <QuoteContent quote={quote} mode="intro" />
      </motion.div>
    </>
  );
}

// Normal in-flow element — takes up real space in the layout
export function QuoteCardInline({ quote }: { quote: string }) {
  return (
    <motion.div
      layoutId="daily-quote-card"
      className="mb-4 flex w-full items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-4 py-2 shadow-sm"
    >
      <QuoteContent quote={quote} mode="card" />
    </motion.div>
  );
}