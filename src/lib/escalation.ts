// Keywords that flag a customer message for owner attention.
// Order matters only insofar as we surface all matches.
export const ESCALATION_KEYWORDS = [
  "emergency",
  "infestation",
  "angry",
  "cancel",
  "lawsuit",
  "unhappy",
  "serious problem",
  "terrible",
  "refund",
] as const;

export type EscalationKeyword = (typeof ESCALATION_KEYWORDS)[number];

export interface EscalationResult {
  escalated: boolean;
  keywords: EscalationKeyword[];
}

/**
 * Detect escalation keywords in a customer message. Case-insensitive,
 * matches whole words for single-word keywords, substring for phrases.
 */
export function detectEscalation(text: string): EscalationResult {
  if (!text) return { escalated: false, keywords: [] };
  const haystack = text.toLowerCase();
  const matched: EscalationKeyword[] = [];
  for (const keyword of ESCALATION_KEYWORDS) {
    if (keyword.includes(" ")) {
      if (haystack.includes(keyword)) matched.push(keyword);
    } else {
      const re = new RegExp(`\\b${escapeRegex(keyword)}\\b`, "i");
      if (re.test(text)) matched.push(keyword);
    }
  }
  return { escalated: matched.length > 0, keywords: matched };
}

function escapeRegex(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
