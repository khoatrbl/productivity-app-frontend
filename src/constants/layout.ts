// Single source of truth for the bottom nav's height — both the nav itself
// and any page content padding derive from this, so they can never drift
// out of sync the way the CSS-variable approach could.
export const BOTTOM_NAV_BAR_REM = 4; // matches Tailwind's h-16
export const BOTTOM_NAV_SAFE_AREA = "max(0.5rem, env(safe-area-inset-bottom))";
export const BOTTOM_NAV_TOTAL_HEIGHT = `calc(${BOTTOM_NAV_BAR_REM}rem + ${BOTTOM_NAV_SAFE_AREA})`;