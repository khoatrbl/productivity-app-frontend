import { Route, Routes } from "react-router-dom";
import MainLayout from './layouts/MainLayout/MainLayout'
import Dashboard from "./pages/Dashboard/Dashboard";
import Sanctuary from "./pages/Sanctuary/Sanctuary";
import Stats from "./pages/Stats/Stats";
import Settings from "./pages/Settings/Settings";
import Calendar from "./pages/Calendar/Calendar";
import Auth from "./pages/Auth/Auth";
import RequireAuth from "./components/RequireAuth/RequireAuth";
import { AuthProvider } from "./context/AuthContext";
import CreateTask from "./pages/CreateTask/CreateTask";

function App() {
    return (
      <AuthProvider>
        <div className="app mx-auto min-h-screen w-full max-w-[430px]">
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/tasks/new" element={<RequireAuth><CreateTask /></RequireAuth>} />
            <Route
              element={
                <RequireAuth>
                  <MainLayout />
                </RequireAuth>
              }
            >
              <Route path="/" element={<Dashboard/>}/>
              <Route path="/sanctuary" element={<Sanctuary/>}/>
              <Route path="/calendar" element={<Calendar/>}/>
              <Route path="/stats" element={<Stats/>}/>
              <Route path="/settings" element={<Settings/>}/>
            </Route>
          </Routes>
        </div>
      </AuthProvider>
    );
}

export default App;