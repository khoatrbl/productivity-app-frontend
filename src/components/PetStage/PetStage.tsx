import { AnimatePresence, motion, useAnimationControls } from "framer-motion";
import { Heart, PawPrint, Sparkles } from "lucide-react";
import {
  Component,
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import MockCapybara from "../MockCapybara/MockCapybara";
import type { PetResult } from "../../hooks/usePetCare";
import type { EquippedCosmetic } from "../PetModel/PetModel";
import type { AffectionTierCode, AffectionTierDto } from "../../types/PetDto";

// Loaded on demand, so three.js (a large bundle) only downloads when the Sanctuary opens
const PetModel = lazy(() => import("../PetModel/PetModel"));

// A pointer that moves more than this between down and up counts as a drag, not a tap
const TAP_MOVE_TOLERANCE_PX = 8;

// Lowest to highest: used to tell whether a tier change is an upgrade
const TIER_ORDER: AffectionTierCode[] = [
  "SHY",
  "CONTENT",
  "PLAYFUL",
  "BEST_BUD",
];

const TIER_STYLE: Record<AffectionTierCode, string> = {
  SHY: "bg-sky-100 text-sky-700",
  CONTENT: "bg-emerald-100 text-emerald-700",
  PLAYFUL: "bg-amber-100 text-amber-700",
  BEST_BUD: "bg-rose-100 text-rose-600",
};

const TIER_UP_MESSAGE_MS = 2800;

interface PetStageProps {
  petName: string;
  canPet: boolean;
  windowPets: number;
  bonusPets: number;
  isNapping: boolean;
  cooldownMsLeft: number;
  isAffectionMaxed: boolean;
  affection: number;
  affectionTier?: AffectionTierDto | null;
  onPet: () => PetResult;
  cosmetics?: EquippedCosmetic[];
}

function formatCooldown(ms: number) {
  const total = Math.ceil(ms / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

// If 3D fails (no WebGL, broken file), quietly keep the SVG capybara instead of crashing the page
class ModelErrorBoundary extends Component<
  { children: ReactNode; onError: () => void },
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: unknown) {
    console.error("3D pet failed to load, using the 2D capybara:", error);
    this.props.onError();
  }

  render() {
    return this.state.failed ? null : this.props.children;
  }
}

function PetStage({
  petName,
  canPet,
  windowPets,
  bonusPets,
  isNapping,
  cooldownMsLeft,
  isAffectionMaxed,
  affection,
  affectionTier,
  onPet,
  cosmetics = [],
}: PetStageProps) {
  const controls = useAnimationControls();
  const [hearts, setHearts] = useState<
    { id: string; x: number; amount: number }[]
  >([]);
  const [isModelReady, setIsModelReady] = useState(false);
  const [hasModelFailed, setHasModelFailed] = useState(false);
  const [tierUp, setTierUp] = useState<{ id: string; name: string } | null>(
    null,
  );

  const stageRef = useRef<HTMLButtonElement>(null);
  const pointerStart = useRef<{ x: number; y: number } | null>(null);
  const previousTier = useRef<AffectionTierCode | null>(null);

  const sleepy = isNapping && bonusPets === 0;
  const showFallback = !isModelReady || hasModelFailed;

  const handleModelReady = useCallback(() => setIsModelReady(true), []);
  const handleModelError = useCallback(() => setHasModelFailed(true), []);

  // Keep presses on the pet away from the page-swipe (framer-motion drag on <main>).
  // This must be a NATIVE listener: React's handlers run at the app root, which the
  // event only reaches after <main> has already started the swipe.
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;

    const onPointerDown = (e: PointerEvent) => {
      pointerStart.current = { x: e.clientX, y: e.clientY };
      e.stopPropagation(); // the 3D canvas inside has already received it
    };

    el.addEventListener("pointerdown", onPointerDown);
    return () => el.removeEventListener("pointerdown", onPointerDown);
  }, []);

  // Celebrate moving UP a tier (not on first load, and not when decay lowers it)
  useEffect(() => {
    const code = affectionTier?.code ?? null;
    const before = previousTier.current;
    previousTier.current = code;

    if (!code || !before || code === before) return;
    if (TIER_ORDER.indexOf(code) > TIER_ORDER.indexOf(before)) {
      setTierUp({ id: crypto.randomUUID(), name: affectionTier!.displayName });
    }
  }, [affectionTier?.code, affectionTier?.displayName]);

  useEffect(() => {
    if (!tierUp) return;
    const t = setTimeout(() => setTierUp(null), TIER_UP_MESSAGE_MS);
    return () => clearTimeout(t);
  }, [tierUp]);

  function spawnHeart(amount: number) {
    if (amount <= 0) return;
    const id = crypto.randomUUID();
    setHearts((h) => [...h, { id, x: Math.random() * 60 - 30, amount }]);
    setTimeout(() => setHearts((h) => h.filter((x) => x.id !== id)), 900);
  }

  function handleClick(e: React.MouseEvent) {
    // Ignore the click that ends a drag-to-rotate
    const start = pointerStart.current;
    pointerStart.current = null;
    if (
      start &&
      Math.hypot(e.clientX - start.x, e.clientY - start.y) >
        TAP_MOVE_TOLERANCE_PX
    ) {
      return;
    }
    handleTap();
  }

  function handleTap() {
    const result = onPet();
    if (!result.ok) {
      controls.start({ x: [0, -4, 4, -2, 0], transition: { duration: 0.3 } });
      return;
    }

    controls.start({
      scaleY: [1, 0.9, 1.05, 1],
      scaleX: [1, 1.08, 0.97, 1],
      transition: { duration: 0.4 },
    });

    if (result.pendingGain) {
      result.pendingGain.then(spawnHeart); // value decided by the server, a moment later
    } else {
      spawnHeart(result.gained);
    }
  }

  // Status line (top-left)
  let status: string;
  if (isAffectionMaxed) {
    status = `${petName} feels completely loved`;
  } else if (isNapping && bonusPets > 0) {
    status = `Napping · ${formatCooldown(cooldownMsLeft)} · bonus pets work!`;
  } else if (isNapping) {
    status = `${petName} is napping · ${formatCooldown(cooldownMsLeft)}`;
  } else {
    status = `Tap to pet · ${windowPets} left`;
  }

  // "12 more to Playful" (uses the live affection, so it counts down as you pet)
  const toNextTier =
    affectionTier?.nextTierAt != null
      ? Math.max(0, affectionTier.nextTierAt - affection)
      : null;

  return (
    <div className="relative h-56 overflow-hidden rounded-3xl bg-gradient-to-b from-amber-100 via-orange-50 to-emerald-100">
      <span className="absolute left-3 top-3 z-10 max-w-[70%] truncate rounded-full bg-white/80 px-2.5 py-1 text-xs font-medium text-gray-600 backdrop-blur">
        {status}
      </span>

      {/* Bonus pets badge (top-right), only when there are some */}
      <AnimatePresence>
        {bonusPets > 0 && (
          <motion.span
            key="bonus"
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.6 }}
            transition={{ type: "spring", stiffness: 400, damping: 18 }}
            className="absolute right-3 top-3 z-10 flex items-center gap-1 rounded-full bg-rose-100 px-2.5 py-1 text-xs font-bold text-rose-600"
            title="Bonus pets: earned from tasks, usable even while napping"
          >
            <PawPrint className="h-3.5 w-3.5" />
            {bonusPets} bonus
          </motion.span>
        )}
      </AnimatePresence>

      {/* Tier-up celebration (top-centre, briefly) */}
      <AnimatePresence>
        {tierUp && (
          <motion.div
            key={tierUp.id}
            initial={{ opacity: 0, y: -10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ type: "spring", stiffness: 380, damping: 20 }}
            className="pointer-events-none absolute inset-x-0 top-12 z-20 flex justify-center"
          >
            <span className="flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-bold text-gray-800 shadow-sm">
              <Sparkles className="h-3.5 w-3.5 text-amber-500" />
              {petName} is now {tierUp.name}!
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* hot-spring water */}
      <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-b from-sky-200/70 to-sky-300/70" />

      {/* Affection tier (bottom-left) */}
      {affectionTier && (
        <div className="pointer-events-none absolute bottom-3 left-3 z-10 flex flex-col items-start gap-1">
          <motion.span
            key={affectionTier.code}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 18 }}
            className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ${TIER_STYLE[affectionTier.code]}`}
          >
            <Heart className="h-3 w-3 fill-current" />
            {affectionTier.displayName}
          </motion.span>
          {toNextTier !== null && toNextTier > 0 && (
            <span className="rounded-full bg-white/70 px-2 py-0.5 text-[10px] font-medium text-gray-500 backdrop-blur">
              {toNextTier} more to {affectionTier.nextTierName}
            </span>
          )}
        </div>
      )}

      <button
        ref={stageRef}
        type="button"
        onClick={handleClick}
        aria-label={`Pet ${petName}`}
        className={`absolute bottom-2 left-1/2 h-48 w-56 -translate-x-1/2 ${canPet ? "cursor-pointer" : "cursor-default"}`}
      >
        <motion.div
          animate={controls}
          style={{ originY: 1 }}
          className="relative h-full w-full"
        >
          {/* 3D capybara (hidden until it has actually rendered) */}
          {!hasModelFailed && (
            <div
              className={`absolute inset-0 transition-opacity duration-300 ${isModelReady ? "opacity-100" : "opacity-0"}`}
            >
              <ModelErrorBoundary onError={handleModelError}>
                <Suspense fallback={null}>
                  <PetModel
                    sleepy={sleepy}
                    cosmetics={cosmetics}
                    onReady={handleModelReady}
                  />
                </Suspense>
              </ModelErrorBoundary>
            </div>
          )}

          {/* 2D capybara: shown while the model loads, or if 3D isn't available */}
          {showFallback && (
            <div className="absolute inset-x-0 bottom-4 flex justify-center">
              <MockCapybara mood={sleepy ? "sleepy" : "awake"} />
            </div>
          )}
        </motion.div>

        <AnimatePresence>
          {hearts.map((h) => (
            <motion.span
              key={h.id}
              initial={{ opacity: 0, y: 0, x: h.x, scale: 0.6 }}
              animate={{ opacity: 1, y: -70, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8 }}
              className="pointer-events-none absolute left-1/2 top-4 flex items-center gap-0.5 text-sm font-semibold text-rose-500"
            >
              <Heart className="h-4 w-4 fill-rose-400 text-rose-400" />+
              {h.amount}
            </motion.span>
          ))}
        </AnimatePresence>
      </button>
    </div>
  );
}

export default PetStage;
