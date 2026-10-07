import { motion, type PanInfo } from "framer-motion";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import BottomNavigation from "../components/BottomNavigation/BottomNavigation";
import UserProfileCard from "../components/UserProfileCard/UserProfileCard";
import { BOTTOM_NAV_TOTAL_HEIGHT } from "../constants/layout";
import { useTasks } from "../context/TaskContext";
import { TaskCompleteOverlay } from "../components/TaskCompleteOverlay/TaskCompleteOverlay";
import { useEffect } from "react";
import { prefetchShopItems } from "../services/shopServices";

const swipeRoutes = ["/", "/sanctuary", "/calendar", "/shop"];
const NAV_SWIPE_THRESHOLD = 60;
const NAV_SWIPE_VELOCITY = 500;

function MainLayout() {
    const navigate = useNavigate();
    const location = useLocation();
    const { completion, dismissCompletion } = useTasks();

    const currentIndex = swipeRoutes.indexOf(location.pathname);

    useEffect(() => {
        prefetchShopItems();
    }, []);

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
            <header className="fixed top-0 left-1/2 z-30 w-full max-w-[430px] -translate-x-1/2 bg-[#fcf8f2]">
                <UserProfileCard />
            </header>

            <motion.main
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0}
                onDragEnd={handleDragEnd}
                className="page-content pt-[109px] touch-pan-y"
                style={{ paddingBottom: `calc(${BOTTOM_NAV_TOTAL_HEIGHT} + 1.5rem)` }}
            >
                <Outlet />
            </motion.main>

            <BottomNavigation onAddTask={() => navigate("/tasks/new")} />

            {completion && (
                <TaskCompleteOverlay key={completion.id} completion={completion} onDismiss={dismissCompletion} />
            )}
        </div>
    );
}

export default MainLayout;