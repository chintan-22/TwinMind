import { TranscriptChunk } from "@/types";

export function getChatPrompt(
  userQuestion: string,
  transcriptContext: TranscriptChunk[]
): string {
  const transcriptText = transcriptContext
    .map((chunk) => `[${chunk.timestamp}] ${chunk.text}`)
    .join("\n");

  return `You are a meeting copilot helping users understand their conversation.

User question: "${userQuestion}"

Recent transcript:
${transcriptText}

Respond helpfully:
1. Ground your answer in the transcript when possible
2. Clearly distinguish between facts from the transcript and inferences
3. If the question requires external knowledge, note that explicitly
4. Keep your answer concise and focused
5. Use markdown for readability
6. Avoid hallucinating information not in the transcript

Provide a direct, markdown-formatted answer.`;
}
