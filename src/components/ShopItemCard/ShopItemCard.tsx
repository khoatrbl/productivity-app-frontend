import { Check, Citrus, Loader2, Lock } from "lucide-react";

export type ShopCardState = "locked" | "buyable" | "owned" | "equipped";

interface ShopItemCardProps {
  name: string;
  description: string;
  price: number;
  art: string;
  state: ShopCardState;
  requiredLevel?: number;
  coins: number;           // user's current balance
  badge?: string;          // small tag top-left, e.g. "+15 XP"
  ownedCount?: number;     // treats only: how many are in the inventory
  isBuying?: boolean;      // purchase in flight
  onBuy: () => void;
}

function ShopItemCard({
  name, description, price, art, state, requiredLevel,
  coins, badge, ownedCount, isBuying = false, onBuy,
}: ShopItemCardProps) {
  const isLocked = state === "locked";
  const isOwned = state === "owned" || state === "equipped";
  const shortfall = Math.max(0, price - coins);
  const canAfford = shortfall === 0;

  return (
    <div
      className={`flex flex-col rounded-3xl border bg-white p-3 shadow-sm ${
        isOwned ? "border-emerald-200" : isLocked ? "border-gray-100" : "border-amber-100"
      }`}
    >
      <div className={`relative flex h-24 items-center justify-center rounded-2xl ${isLocked ? "bg-gray-50" : "bg-amber-50/60"}`}>
        {badge && (
          <span className="absolute left-2 top-2 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-gray-500">
            {badge}
          </span>
        )}
        {isOwned && <Check className="absolute right-2 top-2 h-4 w-4 text-emerald-600" />}
        {ownedCount !== undefined && ownedCount > 0 && (
          <span className="absolute right-2 top-2 rounded-full bg-emerald-700 px-1.5 text-[11px] font-bold leading-5 text-white">
            ×{ownedCount}
          </span>
        )}
        <span className={`text-5xl ${isLocked ? "opacity-30 grayscale" : ""}`}>{art}</span>
        {isLocked && <Lock className="absolute h-6 w-6 text-gray-400" />}
      </div>

      <p className={`mt-2.5 truncate text-sm font-semibold ${isLocked ? "text-gray-400" : "text-gray-800"}`}>{name}</p>
      <p className="line-clamp-2 min-h-[2rem] text-xs text-gray-400">{description}</p>

      <div className="mt-2 flex items-center justify-between gap-2">
        <span className={`flex items-center gap-1 text-sm font-semibold ${isLocked ? "text-gray-300" : "text-amber-600"}`}>
          <Citrus className="h-4 w-4" />
          {price}
        </span>

        {state === "locked" && (
          <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-400">Lv. {requiredLevel}</span>
        )}
        {state === "equipped" && (
          <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">Equipped</span>
        )}
        {state === "owned" && (
          <span className="rounded-full border border-emerald-200 px-2.5 py-1 text-xs font-semibold text-emerald-700">Owned</span>
        )}
        {state === "buyable" && (
          canAfford ? (
            <button
              onClick={onBuy}
              disabled={isBuying}
              className="flex min-w-[56px] items-center justify-center rounded-full bg-emerald-800 px-3.5 py-1 text-xs font-semibold text-white hover:bg-emerald-900 disabled:opacity-60"
            >
              {isBuying ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Buy"}
            </button>
          ) : (
            <button
              disabled
              className="flex shrink-0 cursor-not-allowed items-center gap-0.5 whitespace-nowrap rounded-full bg-gray-100 px-2.5 py-1 text-[11px] font-semibold text-gray-400"
            >
              Need {shortfall}
              <Citrus className="h-3 w-3" />
              more
            </button>
          )
        )}
      </div>
    </div>
  );
}

export default ShopItemCard;