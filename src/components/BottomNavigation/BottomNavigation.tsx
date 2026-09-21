import { NavLink } from "react-router-dom";
import { Timer, PawPrint, Calendar, Award, Plus, type LucideIcon } from "lucide-react";

interface BottomNavigationProps {
  onAddTask?: () => void;
}

interface NavItemConfig {
  to: string;
  label: string;
  icon: LucideIcon;
  end?: boolean;
}

const leftItems: NavItemConfig[] = [
  { to: "/", label: "Dashboard", icon: Timer, end: true },
  { to: "/sanctuary", label: "Sanctuary", icon: PawPrint },
];

const rightItems: NavItemConfig[] = [
  { to: "/calendar", label: "Calendar", icon: Calendar },
  { to: "/stats", label: "Stats", icon: Award },
];

function NavItem({ to, label, icon: Icon, end }: NavItemConfig) {
  return (
    <NavLink to={to} end={end} className="flex flex-1 flex-col items-center gap-0.5 text-[11px]">
      {({ isActive }) => (
        <>
          <span
            className={`flex h-8 w-10 items-center justify-center rounded-full transition-colors ${
              isActive ? "bg-white/15" : ""
            }`}
          >
            <Icon className={`h-5 w-5 ${isActive ? "text-white" : "text-emerald-200"}`} strokeWidth={isActive ? 2.4 : 2} />
          </span>
          <span className={isActive ? "font-semibold text-white" : "text-emerald-200"}>{label}</span>
        </>
      )}
    </NavLink>
  );
}

function BottomNavigation({ onAddTask }: BottomNavigationProps) {
  function handleAddTask() {
    if (onAddTask) {
      onAddTask();
    } else {
      // TODO: wire this to a real add-task modal/page once it exists.
      console.warn("Add Task tapped — no onAddTask handler wired up yet.");
    }
  }

  return (
    <nav
      style={{ "--bottom-nav-height": "calc(4rem + max(0.5rem, env(safe-area-inset-bottom)))" } as React.CSSProperties}
      className="fixed bottom-0 left-1/2 z-30 w-full max-w-[430px] -translate-x-1/2"
    >
      <div className="relative h-16">
        {/* Wave-shaped bar with a notch cut out for the floating button.
            Hand-tuned bezier curve — nudge the control points below if the
            dip doesn't sit exactly where you want it. */}
        <svg viewBox="0 0 400 80" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
          <path
            d="M0,24 C0,10.7 10.7,0 24,0 L150,0 C165,0 170,14 178,32 C188,50 212,50 222,32 C230,14 235,0 250,0 L376,0 C389.3,0 400,10.7 400,24 L400,80 L0,80 Z"
            fill="#065f46"
          />
        </svg>

        {/* Floating Add Task button, sitting in the notch */}
        <button
          onClick={handleAddTask}
          aria-label="Add task"
          className="absolute left-1/2 top-0.5 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-[#f8ca80] text-emerald-900 shadow-lg transition-transform active:scale-95"
        >
          <Plus className="h-7 w-7" strokeWidth={2.5} />
        </button>

        <div className="relative flex h-full items-center px-2">
          <div className="flex flex-1 items-center justify-around">
            {leftItems.map((item) => (
              <NavItem key={item.to} {...item} />
            ))}
          </div>

          <div className="w-14 shrink-0" /> {/* reserves space under the floating button */}

          <div className="flex flex-1 items-center justify-around">
            {rightItems.map((item) => (
              <NavItem key={item.to} {...item} />
            ))}
          </div>
        </div>
      </div>

      {/* Flat continuation of the bar's color into the safe-area inset,
          so the green doesn't visibly stop short of the home indicator. */}
      <div className="bg-[#065f46] pb-[max(0.5rem,env(safe-area-inset-bottom))]" />
    </nav>
  );
}

export default BottomNavigation;