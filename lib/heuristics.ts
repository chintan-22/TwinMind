import { ConversationSignals, TranscriptChunk } from "@/types";

export function detectConversationSignals(
  recentTranscript: TranscriptChunk[]
): ConversationSignals {
  const fullText = recentTranscript.map((c) => c.text).join(" ");
  const lowerText = fullText.toLowerCase();

  const questionMarks = (fullText.match(/\?/g) || []).length;
  const questionKeywords =
    /\b(what|when|where|why|how|who|which|should|could|would)\b/i;
  const questionDetected = questionMarks > 0 || questionKeywords.test(fullText);

  const decisionKeywords =
    /\b(decide|decision|choose|option|alternative|prefer|recommend|best|should go|go with)\b/i;
  const decisionLanguageDetected = decisionKeywords.test(fullText);

  const ambiguityKeywords =
    /\b(not sure|unclear|confusing|ambiguous|ambiguity|clarify|what do you mean|repeat that)\b/i;
  const ambiguityDetected = ambiguityKeywords.test(fullText);

  const actionKeywords =
    /\b(let's|will|we need to|we should|we must|action item|todo|next|follow up|owner|responsible)\b/i;
  const actionItemDetected = actionKeywords.test(fullText);

  const factualClaimKeywords =
    /\b(according to|data shows|statistics|studies show|research|last year|last quarter|increased|decreased|grew|dropped)\b/i;
  const factualClaimDetected = factualClaimKeywords.test(fullText);

  const clarificationKeywords =
    /\b(could you|can you|tell me|explain|more detail|specifically|example|instance)\b/i;
  const clarificationNeeded = clarificationKeywords.test(fullText);

  return {
    questionDetected,
    decisionLanguageDetected,
    ambiguityDetected,
    actionItemDetected,
    factualClaimDetected,
    clarificationNeeded,
  };
}

export function extractRecentContext(
  allTranscript: TranscriptChunk[],
  contextWindow: number
): TranscriptChunk[] {
  return allTranscript.slice(-contextWindow);
}

export function extractPreviousSuggestionTitles(
  batches: any[],
  maxRecent: number = 10
): string[] {
  const titles: string[] = [];
  for (const batch of batches.slice(-3)) {
    if (batch.suggestions) {
      for (const suggestion of batch.suggestions) {
        if (suggestion.title) {
          titles.push(suggestion.title);
        }
      }
    }
  }
  return titles.slice(-maxRecent);
}
