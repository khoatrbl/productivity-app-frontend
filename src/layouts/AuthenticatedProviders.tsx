// layouts/AuthenticatedProviders.tsx
import { Outlet } from "react-router-dom";
import { SanctuaryProvider } from "../context/SanctuaryContext";
import { TaskProvider } from "../context/TaskContext";

function AuthenticatedProviders() {
  return (
    <SanctuaryProvider>
      <TaskProvider>
        <Outlet />
      </TaskProvider>
    </SanctuaryProvider>
  );
}

export default AuthenticatedProviders;