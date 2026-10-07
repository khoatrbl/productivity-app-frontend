import { Award, Citrus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useSanctuary } from "../../context/UserProfileContext";
import { useTasks } from "../../context/TaskContext";
import appLogo from "../../assets/capydo-logo-512x512.png";
import defaultAvatar from "../../assets/angry_capybara_working.jpg";
import UserProfileCardSkeleton from "./UserProfileCardSkeleton";
import { LevelUpOverlay } from "../LevelUpOverlay/LevelUpOverlay";
import AnimatedNumber from "../AnimatedNumber/AnimatedNumber";

function UserProfileCard() {
  const {
    name, subtitle, avatarUrl, level, exp, maxExp, coins,
    recentGains, clearGain,
    recentCoinGains, clearCoinGain,
    levelUpEvents, clearLevelUp,
    isLoading,
  } = useSanctuary();

  const { activeTask, isCelebrationPending } = useTasks();
  const navigate = useNavigate();

  if (isLoading) {
    return <UserProfileCardSkeleton />;
  }

  const progress = maxExp > 0 ? Math.min((exp / maxExp) * 100, 100) : 0;

  // Only ever display the oldest queued event — if two level-ups land close
  // together, the second waits its turn rather than overlapping.
  const activeLevelUp = isCelebrationPending ? undefined : levelUpEvents[0];

  return (
    <>
      {activeLevelUp && (
        <LevelUpOverlay
          key={activeLevelUp.id}
          level={activeLevelUp.newLevel}
          previousLevel={activeLevelUp.previousLevel}
          onDismiss={() => clearLevelUp(activeLevelUp.id)}
        />
      )}

      <div className="border-b border-gray-200 bg-white px-3 pb-2 pt-[max(0.5rem,env(safe-area-inset-top))] shadow-[0_1.5px_0_0px_rgba(196,181,253,0.15),_1.5px_0_0_0px_rgba(196,181,253,0.15),_-1.5px_0_0_0px_rgba(196,181,253,0.15)]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={appLogo}
              alt="App logo"
              className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-50 text-xl"
            />
            <div>
              <p className="font-semibold leading-tight text-gray-900">{name}</p>
              {activeTask ? (
                <p className="text-xs font-semibold uppercase leading-tight tracking-wide text-orange-500">
                  Focus Mode
                </p>
              ) : (
                <p className="text-sm leading-tight text-gray-400">{subtitle}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Coin balance: counts to the new value; +N floats up, -N floats down */}
            <div className="relative flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-3 py-1">
              <Citrus className="h-4 w-4 text-amber-500" />
              <AnimatedNumber value={coins} className="text-sm font-semibold text-amber-700" />

              <AnimatePresence>
                {recentCoinGains.map((gain) => {
                  const isSpend = gain.amount < 0;
                  return (
                    <motion.span
                      key={gain.id}
                      initial={{ opacity: 0, y: 0 }}
                      animate={{ opacity: [0, 1, 1, 0], y: isSpend ? 22 : -22 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 1.1, ease: "easeOut" }}
                      onAnimationComplete={() => clearCoinGain(gain.id)}
                      className={`pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 whitespace-nowrap text-xs font-bold ${
                        isSpend ? "text-[#D97D64]" : "text-amber-600"
                      }`}
                    >
                      {isSpend ? gain.amount : `+${gain.amount}`}
                    </motion.span>
                  );
                })}
              </AnimatePresence>
            </div>

            <button
              onClick={() => navigate("/settings")}
              aria-label="Open settings"
              className="h-9 w-9 shrink-0 overflow-hidden rounded-full"
            >
              <img
                src={avatarUrl ? avatarUrl : defaultAvatar}
                alt="Profile"
                className="h-9 w-9 rounded-full object-cover"
              />
            </button>
          </div>
        </div>

        <div className="mt-3 flex items-center gap-3">
          <div className="flex items-center gap-1 whitespace-nowrap rounded-full bg-emerald-800 px-3 py-1 text-sm font-medium text-white">
            <Award className="h-3.5 w-3.5" />
            Lv. {level}
          </div>

          {/* XP bar: +N XP floats up from the right end */}
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
                  animate={{ opacity: [0, 1, 1, 0], y: -18 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1.1, ease: "easeOut" }}
                  onAnimationComplete={() => clearGain(gain.id)}
                  className="pointer-events-none absolute -top-1 right-0 whitespace-nowrap text-xs font-bold text-emerald-600"
                >
                  +{gain.amount} XP
                </motion.span>
              ))}
            </AnimatePresence>
          </div>

          <span className="whitespace-nowrap text-sm text-gray-400">
            <AnimatedNumber value={exp} /> / {maxExp} XP
          </span>
        </div>
      </div>
    </>
  );
}

export default UserProfileCard;