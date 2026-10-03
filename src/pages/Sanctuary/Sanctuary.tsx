import { useMemo, useState } from "react";
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

const ITEM_TABS: { value: ItemType; label: string }[] = [
  { value: ItemType.HEADWEAR, label: "Headwear" },
  { value: ItemType.BODYWEAR, label: "Bodywear" },
  { value: ItemType.FOOTWEAR, label: "Footwear" },
];

function Sanctuary() {
  const navigate = useNavigate();
  const { pet, isLoading, error, renamePet } = usePet();
  const care = usePetCare(pet); // called unconditionally; handles pet === null
  const inventory = useInventory();
  const [itemType, setItemType] = useState<ItemType>(ItemType.HEADWEAR);

  const visibleItems = useMemo(
    () => care.items.filter((i) => i.shopItem.itemType === itemType),
    [care.items, itemType]
  );

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
          petsLeft={care.petsLeft}
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
          canRename={true /* TODO: wire to a "renamed once" flag when PetDto has one */}
          onRename={renamePet}
        />
      </section>

      <section>
        <h3 className="mb-2.5 flex items-center gap-1.5 px-1 text-base font-semibold text-gray-800">
            <Cookie className="h-4 w-4 text-amber-600" /> Snack Pantry
        </h3>

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
                onFeed={() => console.log("TODO: feed", item.treatDto.treatTier)}
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
            <WardrobeItemCard key={item.id} item={item} onToggleEquip={() => care.toggleEquip(item.id)} />
          ))}

          {visibleItems.length === 0 && (
            <div className="flex flex-col items-center gap-1 rounded-3xl border border-dashed border-emerald-200 bg-emerald-50/40 py-8 text-center">
              <p className="text-sm font-semibold text-emerald-800">Nothing here yet</p>
              <button onClick={() => navigate("/shop")} className="text-xs font-medium text-emerald-700 underline">
                Browse the shop
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default Sanctuary;