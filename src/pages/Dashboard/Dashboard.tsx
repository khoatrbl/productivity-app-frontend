import { useEffect, useState } from "react";
import { getDailyQuote } from "../../services/quoteServices";
import { QuoteIntroOverlay, QuoteCardInline } from "../../components/DailyQuoteCard/DailyQuoteCard";
import { AnimatePresence } from "framer-motion";
import TaskBoard from "../../components/TaskBoard/TaskBoard";
import FocusSession from "../../components/FocusSession/FocusSession";
import ViewToggle, { type DashboardView } from "../../components/ViewToggle/ViewToggle";
import { useTasks } from "../../context/TaskContext";
import { useSanctuary } from "../../context/SanctuaryContext";
import type { DailyQuoteData } from "../../types/DailyQuoteData";
import PriorityFilterTabs, { type PriorityFilter } from "../../components/PriorityFilterTabs/PriorityFilterTabs";

function Dashboard() {
    const [showIntro] = useState(() => sessionStorage.getItem("justLoggedIn") === "true");
    const [phase, setPhase] = useState<"intro" | "card">(showIntro ? "intro" : "card");
    const [view, setView] = useState<DashboardView>("list");
    const { activeTask, visibleTasks } = useTasks();
    const { claimQuoteReward } = useSanctuary();
    const [quote, setQuote] = useState<DailyQuoteData | null>(null);
    const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>("ALL");
    

    useEffect(() => {
        if (showIntro) {
            sessionStorage.removeItem("justLoggedIn");
        }
    }, [showIntro]);

    useEffect(() => {
        setView(activeTask ? "focus" : "list");
    }, [!!activeTask]);

    useEffect(() => {
        getDailyQuote().then(setQuote).catch((err) => console.error("Failed to load daily quote:", err));
    }, []);

    
    async function handleQuoteDismiss() {
        setPhase("card");
        if (!quote) return;

        await claimQuoteReward();

        // Always true after this point, regardless of whether this specific
        // call granted new XP or was an idempotent no-op — don't use the
        // claim response's `claimed` flag here, it means something different.
        setQuote((prev) => (prev ? { ...prev, alreadyClaimed: true } : prev));
    }

    return (
        <>
            <AnimatePresence mode="popLayout">
                {phase === "intro" && quote && (
                    <QuoteIntroOverlay data={quote} onDismiss={handleQuoteDismiss} />
                )}
            </AnimatePresence>

            <div className="flex flex-col gap-2 px-2">
                {phase === "card" && quote && view !== "focus" && <QuoteCardInline data={quote} />}

                <div className="flex justify-center">
                    <ViewToggle value={view} onChange={setView} />
                </div>

                {view === "list" && (
                    <PriorityFilterTabs tasks={visibleTasks} value={priorityFilter} onChange={setPriorityFilter} />
                )}

                {view === "focus" ? <FocusSession /> : <TaskBoard priorityFilter={priorityFilter} />}
            </div>
        </>
    );
}

export default Dashboard;