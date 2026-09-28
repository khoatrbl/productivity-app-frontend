import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePet } from "../../context/PetContext";

function NamePet() {
  const navigate = useNavigate();
  const { pet, renamePet } = usePet();
  const [name, setName] = useState(pet?.name ?? "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    if (!name.trim()) {
      setError("Give your companion a name, or skip for now.");
      return;
    }
    setIsSubmitting(true);
    try {
      await renamePet(name.trim());
      navigate("/", { replace: true });
    } catch {
      setError("Couldn't save that — try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleSkip() {
    navigate("/", { replace: true }); // keeps the default name as-is
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-5 bg-[#fcf8f2] px-6 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 text-4xl">🦫</div>
      <div>
        <h1 className="text-xl font-bold text-emerald-900">Welcome! One last thing...</h1>
        <p className="mt-1 text-sm text-gray-500">Want to name your companion, or keep it as-is?</p>
      </div>

      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="e.g. Mochi"
        maxLength={30}
        className="w-full max-w-xs rounded-2xl bg-white px-4 py-3 text-center text-base text-gray-800 shadow-sm outline-none placeholder:text-gray-300"
      />

      {error && <p className="text-xs font-medium text-red-500">{error}</p>}

      <div className="flex w-full max-w-xs flex-col gap-2">
        <button
          onClick={handleSave}
          disabled={isSubmitting}
          className="w-full rounded-full bg-emerald-800 py-3 text-sm font-semibold text-white disabled:opacity-60"
        >
          {isSubmitting ? "Saving..." : "That's the one!"}
        </button>
        <button
          onClick={handleSkip}
          disabled={isSubmitting}
          className="w-full py-2 text-sm font-medium text-gray-400 hover:text-gray-600"
        >
          Keep the default name
        </button>
      </div>
    </div>
  );
}

export default NamePet;