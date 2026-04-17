import { DEFAULT_SETTINGS, STORAGE_KEYS } from "@/lib/defaults";
import { SessionSettings } from "@/types";

const SETTINGS_STORAGE_EVENT = "twinmind:settings-updated";

let cachedRawSettings: string | null = null;
let cachedSettings: SessionSettings = { ...DEFAULT_SETTINGS };

function parseStoredSettings(rawSettings: string | null): SessionSettings {
  if (!rawSettings) {
    return { ...DEFAULT_SETTINGS };
  }

  try {
    const parsed = JSON.parse(rawSettings);

    if (typeof parsed === "object" && parsed !== null) {
      return {
        ...DEFAULT_SETTINGS,
        ...(parsed as Partial<SessionSettings>),
      };
    }
  } catch (error) {
    console.error("Failed to load settings", error);
  }

  return { ...DEFAULT_SETTINGS };
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
  };
  cachedRawSettings = JSON.stringify(cachedSettings);

  window.localStorage.setItem(STORAGE_KEYS.SETTINGS, cachedRawSettings);
  window.dispatchEvent(new Event(SETTINGS_STORAGE_EVENT));
}
