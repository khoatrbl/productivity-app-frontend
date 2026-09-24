import { Route, Routes } from "react-router-dom";
import MainLayout from './layouts/MainLayout'
import AuthenticatedProviders from './layouts/AuthenticatedProviders'
import Dashboard from "./pages/Dashboard/Dashboard";
import Sanctuary from "./pages/Sanctuary/Sanctuary";
import Shop from "./pages/Shop/Shop";
import Settings from "./pages/Settings/Settings";
import Calendar from "./pages/Calendar/Calendar";
import Auth from "./pages/Auth/Auth";
import RequireAuth from "./components/RequireAuth/RequireAuth";
import { AuthProvider } from "./context/AuthContext";
import CreateTask from "./pages/CreateTask/CreateTask";
import EditTask from "./pages/EditTask/EditTask";

function App() {
    return (
      <AuthProvider>
        <div className="app mx-auto min-h-screen w-full max-w-[430px]">
          <Routes>
            <Route path="/auth" element={<Auth />} />

            <Route
              element={
                <RequireAuth>
                  <AuthenticatedProviders />
                </RequireAuth>
              }
            >
              <Route path="/tasks/new" element={<CreateTask />} />
              <Route path="/tasks/:taskId/edit" element={<EditTask />} />

              <Route element={<MainLayout />}>
                <Route path="/" element={<Dashboard/>}/>
                <Route path="/sanctuary" element={<Sanctuary/>}/>
                <Route path="/calendar" element={<Calendar/>}/>
                <Route path="/shop" element={<Shop/>}/>
                <Route path="/settings" element={<Settings/>}/>
              </Route>
            </Route>
          </Routes>
        </div>
      </AuthProvider>
    );
}

export default App;