import { useEffect, useState } from "react";
import { getDailyQuote } from "../../data/mockQuoteDate";
import { QuoteIntroOverlay, QuoteCardInline } from "../../components/DailyQuoteCard/DailyQuoteCard";
import { AnimatePresence } from "framer-motion";
import TaskBoard from "../../components/TaskBoard/TaskBoard";


function Dashboard() {
    const [showIntro] = useState(() => sessionStorage.getItem("justLoggedIn") === "true");
    const [phase, setPhase] = useState<"intro" | "card">(showIntro ? "intro" : "card");
    const quote = getDailyQuote();

    useEffect(() => {
        if (showIntro) {
            sessionStorage.removeItem("justLoggedIn");
        }
    }, []);

    return (
        <>
            <AnimatePresence mode="popLayout">
                {phase === "intro" && (
                    <QuoteIntroOverlay quote={quote} onDismiss={() => setPhase("card")} />
                )}
            </AnimatePresence>

            <div className="px-2">
                {phase === "card" && <QuoteCardInline quote={quote} />}
                {/* SanctuaryCard and rest of your dashboard content go here */}

                <TaskBoard/>

            </div>
        </>
    );
}

export default Dashboard;