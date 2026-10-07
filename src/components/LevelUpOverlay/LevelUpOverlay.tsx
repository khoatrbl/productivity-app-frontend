import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import dancingCapybara from "../../assets/capybara-dancing.gif"
import { ItemType } from "../../types/ItemType";
import { Crown, Footprints, Shirt, Unlock, type LucideIcon } from "lucide-react";
import { getShopItems } from "../../services/shopServices";
import { useNavigate } from "react-router-dom";
import type { ShopItemsDto } from "../../types/ShopItemsDto";

interface LevelUpOverlayProps {
  level: number;
  previousLevel: number;
  duration?: number;
  onDismiss: () => void;
}

const TYPE_ICON: Record<ItemType, LucideIcon> = {
  [ItemType.HEADWEAR]: Crown,
  [ItemType.BODYWEAR]: Shirt,
  [ItemType.FOOTWEAR]: Footprints,
};
const MAX_LISTED = 3;

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

export function LevelUpOverlay({ level, previousLevel, duration = 4000, onDismiss }: LevelUpOverlayProps) {
  const navigate = useNavigate();
  const confetti = useMemo(() => generateConfetti(36), []);
  const [unlocks, setUnlocks] = useState<ShopItemsDto[] | null>(null); // null = still loading

  // Items whose required level is in (previousLevel, level]
  useEffect(() => {
    getShopItems()
      .then((items) =>
        setUnlocks(
          items
            .filter((i) => i.requiredUserLevel > previousLevel && i.requiredUserLevel <= level)
            .sort((a, b) => a.price - b.price)
        )
      )
      .catch(() => setUnlocks([]));
  }, [level, previousLevel]);

  // Only auto-close when there's nothing new to show
  useEffect(() => {
    if (unlocks === null || unlocks.length > 0) return;
    const timer = setTimeout(onDismiss, duration);
    return () => clearTimeout(timer);
  }, [unlocks, duration, onDismiss]);

  function goToShop() {
    onDismiss();
    navigate("/shop", { state: { filter: unlocks?.[0]?.itemType ?? ItemType.HEADWEAR } });
  }

  return createPortal(
    <div onClick={onDismiss} className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
      />

      <motion.div
        onClick={(e) => e.stopPropagation()}
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 18 }}
        className="relative flex w-full max-w-[320px] flex-col items-center gap-1 rounded-3xl border border-amber-200 bg-gradient-to-b from-amber-50 to-orange-50 px-6 py-8 shadow-xl"
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
            <img src={dancingCapybara} alt="dancing capybara" className="w-35 h-auto" />
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

        <p className="relative mt-2 text-center text-2xl font-bold text-emerald-900">You have reached Lv.{level}!</p>

        {/* New in the shop: only when this level unlocked something */}
        {unlocks && unlocks.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="relative mt-4 w-full rounded-2xl border border-amber-200 bg-white/80 p-3 text-left"
          >
            <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-amber-700">
              <Unlock className="h-3.5 w-3.5" /> New in the shop
            </p>

            <ul className="mt-2 space-y-1.5">
              {unlocks.slice(0, MAX_LISTED).map((item) => {
                const Icon = TYPE_ICON[item.itemType];
                return (
                  <li key={item.id} className="flex items-center gap-2 text-sm">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-amber-50">
                      <Icon className="h-4 w-4 text-amber-600" />
                    </span>
                    <span className="truncate font-medium text-gray-800">{item.name}</span>
                  </li>
                );
              })}
            </ul>

            {unlocks.length > MAX_LISTED && (
              <p className="mt-1.5 text-xs text-gray-400">+{unlocks.length - MAX_LISTED} more</p>
            )}

            <button
              onClick={goToShop}
              className="mt-3 w-full rounded-full bg-[#FFB780] py-2 text-sm font-bold text-[#7C3F1D] transition-colors hover:bg-[#FFAB6B]"
            >
              Take a look
            </button>
          </motion.div>
        )}

        <p className="relative mt-2 text-xs text-gray-400">Tap anywhere to continue</p>
      </motion.div>
    </div>,
    document.body
  );
}