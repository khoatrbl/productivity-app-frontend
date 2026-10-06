import { Cookie, Loader2, ShoppingBag, Sparkles } from "lucide-react";
import type { TreatTier } from "../../types/TreatDto";
import type { InventoryItemDto } from "../../types/InventoryItemDto";

const TIER_STYLE: Record<TreatTier, { ring: string; icon: string }> = {
  BASIC: { ring: "bg-amber-50", icon: "text-amber-500" },
  MEDIUM: { ring: "bg-rose-50", icon: "text-rose-400" },
  SPECIAL: { ring: "bg-violet-50", icon: "text-violet-500" },
};

interface SnackCardProps {
  item: InventoryItemDto;
  isFeeding?: boolean;
  disabled?: boolean; // another treat is being fed
  onFeed: () => void;
  onShop: () => void;
}

function SnackCard({ item, isFeeding = false, disabled = false, onFeed, onShop }: SnackCardProps) {
  const { treatDto: treat, quantity } = item;
  const style = TIER_STYLE[treat.treatTier];
  const isEmpty = quantity <= 0;

  return (
    <div className="flex flex-col items-center rounded-3xl border border-gray-100 bg-white px-2 pb-3 pt-4 text-center shadow-sm">
      <div className={`relative flex h-12 w-12 items-center justify-center rounded-full ${style.ring}`}>
        <Cookie className={`h-5 w-5 ${style.icon}`} />
        <span
          className={`absolute -right-1.5 -top-1 min-w-[22px] rounded-full px-1.5 text-[11px] font-bold leading-5 ${
            isEmpty ? "bg-gray-100 text-gray-400" : "bg-emerald-700 text-white"
          }`}
        >
          ×{quantity}
        </span>
      </div>

      <p className="mt-2 text-sm font-semibold leading-tight text-gray-800">{treat.treatName}</p>
      <p className="mt-0.5 flex items-center gap-0.5 text-xs text-emerald-600">
        <Sparkles className="h-3 w-3" />+{treat.exp} XP
      </p>

      {isEmpty ? (
        <button
          onClick={onShop}
          className="mt-3 flex w-full items-center justify-center gap-1 rounded-full border border-amber-200 bg-amber-50 py-1.5 text-xs font-semibold text-amber-700"
        >
          <ShoppingBag className="h-3.5 w-3.5" /> Get more
        </button>
      ) : (
        <button
          onClick={onFeed}
          disabled={isFeeding || disabled}
          className="mt-3 flex w-full items-center justify-center rounded-full bg-emerald-800 py-1.5 text-xs font-semibold text-white hover:bg-emerald-900 disabled:opacity-50"
        >
          {isFeeding ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Feed"}
        </button>
      )}
    </div>
  );
}

export default SnackCard;