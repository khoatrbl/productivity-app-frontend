import { useEffect, useState } from "react";
import { getDailyQuote } from "../../data/mockQuoteDate";
import { QuoteIntroOverlay, QuoteCardInline } from "../../components/DailyQuoteCard/DailyQuoteCard";
import { AnimatePresence } from "framer-motion";

function Dashboard() {
    // const [showIntro] = useState(() => sessionStorage.getItem("justLoggedIn") === "true");
    const [showIntro] = useState(true);
    const [phase, setPhase] = useState<"intro" | "card">(showIntro ? "intro" : "card");
    const quote = getDailyQuote();

    useEffect(() => {
        if (showIntro) {
            // sessionStorage.removeItem("justLoggedIn");
        }

        if (phase !== "intro") {
            return;
        }

        const timer = setTimeout(() => setPhase("card"), 5000);

        return () => clearTimeout(timer);
    }, []);

    return (
        <>
            <AnimatePresence mode="popLayout">
                {phase === "intro" && <QuoteIntroOverlay quote={quote} />}
            </AnimatePresence>

            <div className="px-2">
                {phase === "card" && <QuoteCardInline quote={quote} />}
                {/* SanctuaryCard and rest of your dashboard content go here */}
            </div>
        </>
    );
}

export default Dashboard;