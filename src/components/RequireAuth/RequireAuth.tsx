import { useEffect, useState, type ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { validateToken } from "../../services/authServices";

type Status = "checking" | "valid" | "invalid";

function RequireAuth({ children }: { children: ReactNode }) {
  const { token, logout } = useAuth();
  const [status, setStatus] = useState<Status>("checking");

  useEffect(() => {
    if (!token) {
      logout();
      setStatus("invalid");
      return;
    }

    validateToken()
      .then(() => setStatus("valid"))
      .catch(() => {
        logout();
        setStatus("invalid");
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // only re-check on a genuine mount, not on every token/logout change

  if (status === "checking") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#fcf8f2]">
        <p className="text-sm text-gray-400">Loading...</p>
      </div>
    );
  }

  if (status === "invalid") {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
}

export default RequireAuth;