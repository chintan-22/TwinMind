import { SessionSettings } from "@/types";

export const DEFAULT_SETTINGS: SessionSettings = {
  apiKey: "",
  livesuggestionPrompt: "", // Will be generated dynamically
  detailedAnswerPrompt: "", // Will be generated dynamically
  chatPrompt: "", // Will be generated dynamically
  liveContextWindow: 3,
  detailedContextWindow: 8,
  transcriptionChunkDuration: 30,
  temperature: 0.7,
  topP: 0.9,
  whisperModel: "whisper-large-v3",
  suggestionModel: "mixtral-8x7b-32768",
  chatModel: "mixtral-8x7b-32768",
  avoidRepetition: true,
};

export function getStorageKey(key: string): string {
  return `twinmind_${key}`;
}

export const STORAGE_KEYS = {
  API_KEY: getStorageKey("apiKey"),
  SETTINGS: getStorageKey("settings"),
  SESSION_DATA: getStorageKey("sessionData"),
};
