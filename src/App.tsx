import { Route, Routes } from "react-router-dom";
import MainLayout from './layouts/MainLayout/MainLayout'
import Dashboard from "./pages/Dashboard/Dashboard";
import Sanctuary from "./pages/Sanctuary/Sanctuary";
import Stats from "./pages/Stats/Stats";
import Settings from "./pages/Settings/Settings";
import Calendar from "./pages/Calendar/Calendar";
import Auth from "./pages/Auth/Auth";
import RequireAuth from "./components/RequireAuth/RequireAuth";

function App() {
    return (
      <div className="app mx-auto min-h-screen w-full max-w-[430px]">
        <Routes>
          <Route path="/auth" element={<Auth />} />
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
    );
}

export default App;