import {
  DEFAULT_SETTINGS,
  STORAGE_KEYS,
  SUPPORTED_TEXT_MODELS,
  SUPPORTED_TRANSCRIPTION_MODELS,
} from "@/lib/defaults";
import { SessionSettings } from "@/types";

const SETTINGS_STORAGE_EVENT = "twinmind:settings-updated";
const DEFAULT_SETTINGS_SNAPSHOT: SessionSettings = { ...DEFAULT_SETTINGS };

let cachedRawSettings: string | null = null;
let cachedSettings: SessionSettings = DEFAULT_SETTINGS_SNAPSHOT;

function parseStoredSettings(rawSettings: string | null): SessionSettings {
  if (!rawSettings) {
    return DEFAULT_SETTINGS_SNAPSHOT;
  }

  try {
    const parsed = JSON.parse(rawSettings);

    if (typeof parsed === "object" && parsed !== null) {
      const mergedSettings = {
        ...DEFAULT_SETTINGS,
        ...(parsed as Partial<SessionSettings>),
      };

      return {
        ...mergedSettings,
        whisperModel: normalizeTranscriptionModel(mergedSettings.whisperModel),
        suggestionModel: normalizeTextModel(mergedSettings.suggestionModel),
        chatModel: normalizeTextModel(mergedSettings.chatModel),
      };
    }
  } catch (error) {
    console.error("Failed to load settings", error);
  }

  return DEFAULT_SETTINGS_SNAPSHOT;
}

function normalizeTextModel(model: string): string {
  const deprecatedModelMap: Record<string, string> = {
    "mixtral-8x7b-32768": "llama-3.3-70b-versatile",
    "llama-3.1-70b-versatile": "llama-3.3-70b-versatile",
    "llama3-70b-8192": "llama-3.3-70b-versatile",
    "llama3-8b-8192": "llama-3.1-8b-instant",
  };

  const normalizedModel = deprecatedModelMap[model] ?? model;

  return SUPPORTED_TEXT_MODELS.includes(
    normalizedModel as (typeof SUPPORTED_TEXT_MODELS)[number]
  )
    ? normalizedModel
    : DEFAULT_SETTINGS.chatModel;
}

function normalizeTranscriptionModel(model: string): string {
  const deprecatedModelMap: Record<string, string> = {
    "distil-whisper-large-v3-en": "whisper-large-v3-turbo",
  };

  const normalizedModel = deprecatedModelMap[model] ?? model;

  return SUPPORTED_TRANSCRIPTION_MODELS.includes(
    normalizedModel as (typeof SUPPORTED_TRANSCRIPTION_MODELS)[number]
  )
    ? normalizedModel
    : DEFAULT_SETTINGS.whisperModel;
}

export function getStoredSettings(): SessionSettings {
  if (typeof window === "undefined") {
    return cachedSettings;
  }

  const rawSettings = window.localStorage.getItem(STORAGE_KEYS.SETTINGS);

  if (rawSettings === cachedRawSettings) {
    return cachedSettings;
  }

  cachedRawSettings = rawSettings;
  cachedSettings = parseStoredSettings(rawSettings);

  return cachedSettings;
}

export function subscribeToSettings(onStoreChange: () => void): () => void {
  if (typeof window === "undefined") {
    return () => {};
  }

  const handleStorage = (event: StorageEvent) => {
    if (event.key && event.key !== STORAGE_KEYS.SETTINGS) {
      return;
    }

    onStoreChange();
  };

  const handleInternalChange = () => {
    onStoreChange();
  };

  window.addEventListener("storage", handleStorage);
  window.addEventListener(SETTINGS_STORAGE_EVENT, handleInternalChange);

  return () => {
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener(SETTINGS_STORAGE_EVENT, handleInternalChange);
  };
}

export function saveSettings(settings: SessionSettings): void {
  if (typeof window === "undefined") {
    return;
  }

  cachedSettings = {
    ...DEFAULT_SETTINGS,
    ...settings,
    whisperModel: normalizeTranscriptionModel(settings.whisperModel),
    suggestionModel: normalizeTextModel(settings.suggestionModel),
    chatModel: normalizeTextModel(settings.chatModel),
  };
  cachedRawSettings = JSON.stringify(cachedSettings);

  window.localStorage.setItem(STORAGE_KEYS.SETTINGS, cachedRawSettings);
  window.dispatchEvent(new Event(SETTINGS_STORAGE_EVENT));
}

export function getServerSettingsSnapshot(): SessionSettings {
  return DEFAULT_SETTINGS_SNAPSHOT;
}
