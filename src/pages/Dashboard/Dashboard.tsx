import { useEffect, useState } from "react";
import { getDailyQuote } from "../../data/mockQuoteDate";
import { QuoteIntroOverlay, QuoteCardInline } from "../../components/DailyQuoteCard/DailyQuoteCard";
import { AnimatePresence } from "framer-motion";
import TaskBoard from "../../components/TaskBoard/TaskBoard";
import FocusSession from "../../components/FocusSession/FocusSession";
import ViewToggle, { type DashboardView } from "../../components/ViewToggle/ViewToggle";
import { useTasks } from "../../context/TaskContext";

function Dashboard() {
    const [showIntro] = useState(() => sessionStorage.getItem("justLoggedIn") === "true");
    const [phase, setPhase] = useState<"intro" | "card">(showIntro ? "intro" : "card");
    const [view, setView] = useState<DashboardView>("list");
    const { activeTask } = useTasks();
    const quote = getDailyQuote();

    useEffect(() => {
        if (showIntro) {
            sessionStorage.removeItem("justLoggedIn");
        }
    }, [showIntro]);

    // Nudges into Focus view whenever a task starts/stops being active —
    // still freely overridable via the toggle afterward. Assumption worth
    // confirming: is this auto-switch wanted, or should the view always
    // stay exactly where the user last left it?
    useEffect(() => {
        setView(activeTask ? "focus" : "list");
    }, [!!activeTask]);

    return (
        <>
            <AnimatePresence mode="popLayout">
                {phase === "intro" && (
                    <QuoteIntroOverlay quote={quote} onDismiss={() => setPhase("card")} />
                )}
            </AnimatePresence>

            <div className="px-2">
                {phase === "card" && <QuoteCardInline quote={quote} />}

                <div className="mb-2 flex justify-center">
                    <ViewToggle value={view} onChange={setView} />
                </div>

                {view === "focus" ? <FocusSession /> : <TaskBoard />}
            </div>
        </>
    );
}

export default Dashboard;