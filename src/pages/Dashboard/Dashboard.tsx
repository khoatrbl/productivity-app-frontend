import { useState } from "react";
import QuoteOverlay from "../../components/QuoteOverlay/QuoteOverlay";

function Dashboard() {
    const [quoteMode, setQuoteMode] = useState<'fullscreen' | 'minimized'>('fullscreen');

    
    return (
        <div className="dashboard">
            <QuoteOverlay mode={quoteMode} onContinue={() => setQuoteMode('minimized')}/>
        </div>
    )
}

export default Dashboard;