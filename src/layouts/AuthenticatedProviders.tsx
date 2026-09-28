// layouts/AuthenticatedProviders.tsx
import { Outlet } from "react-router-dom";
import { SanctuaryProvider } from "../context/SanctuaryContext";
import { TaskProvider } from "../context/TaskContext";
import { PetProvider } from "../context/PetContext";

function AuthenticatedProviders() {
  return (
    <SanctuaryProvider>
      <PetProvider>
        <TaskProvider>
            <Outlet />
        </TaskProvider>
      </PetProvider>
    </SanctuaryProvider>
  );
}

export default AuthenticatedProviders;