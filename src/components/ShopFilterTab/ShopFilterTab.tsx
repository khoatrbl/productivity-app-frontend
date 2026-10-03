import { motion } from "framer-motion";
import { Cookie, Crown, Footprints, Shirt, type LucideIcon } from "lucide-react";
import { ItemType } from "../../types/ItemType";

export type ShopFilter = "TREATS" | ItemType;

const TABS: { value: ShopFilter; label: string; icon: LucideIcon }[] = [
  { value: "TREATS", label: "Treats", icon: Cookie },
  { value: ItemType.HEADWEAR, label: "Headwear", icon: Crown },
  { value: ItemType.BODYWEAR, label: "Bodywear", icon: Shirt },
  { value: ItemType.FOOTWEAR, label: "Footwear", icon: Footprints },
];

interface ShopFilterTabsProps {
  value: ShopFilter;
  onChange: (value: ShopFilter) => void;
}

function ShopFilterTabs({ value, onChange }: ShopFilterTabsProps) {
  return (
    <div
      role="tablist"
      className="grid grid-cols-4 gap-1 rounded-3xl bg-gradient-to-r from-[#FDF1E8] via-[#FBE3D2] to-[#FADCC4] px-2 py-1.5 shadow-sm"
      onPointerDownCapture={(e) => e.stopPropagation()}
    >
      {TABS.map(({ value: v, label, icon: Icon }) => {
        const active = value === v;
        return (
          <button
            key={v}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(v)}
            className="relative flex flex-col items-center justify-center gap-0.5 rounded-2xl py-2 text-xs font-medium"
          >
            {active && (
              <motion.span
                layoutId="shop-tab-pill"
                className="absolute inset-0 rounded-2xl bg-white shadow-sm"
                transition={{ type: "spring", stiffness: 500, damping: 38 }}
              />
            )}
            <Icon className={`relative h-[18px] w-[18px] ${active ? "text-[#F48C42]" : "text-[#B8653F]"}`} />
            <span className={`relative ${active ? "font-semibold text-[#E0742C]" : "text-[#9A5535]"}`}>{label}</span>
          </button>
        );
      })}
    </div>
  );
}

export default ShopFilterTabs;