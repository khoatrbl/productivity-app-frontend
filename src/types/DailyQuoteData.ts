export interface DailyQuoteData {
  label: string;   // e.g. "Mindful Pulse"
  title: string;   // short teaser shown collapsed, e.g. "Gentle pacing today"
  quote: string;   // full quote text, shown only when expanded
  author: string;  // e.g. "Capy Zen Master"
  calmExp: number;  // e.g. 10
  alreadyClaimed: boolean; 
}