// layouts/AuthenticatedProviders.tsx
import { Outlet } from "react-router-dom";
import { UserProfileProvider } from "../context/UserProfileContext";
import { TaskProvider } from "../context/TaskContext";
import { PetProvider } from "../context/PetContext";

function AuthenticatedProviders() {
  return (
    <UserProfileProvider>
      <PetProvider>
        <TaskProvider>
            <Outlet />
        </TaskProvider>
      </PetProvider>
    </UserProfileProvider>
  );
}

export default AuthenticatedProviders;