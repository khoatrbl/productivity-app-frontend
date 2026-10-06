import { AnimatePresence, motion } from "framer-motion";
import { Check, Heart, Pencil, Sparkles, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const MAX_NAME_LENGTH = 20;

interface PetInfoCardProps {
  name: string;
  level: number;
  exp: number;
  maxExp: number;
  affection: number; // 0–100
  canRename: boolean;
  onRename: (name: string) => Promise<void>;
  xpPop?: {id: string, amount: number} | null;
}

function PetInfoCard({ name, level, exp, maxExp, affection, canRename, onRename, xpPop }: PetInfoCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(name);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { if (isEditing) inputRef.current?.focus(); }, [isEditing]);
  useEffect(() => { if (!isEditing) setDraft(name); }, [name, isEditing]);

  const expPercent = maxExp > 0 ? Math.min(100, Math.round((exp / maxExp) * 100)) : 0;
  const trimmed = draft.trim();
  const isValid = trimmed.length > 0 && trimmed.length <= MAX_NAME_LENGTH && trimmed !== name;

  async function save() {
    if (!isValid || isSaving) return;
    setIsSaving(true);
    setError(null);
    try {
      await onRename(trimmed);
      setIsEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't rename right now");
    } finally {
      setIsSaving(false);
    }
  }

  function cancel() {
    setIsEditing(false);
    setError(null);
  }

  return (
    <div className="rounded-3xl border border-gray-100 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        {isEditing ? (
          <div className="flex min-w-0 flex-1 items-center gap-1.5">
            <input
              ref={inputRef}
              value={draft}
              maxLength={MAX_NAME_LENGTH}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") save();
                if (e.key === "Escape") cancel();
              }}
              className="min-w-0 flex-1 rounded-xl border border-emerald-200 bg-emerald-50/40 px-3 py-1.5 text-lg font-semibold text-gray-900 outline-none focus:border-emerald-400"
            />
            <button onClick={cancel} aria-label="Cancel rename" className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100">
              <X className="h-4 w-4" />
            </button>
            <button
              onClick={save}
              disabled={!isValid || isSaving}
              aria-label="Save name"
              className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-800 text-white disabled:opacity-40"
            >
              <Check className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="flex min-w-0 items-center gap-1.5">
            <h2 className="truncate text-xl font-semibold text-gray-900">{name}</h2>
            {canRename && (
              <button
                onClick={() => setIsEditing(true)}
                aria-label="Rename your pet"
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-100 hover:text-emerald-700"
              >
                <Pencil className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        )}

        {!isEditing && (
          <span className="shrink-0 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
            Lv. {level}
          </span>
        )}
      </div>

      {isEditing && (
        <p className={`mt-1 text-xs ${error ? "text-red-500" : "text-amber-600"}`}>
          {error ?? "Heads up: you can only rename your pet once."}
        </p>
      )}

      <div className="relative mt-3">
        <div className="flex items-center justify-between text-xs">
          <span className="flex items-center gap-1 font-medium text-gray-600">
            <Sparkles className="h-3.5 w-3.5 text-emerald-600" /> Pet XP
          </span>
          <span className="text-gray-400">{exp} / {maxExp}</span>
        </div>
        <div className="mt-1.5 h-2.5 overflow-hidden rounded-full bg-gray-100">
          <div className="h-full rounded-full bg-emerald-600 transition-[width] duration-500" style={{ width: `${expPercent}%` }} />
        </div>

        <AnimatePresence>
          {xpPop && (
            <motion.span
              key={xpPop.id}
              initial={{ opacity: 0, y: 0 }}
              animate={{ opacity: [0, 1, 1, 0], y: -22 }}
              transition={{ duration: 1.1, ease: "easeOut" }}
              className="pointer-events-none absolute right-0 top-0 text-xs font-bold text-emerald-600"
            >
              +{xpPop.amount} XP
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      <div className="mt-3 rounded-2xl border border-rose-100 bg-rose-50/50 px-3 py-2.5">
        <div className="flex items-center justify-between text-xs">
          <span className="flex items-center gap-1 font-medium text-gray-600">
            <Heart className="h-3.5 w-3.5 fill-rose-400 text-rose-400" /> Affection
          </span>
          <span className="font-semibold text-rose-500">{affection}%</span>
        </div>
        <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-rose-100">
          <div className="h-full rounded-full bg-rose-400 transition-[width] duration-500" style={{ width: `${affection}%` }} />
        </div>
      </div>
    </div>
  );
}

export default PetInfoCard;