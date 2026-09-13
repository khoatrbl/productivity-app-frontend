import { Navigate } from "react-router-dom";
import type { ReactNode } from "react";

function RequireAuth({ children }: { children: ReactNode }) {
  const isAuthenticated = localStorage.getItem("capydo_auth") === "true";
  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }
  return <>{children}</>;
}

export default RequireAuth;