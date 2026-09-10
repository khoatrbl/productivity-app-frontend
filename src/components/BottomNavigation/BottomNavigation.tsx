import { NavLink } from "react-router-dom";
import { Timer, PawPrint, Calendar, Award, Settings } from "lucide-react";

const navItems = [
  { to: "/", label: "Focus", icon: Timer, end: true },
  { to: "/sanctuary", label: "Sanctuary", icon: PawPrint },
  { to: "/calendar", label: "Calendar", icon: Calendar },
  { to: "/stats", label: "Stats", icon: Award },
  { to: "/settings", label: "Settings", icon: Settings },
];

function BottomNavigation() {
  return (
    <nav className="fixed bottom-0 left-1/2 z-50 w-full max-w-[430px] -translate-x-1/2 border-t border-gray-200 bg-white/80 backdrop-blur-lg pb-[max(0.5rem,env(safe-area-inset-bottom))]">
      <div className="flex justify-around items-center px-2 pt-2">
        {navItems.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className="flex flex-col items-center gap-1 text-[11px]"
          >
            {({ isActive }) => (
              <>
                <span
                  className={`flex items-center justify-center w-12 h-8 rounded-full transition-colors ${
                    isActive ? "bg-emerald-100" : ""
                  }`}
                >
                  <Icon
                    className={`w-5 h-5 ${isActive ? "text-gray-900" : "text-gray-400"}`}
                    strokeWidth={isActive ? 2.2 : 2}
                  />
                </span>
                <span className={isActive ? "font-medium text-gray-900" : "text-gray-400"}>
                  {label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}

export default BottomNavigation;