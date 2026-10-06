import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Cookie, Crown, Footprints, Shirt, type LucideIcon } from "lucide-react";
import { ApiError } from "../../lib/apiClient";
import { getShopItems, purchaseShopItem, purchaseTreat } from "../../services/shopServices";
import { useSanctuary } from "../../context/UserProfileContext";
import { usePet } from "../../context/PetContext";
import { useInventory } from "../../context/InventoryContext";
import { ItemType } from "../../types/ItemType";
import type { ShopItemsDto } from "../../types/ShopItemsDto";
import type { InventoryItemDto } from "../../types/InventoryItemDto";
import { mockItemArt, TREAT_ART } from "../../data/mockShop";
import ShopFilterTabs, { type ShopFilter } from "../../components/ShopFilterTab/ShopFilterTab";
import ShopItemCard, { type ShopCardState } from "../../components/ShopItemCard/ShopItemCard";
import type { TreatPurchaseResponseDto } from "../../types/TreatPurchaseDto";
import { useLocation } from "react-router-dom";
import type { PetItemPurchaseResponse } from "../../types/PetItemPurchaseResponse";

const SECTIONS: { type: ItemType; title: string; icon: LucideIcon }[] = [
  { type: ItemType.HEADWEAR, title: "Hats & Headpieces", icon: Crown },
  { type: ItemType.BODYWEAR, title: "Cozy Bodywear", icon: Shirt },
  { type: ItemType.FOOTWEAR, title: "Paws & Footwear", icon: Footprints },
];

// Buyable first, then locked (by level), owned/equipped last
const STATE_ORDER: Record<ShopCardState, number> = { buyable: 0, locked: 1, owned: 2, equipped: 3 };

const NOTICE_DURATION_MS = 2500;

// Feedback banner shown under the tabs after a purchase attempt
type Notice = { kind: "success" | "error"; text: string };

function SectionHeader({ icon: Icon, title, count }: { icon: LucideIcon; title: string; count: number }) {
  return (
    <div className="mb-2.5 flex items-center justify-between px-1">
      <h3 className="flex items-center gap-1.5 text-sm font-semibold uppercase tracking-wide text-gray-700">
        <Icon className="h-4 w-4 text-[#D97D64]" /> {title}
      </h3>
      <span className="rounded-full bg-[#F5DCD7] px-2 py-0.5 text-xs font-semibold text-[#D97D64]">
        {count} available
      </span>
    </div>
  );
}

function CardGridSkeleton({ count }: { count: number }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="h-52 animate-pulse rounded-3xl bg-white/60" />
      ))}
    </div>
  );
}

function Shop() {
  const { level: userLevel, coins, syncCoins } = useSanctuary();
  const { pet, addPetItem } = usePet();
  const inventory = useInventory();

  const location = useLocation();
  const [filter, setFilter] = useState<ShopFilter>(
    (location.state as { filter?: ShopFilter } | null)?.filter ?? "TREATS"
  );

  const [items, setItems] = useState<ShopItemsDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [buyingId, setBuyingId] = useState<string | null>(null);
  const [notice, setNotice] = useState<Notice | null>(null);

  useEffect(() => {
    getShopItems()
      .then(setItems)
      .catch((err: ApiError) => setError(err.message || "Couldn't load the shop"))
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    if (!notice) return;
    const id = setTimeout(() => setNotice(null), NOTICE_DURATION_MS);
    return () => clearTimeout(id);
  }, [notice]);

  const ownership = useMemo(() => {
    const owned = new Set<string>();
    const equipped = new Set<string>();
    (pet?.items ?? []).forEach((pi) => {
      owned.add(pi.shopItem.id);
      if (pi.isEquipped) equipped.add(pi.shopItem.id);
    });
    return { owned, equipped };
  }, [pet]);

  function stateOf(item: ShopItemsDto): ShopCardState {
    if (ownership.equipped.has(item.id)) return "equipped";
    if (ownership.owned.has(item.id)) return "owned";
    if (userLevel < item.requiredUserLevel) return "locked";
    return "buyable";
  }

  function itemsOfType(type: ItemType) {
    return items
      .filter((i) => i.itemType === type)
      .sort(
        (a, b) =>
          STATE_ORDER[stateOf(a)] - STATE_ORDER[stateOf(b)] ||
          a.requiredUserLevel - b.requiredUserLevel
      );
  }

  async function handleBuyTreat(entry: InventoryItemDto) {
    const { treatDto: treat } = entry;
    if (buyingId || coins < treat.price) return;

    setBuyingId(treat.id);

    // 1. The API call: only this can be a "failed purchase"
    let res: TreatPurchaseResponseDto;
    try {
        res = await purchaseTreat(treat.id);
    } catch (err) {
        const apiErr = err instanceof ApiError ? err : new ApiError("Purchase failed", 0);
        setNotice({
        kind: "error",
        text: apiErr.status === 422 ? "Not enough citrus for that one" : apiErr.message,
        });
        setBuyingId(null);
        return;
    }

    // 2. The purchase succeeded. A bug here must not be reported as a failed purchase.
    try {
        inventory.upsertItem(res.inventoryItem);
        syncCoins(res.coins);
    } catch (uiErr) {
        console.error("Purchase succeeded but updating the UI failed:", uiErr);
        await inventory.refresh(); // fall back to re-syncing from the server
    }

    setNotice({ kind: "success", text: `+1 ${treat.treatName}` });
    setBuyingId(null);
  }

  async function handleBuyItem(item: ShopItemsDto) {
    if (buyingId || ownership.owned.has(item.id) || coins < item.price) return;

    setBuyingId(item.id);

    let res: PetItemPurchaseResponse;
    try {
      res = await purchaseShopItem(item.id);
    } catch (err) {
      const apiErr = err instanceof ApiError ? err : new ApiError("Purchase failed", 0);
      const text =
        apiErr.status === 409 ? "You already own this one" :
        apiErr.status === 422 ? "Not enough citrus for that one" :
        apiErr.status === 403 ? `Reach Lv. ${item.requiredUserLevel} to unlock this` :
        apiErr.message;
      setNotice({ kind: "error", text });
      setBuyingId(null);
      return;
    }

    try {
      addPetItem(res.petItem);
      syncCoins(res.coins);
    } catch (uiErr) {
      console.error("Purchase succeeded but updating the UI failed:", uiErr);
    }

    setNotice({ kind: "success", text: `${item.name} added to the wardrobe` });
    setBuyingId(null);
  }

  const showTreats = filter === "TREATS";
  const visibleSections = SECTIONS.filter((s) => s.type === filter);

  return (
    <div className="flex flex-col gap-5 px-2">
      {/* Sticky tabs + purchase feedback */}
      <div className="sticky top-[109px] z-20 -mx-2 -mb-3 bg-[#FCF5F0] px-2 pb-2 pt-1 before:absolute before:inset-x-0 before:bottom-full before:h-8 before:bg-[#FCF5F0]">
        <ShopFilterTabs value={filter} onChange={setFilter} />

        <AnimatePresence>
          {notice && (
            <motion.div
              key={notice.text}
              role="status"
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className={`absolute inset-x-2 top-full mt-1 rounded-2xl px-3 py-2 text-center text-xs font-semibold shadow-sm ${
                notice.kind === "success" ? "bg-[#F48C42] text-white" : "bg-red-50 text-red-600"
              }`}
            >
              {notice.text}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Treats: data comes from the inventory (real treat ids + owned quantity) */}
      {showTreats && (
        <section>
          <SectionHeader icon={Cookie} title="Treats" count={inventory.items.length} />

          {inventory.isLoading ? (
            <CardGridSkeleton count={3} />
          ) : inventory.error ? (
            <p className="px-1 text-sm text-red-500">{inventory.error}</p>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {inventory.items.map((entry) => {
                const treat = entry.treatDto;
                return (
                  <ShopItemCard
                    key={treat.id}
                    name={treat.treatName}
                    description={`Feeds your capy for +${treat.exp} pet XP`}
                    price={treat.price}
                    art={TREAT_ART[treat.treatTier]}
                    state="buyable" // treats never become "owned"
                    badge={`+${treat.exp} XP`}
                    coins={coins}
                    ownedCount={entry.quantity}
                    isBuying={buyingId === treat.id}
                    onBuy={() => handleBuyTreat(entry)}
                  />
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* Cosmetics: one section for the selected wear type */}
      {!showTreats &&
        (error ? (
          <p className="px-1 text-sm text-red-500">{error}</p>
        ) : isLoading ? (
          <CardGridSkeleton count={4} />
        ) : (
          visibleSections.map((section) => {
            const sectionItems = itemsOfType(section.type);
            const available = sectionItems.filter((i) => stateOf(i) === "buyable").length;

            return (
              <section key={section.type}>
                <SectionHeader icon={section.icon} title={section.title} count={available} />

                {sectionItems.length === 0 ? (
                  <p className="rounded-3xl border border-dashed border-[#F5DCD7] py-6 text-center text-sm text-gray-400">
                    Nothing in stock yet
                  </p>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    {sectionItems.map((item) => (
                      <ShopItemCard
                        key={item.id}
                        name={item.name}
                        description={item.description}
                        price={item.price}
                        art={mockItemArt(item.id, item.itemType)}
                        state={stateOf(item)}
                        requiredLevel={item.requiredUserLevel}
                        coins={coins}
                        isBuying={buyingId === item.id}
                        onBuy={() => handleBuyItem(item)}
                      />
                    ))}
                  </div>
                )}
              </section>
            );
          })
        ))}
    </div>
  );
}

export default Shop;