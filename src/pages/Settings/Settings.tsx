// pages/Settings/Settings.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  AudioLines,
  Bell,
  Camera,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  CloudUpload,
  Download,
  Flower2,
  KeyRound,
  Link2,
  LogOut,
  Mail,
  Palette,
  PawPrint,
  Pencil,
  RefreshCw,
  Shield,
  Smartphone,
  Sparkles,
  Vibrate,
  X,
  type LucideIcon,
} from "lucide-react";
import { useUserProfileContext } from "../../context/UserProfileContext";
import { usePet } from "../../context/PetContext";
import defaultAvatar from "../../assets/angry_capybara_working.jpg";
import { ApiError } from "../../lib/apiClient";
import { useAuth } from "../../context/AuthContext";

type AtmosphereTheme = "PARCHMENT" | "OAT_CREAM" | "SOFT_DUSK";

const THEMES: { value: AtmosphereTheme; label: string; swatch: string }[] = [
  { value: "PARCHMENT", label: "Parchment", swatch: "bg-[#FCF5F0]" },
  { value: "OAT_CREAM", label: "Oat Cream", swatch: "bg-[#EDE3D1]" },
  { value: "SOFT_DUSK", label: "Soft Dusk", swatch: "bg-gray-800" },
];

/* ---------- small building blocks ---------- */

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${
        checked ? "bg-emerald-800" : "bg-gray-200"
      }`}
    >
      <motion.span
        layout
        transition={{ type: "spring", stiffness: 500, damping: 32 }}
        className={`absolute top-1 flex h-5 w-5 items-center justify-center rounded-full bg-white ${
          checked ? "right-1" : "left-1"
        }`}
      >
        {checked ? (
          <Check className="h-3 w-3 text-emerald-800" />
        ) : (
          <X className="h-3 w-3 text-red-400" />
        )}
      </motion.span>
    </button>
  );
}

function SectionHeader({
  icon: Icon,
  title,
}: {
  icon: LucideIcon;
  title: string;
}) {
  return (
    <h3 className="mb-2 mt-1 flex items-center gap-1.5 px-1 text-xs font-bold uppercase tracking-wider text-gray-600">
      <Icon className="h-3.5 w-3.5" /> {title}
    </h3>
  );
}

function SettingRow({
  icon: Icon,
  title,
  subtitle,
  badge,
  right,
  onClick,
}: {
  icon: LucideIcon;
  title: string;
  subtitle?: string;
  badge?: string;
  right?: React.ReactNode;
  onClick?: () => void;
}) {
  const content = (
    <>
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#F5EDE6] text-gray-700">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1 text-left">
        <div className="flex items-center gap-1.5">
          <p className="text-sm font-semibold text-gray-800">{title}</p>
          {badge && (
            <span className="rounded-full bg-[#F5DCD7] px-1.5 py-0.5 text-[10px] font-semibold text-[#D97D64]">
              {badge}
            </span>
          )}
        </div>
        {subtitle && (
          <p className="text-xs leading-snug text-gray-400">{subtitle}</p>
        )}
      </div>
      {right}
    </>
  );

  return onClick ? (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 px-4 py-3 hover:bg-gray-50"
    >
      {content}
    </button>
  ) : (
    <div className="flex items-center gap-3 px-4 py-3">{content}</div>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="divide-y divide-gray-50 overflow-hidden rounded-3xl bg-white">
      {children}
    </div>
  );
}

/* ---------- page ---------- */

function Settings() {
  const navigate = useNavigate();
  const { pet } = usePet();
  const { logout } = useAuth();

  // TODO: map these to your real UserProfileContext fields
  const {
    name,
    email,
    avatarUrl: profileAvatar,
    level,
    exp,
    maxExp,
    isLoading: isProfileLoading,
    updateDisplayName,
  } = useUserProfileContext();

  const username = name || "Capy friend";
  const avatarUrl = profileAvatar || defaultAvatar;
  const expToNext = maxExp;

  const [isEditingName, setIsEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState("");
  const [isSavingName, setIsSavingName] = useState(false);
  const [nameError, setNameError] = useState<string | null>(null);

  // Local-only preferences (wire to backend later)
  const [twoFactor, setTwoFactor] = useState(true);
  const [sensoryFriendly, setSensoryFriendly] = useState(true);
  const [onsenChimes, setOnsenChimes] = useState(false);
  const [hapticTaps, setHapticTaps] = useState(true);
  const [nudgeTime, setNudgeTime] = useState("09:00");
  const [theme, setTheme] = useState<AtmosphereTheme>("PARCHMENT");
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSynced, setLastSynced] = useState("2 mins ago");
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  function startEditName() {
    setNameDraft(name);
    setNameError(null);
    setIsEditingName(true);
  }

  function cancelEditName() {
    setIsEditingName(false);
    setNameError(null);
  }

  async function saveName() {
    const trimmed = nameDraft.trim();
    if (!trimmed) return setNameError("Name can't be empty.");
    if (trimmed === name) return cancelEditName();

    setIsEditingName(false); // optimistic: close right away, new name already showing
    setNameError(null);

    try {
      await updateDisplayName(trimmed);
    } catch (err) {
      const apiErr = err instanceof ApiError ? err : null;
      setNameDraft(trimmed); // keep what they typed so they can fix it
      setIsEditingName(true); // reopen the editor
      setNameError(
        apiErr?.status === 400
          ? "That name isn't valid."
          : "Couldn't save. Try again.",
      );
    }
  }

  function handleSync() {
    if (isSyncing) return;
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      setLastSynced("just now");
    }, 1200); // TODO: replace with real sync call
  }

  async function handleLogout() {
    await logout();
    navigate("/auth", { replace: true });
  }

  function handleExport() {
    // TODO: fetch real data from the backend
    const data = {
      username,
      email,
      level,
      exp,
      pet,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "capydo-export.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  const expPct = Math.min(
    100,
    Math.round((exp / Math.max(1, expToNext)) * 100),
  );

  if (isProfileLoading) {
    return (
      <div className="flex flex-col gap-4 px-2">
        <div className="h-36 animate-pulse rounded-3xl bg-gray-100" />
        <div className="h-48 animate-pulse rounded-3xl bg-gray-100" />
        <div className="h-64 animate-pulse rounded-3xl bg-gray-100" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#fcf8f2]">
      {/* Header — same style as CreateTask */}
      <div className="sticky top-0 z-20 flex items-center justify-between border-b border-gray-100 bg-white px-4 py-3">
        <button
          onClick={() => navigate(-1)}
          aria-label="Go back"
          className="text-gray-400 hover:text-gray-600"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <p className="text-base font-bold text-gray-900">Settings</p>
        <div className="h-5 w-5" /> {/* keeps the title centered */}
      </div>

      <div className="flex flex-col gap-4 px-4 py-4 pb-[max(2rem,env(safe-area-inset-bottom))]">
        {/* Profile card */}
        <section className="rounded-3xl bg-white p-4">
          <div className="flex items-start gap-3">
            <div className="relative shrink-0">
              <img
                src={avatarUrl}
                alt="Profile"
                className="h-16 w-16 rounded-2xl object-cover"
              />
              <button
                type="button"
                aria-label="Change photo"
                className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-emerald-800 text-white"
              >
                <Camera className="h-3 w-3" />
              </button>
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                {isEditingName ? (
                  <div className="flex min-w-0 flex-1 items-center gap-1">
                    <input
                      autoFocus
                      value={nameDraft}
                      maxLength={30}
                      onChange={(e) => {
                        setNameDraft(e.target.value);
                        setNameError(null);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") saveName();
                        if (e.key === "Escape") cancelEditName();
                      }}
                      disabled={isSavingName}
                      aria-label="Display name"
                      aria-invalid={!!nameError}
                      className={`min-w-0 flex-1 rounded-lg bg-gray-50 px-2 py-1 text-base font-bold text-gray-900 outline-none ${
                        nameError
                          ? "ring-2 ring-red-300"
                          : "ring-1 ring-gray-200 focus:ring-emerald-300"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={saveName}
                      disabled={isSavingName}
                      aria-label="Save name"
                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-800 text-white disabled:opacity-60"
                    >
                      {isSavingName ? (
                        <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Check className="h-3.5 w-3.5" />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={cancelEditName}
                      disabled={isSavingName}
                      aria-label="Cancel"
                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-500"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="flex min-w-0 items-center gap-1.5">
                    <p className="truncate text-lg font-bold text-gray-900">
                      {username}
                    </p>
                    <button
                      type="button"
                      onClick={startEditName}
                      aria-label="Edit name"
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}
                <span className="flex shrink-0 items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                  <Sparkles className="h-3 w-3" /> Pro
                </span>
              </div>
              <p className="truncate text-xs text-gray-400">{email}</p>
              {nameError && (
                <p className="mt-0.5 text-xs font-medium text-red-500">
                  {nameError}
                </p>
              )}

              <div className="mt-2 flex items-center justify-between gap-2 rounded-full bg-[#FCF5F0] px-2.5 py-1">
                <span className="flex items-center gap-1 text-[11px] font-semibold text-gray-700">
                  <PawPrint className="h-3 w-3" /> Lv. {level} Capy Caretaker
                </span>
                <span className="text-[11px] text-gray-400">
                  {exp}/{expToNext} XP
                </span>
              </div>
              <div className="mt-1 h-1 overflow-hidden rounded-full bg-gray-100">
                <div
                  className="h-full rounded-full bg-[#F48C42]"
                  style={{ width: `${expPct}%` }}
                />
              </div>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between border-t border-gray-50 pt-3">
            <span className="flex items-center gap-1.5 text-xs text-gray-500">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              {pet?.name ?? "Your capy"} is resting peacefully
            </span>
            <button
              type="button"
              onClick={() => navigate("/sanctuary")}
              className="flex items-center gap-0.5 text-xs font-semibold text-emerald-800"
            >
              Care Room <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </section>

        {/* Account & security */}
        <section>
          <SectionHeader icon={Shield} title="Account & Security" />
          <Card>
            <SettingRow
              icon={Mail}
              title="Email"
              subtitle={email}
              // onClick={() => navigate("/settings/email")}
              // right={<ChevronRight className="h-4 w-4 text-gray-300" />}
            />
            <SettingRow
              icon={KeyRound}
              title="Password"
              subtitle="Update your password"
              onClick={() => navigate("/settings/password")}
              right={<ChevronRight className="h-4 w-4 text-gray-300" />}
            />
            <SettingRow
              icon={Smartphone}
              title="Two-Factor Authentication"
              subtitle="SMS or Authenticator App"
              right={
                <Toggle
                  checked={twoFactor}
                  onChange={setTwoFactor}
                  label="Two-factor authentication"
                />
              }
            />
            <SettingRow
              icon={Link2}
              title="Linked Passkeys"
              subtitle="Google & Apple ID active"
              right={
                <span className="rounded-full bg-gray-100 px-2.5 py-1 text-[11px] font-semibold text-gray-600">
                  2 Active
                </span>
              }
            />
          </Card>
        </section>

        {/* Experience & vibes */}
        <section>
          <SectionHeader icon={Sparkles} title="Experience & Vibes" />
          <Card>
            <SettingRow
              icon={Flower2}
              title="Sensory Friendly Mode"
              badge="Calm"
              subtitle="Mutes loud flashing bursts & high vibrations"
              right={
                <Toggle
                  checked={sensoryFriendly}
                  onChange={setSensoryFriendly}
                  label="Sensory friendly mode"
                />
              }
            />
            <SettingRow
              icon={Bell}
              title="Gentle Nudges"
              subtitle="Zero-guilt daily reminders"
              right={
                <label className="flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 text-[11px] font-semibold text-gray-600">
                  <input
                    type="time"
                    value={nudgeTime}
                    onChange={(e) => setNudgeTime(e.target.value)}
                    className="w-[60px] bg-transparent outline-none [&::-webkit-calendar-picker-indicator]:hidden"
                    aria-label="Nudge time"
                  />
                  <Clock className="h-3 w-3" />
                </label>
              }
            />
            <SettingRow
              icon={AudioLines}
              title="Relaxing Onsen Chimes"
              subtitle="Wooden bowls, waterdrops & soft bells"
              right={
                <Toggle
                  checked={onsenChimes}
                  onChange={setOnsenChimes}
                  label="Onsen chimes"
                />
              }
            />

            <div className="px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#F5EDE6] text-gray-700">
                  <Palette className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">
                    Atmosphere Theme
                  </p>
                  <p className="text-xs text-gray-400">
                    Warm low-glare spectrums
                  </p>
                </div>
              </div>

              <div className="mt-3 grid grid-cols-3 gap-2">
                {THEMES.map((t) => {
                  const active = theme === t.value;
                  return (
                    <button
                      key={t.value}
                      type="button"
                      onClick={() => setTheme(t.value)}
                      aria-pressed={active}
                      className={`flex flex-col items-center gap-1.5 rounded-xl py-2.5 text-xs font-semibold transition-colors ${
                        active
                          ? "bg-emerald-800 text-white"
                          : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      <span
                        className={`h-3 w-3 rounded-full border border-black/5 ${t.swatch}`}
                      />
                      {t.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </Card>
        </section>

        {/* Sanctuary sync */}
        <section>
          <SectionHeader icon={PawPrint} title="Sanctuary Sync" />
          <Card>
            <SettingRow
              icon={CloudUpload}
              title="Pet Progress Cloud Save"
              subtitle={isSyncing ? "Syncing..." : `Synced ${lastSynced}`}
              right={
                <button
                  type="button"
                  onClick={handleSync}
                  aria-label="Sync now"
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200"
                >
                  <RefreshCw
                    className={`h-3.5 w-3.5 ${isSyncing ? "animate-spin" : ""}`}
                  />
                </button>
              }
            />
            <SettingRow
              icon={Vibrate}
              title="Haptic Tap Affirmation"
              subtitle="Satisfying micro-thumps"
              right={
                <Toggle
                  checked={hapticTaps}
                  onChange={setHapticTaps}
                  label="Haptic taps"
                />
              }
            />
          </Card>
        </section>

        {/* Actions */}
        <button
          type="button"
          onClick={handleExport}
          className="flex items-center justify-center gap-2 rounded-full bg-white py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50"
        >
          <Download className="h-4 w-4" /> Export Quest & Pet Data (JSON)
        </button>

        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center justify-center gap-2 rounded-2xl bg-[#FDDCC8] py-3.5 text-sm font-bold text-gray-800 hover:bg-[#FCD0B6]"
        >
          <LogOut className="h-4 w-4" /> Log Out of Sanctuary
        </button>

        <AnimatePresence mode="wait" initial={false}>
          {confirmingDelete ? (
            <motion.div
              key="confirm"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="rounded-2xl bg-red-50 p-3 text-center"
            >
              <p className="text-xs font-semibold text-red-600">
                This erases your quests, {pet?.name ?? "your capy"} and all
                progress. It can't be undone.
              </p>
              <div className="mt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setConfirmingDelete(false)}
                  className="flex-1 rounded-full bg-white py-2 text-xs font-semibold text-gray-600"
                >
                  Keep my sanctuary
                </button>
                <button
                  type="button"
                  onClick={() => {
                    /* TODO: call delete account endpoint, then handleLogout() */
                  }}
                  className="flex-1 rounded-full bg-red-500 py-2 text-xs font-semibold text-white"
                >
                  Delete forever
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.button
              key="link"
              type="button"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setConfirmingDelete(true)}
              className="mx-auto text-xs font-semibold text-red-500 underline underline-offset-2"
            >
              Permanently Delete Sanctuary Account
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default Settings;
