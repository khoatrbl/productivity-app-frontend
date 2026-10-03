import { useEffect, useMemo, useState } from "react";
import { Cookie, Crown, Footprints, Shirt, type LucideIcon } from "lucide-react";
import { getAllTreats, getShopItems } from "../../services/shopServices";
import { useSanctuary } from "../../context/UserProfileContext";
import { usePet } from "../../context/PetContext";
import { ItemType } from "../../types/ItemType";
import type { ShopItemsDto } from "../../types/ShopItemsDto";
import { mockItemArt, TREAT_ART } from "../../data/mockShop";
import ShopFilterTabs, { type ShopFilter } from "../../components/ShopFilterTab/ShopFilterTab";
import ShopItemCard, { type ShopCardState } from "../../components/ShopItemCard/ShopItemCard";
import type { TreatDto } from "../../types/TreatDto";
import { useInventory } from "../../context/InventoryContext";


const SECTIONS: { type: ItemType; title: string; icon: LucideIcon }[] = [
  { type: ItemType.HEADWEAR, title: "Hats & Headpieces", icon: Crown },
  { type: ItemType.BODYWEAR, title: "Cozy Bodywear", icon: Shirt },
  { type: ItemType.FOOTWEAR, title: "Paws & Footwear", icon: Footprints },
];

function SectionHeader({ icon: Icon, title, count }: { icon: LucideIcon; title: string; count: number }) {
  return (
    <div className="mb-2.5 flex items-center justify-between px-1">
      <h3 className="flex items-center gap-1.5 text-sm font-semibold uppercase tracking-wide text-gray-700">
        <Icon className="h-4 w-4 text-amber-600" /> {title}
      </h3>
      <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">{count} available</span>
    </div>
  );
}

function Shop() {
  const { level: userLevel, coins } = useSanctuary();
  const { pet } = usePet();
  const inventory = useInventory();

  const [items, setItems] = useState<ShopItemsDto[]>([]);
  const [treats, setTreats] = useState<TreatDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<ShopFilter>("TREATS");
  // MOCK: purchases made this session, until a buy endpoint exists
  const [boughtIds, setBoughtIds] = useState<Set<string>>(new Set());
  const [buyingId, setBuyingId] = useState<string | null>(null);

  const ownedTreatCount = (tier: string) => inventory.items.find((i) => i.treatDto.treatTier === tier)?.quantity ?? 0;

  useEffect(() => {
    getShopItems()
      .then(setItems)
      .catch((err) => setError(err.message ?? "Couldn't load the shop"))
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    getAllTreats()
        .then(setTreats)
        .catch((err) => setError(err.message ?? "Couldn't load the shop"))
        .finally(() => setIsLoading(false))
  }, [])

  const ownership = useMemo(() => {
    const owned = new Set<string>(boughtIds);
    const equipped = new Set<string>();
    (pet?.items ?? []).forEach((pi) => {
      owned.add(pi.shopItem.id);
      if (pi.isEquipped) equipped.add(pi.shopItem.id);
    });
    return { owned, equipped };
  }, [pet, boughtIds]);

  function stateOf(item: ShopItemsDto): ShopCardState {
    if (ownership.equipped.has(item.id)) return "equipped";
    if (ownership.owned.has(item.id)) return "owned";
    if (userLevel < item.requiredUserLevel) return "locked";
    return "buyable";
  }

  async function handleBuyItem(item: ShopItemsDto) {
    if (buyingId || ownership.owned.has(item.id)) return; // cosmetics: once only
    setBuyingId(item.id);
    try {
        // TODO: await buyShopItem(item.id), then refresh pet + coins
        setBoughtIds((prev) => new Set(prev).add(item.id));
    } finally {
    setBuyingId(null);
    }
  }

  async function handleBuyTreat(treatId: string, tier: string) {
    if (buyingId) return;
    setBuyingId(treatId);
    try {
        // TODO: await buyTreat(tier), then update coins
        await inventory.refresh(); // picks up the new quantity
    } finally {
        setBuyingId(null);
    }
  }

  // Buyable first, then locked by level, owned last
  const order: Record<ShopCardState, number> = { buyable: 0, locked: 1, owned: 2, equipped: 3 };
  const byType = (type: ItemType) =>
    items
      .filter((i) => i.itemType === type)
      .sort((a, b) => order[stateOf(a)] - order[stateOf(b)] || a.requiredUserLevel - b.requiredUserLevel);

  const visibleSections = SECTIONS.filter((s) => s.type === filter);
  const showTreats = filter === "TREATS";

  if (error) return <div className="px-4 text-sm text-red-500">{error}</div>;

  return (
    <div className="flex flex-col gap-3 px-2">
      <div className="sticky top-[109px] z-20 -mx-2 bg-[#fcf8f2] px-2 py-1 before:absolute before:inset-x-0 before:bottom-full before:h-8 before:bg-[#fcf8f2] after:absolute after:inset-x-0 after:top-full after:h-3 after:bg-gradient-to-b after:from-[#fcf8f2] after:to-transparent">
        <ShopFilterTabs value={filter} onChange={setFilter} />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 gap-3">
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="h-52 animate-pulse rounded-3xl bg-gray-100" />
          ))}
        </div>
      ) : (
        <>
          {visibleSections.map((section) => {
            const sectionItems = byType(section.type);
            const available = sectionItems.filter((i) => stateOf(i) === "buyable").length;
            return (
              <section key={section.type}>
                <SectionHeader icon={section.icon} title={section.title} count={available} />
                {sectionItems.length === 0 ? (
                  <p className="rounded-3xl border border-dashed border-gray-200 py-6 text-center text-sm text-gray-400">
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
          })}

          {showTreats && (
            <section>
              <SectionHeader icon={Cookie} title="Treats" count={treats.length} />
              <div className="grid grid-cols-2 gap-3">
                {treats.map((treat) => (
                  <ShopItemCard
                    key={treat.id}
                    name={treat.treatName}
                    description={`Feeds your capy for +${treat.exp} pet XP`}
                    price={treat.price}
                    art={TREAT_ART[treat.treatTier]}
                    state="buyable"
                    badge={`+${treat.exp} XP`}
                    coins={coins}
                    ownedCount={ownedTreatCount(treat.treatTier)}
                    isBuying={buyingId === treat.id}
                    onBuy={() => handleBuyTreat(treat.id, treat.treatTier)}
                  />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}

export default Shop;