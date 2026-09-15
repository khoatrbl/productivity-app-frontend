import { Award, Coins } from "lucide-react";
import { useSanctuary } from "../../context/SanctuaryContext";
import appLogo from "../../assets/capydo-logo-512x512.png"
import { motion, AnimatePresence } from "framer-motion";
import SanctuaryCardSkeleton from "./SanctuaryCardSkeleton";

function SanctuaryCard() {
  const { name, subtitle, avatarUrl, level, exp, maxExp, coins, recentGains, clearGain, isLoading } = useSanctuary();

  if (isLoading) {
    return <SanctuaryCardSkeleton/>
  }

  const progress = Math.min((exp / maxExp) * 100, 100);

  return (
    <div className="border-b border-gray-200 bg-white px-3 pb-2 pt-[max(0.5rem,env(safe-area-inset-top))] shadow-[0_1.5px_0_0px_rgba(196,181,253,0.15),_1.5px_0_0_0px_rgba(196,181,253,0.15),_-1.5px_0_0_0px_rgba(196,181,253,0.15)]">

      {/* Top row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src={appLogo} alt="App logo" className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-50 text-xl" />
          <div>
            <p className="font-semibold text-gray-900 leading-tight">{name}</p>
            <p className="text-sm text-gray-400 leading-tight">{subtitle}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-3 py-1">
            <Coins className="h-4 w-4 text-amber-500" />
            <span className="text-sm font-semibold text-amber-700">{coins}</span>
          </div>
          {avatarUrl && (
            <img src={avatarUrl} alt="Profile" className="h-9 w-9 rounded-full object-cover" />
          )}
        </div>
      </div>

      {/* Bottom row: level + progress */}
      <div className="mt-3 flex items-center gap-3">
        <div className="flex items-center gap-1 rounded-full bg-emerald-800 px-3 py-1 text-sm font-medium text-white whitespace-nowrap">
          <Award className="h-3.5 w-3.5" />
          Lv. {level}
        </div>

        <div className="relative flex-1">
          <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-amber-400 to-yellow-400"
              animate={{ width: `${progress}%` }}
              transition={{ type: "spring", stiffness: 120, damping: 20 }}
            />
          </div>

          <AnimatePresence>
            {recentGains.map((gain) => (
              <motion.span
                key={gain.id}
                initial={{ opacity: 0, y: 0 }}
                animate={{ opacity: 1, y: -22 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.9, ease: "easeOut" }}
                onAnimationComplete={() => clearGain(gain.id)}
                style={{ left: `${progress}%` }}
                className="pointer-events-none absolute -top-1 -translate-x-1/2 whitespace-nowrap text-xs font-semibold text-emerald-600"
              >
                +{gain.amount} XP
              </motion.span>
            ))}
          </AnimatePresence>
        </div>

        <span className="text-sm text-gray-400 whitespace-nowrap">
          {exp} / {maxExp} XP
        </span>
      </div>
    </div>
  );
}

export default SanctuaryCard;