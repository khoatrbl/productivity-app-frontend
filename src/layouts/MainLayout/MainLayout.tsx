import { motion, type PanInfo } from "framer-motion";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import BottomNavigation from "../../components/BottomNavigation/BottomNavigation";
import SanctuaryCard from "../../components/SanctuaryCard/SanctuaryCard";
import { mockSanctuary } from "../../data/mockSantuaryProfile";

const swipeRoutes = ["/", "/sanctuary", "/calendar", "/stats", "/settings"];
const NAV_SWIPE_THRESHOLD = 60; // px offset needed to trigger a page change
const NAV_SWIPE_VELOCITY = 500; // fast flicks count even under the distance threshold

function MainLayout() {
    const sanctuaryProfile = mockSanctuary;
    const navigate = useNavigate();
    const location = useLocation();
    const currentIndex = swipeRoutes.indexOf(location.pathname);

    const goToPreviousPage = () => {
        const previousIndex = (currentIndex - 1 + swipeRoutes.length) % swipeRoutes.length;
        navigate(swipeRoutes[previousIndex]);
    };

    const goToNextPage = () => {
        const nextIndex = (currentIndex + 1) % swipeRoutes.length;
        navigate(swipeRoutes[nextIndex]);
    };

    function handleDragEnd(_: unknown, info: PanInfo) {
        const swipedLeft = info.offset.x < -NAV_SWIPE_THRESHOLD || info.velocity.x < -NAV_SWIPE_VELOCITY;
        const swipedRight = info.offset.x > NAV_SWIPE_THRESHOLD || info.velocity.x > NAV_SWIPE_VELOCITY;

        if (swipedLeft) goToNextPage();
        else if (swipedRight) goToPreviousPage();
    }

    return (
        <div className="main-layout min-h-screen">
            <header className="fixed top-0 left-1/2 z-50 w-full max-w-[430px] -translate-x-1/2 bg-[#fcf8f2]">
                <SanctuaryCard profile={sanctuaryProfile} />
            </header>

            <motion.main
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0}
                onDragEnd={handleDragEnd}
                className="page-content pt-[115px] pb-[80px] touch-pan-y"
            >
                <Outlet />
            </motion.main>

            <BottomNavigation />
        </div>
    );
}

export default MainLayout;