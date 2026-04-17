"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { v4 as uuidv4 } from "uuid";
import { Settings, Download } from "lucide-react";
import {
  ChatResponse,
  SuggestionsResponse,
  TranscriptChunk,
  TranscriptionResponse,
  SuggestionBatch,
  ChatMessage,
  Suggestion,
} from "@/types";
import { TranscriptPanel } from "@/components/TranscriptPanel";
import { SuggestionsPanel } from "@/components/SuggestionsPanel";
import { ChatPanel } from "@/components/ChatPanel";
import { MicControls } from "@/components/MicControls";
import { getErrorMessage, readApiErrorMessage } from "@/lib/errors";
import {
  downloadSessionExport,
  createSessionExport,
} from "@/lib/exportSession";
import {
  getServerSettingsSnapshot,
  getStoredSettings,
  subscribeToSettings,
} from "@/lib/settingsStore";

function blobToBase64(audioBlob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result !== "string") {
        reject(new Error("Failed to read audio data"));
        return;
      }

      const base64Audio = reader.result.split(",")[1];

      if (!base64Audio) {
        reject(new Error("Failed to encode audio data"));
        return;
      }

      resolve(base64Audio);
    };

    reader.onerror = () => {
      reject(reader.error ?? new Error("Failed to read audio data"));
    };

    reader.readAsDataURL(audioBlob);
  });
}

export default function Home() {
  const settings = useSyncExternalStore(
    subscribeToSettings,
    getStoredSettings,
    getServerSettingsSnapshot
  );
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState<TranscriptChunk[]>([]);
  const [suggestionBatches, setSuggestionBatches] = useState<SuggestionBatch[]>(
    []
  );
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isGeneratingSuggestions, setIsGeneratingSuggestions] = useState(false);
  const [isGeneratingChat, setIsGeneratingChat] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const suggestionsIntervalRef = useRef<ReturnType<typeof setInterval> | null>(
    null
  );
  const transcriptRef = useRef<TranscriptChunk[]>([]);
  const suggestionBatchesRef = useRef<SuggestionBatch[]>([]);
  const isRecordingRef = useRef(false);
  const isGeneratingSuggestionsRef = useRef(false);
  const pendingSuggestionsGenerationRef = useRef(false);

  useEffect(() => {
    return () => {
      if (suggestionsIntervalRef.current) {
        clearInterval(suggestionsIntervalRef.current);
      }
    };
  }, []);

  // Generate suggestions
  const generateSuggestions = useCallback(
    async (options?: {
      transcript?: TranscriptChunk[];
      suggestionBatches?: SuggestionBatch[];
    }) => {
      if (isGeneratingSuggestionsRef.current) {
        pendingSuggestionsGenerationRef.current = true;
        return;
      }

      if (!settings.apiKey) {
        setError("Please set your Groq API key in settings");
        return;
      }

      const transcriptToUse = options?.transcript ?? transcriptRef.current;
      const batchesToUse =
        options?.suggestionBatches ?? suggestionBatchesRef.current;

      if (transcriptToUse.length === 0) {
        setError("No transcript to generate suggestions from");
        return;
      }

      isGeneratingSuggestionsRef.current = true;
      setIsGeneratingSuggestions(true);

      try {
        const response = await fetch("/api/suggestions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            transcript: transcriptToUse,
            suggestionBatches: batchesToUse,
            apiKey: settings.apiKey,
            contextWindow: settings.liveContextWindow,
            model: settings.suggestionModel,
            temperature: settings.temperature,
            topP: settings.topP,
          }),
        });

        if (!response.ok) {
          setError(
            await readApiErrorMessage(response, "Failed to generate suggestions")
          );
          return;
        }

        const data = (await response.json()) as SuggestionsResponse;
        const nextBatches = [data.batch, ...suggestionBatchesRef.current];
        suggestionBatchesRef.current = nextBatches;
        setSuggestionBatches(nextBatches);
        setError(null);
      } catch (error: unknown) {
        setError(getErrorMessage(error, "Suggestions error"));
      } finally {
        isGeneratingSuggestionsRef.current = false;
        setIsGeneratingSuggestions(false);

        if (pendingSuggestionsGenerationRef.current) {
          pendingSuggestionsGenerationRef.current = false;
          void generateSuggestions();
        }
      }
    },
    [
      settings.apiKey,
      settings.liveContextWindow,
      settings.suggestionModel,
      settings.temperature,
      settings.topP,
    ]
  );

  // Handle audio chunk from microphone
  const handleAudioChunk = useCallback(
    async (audioBlob: Blob) => {
      if (!settings.apiKey) {
        setError("Please set your Groq API key in settings");
        return;
      }

      setIsTranscribing(true);

      try {
        const base64Audio = await blobToBase64(audioBlob);

        const response = await fetch("/api/transcribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            audioBlob: base64Audio,
            mimeType: audioBlob.type || "audio/webm",
            apiKey: settings.apiKey,
            model: settings.whisperModel,
          }),
        });

        if (!response.ok) {
          setError(
            await readApiErrorMessage(response, "Transcription failed")
          );
          return;
        }

        const data = (await response.json()) as TranscriptionResponse;

        if (data.text) {
          const chunk: TranscriptChunk = {
            id: uuidv4(),
            text: data.text,
            timestamp: new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            }),
            duration: data.duration || 0,
          };
          const nextTranscript = [...transcriptRef.current, chunk];

          transcriptRef.current = nextTranscript;
          setTranscript(nextTranscript);

          if (!isRecordingRef.current) {
            void generateSuggestions({ transcript: nextTranscript });
          }
        }
      } catch (error: unknown) {
        setError(getErrorMessage(error, "Transcription error"));
      } finally {
        setIsTranscribing(false);
      }
    },
    [generateSuggestions, settings.apiKey, settings.whisperModel]
  );

  // Handle suggestion click
  const handleSuggestionClick = useCallback(
    async (suggestion: Suggestion) => {
      if (!settings.apiKey) {
        setError("Please set your Groq API key in settings");
        return;
      }

      setIsGeneratingChat(true);

      try {
        const response = await fetch("/api/detailed-answer", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            suggestion: suggestion.title + ": " + suggestion.preview,
            transcript,
            apiKey: settings.apiKey,
            contextWindow: settings.detailedContextWindow,
            model: settings.chatModel,
            temperature: settings.temperature,
            topP: settings.topP,
          }),
        });

        if (!response.ok) {
          setError(await readApiErrorMessage(response, "Failed to generate answer"));
          return;
        }

        const data = (await response.json()) as ChatResponse;
        setChatMessages((prev) => [...prev, data.message]);
        setError(null);
      } catch (error: unknown) {
        setError(getErrorMessage(error, "Chat error"));
      } finally {
        setIsGeneratingChat(false);
      }
    },
    [settings, transcript]
  );

  // Handle chat message
  const handleSendMessage = useCallback(
    async (userMessage: string) => {
      if (!settings.apiKey) {
        setError("Please set your Groq API key in settings");
        return;
      }

      // Add user message to chat
      const userMsg: ChatMessage = {
        id: uuidv4(),
        role: "user",
        content: userMessage,
        timestamp: new Date().toISOString(),
      };
      setChatMessages((prev) => [...prev, userMsg]);

      setIsGeneratingChat(true);

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userMessage,
            transcript,
            apiKey: settings.apiKey,
            contextWindow: settings.detailedContextWindow,
            model: settings.chatModel,
            temperature: settings.temperature,
            topP: settings.topP,
          }),
        });

        if (!response.ok) {
          setError(await readApiErrorMessage(response, "Failed to send message"));
          return;
        }

        const data = (await response.json()) as ChatResponse;
        setChatMessages((prev) => [...prev, data.message]);
        setError(null);
      } catch (error: unknown) {
        setError(getErrorMessage(error, "Chat error"));
      } finally {
        setIsGeneratingChat(false);
      }
    },
    [settings, transcript]
  );

  // Start recording
  const handleStartRecording = useCallback(() => {
    setError(null);
    isRecordingRef.current = true;
    setIsRecording(true);

    // Set up suggestions refresh interval
    const intervalMs = settings.transcriptionChunkDuration * 1000 + 2000; // Add 2s buffer for transcription

    if (suggestionsIntervalRef.current) {
      clearInterval(suggestionsIntervalRef.current);
    }

    suggestionsIntervalRef.current = setInterval(() => {
      generateSuggestions();
    }, intervalMs * 2); // Refresh suggestions every 2 transcription cycles
  }, [settings, generateSuggestions]);

  // Stop recording
  const handleStopRecording = useCallback(() => {
    isRecordingRef.current = false;
    setIsRecording(false);
    if (suggestionsIntervalRef.current) {
      clearInterval(suggestionsIntervalRef.current);
    }
  }, []);

  // Handle manual refresh
  const handleRefreshSuggestions = useCallback(() => {
    generateSuggestions();
  }, [generateSuggestions]);

  // Export session
  const handleExportSession = useCallback(() => {
    const sessionExport = createSessionExport(
      transcript,
      suggestionBatches,
      chatMessages,
      settings
    );
    downloadSessionExport(sessionExport);
  }, [transcript, suggestionBatches, chatMessages, settings]);

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-white/70 bg-white/78 shadow-sm backdrop-blur-xl">
        <div className="mx-auto w-full max-w-[1600px] px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                TwinMind
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Real-time meeting copilot for transcript, suggestions, and
                grounded chat.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 xl:justify-end">
              {settings.apiKey ? (
                <div className="rounded-full bg-emerald-50 px-3 py-1.5 text-sm font-medium text-emerald-700">
                  API key ready
                </div>
              ) : (
                <div className="rounded-full bg-red-50 px-3 py-1.5 text-sm font-medium text-red-700">
                  API key needed
                </div>
              )}

              {isRecording && (
                <div className="rounded-full bg-red-50 px-3 py-1.5 text-sm font-medium text-red-700">
                  Recording live
                </div>
              )}

              {isTranscribing && (
                <div className="rounded-full bg-sky-50 px-3 py-1.5 text-sm font-medium text-sky-700">
                  Transcribing
                </div>
              )}

              {isGeneratingSuggestions && (
                <div className="rounded-full bg-amber-50 px-3 py-1.5 text-sm font-medium text-amber-700">
                  Updating suggestions
                </div>
              )}

              {!settings.apiKey && (
                <div className="rounded-full bg-red-50 px-3 py-1.5 text-sm font-medium text-red-700">
                  Add your Groq key in Settings
                </div>
              )}

              {error && (
                <div className="rounded-2xl bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
                  {error}
                </div>
              )}

              <button
                onClick={handleExportSession}
                disabled={transcript.length === 0}
                className="flex shrink-0 items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                title="Export session as JSON"
                type="button"
              >
                <Download size={16} />
                Export
              </button>

              <Link
                href="/settings"
                className="flex shrink-0 items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
                title="Open settings"
              >
                <Settings size={16} />
                Settings
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content - 3 Column Layout */}
      <main className="mx-auto flex w-full max-w-[1600px] flex-1 flex-col gap-4 px-4 py-4 sm:px-6 lg:px-8 xl:grid xl:grid-cols-[1.05fr_0.95fr_1.1fr] xl:items-stretch">
        {/* Left Column: Transcript + Microphone */}
        <section className="flex min-h-0 flex-col gap-4">
          <div className="rounded-[28px] border border-slate-200/80 bg-white/88 p-4 shadow-[0_20px_60px_-40px_rgba(15,23,42,0.45)] backdrop-blur sm:p-5">
            <MicControls
              onAudioChunk={handleAudioChunk}
              chunkDuration={settings.transcriptionChunkDuration}
              isRecording={isRecording}
              onRecordingChange={(recording) => {
                if (recording) {
                  handleStartRecording();
                } else {
                  handleStopRecording();
                }
              }}
            />
          </div>
          <div className="min-h-0 flex-1">
            <TranscriptPanel
              transcript={transcript}
              isLoading={isTranscribing}
            />
          </div>
        </section>

        {/* Middle Column: Suggestions */}
        <section className="min-h-0">
          <div className="h-full min-h-0">
            <SuggestionsPanel
              batches={suggestionBatches}
              onSuggestionClick={handleSuggestionClick}
              onRefresh={handleRefreshSuggestions}
              isLoading={isGeneratingSuggestions}
            />
          </div>
        </section>

        {/* Right Column: Chat */}
        <section className="min-h-0">
          <div className="h-full min-h-0">
            <ChatPanel
              messages={chatMessages}
              onSendMessage={handleSendMessage}
              isLoading={isGeneratingChat}
            />
          </div>
        </section>
      </main>
    </div>
  );
}
