"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { v4 as uuidv4 } from "uuid";
import { Settings, Download } from "lucide-react";
import {
  SessionSettings,
  TranscriptChunk,
  SuggestionBatch,
  ChatMessage,
  Suggestion,
} from "@/types";
import { TranscriptPanel } from "@/components/TranscriptPanel";
import { SuggestionsPanel } from "@/components/SuggestionsPanel";
import { ChatPanel } from "@/components/ChatPanel";
import { MicControls } from "@/components/MicControls";
import { SettingsDialog } from "@/components/SettingsDialog";
import { DEFAULT_SETTINGS, STORAGE_KEYS } from "@/lib/defaults";
import {
  downloadSessionExport,
  createSessionExport,
} from "@/lib/exportSession";

export default function Home() {
  const [settings, setSettings] = useState<SessionSettings>(DEFAULT_SETTINGS);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
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
  const suggestionsIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings((prev) => ({ ...prev, ...parsed }));
      } catch (e) {
        console.error("Failed to load settings", e);
      }
    }
  }, []);

  // Save settings to localStorage when they change
  const handleSaveSettings = useCallback((newSettings: SessionSettings) => {
    setSettings(newSettings);
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(newSettings));
    setError(null);
  }, []);

  // Handle audio chunk from microphone
  const handleAudioChunk = useCallback(
    async (audioBlob: Blob) => {
      if (!settings.apiKey) {
        setError("Please set your Groq API key in settings");
        return;
      }

      setIsTranscribing(true);

      try {
        const reader = new FileReader();
        reader.onload = async (e) => {
          const base64Audio = (e.target?.result as string).split(",")[1];

          const response = await fetch("/api/transcribe", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              audioBlob: base64Audio,
              apiKey: settings.apiKey,
              model: settings.whisperModel,
            }),
          });

          if (!response.ok) {
            const errorData = await response.json();
            setError(errorData.error || "Transcription failed");
            setIsTranscribing(false);
            return;
          }

          const data = await response.json();
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
            setTranscript((prev) => [...prev, chunk]);
          }

          setIsTranscribing(false);
        };
        reader.readAsDataURL(audioBlob);
      } catch (err: any) {
        setError(err.message || "Transcription error");
        setIsTranscribing(false);
      }
    },
    [settings]
  );

  // Generate suggestions
  const generateSuggestions = useCallback(async () => {
    if (!settings.apiKey) {
      setError("Please set your Groq API key in settings");
      return;
    }

    if (transcript.length === 0) {
      setError("No transcript to generate suggestions from");
      return;
    }

    setIsGeneratingSuggestions(true);

    try {
      const response = await fetch("/api/suggestions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transcript,
          suggestionBatches,
          apiKey: settings.apiKey,
          contextWindow: settings.liveContextWindow,
          model: settings.suggestionModel,
          temperature: settings.temperature,
          topP: settings.topP,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.error || "Failed to generate suggestions");
        setIsGeneratingSuggestions(false);
        return;
      }

      const data = await response.json();
      setSuggestionBatches((prev) => [data.batch, ...prev]);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Suggestions error");
    } finally {
      setIsGeneratingSuggestions(false);
    }
  }, [settings, transcript, suggestionBatches]);

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
          const errorData = await response.json();
          setError(errorData.error || "Failed to generate answer");
          setIsGeneratingChat(false);
          return;
        }

        const data = await response.json();
        setChatMessages((prev) => [...prev, data.message]);
        setError(null);
      } catch (err: any) {
        setError(err.message || "Chat error");
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
          const errorData = await response.json();
          setError(errorData.error || "Failed to send message");
          setIsGeneratingChat(false);
          return;
        }

        const data = await response.json();
        setChatMessages((prev) => [...prev, data.message]);
        setError(null);
      } catch (err: any) {
        setError(err.message || "Chat error");
      } finally {
        setIsGeneratingChat(false);
      }
    },
    [settings, transcript]
  );

  // Start recording
  const handleStartRecording = useCallback(() => {
    setError(null);
    setIsRecording(true);

    // Set up suggestions refresh interval
    const intervalMs = settings.transcriptionChunkDuration * 1000 + 2000; // Add 2s buffer for transcription
    suggestionsIntervalRef.current = setInterval(() => {
      generateSuggestions();
    }, intervalMs * 2); // Refresh suggestions every 2 transcription cycles
  }, [settings, generateSuggestions]);

  // Stop recording
  const handleStopRecording = useCallback(() => {
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
    <div className="flex flex-col h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white shadow-sm">
        <div className="max-w-full px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">TwinMind</h1>
              <p className="text-sm text-gray-500">
                Live Conversation Copilot
              </p>
            </div>

            <div className="flex items-center gap-3">
              {!settings.apiKey && (
                <div className="text-sm text-red-600 font-medium">
                  ⚠️ API Key not set
                </div>
              )}

              {error && (
                <div className="text-sm text-red-600 font-medium bg-red-50 px-3 py-2 rounded-lg">
                  {error}
                </div>
              )}

              <button
                onClick={handleExportSession}
                disabled={transcript.length === 0}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Export session as JSON"
              >
                <Download size={16} />
                Export
              </button>

              <button
                onClick={() => setIsSettingsOpen(true)}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                title="Open settings"
              >
                <Settings size={16} />
                Settings
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content - 3 Column Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Column: Transcript + Microphone */}
        <div className="w-1/3 flex flex-col border-r border-gray-200">
          <div className="p-4 border-b border-gray-200 bg-gray-50">
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
          <div className="flex-1 overflow-hidden">
            <TranscriptPanel
              transcript={transcript}
              isLoading={isTranscribing}
            />
          </div>
        </div>

        {/* Middle Column: Suggestions */}
        <div className="w-1/3 flex flex-col">
          <div className="flex-1 overflow-hidden">
            <SuggestionsPanel
              batches={suggestionBatches}
              onSuggestionClick={handleSuggestionClick}
              onRefresh={handleRefreshSuggestions}
              isLoading={isGeneratingSuggestions}
            />
          </div>
        </div>

        {/* Right Column: Chat */}
        <div className="w-1/3 flex flex-col">
          <div className="flex-1 overflow-hidden">
            <ChatPanel
              messages={chatMessages}
              onSendMessage={handleSendMessage}
              isLoading={isGeneratingChat}
            />
          </div>
        </div>
      </div>

      {/* Settings Dialog */}
      <SettingsDialog
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSave={handleSaveSettings}
      />
    </div>
  );
}
