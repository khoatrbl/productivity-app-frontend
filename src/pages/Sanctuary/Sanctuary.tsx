import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Cookie, Shirt } from "lucide-react";
import { usePet } from "../../context/PetContext";
import { usePetCare } from "../../hooks/usePetCare";
import { ItemType } from "../../types/ItemType";
import PetStage from "../../components/PetStage/PetStage";
import PetInfoCard from "../../components/PetInfoCard/PetInfoCard";
import SnackCard from "../../components/SnackCard/SnackCard";
import WardrobeItemCard from "../../components/WardrobeItemCard/WardrobeItemCard";
import { useInventory } from "../../context/InventoryContext";
import type { InventoryItemDto } from "../../types/InventoryItemDto";
import type { PetFeedResponse } from "../../types/PetFeedResponse";
import { feedPet } from "../../services/petServices";
import { ApiError } from "../../lib/apiClient";
import { AnimatePresence, motion } from "framer-motion";
import { useSanctuary } from "../../context/UserProfileContext";
import type { PetFortuneDto } from "../../types/PetFortuneDto";
import { PetLevelUpOverlay } from "../../components/PetLevelUpOverlay.tsx/PetLevelUpOverlay";

const ITEM_TABS: { value: ItemType; label: string }[] = [
  { value: ItemType.HEADWEAR, label: "Headwear" },
  { value: ItemType.BODYWEAR, label: "Bodywear" },
  { value: ItemType.FOOTWEAR, label: "Footwear" },
];

function Sanctuary() {
  const navigate = useNavigate();
  const { pet, isLoading, error, renamePet, syncPet } = usePet();
  const care = usePetCare(pet); // called unconditionally; handles pet === null
  const inventory = useInventory();
  const [itemType, setItemType] = useState<ItemType>(ItemType.HEADWEAR);

  const [feedingId, setFeedingId] = useState<string | null>(null);
  const [xpPop, setXpPop] = useState<{ id: string; amount: number } | null>(null);
  const [notice, setNotice] = useState<{ kind: "success" | "error"; text: string } | null>(null);

  const { syncCoins } = useSanctuary();
  const [levelUp, setLevelUp] = useState<{
    id: string;
    fromLevel: number;
    toLevel: number;
    fortune: PetFortuneDto | null;
  } | null>(null);

  const visibleItems = useMemo(
    () => care.items.filter((i) => i.shopItem.itemType === itemType),
    [care.items, itemType]
  );

  useEffect(() => {
    if (!notice) return;
    const id = setTimeout(() => setNotice(null), 2500);
    return () => clearTimeout(id);
  }, [notice]);

  useEffect(() => {
    if (care.petError) {
      setNotice({ kind: "error", text: care.petError });
      care.clearPetError();
    }
  }, [care.petError]);

  async function handleFeed(entry: InventoryItemDto) {
    const treat = entry.treatDto;
    if (feedingId || entry.quantity <= 0) return;

    setFeedingId(treat.id);

    let res: PetFeedResponse;
    try {
      res = await feedPet(treat.id);
    } catch (err) {
      const apiErr = err instanceof ApiError ? err : new ApiError("Couldn't feed right now", 0);
      const text =
        apiErr.status === 409 ? `${pet?.name ?? "Your capy"} is fully grown!` :
        apiErr.status === 422 ? "You're out of that treat" :
        apiErr.message;
      setNotice({ kind: "error", text });
      setFeedingId(null);
      return;
    }

    try {
      syncPet(res.pet);
      inventory.upsertItem(res.inventoryItem);
      if (res.fortuneInventoryItem) inventory.upsertItem(res.fortuneInventoryItem);
      if (typeof res.coins === "number") syncCoins(res.coins);
    } catch (uiErr) {
      console.error("Feed succeeded but updating the UI failed:", uiErr);
      await inventory.refresh();
    }

    setXpPop({ id: crypto.randomUUID(), amount: res.expGained });

    if (res.levelsGained > 0) {
      const toLevel = res.pet.petLevel.level;
      setLevelUp({
        id: crypto.randomUUID(),
        fromLevel: toLevel - res.levelsGained,
        toLevel,
        fortune: res.fortune,
      });
    }

    setFeedingId(null);
  }

  async function handleToggleEquip(petItemId: string) {
    const result = await care.toggleEquip(petItemId);
    if (!result.ok && result.reason !== "busy") {
      setNotice({ kind: "error", text: result.message ?? "Something went wrong" });
    }
  }

  if (error) return <div className="px-4 text-sm text-red-500">{error}</div>;
  if (isLoading || !pet) {
    return (
      <div className="flex flex-col gap-3 px-2">
        <div className="h-56 animate-pulse rounded-3xl bg-gray-100" />
        <div className="h-40 animate-pulse rounded-3xl bg-gray-100" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5 px-2">
      <section className="flex flex-col gap-3">
        <PetStage
          petName={pet.name}
          canPet={care.canPet}
          windowPets={care.windowPets}
          bonusPets={care.bonusPets}
          isNapping={care.isNapping}
          cooldownMsLeft={care.cooldownMsLeft}
          isAffectionMaxed={care.isAffectionMaxed}
          onPet={care.pet}
        />
        <PetInfoCard
          name={pet.name}
          level={care.level}
          exp={care.exp}
          maxExp={care.maxExp}
          affection={care.affection}
          canRename={true}
          onRename={renamePet}
          xpPop={xpPop}
        />
      </section>

      <section>
        <h3 className="mb-2.5 flex items-center gap-1.5 px-1 text-base font-semibold text-gray-800">
            <Cookie className="h-4 w-4 text-amber-600" /> Snack Pantry
        </h3>

        <AnimatePresence>
          {notice && (
            <motion.div
              key={notice.text}
              role="status"
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className={`rounded-2xl px-3 py-2 text-center text-xs font-semibold shadow-sm ${
                notice.kind === "success" ? "bg-emerald-700 text-white" : "bg-red-50 text-red-600"
              }`}
            >
              {notice.text}
            </motion.div>
          )}
        </AnimatePresence>

        {inventory.isLoading ? (
            <div className="grid grid-cols-3 gap-2">
            {Array.from({ length: 3 }, (_, i) => (
                <div key={i} className="h-40 animate-pulse rounded-3xl bg-gray-100" />
            ))}
            </div>
        ) : inventory.error ? (
            <p className="px-1 text-sm text-red-500">{inventory.error}</p>
        ) : (
            <div className="grid grid-cols-3 gap-2">
              {inventory.items.map((item) => (
                <SnackCard
                  key={item.treatDto.id}
                  item={item}
                  isFeeding={feedingId === item.treatDto.id}
                  disabled={!!feedingId && feedingId !== item.treatDto.id}
                  onFeed={() => handleFeed(item)}
                  onShop={() => navigate("/shop")}
                />
              ))}
            </div>
        )}
      </section>

      <section>
        <h3 className="mb-2.5 flex items-center gap-1.5 px-1 text-base font-semibold text-gray-800">
          <Shirt className="h-4 w-4 text-emerald-700" /> Capy Wardrobe
        </h3>

        <div className="mb-3 flex rounded-full bg-gray-100 p-1">
          {ITEM_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setItemType(tab.value)}
              className={`flex-1 rounded-full py-1.5 text-sm font-medium transition-colors ${
                itemType === tab.value ? "bg-white text-emerald-800 shadow-sm" : "text-gray-500"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-2">
          {visibleItems.map((item) => (
            <WardrobeItemCard key={item.id} item={item} onToggleEquip={() => handleToggleEquip(item.id)} />
          ))}

          {visibleItems.length === 0 && (
            <div className="flex flex-col items-center gap-1 rounded-3xl border border-dashed border-emerald-200 bg-emerald-50/40 py-8 text-center">
              <p className="text-sm font-semibold text-emerald-800">Nothing here yet</p>
              <button
                onClick={() => navigate("/shop", { state: { filter: itemType } })}
                className="text-xs font-medium text-emerald-700 underline"
              >
                Browse the shop
              </button>
            </div>
          )}
        </div>
      </section>

      {levelUp && pet && (
        <PetLevelUpOverlay
          key={levelUp.id}
          petName={pet.name}
          fromLevel={levelUp.fromLevel}
          toLevel={levelUp.toLevel}
          fortune={levelUp.fortune}
          onDismiss={() => setLevelUp(null)}
        />
      )}
    </div>
  );
}

export default Sanctuary;