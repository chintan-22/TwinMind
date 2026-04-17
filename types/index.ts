export type SuggestionType =
  | "question"
  | "talking_point"
  | "answer"
  | "fact_check"
  | "clarification"
  | "next_step";

export interface Suggestion {
  id: string;
  type: SuggestionType;
  title: string;
  preview: string;
}

export interface SuggestionBatch {
  id: string;
  createdAt: string;
  suggestions: Suggestion[];
}

export interface TranscriptChunk {
  id: string;
  text: string;
  timestamp: string;
  duration: number;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  relatedSuggestion?: string;
}

export interface SessionSettings {
  apiKey: string;
  livesuggestionPrompt: string;
  detailedAnswerPrompt: string;
  chatPrompt: string;
  liveContextWindow: number;
  detailedContextWindow: number;
  transcriptionChunkDuration: number;
  temperature?: number;
  topP?: number;
  whisperModel: string;
  suggestionModel: string;
  chatModel: string;
  avoidRepetition: boolean;
}

export interface SessionExport {
  exportedAt: string;
  transcript: TranscriptChunk[];
  suggestionBatches: SuggestionBatch[];
  chatMessages: ChatMessage[];
  settings: Partial<SessionSettings>;
}

export interface ConversationSignals {
  questionDetected: boolean;
  decisionLanguageDetected: boolean;
  ambiguityDetected: boolean;
  actionItemDetected: boolean;
  factualClaimDetected: boolean;
  clarificationNeeded: boolean;
}

export interface TranscriptionResponse {
  text: string;
  duration: number;
}

export interface SuggestionsResponse {
  suggestions: Suggestion[];
  batch: SuggestionBatch;
}

export interface ChatResponse {
  message: ChatMessage;
}
