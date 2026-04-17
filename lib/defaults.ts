import { SessionSettings } from "@/types";

export const SUPPORTED_TRANSCRIPTION_MODELS = [
  "whisper-large-v3-turbo",
  "whisper-large-v3",
] as const;

export const SUPPORTED_TEXT_MODELS = [
  "llama-3.3-70b-versatile",
  "openai/gpt-oss-120b",
  "openai/gpt-oss-20b",
  "llama-3.1-8b-instant",
] as const;

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
  whisperModel: "whisper-large-v3-turbo",
  suggestionModel: "llama-3.3-70b-versatile",
  chatModel: "llama-3.3-70b-versatile",
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
