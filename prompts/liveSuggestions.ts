import { ConversationSignals, TranscriptChunk } from "@/types";

export function getLiveSuggestionsPrompt(
  recentTranscript: TranscriptChunk[],
  signals: ConversationSignals,
  previousSuggestionTitles: string[] = []
): string {
  const transcriptText = recentTranscript
    .map((chunk) => `[${chunk.timestamp}] ${chunk.text}`)
    .join("\n");

  const signalsContext = `
Conversation signals detected:
- Question asked: ${signals.questionDetected}
- Decision language: ${signals.decisionLanguageDetected}
- Ambiguity: ${signals.ambiguityDetected}
- Action items: ${signals.actionItemDetected}
- Factual claim: ${signals.factualClaimDetected}
- Needs clarification: ${signals.clarificationNeeded}
`;

  const avoidanceContext =
    previousSuggestionTitles.length > 0
      ? `\nDo NOT suggest these topics again (unless critical): ${previousSuggestionTitles.join(", ")}\n`
      : "";

  return `You are an intelligent meeting copilot analyzing a live conversation. Your job is to generate exactly 3 diverse, actionable suggestions that would be useful RIGHT NOW to improve this conversation.

Recent transcript:
${transcriptText}

${signalsContext}

${avoidanceContext}

IMPORTANT CONSTRAINTS:
1. Return EXACTLY 3 suggestions
2. Vary the suggestion types across the batch
3. Each suggestion must be concrete and immediately useful
4. Previews should be concise (under 15 words)
5. Avoid generic fluff like "Discuss X" or "Consider Y"
6. Focus on current conversation state
7. Return ONLY valid JSON, no other text

Return a JSON array with exactly this structure:
[
  {
    "id": "suggestion_1",
    "type": "question|talking_point|answer|fact_check|clarification|next_step",
    "title": "Short title (max 10 words)",
    "preview": "Concise useful preview that stands alone (max 15 words)"
  },
  ...
]

Examples of GOOD suggestions:
- Type: question, Title: "Q3 Launch Dependencies", Preview: "What could delay the Q3 launch? Clarify blockers now."
- Type: fact_check, Title: "Verify Churn Claim", Preview: "Did churn really drop last month? Check before committing."
- Type: clarification, Title: "Budget Status", Preview: "Is the budget approved or still pending final approval?"
- Type: next_step, Title: "Timeline for Approval", Preview: "Who signs off and by when? Establish clear ownership."

Generate 3 suggestions now:`;
}

export function parseJson<T>(text: string): T | null {
  const jsonMatch = text.match(/\[[\s\S]*\]/);
  if (!jsonMatch) return null;
  try {
    return JSON.parse(jsonMatch[0]) as T;
  } catch {
    return null;
  }
}
