import { AnimatePresence, motion, useAnimationControls } from "framer-motion";
import { Heart } from "lucide-react";
import { useState } from "react";
import type { PetResult } from "../../hooks/usePetCare";
import MockCapybara from "../MockCapybara/MockCapybara";

interface PetStageProps {
  petName: string;
  canPet: boolean;
  petsLeft: number;
  cooldownMsLeft: number;
  isAffectionMaxed: boolean;
  onPet: () => Promise<PetResult>;
}

function formatCooldown(ms: number) {
  const total = Math.ceil(ms / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

// PLACEHOLDER: swap <MockCapybara /> for the real pet animation later.
function PetStage({ petName, canPet, petsLeft, cooldownMsLeft, isAffectionMaxed, onPet }: PetStageProps) {
  const controls = useAnimationControls();
  const [hearts, setHearts] = useState<{ id: string; x: number; amount: number }[]>([]);

  async function handleTap() {
    // Squish right away so the tap feels instant
    controls.start({ scaleY: [1, 0.9, 1.05, 1], scaleX: [1, 1.08, 0.97, 1], transition: { duration: 0.4 } });

    const result = await onPet();
    if (!result.ok) {
      if (result.reason !== "busy") {
        controls.start({ x: [0, -4, 4, -2, 0], transition: { duration: 0.3 } });
      }
      return;
    }

    const id = crypto.randomUUID();
    setHearts((h) => [...h, { id, x: Math.random() * 60 - 30, amount: result.gained }]);
    setTimeout(() => setHearts((h) => h.filter((x) => x.id !== id)), 900);
  }

  let status: string;
  if (isAffectionMaxed) status = `${petName} feels completely loved`;
  else if (cooldownMsLeft > 0) status = `${petName} is napping · ${formatCooldown(cooldownMsLeft)}`;
  else status = `Tap to pet · ${petsLeft} left`;

  return (
    <div className="relative h-56 overflow-hidden rounded-3xl bg-gradient-to-b from-amber-100 via-orange-50 to-emerald-100">
      <span className="absolute left-3 top-3 z-10 rounded-full bg-white/80 px-2.5 py-1 text-xs font-medium text-gray-600 backdrop-blur">
        {status}
      </span>

      {/* hot-spring water */}
      <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-b from-sky-200/70 to-sky-300/70" />

      <button
        type="button"
        onClick={handleTap}
        aria-label={`Pet ${petName}`}
        className={`absolute bottom-6 left-1/2 -translate-x-1/2 ${canPet ? "cursor-pointer" : "cursor-default"}`}
        onPointerDownCapture={(e) => e.stopPropagation()} // don't trigger the page swipe
      >
        <motion.div animate={controls} style={{ originY: 1 }}>
          <MockCapybara mood={cooldownMsLeft > 0 ? "sleepy" : "awake"} />
        </motion.div>

        <AnimatePresence>
          {hearts.map((h) => (
            <motion.span
              key={h.id}
              initial={{ opacity: 0, y: 0, x: h.x, scale: 0.6 }}
              animate={{ opacity: 1, y: -70, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8 }}
              className="pointer-events-none absolute left-1/2 top-0 flex items-center gap-0.5 text-sm font-semibold text-rose-500"
            >
              <Heart className="h-4 w-4 fill-rose-400 text-rose-400" />+{h.amount}
            </motion.span>
          ))}
        </AnimatePresence>
      </button>
    </div>
  );
}

export default PetStage;