import { NavLink } from "react-router-dom";
import { Timer, PawPrint, Calendar, Store, Plus, type LucideIcon } from "lucide-react";
import { BOTTOM_NAV_SAFE_AREA } from "../../constants/layout";

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
  { to: "/shop", label: "Shop", icon: Store },
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
    <nav className="fixed bottom-0 left-1/2 z-30 w-full max-w-[430px] -translate-x-1/2">
      <div className="relative h-16">
        {/* Wave-shaped bar with a notch cut out for the floating button.
            Hand-tuned bezier curve — nudge the control points below if the
            dip doesn't sit exactly where you want it. */}
        <svg viewBox="0 0 400 64" preserveAspectRatio="none" className="absolute inset-0 h-full w-full drop-shadow-lg">
          <path
            d="
              M18,0
              L164,0
              C169,0 170,4 171,7
              A30,30 0 0 0 229,7
              C230,4 231,0 236,0
              L382,0
              A18,18 0 0 1 400,18
              L400,64
              L0,64
              L0,18
              A18,18 0 0 1 18,0
              Z
            "
            fill="#065f46"
          />
        </svg>

        {/* Floating Add Task button, sitting in the notch */}
        <button
          onClick={handleAddTask}
          aria-label="Add task"
          className="absolute left-1/2 -top-0.5 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-[#f8ca80] hover:bg-amber-400 text-emerald-900 shadow-lg transition-transform active:scale-95"
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
      <div className="bg-[#065f46]" style={{ paddingBottom: BOTTOM_NAV_SAFE_AREA }} />
    </nav>
  );
}

export default BottomNavigation;