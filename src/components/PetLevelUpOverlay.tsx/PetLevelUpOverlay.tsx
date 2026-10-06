import { useMemo } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import { Citrus, Cookie, Heart, Leaf, Sparkles, type LucideIcon } from "lucide-react";
import MockCapybara from "../MockCapybara/MockCapybara";
import type { PetFortuneDto } from "../../types/PetFortuneDto";

interface PetLevelUpOverlayProps {
  petName: string;
  fromLevel: number;
  toLevel: number;
  fortune: PetFortuneDto | null;
  onDismiss: () => void;
}

interface FloatPiece {
  id: number;
  Icon: LucideIcon;
  color: string;
  left: number;
  delay: number;
  rotate: number;
}

const FLOAT_ICONS: { Icon: LucideIcon; color: string }[] = [
  { Icon: Leaf, color: "text-emerald-500" },
  { Icon: Heart, color: "text-rose-400" },
  { Icon: Sparkles, color: "text-amber-400" },
  { Icon: Leaf, color: "text-emerald-400" },
  { Icon: Heart, color: "text-amber-400" },
  { Icon: Sparkles, color: "text-emerald-400" },
  { Icon: Leaf, color: "text-emerald-500" },
  { Icon: Heart, color: "text-rose-300" },
];

function generateFloats(): FloatPiece[] {
  return FLOAT_ICONS.map(({ Icon, color }, i) => ({
    id: i,
    Icon,
    color,
    left: 20 + Math.random() * 140,
    delay: 0.5 + i * 0.12,
    rotate: (Math.random() - 0.5) * 60,
  }));
}

// Shared timeline (seconds), matching the approved preview
const T = {
  pet: 0.4,
  oldLevel: 0.7,
  arrow: 0.85,
  newLevel: 1.0,
  bubble: 1.35,
  gift: 1.75,
  button: 2.1,
};

export function PetLevelUpOverlay({ petName, fromLevel, toLevel, fortune, onDismiss }: PetLevelUpOverlayProps) {
  // Rolled once per mount; the parent remounts with a new key per level-up
  const floats = useMemo(generateFloats, []);
  const levelsGained = toLevel - fromLevel;

  return createPortal(
    <div onClick={onDismiss} className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="absolute inset-0 bg-emerald-900/35 backdrop-blur-sm"
      />

      <motion.div
        role="dialog"
        aria-label={`${petName} grew to level ${toLevel}`}
        onClick={(e) => e.stopPropagation()}
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 18 }}
        className="relative flex w-[304px] flex-col items-center rounded-[28px] border border-emerald-100 bg-gradient-to-b from-emerald-50 via-[#fffaf3] to-[#fffaf3] px-5 pb-4 pt-6 text-center"
      >
        <span className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-emerald-600">
          ✦ Growth spurt ✦
        </span>

        {/* Stage: glow, ring, pet, rising leaves and hearts */}
        <div className="relative mt-1 flex h-[140px] w-[180px] items-end justify-center">
          <motion.div
            className="absolute h-[150px] w-[150px] rounded-full"
            style={{
              left: "50%",
              top: "52%",
              x: "-50%",
              y: "-50%",
              background: "radial-gradient(circle, rgba(52,211,153,.45) 0%, rgba(52,211,153,0) 70%)",
            }}
            initial={{ opacity: 0, scale: 0.4 }}
            animate={{ opacity: [0, 1, 0.7], scale: [0.4, 1, 1.25] }}
            transition={{ duration: 1.6, delay: 0.35, times: [0, 0.4, 1], ease: "easeOut" }}
          />
          <motion.div
            className="absolute h-[120px] w-[120px] rounded-full border-[3px] border-emerald-500/55"
            style={{ left: "50%", top: "52%", x: "-50%", y: "-50%" }}
            initial={{ opacity: 0, scale: 0.3 }}
            animate={{ opacity: [0.9, 0], scale: [0.3, 1.6] }}
            transition={{ duration: 1, delay: 0.55, ease: "easeOut" }}
          />

          <motion.div
            className="absolute bottom-0.5 h-2 w-[90px] rounded-full bg-black/20"
            animate={{ scaleX: [1, 0.6, 1.15], opacity: [1, 0.5, 1] }}
            transition={{ duration: 1.4, delay: T.pet, times: [0, 0.35, 1], ease: "easeInOut" }}
          />

          <motion.div
            style={{ originY: 1 }}
            animate={{
              scaleX: [1, 1.08, 0.95, 1.05, 1.12, 1.15],
              scaleY: [1, 0.88, 1.12, 0.95, 1.12, 1.15],
              y: [0, 0, -14, 0, 0, 0],
            }}
            transition={{ duration: 1.4, delay: T.pet, times: [0, 0.15, 0.35, 0.55, 0.75, 1], ease: "easeInOut" }}
            className="relative"
          >
            <MockCapybara mood="happy" width={140} />
          </motion.div>

          {floats.map(({ id, Icon, color, left, delay, rotate }) => (
            <motion.span
              key={id}
              className={`pointer-events-none absolute bottom-[30px] ${color}`}
              style={{ left }}
              initial={{ opacity: 0, y: 0, scale: 0.6 }}
              animate={{ opacity: [0, 1, 0], y: -120, scale: 1.1, rotate }}
              transition={{ duration: 2, delay, times: [0, 0.2, 1], ease: "easeOut" }}
            >
              <Icon className="h-4 w-4 fill-current" />
            </motion.span>
          ))}
        </div>

        {/* Level change: old -> new */}
        <div className="mt-2 flex items-center gap-2.5">
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: T.oldLevel, duration: 0.3 }}
            className="text-sm font-bold text-gray-400 line-through"
          >
            Lv. {fromLevel}
          </motion.span>
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: T.arrow, duration: 0.3 }}
            className="font-extrabold text-emerald-600"
          >
            →
          </motion.span>
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: T.newLevel, type: "spring", stiffness: 400, damping: 12 }}
            className="rounded-full bg-emerald-700 px-3 py-1 text-[15px] font-extrabold text-white"
          >
            Lv. {toLevel}
          </motion.span>
        </div>

        {levelsGained > 1 && (
          <p className="mt-1.5 text-[11px] font-bold text-emerald-600">+{levelsGained} levels at once!</p>
        )}

        <h2 className="mt-2 text-[21px] font-bold leading-tight text-emerald-900">
          {petName} grew to Lv. {toLevel}!
        </h2>

        {/* The pet's little fortune */}
        {fortune && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: T.bubble, type: "spring", stiffness: 300, damping: 16 }}
            className="relative mt-4 w-full rounded-[20px] border-2 border-amber-200 bg-white px-3.5 pb-3 pt-3.5"
          >
            {/* speech bubble tail */}
            <span className="absolute -top-[11px] left-1/2 h-[18px] w-[18px] -translate-x-1/2 rotate-45 rounded-tl border-l-2 border-t-2 border-amber-200 bg-white" />

            <p className="relative text-[13px] font-semibold leading-snug text-amber-900">
              <span className="text-emerald-700">{petName}</span> brought you a little fortune:
            </p>

            <motion.div
              initial={{ opacity: 0, scale: 0.4, rotate: -8 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ delay: T.gift, type: "spring", stiffness: 420, damping: 11 }}
              className="mt-2.5 flex items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-br from-orange-50 to-amber-100 px-3 py-2.5"
            >
              <motion.div
                animate={{ rotate: [0, -10, 10, 0, -10, 10, 0] }}
                transition={{ delay: T.gift + 0.65, duration: 1.2, ease: "easeInOut" }}
                className="flex shrink-0"
              >
                {fortune.type === "COINS" ? (
                  <Citrus className="h-7 w-7 text-[#F48C42]" />
                ) : (
                  <>
                    <Cookie className="h-7 w-7 text-amber-500" />
                    <Cookie className="-ml-2.5 h-7 w-7 text-amber-600" />
                  </>
                )}
              </motion.div>

              <p className="whitespace-nowrap text-lg leading-none text-orange-800">
                <span className="font-extrabold text-orange-700">
                  {fortune.type === "COINS" ? `+${fortune.amount}` : `×${fortune.amount}`}
                </span>{" "}
                <span className="font-bold">
                  {fortune.type === "COINS" ? "Citrus" : fortune.treat?.treatName ?? "Basic Treat"}
                </span>
              </p>
            </motion.div>
          </motion.div>
        )}

        <motion.button
          onClick={onDismiss}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: fortune ? T.button : T.bubble, duration: 0.4 }}
          className="mt-4 w-full rounded-full bg-[#FFB780] py-3 text-[15px] font-bold text-[#7C3F1D] transition-colors hover:bg-[#FFAB6B] active:translate-y-px"
        >
          Yay!
        </motion.button>
        <span className="mt-2.5 text-[11px] text-gray-400">Tap anywhere to continue</span>
      </motion.div>
    </div>,
    document.body
  );
}