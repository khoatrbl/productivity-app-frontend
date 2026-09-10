// src/lib/quotes.ts
export const dailyQuotes = [
  "Even 2% progress counts today.",
  "Small steps still move you forward.",
  "Consistency beats intensity.",
  "You don't have to finish, just start.",
  "Rest is part of the process, not the opposite of it.",
];

// Same quote all day for everyone, rotates daily
export function getDailyQuote(): string {
  const dayIndex = Math.floor(Date.now() / 86_400_000);
  return dailyQuotes[dayIndex % dailyQuotes.length];
}