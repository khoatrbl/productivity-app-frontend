import { Outlet, useLocation, useNavigate } from "react-router-dom";
import BottomNavigation from "../../components/BottomNavigation/BottomNavigation";
import SanctuaryCard from "../../components/SanctuaryCard/SanctuaryCard";
import { mockSanctuary } from "../../data/mockSantuaryProfile";
import { useSwipeable } from "react-swipeable";

const swipeRoutes = [
  "/",
  "/sanctuary",
  "/calendar",
  "/stats",
  "/settings",
];

function MainLayout() {
    const sanctuaryProfile = mockSanctuary;

    const navigate = useNavigate();
    const location = useLocation();

    const currentIndex = swipeRoutes.indexOf(location.pathname);

    const goToPreviousPage = () => {
        console.log("Swiped, previous page.");
        const previousIndex = (currentIndex - 1 + swipeRoutes.length) % swipeRoutes.length;

        navigate(swipeRoutes[previousIndex]);
    };

    const goToNextPage = () => {
        console.log("Swiped, next page.")
        const nextIndex = (currentIndex + 1) % swipeRoutes.length;

        navigate(swipeRoutes[nextIndex]);
    };

    const swipeHandlers = useSwipeable({
        onSwipedLeft: () => {
        goToNextPage();
        },

        onSwipedRight: () => {
        goToPreviousPage();
        },

        preventScrollOnSwipe: false,
        trackMouse: true,
        trackTouch: true
    });
    
    return (
        <div className="main-layout min-h-screen">
            <header className="fixed top-0 left-1/2 z-50 w-full max-w-[430px] -translate-x-1/2 bg-[#fcf8f2]">
                <SanctuaryCard profile={sanctuaryProfile} />
            </header>
            

            <main {...swipeHandlers} className="page-content pt-[115px] pb-[80px] touch-pan-y">
                <Outlet/>
            </main> 

            <BottomNavigation />
        </div>
    )
}

export default MainLayout;