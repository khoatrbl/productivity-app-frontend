import { Outlet } from "react-router-dom";
import BottomNavigation from "../../components/BottomNavigation/BottomNavigation";
import SanctuaryCard from "../../components/SanctuaryCard/SanctuaryCard";
import { mockSanctuary } from "../../data/mockSantuaryProfile";



function MainLayout() {
    const sanctuaryProfile = mockSanctuary;
    
    return (
        <div className="main-layout min-h-screen">
            <header className="fixed top-0 left-1/2 z-50 w-full max-w-[430px] -translate-x-1/2">
                <SanctuaryCard profile={sanctuaryProfile} />
            </header>
            

            <main className="page-content pt-[115px] pb-[80px]">
                <Outlet/>
            </main> 

            <BottomNavigation />
        </div>
    )
}

export default MainLayout;