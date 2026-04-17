import {
  ChatMessage,
  SessionExport,
  SessionSettings,
  SuggestionBatch,
  TranscriptChunk,
} from "@/types";

export function createSessionExport(
  transcript: TranscriptChunk[],
  suggestionBatches: SuggestionBatch[],
  chatMessages: ChatMessage[],
  settings: SessionSettings
): SessionExport {
  return {
    exportedAt: new Date().toISOString(),
    transcript,
    suggestionBatches,
    chatMessages,
    settings: {
      liveContextWindow: settings?.liveContextWindow,
      detailedContextWindow: settings?.detailedContextWindow,
      transcriptionChunkDuration: settings?.transcriptionChunkDuration,
      temperature: settings?.temperature,
      topP: settings?.topP,
      whisperModel: settings?.whisperModel,
      suggestionModel: settings?.suggestionModel,
      chatModel: settings?.chatModel,
      avoidRepetition: settings?.avoidRepetition,
    },
  };
}

export function downloadSessionExport(sessionExport: SessionExport): void {
  const json = JSON.stringify(sessionExport, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `twinmind-session-${new Date().toISOString().split("T")[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
