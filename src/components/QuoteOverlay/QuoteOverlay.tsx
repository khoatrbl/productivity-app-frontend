
type QuoteMode = 'fullscreen' | 'minimized'

interface QuoteOverlayProps {
  mode: QuoteMode
  onContinue: () => void
}

function QuoteOverlay({ mode, onContinue }: QuoteOverlayProps) {
  return (
    <div className={`quote quote-${mode}`}>
      <p>
        "The secret of getting ahead is getting started."
      </p>

      {mode === 'fullscreen' && (
        <button onClick={onContinue}>
          Continue
        </button>
      )}
    </div>
  )
}

export default QuoteOverlay

