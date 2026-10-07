import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Check, Citrus, Heart, PawPrint, Sparkles, Trophy } from "lucide-react";
import { useSanctuary } from "../../context/UserProfileContext";
import { usePet } from "../../context/PetContext";
import type { TaskCompletion } from "../../context/TaskContext";
import petAvatar from "../../assets/chilling_capybara.png"; // placeholder avatar

interface TaskCompleteOverlayProps {
  completion: TaskCompletion;
  onDismiss: () => void;
}

export function TaskCompleteOverlay({ completion, onDismiss }: TaskCompleteOverlayProps) {
  const navigate = useNavigate();
  const { level, exp, maxExp, levelUpEvents } = useSanctuary();
  const { pet } = usePet();

  const leveledUp = levelUpEvents.length > 0;
  const progress = maxExp > 0 ? Math.min(100, Math.round((exp / maxExp) * 100)) : 0;
  const petName = pet?.name ?? "Your capy";

  function visitPet() {
    onDismiss();
    navigate("/sanctuary");
  }

  return createPortal(
    <div onClick={onDismiss} className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.25 }}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
      />

      <motion.div
        role="dialog"
        aria-label="Quest completed"
        onClick={(e) => e.stopPropagation()}
        initial={{ scale: 0.85, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 22 }}
        className="relative max-h-[90vh] w-full max-w-[360px] overflow-y-auto rounded-[28px] bg-[#FCF8F2] px-5 pb-5 pt-6 text-center"
      >
        {/* Header */}
        <span className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-orange-700">
          <Trophy className="h-3.5 w-3.5" /> Quest complete
        </span>
        <h2 className="mt-2 text-[26px] font-extrabold leading-tight text-gray-900">Quest conquered!</h2>
        <p className="mt-1 text-sm text-gray-500">{petName} is so proud of you.</p>

        {/* Pet avatar */}
        <div className="relative mx-auto mt-5 w-fit">
          <motion.div
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.15, type: "spring", stiffness: 300, damping: 16 }}
            className="h-36 w-36 overflow-hidden rounded-full border-4 border-white bg-emerald-50"
          >
            <img src={petAvatar} alt={petName} className="h-full w-full object-cover" />
          </motion.div>
          <span className="absolute -bottom-2 left-1/2 inline-flex -translate-x-1/2 items-center gap-1 whitespace-nowrap rounded-full bg-amber-300 px-3 py-1 text-xs font-bold text-amber-900">
            <Heart className="h-3 w-3 fill-current" /> Lv. {pet?.petLevel.level ?? 1} {petName}
          </span>
        </div>

        {/* Completed task */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-6 flex items-center gap-3 rounded-2xl border border-gray-100 bg-white px-4 py-3 text-left"
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-100">
            <Check className="h-5 w-5 text-emerald-700" />
          </span>
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-wide text-gray-400">Completed quest</p>
            <p className="truncate font-semibold text-gray-900">{completion.title}</p>
          </div>
        </motion.div>

        {/* Rewards */}
        <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45 }}
        className="mt-3 rounded-2xl bg-[#F3EEE6] p-4 text-left"
        >
        <p className="font-semibold text-gray-800">Rewards claimed</p>

        {/* Reward tiles: XP, Citrus, and bonus pets when granted */}
        <div className={`mt-3 grid gap-2 ${completion.bonusPets > 0 ? "grid-cols-3" : "grid-cols-2"}`}>
            <RewardTile
            icon={<Sparkles className="h-4 w-4 text-amber-500" />}
            iconBg="bg-amber-100"
            label="EXP"
            value={`+${completion.expGained}`}
            delay={0.55}
            />
            <RewardTile
            icon={<Citrus className="h-4 w-4 text-[#F48C42]" />}
            iconBg="bg-orange-100"
            label="Citrus"
            value={`+${completion.coinsGained}`}
            delay={0.65}
            />
            {completion.bonusPets > 0 && (
            <RewardTile
                icon={<PawPrint className="h-4 w-4 text-rose-500" />}
                iconBg="bg-rose-100"
                label="Bonus pets"
                value={`+${completion.bonusPets}`}
                delay={0.75}
                highlight
            />
            )}
        </div>

        {/* Level progress */}
        <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-white">
            <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ delay: 0.6, duration: 0.8, ease: "easeOut" }}
            className="h-full rounded-full bg-gradient-to-r from-amber-400 to-yellow-400"
            />
        </div>
        <div className="mt-1.5 flex justify-between text-xs text-gray-400">
            <span>{exp} / {maxExp} XP</span>
            {leveledUp ? (
            <span className="font-bold text-emerald-700">Level up! Lv. {level}</span>
            ) : (
            <span>{progress}% to Lv. {level + 1}</span>
            )}
        </div>
        </motion.div>

        {/* Actions */}
        <button
          onClick={visitPet}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-emerald-800 py-3 text-[15px] font-bold text-white hover:bg-emerald-900"
        >
          Visit {petName} <Heart className="h-4 w-4 fill-current" />
        </button>
        <button
          onClick={onDismiss}
          className="mt-2 w-full rounded-full bg-[#EDE6DC] py-3 text-[15px] font-semibold text-gray-800 hover:bg-[#E6DDD0]"
        >
          Back to quests
        </button>
      </motion.div>
    </div>,
    document.body
  );
}

interface RewardTileProps {
  icon: React.ReactNode;
  iconBg: string;
  label: string;
  value: string;
  delay: number;
  highlight?: boolean;
}

function RewardTile({ icon, iconBg, label, value, delay, highlight = false }: RewardTileProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, type: "spring", stiffness: 380, damping: 18 }}
      className={`flex flex-col items-center gap-1 rounded-xl bg-white px-2 py-2.5 text-center ${
        highlight ? "ring-2 ring-rose-200" : ""
      }`}
    >
      <span className={`flex h-8 w-8 items-center justify-center rounded-full ${iconBg}`}>{icon}</span>
      <p className="text-[11px] leading-tight text-gray-400">{label}</p>
      <p className="text-sm font-bold text-gray-900">{value}</p>
    </motion.div>
  );
}