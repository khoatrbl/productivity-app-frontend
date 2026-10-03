import { Outlet } from "react-router-dom";
import { UserProfileProvider } from "../context/UserProfileContext";
import { TaskProvider } from "../context/TaskContext";
import { PetProvider } from "../context/PetContext";
import { InventoryProvider } from "../context/InventoryContext";

function AuthenticatedProviders() {
  return (
    <UserProfileProvider>
      <PetProvider>
        <InventoryProvider>
          <TaskProvider>
            <Outlet />
          </TaskProvider>
        </InventoryProvider>
      </PetProvider>
    </UserProfileProvider>
  );
}

export default AuthenticatedProviders;