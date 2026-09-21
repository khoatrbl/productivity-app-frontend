import { motion, type PanInfo } from "framer-motion";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import BottomNavigation from "../../components/BottomNavigation/BottomNavigation";
import SanctuaryCard from "../../components/SanctuaryCard/SanctuaryCard";
import { SanctuaryProvider } from "../../context/SanctuaryContext";
import { TaskProvider } from "../../context/TaskContext";

const swipeRoutes = ["/", "/sanctuary", "/calendar", "/stats", "/settings"];
const NAV_SWIPE_THRESHOLD = 60;
const NAV_SWIPE_VELOCITY = 500;

function MainLayout() {
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
        <SanctuaryProvider>
            <TaskProvider>
                <div className="main-layout min-h-screen">
                    <header className="fixed top-0 left-1/2 z-30 w-full max-w-[430px] -translate-x-1/2 bg-[#fcf8f2]">
                        <SanctuaryCard />
                    </header>

                    <motion.main
                        drag="x"
                        dragConstraints={{ left: 0, right: 0 }}
                        dragElastic={0}
                        onDragEnd={handleDragEnd}
                        className="page-content pt-[109px] touch-pan-y"
                        style={{ paddingBottom: "calc(var(--bottom-nav-height) + 1.5rem)" }}
                    >
                        <Outlet />
                    </motion.main>

                    <BottomNavigation />
                </div>
            </TaskProvider>
        </SanctuaryProvider>
    );
}

export default MainLayout;