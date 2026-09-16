import { useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import dancingCapybara from "../../assets/capybara-dancing.gif"

interface LevelUpOverlayProps {
  level: number;
  duration?: number;
  onDismiss: () => void;
}

interface ConfettiPiece {
  id: number;
  x: number;
  y: number;
  rotate: number;
  color: string;
  shape: "circle" | "rect";
  delay: number;
  duration: number;
}

const CONFETTI_COLORS = ["#f59e0b", "#fb923c", "#34d399", "#38bdf8", "#f472b6", "#facc15"];

function generateConfetti(count: number): ConfettiPiece[] {
  return Array.from({ length: count }, (_, i) => {
    const angle = Math.random() * Math.PI * 2;
    const distance = 90 + Math.random() * 110;
    return {
      id: i,
      x: Math.cos(angle) * distance,
      y: Math.sin(angle) * distance - 30, // slight upward bias before they fall
      rotate: (Math.random() - 0.5) * 360,
      color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
      shape: Math.random() > 0.5 ? "circle" : "rect",
      delay: Math.random() * 0.2,
      duration: 1.1 + Math.random() * 0.7,
    };
  });
}

export function LevelUpOverlay({ level, duration = 4000, onDismiss }: LevelUpOverlayProps) {
  // Generated once per mount — SanctuaryCard mounts a fresh instance per
  // event via `key={activeLevelUp.id}`, so this doesn't need to re-roll on rerender.
  const confetti = useMemo(() => generateConfetti(36), []);

  useEffect(() => {
    const timer = setTimeout(onDismiss, duration);
    return () => clearTimeout(timer);
  }, [duration, onDismiss]);

  return createPortal(
    <div onClick={onDismiss} className="fixed inset-0 z-50 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
      />

      <motion.div
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 18 }}
        className="relative flex flex-col items-center gap-1 rounded-3xl border border-amber-200 bg-gradient-to-b from-amber-50 to-orange-50 px-10 py-9 shadow-xl"
      >
        {/* Confetti burst — sits behind the capybara, exploding outward from center */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-visible">
          {confetti.map((piece) => (
            <motion.span
              key={piece.id}
              initial={{ x: 0, y: 0, opacity: 0, rotate: 0, scale: 0 }}
              animate={{
                x: piece.x,
                y: piece.y + 130, // gravity — keeps falling past its outward burst point
                opacity: [0, 1, 1, 0],
                rotate: piece.rotate,
                scale: 1,
              }}
              transition={{ duration: piece.duration, delay: piece.delay, ease: "easeOut" }}
              style={{
                backgroundColor: piece.color,
                width: piece.shape === "circle" ? 7 : 5,
                height: piece.shape === "circle" ? 7 : 10,
                borderRadius: piece.shape === "circle" ? "9999px" : "1px",
              }}
              className="absolute"
            />
          ))}
        </div>

        <p className="relative text-lg font-semibold uppercase tracking-wide text-orange-500">
          Level Up!
        </p>

        {/* Capybara + its shadow — shadow compresses as the capybara gets airborne */}
        <div className="relative mt-2 flex h-28 flex-col items-center justify-end">
          <motion.div
            animate={{
              scaleX: [1, 1.08, 0.96, 0.96, 1.03, 0.97, 1],
              scaleY: [1, 0.9, 1.06, 1.06, 0.95, 1.04, 1],
            }}
            transition={{
              duration: 1.3,
              delay: 0.35,
              times: [0, 0.1, 0.32, 0.55, 0.75, 0.9, 1],
              ease: "easeInOut",
            }}
            className="text-7xl"
          >
            <img src={dancingCapybara} alt="dancing capybara" className="w-35 h-auto"/>
          </motion.div>
          <motion.div
            animate={{ scaleX: [1, 0.7, 0.35, 0.35, 0.75, 0.95, 1], opacity: [0.25, 0.18, 0.08, 0.08, 0.16, 0.22, 0.25] }}
            transition={{
              duration: 1.3,
              delay: 0.35,
              times: [0, 0.1, 0.32, 0.55, 0.75, 0.9, 1],
              ease: "easeInOut",
            }}
            className="mt-1 h-2 w-14 rounded-full bg-black"
          />
        </div>

        <p className="relative mt-2 text-2xl font-bold text-emerald-900">You have reached Lv.{level}!</p>
        <p className="relative text-xs text-gray-400">Tap anywhere to continue</p>
      </motion.div>
    </div>,
    document.body
  );
}