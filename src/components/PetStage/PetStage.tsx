import { AnimatePresence, motion, useAnimationControls } from "framer-motion";
import { Heart } from "lucide-react";
import { useState } from "react";
import { AFFECTION_PER_PET } from "../../data/mockSanctuary";

interface PetStageProps {
  petName: string;
  canPet: boolean;
  petsLeft: number;
  cooldownMsLeft: number;
  isAffectionMaxed: boolean;
  onPet: () => boolean;
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
  const [hearts, setHearts] = useState<{ id: string; x: number }[]>([]);

  function handleTap() {
    if (!onPet()) {
      controls.start({ x: [0, -4, 4, -2, 0], transition: { duration: 0.3 } });
      return;
    }
    controls.start({ scaleY: [1, 0.9, 1.05, 1], scaleX: [1, 1.08, 0.97, 1], transition: { duration: 0.4 } });
    const id = crypto.randomUUID();
    setHearts((h) => [...h, { id, x: Math.random() * 60 - 30 }]);
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
          <MockCapybara sleepy={cooldownMsLeft > 0} />
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
              <Heart className="h-4 w-4 fill-rose-400 text-rose-400" />+{AFFECTION_PER_PET}
            </motion.span>
          ))}
        </AnimatePresence>
      </button>
    </div>
  );
}

function MockCapybara({ sleepy }: { sleepy: boolean }) {
  return (
    <svg width="150" height="110" viewBox="0 0 150 110" aria-hidden>
      <ellipse cx="72" cy="72" rx="58" ry="34" fill="#a9754a" />
      <ellipse cx="112" cy="50" rx="30" ry="26" fill="#b98556" />
      <ellipse cx="104" cy="28" rx="6" ry="5" fill="#8a5a36" />
      <rect x="128" y="48" width="16" height="16" rx="7" fill="#8a5a36" />
      {sleepy ? (
        <path d="M112 44 q5 4 10 0" stroke="#3b2618" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      ) : (
        <circle cx="117" cy="44" r="3.5" fill="#3b2618" />
      )}
      <ellipse cx="106" cy="56" rx="5" ry="3" fill="#f3a6a0" opacity="0.6" />
      <circle cx="98" cy="18" r="9" fill="#f5b83d" />
      <rect x="96" y="7" width="3" height="5" rx="1" fill="#4c7a3a" />
      <rect x="0" y="86" width="150" height="24" fill="#bae6fd" opacity="0.55" />
    </svg>
  );
}

export default PetStage;