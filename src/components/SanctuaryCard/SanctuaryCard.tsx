import { Award, Coins } from "lucide-react";
import type { SanctuaryProfile } from "../../types/SanctuaryProfile";

import avatar from '../../assets/heize.jpg';
import appLogo from '../../../public/capydo-logo-512x512.png'

interface SanctuaryCardProps {
  profile: SanctuaryProfile;
}

function SanctuaryCard({ profile }: SanctuaryCardProps) {
  const progress = Math.min((profile.xp / profile.maxXp) * 100, 100);

  return (
    <div className="border-b border-gray-200 bg-white px-3 pb-2 pt-[max(0.5rem,env(safe-area-inset-top))] shadow-[0_1.5px_0_0px_rgba(196,181,253,0.15),_1.5px_0_0_0px_rgba(196,181,253,0.15),_-1.5px_0_0_0px_rgba(196,181,253,0.15)]">
      {/* Top row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          
          <img src={appLogo} alt="avatar" className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-50 text-xl"/>
          
          <div>
            <p className="font-semibold text-gray-900 leading-tight">{profile.name}</p>
            <p className="text-sm text-gray-400 leading-tight">{profile.subtitle}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-3 py-1">
            <Coins className="h-4 w-4 text-amber-500" />
            <span className="text-sm font-semibold text-amber-700">{profile.coins}</span>
          </div>
          {profile.avatarUrl && (
            <img
              src={profile.avatarUrl}
              alt="Profile"
              className="h-9 w-9 rounded-full object-cover"
            />
          )}
        </div>
      </div>

      {/* Bottom row: level + progress */}
      <div className="mt-3 flex items-center gap-3 bg-gray-100 rounded-full px-2 py-1.5">
        <div className="flex items-center gap-1 rounded-full bg-emerald-800 px-3 py-0.5 text-sm font-medium text-white whitespace-nowrap">
          <Award className="h-3.5 w-3.5" />
          Lv. {profile.level}
        </div>

        <div className="h-2 flex-1 rounded-full bg-gray-200 overflow-hidden">
          <div
            className="h-full rounded-full bg-linear-to-r from-amber-400 to-yellow-400"
            style={{ width: `${progress}%` }}
          />
        </div>

        <span className="text-xs text-gray-500 whitespace-nowrap font-medium">
          {profile.xp} / {profile.maxXp} EXP
        </span>
      </div>
    </div>
  );
}

export default SanctuaryCard;