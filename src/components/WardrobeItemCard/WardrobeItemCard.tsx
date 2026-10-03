import { Crown, Footprints, Shirt, type LucideIcon } from "lucide-react";
import type { PetItemDto } from "../../types/PetDto";
import { ItemType } from "../../types/ItemType";

const TYPE_ICON: Record<ItemType, LucideIcon> = {
  [ItemType.HEADWEAR]: Crown,
  [ItemType.BODYWEAR]: Shirt,
  [ItemType.FOOTWEAR]: Footprints,
};

interface WardrobeItemCardProps {
  item: PetItemDto;
  onToggleEquip: () => void;
}

function WardrobeItemCard({ item, onToggleEquip }: WardrobeItemCardProps) {
  const { shopItem, isEquipped } = item;
  const Icon = TYPE_ICON[shopItem.itemType];

  return (
    <div
      className={`flex items-center gap-3 rounded-3xl border bg-white px-4 py-3 shadow-sm ${
        isEquipped ? "border-emerald-200" : "border-gray-100"
      }`}
    >
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-amber-50">
        <Icon className="h-5 w-5 text-amber-600" />
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate font-medium text-gray-800">{shopItem.name}</p>
        <p className="truncate text-xs text-gray-400">{shopItem.description}</p>
      </div>

      <button
        onClick={onToggleEquip}
        className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
          isEquipped
            ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
            : "border border-gray-200 text-gray-600 hover:bg-gray-50"
        }`}
      >
        {isEquipped ? "Equipped" : "Equip"}
      </button>
    </div>
  );
}

export default WardrobeItemCard;