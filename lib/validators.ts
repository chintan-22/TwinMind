import { Suggestion, SuggestionBatch, SuggestionType } from "@/types";
import { v4 as uuidv4 } from "uuid";

const SUGGESTION_TYPES = [
  "question",
  "talking_point",
  "answer",
  "fact_check",
  "clarification",
  "next_step",
] as const satisfies SuggestionType[];

function isSuggestionType(value: string): value is SuggestionType {
  return SUGGESTION_TYPES.includes(value as SuggestionType);
}

export function validateAndSanitizeSuggestions(
  data: unknown
): Suggestion[] | null {
  if (!Array.isArray(data)) return null;

  const suggestions: Suggestion[] = [];

  for (const item of data) {
    if (
      typeof item === "object" &&
      item !== null &&
      "type" in item &&
      "title" in item &&
      "preview" in item
    ) {
      const suggestionType = String(item.type);

      if (!isSuggestionType(suggestionType)) {
        continue;
      }

      suggestions.push({
        id:
          "id" in item && typeof item.id === "string" && item.id
            ? item.id
            : uuidv4(),
        type: suggestionType,
        title: String(item.title).slice(0, 100),
        preview: String(item.preview).slice(0, 200),
      });
    }
  }

  return suggestions.length > 0 ? suggestions : null;
}

export function createSuggestionBatch(
  suggestions: Suggestion[]
): SuggestionBatch {
  return {
    id: uuidv4(),
    createdAt: new Date().toISOString(),
    suggestions,
  };
}

export function validateApiKey(key: string): boolean {
  return !!(key && key.trim().length > 10);
}

export function validateTranscription(text: string): boolean {
  return !!(text && text.trim().length > 0);
}
