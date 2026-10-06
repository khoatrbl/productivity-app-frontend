interface MockCapybaraProps {
  mood?: "awake" | "sleepy" | "happy";
  width?: number;
}

function MockCapybara({ mood = "awake", width = 150 }: MockCapybaraProps) {
  return (
    <svg width={width} height={(width * 110) / 150} viewBox="0 0 150 110" aria-hidden>
      <ellipse cx="72" cy="72" rx="58" ry="34" fill="#a9754a" />
      <ellipse cx="112" cy="50" rx="30" ry="26" fill="#b98556" />
      <ellipse cx="104" cy="28" rx="6" ry="5" fill="#8a5a36" />
      <rect x="128" y="48" width="16" height="16" rx="7" fill="#8a5a36" />
      {mood === "sleepy" && (
        <path d="M112 44 q5 4 10 0" stroke="#3b2618" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      )}
      {mood === "happy" && (
        <path d="M112 45 q5 -5 10 0" stroke="#3b2618" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      )}
      {mood === "awake" && <circle cx="117" cy="44" r="3.5" fill="#3b2618" />}
      <ellipse cx="106" cy="56" rx="5" ry="3" fill="#f3a6a0" opacity={mood === "happy" ? 0.8 : 0.6} />
      <circle cx="98" cy="18" r="9" fill="#f5b83d" />
      <rect x="96" y="7" width="3" height="5" rx="1" fill="#4c7a3a" />
    </svg>
  );
}

export default MockCapybara;