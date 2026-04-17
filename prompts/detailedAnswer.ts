import { TranscriptChunk } from "@/types";

export function getDetailedAnswerPrompt(
  suggestion: string,
  transcriptContext: TranscriptChunk[]
): string {
  const transcriptText = transcriptContext
    .map((chunk) => `[${chunk.timestamp}] ${chunk.text}`)
    .join("\n");

  return `You are a meeting copilot providing detailed context and actionable advice based on a conversation transcript.

The user clicked on this suggestion: "${suggestion}"

Full recent transcript:
${transcriptText}

Provide a detailed, concrete response that:
1. Directly addresses the suggestion in the context of the conversation
2. Includes specific talking points, facts, or caveats from the transcript
3. Offers practical next steps or phrasing if applicable
4. Is grounded in what was actually said (distinguish facts from inferences)
5. Is concise but thorough (3-5 short paragraphs max)
6. Uses markdown formatting for readability (bullets, emphasis, etc.)

Respond with markdown content only, no JSON.`;
}
