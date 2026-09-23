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

function Dashboard() {
    const [showIntro] = useState(() => sessionStorage.getItem("justLoggedIn") === "true");
    const [phase, setPhase] = useState<"intro" | "card">(showIntro ? "intro" : "card");
    const [view, setView] = useState<DashboardView>("list");
    const { activeTask } = useTasks();
    const { addExp, claimQuoteReward } = useSanctuary();
    const [quote, setQuote] = useState<DailyQuoteData | null>(null);

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
        if (quote) {
            await claimQuoteReward(); // backend decides if this actually grants anything
    }
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

            {view === "focus" ? <FocusSession /> : <TaskBoard />}
        </div>
    </>
);
}

export default Dashboard;