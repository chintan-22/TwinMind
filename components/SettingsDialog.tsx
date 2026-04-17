"use client";

import { SessionSettings } from "@/types";
import { X } from "lucide-react";
import { useState } from "react";

interface SettingsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  settings: SessionSettings;
  onSave: (settings: SessionSettings) => void;
}

export function SettingsDialog({
  isOpen,
  onClose,
  settings,
  onSave,
}: SettingsDialogProps) {
  const [formData, setFormData] = useState<SessionSettings>(() => settings);

  if (!isOpen) return null;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "number"
          ? value === ""
            ? 0
            : Number(value)
          : type === "checkbox"
            ? (e.target as HTMLInputElement).checked
            : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-screen overflow-y-auto">
        <div className="sticky top-0 flex items-center justify-between p-6 border-b border-gray-200 bg-white">
          <h2 className="text-2xl font-semibold text-gray-900">Settings</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* API Key */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Groq API Key *
            </label>
            <input
              type="password"
              name="apiKey"
              value={formData.apiKey}
              onChange={handleChange}
              placeholder="Enter your Groq API key"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Get your key from{" "}
              <a
                href="https://console.groq.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                console.groq.com
              </a>
            </p>
          </div>

          {/* Model Selection */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Transcription Model
              </label>
              <select
                name="whisperModel"
                value={formData.whisperModel}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="whisper-large-v3">whisper-large-v3</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Suggestion Model
              </label>
              <select
                name="suggestionModel"
                value={formData.suggestionModel}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="mixtral-8x7b-32768">mixtral-8x7b-32768</option>
                <option value="llama-3.1-70b-versatile">
                  llama-3.1-70b-versatile
                </option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Chat Model
              </label>
              <select
                name="chatModel"
                value={formData.chatModel}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="mixtral-8x7b-32768">mixtral-8x7b-32768</option>
                <option value="llama-3.1-70b-versatile">
                  llama-3.1-70b-versatile
                </option>
              </select>
            </div>
          </div>

          {/* Context Windows */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Live Suggestions Context Window
              </label>
              <input
                type="number"
                name="liveContextWindow"
                value={formData.liveContextWindow}
                onChange={handleChange}
                min="1"
                max="20"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Number of transcript chunks to consider
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Detailed Answer Context Window
              </label>
              <input
                type="number"
                name="detailedContextWindow"
                value={formData.detailedContextWindow}
                onChange={handleChange}
                min="1"
                max="30"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Number of transcript chunks for chat
              </p>
            </div>
          </div>

          {/* Transcription Settings */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Transcription Chunk Duration (seconds)
            </label>
            <input
              type="number"
              name="transcriptionChunkDuration"
              value={formData.transcriptionChunkDuration}
              onChange={handleChange}
              min="10"
              max="60"
              step="5"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              How often to send audio for transcription
            </p>
          </div>

          {/* Temperature & Top P */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Temperature
              </label>
              <input
                type="number"
                name="temperature"
                value={formData.temperature}
                onChange={handleChange}
                min="0"
                max="2"
                step="0.1"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">0=deterministic, 2=creative</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Top P
              </label>
              <input
                type="number"
                name="topP"
                value={formData.topP}
                onChange={handleChange}
                min="0"
                max="1"
                step="0.05"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">Nucleus sampling threshold</p>
            </div>
          </div>

          {/* Avoid Repetition */}
          <div>
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                name="avoidRepetition"
                checked={formData.avoidRepetition}
                onChange={handleChange}
                className="w-4 h-4 rounded border-gray-300 focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-900">
                Avoid repeating suggestions from previous batches
              </span>
            </label>
          </div>

          {/* Prompts Section */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Prompts</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Live Suggestions Prompt
                </label>
                <textarea
                  name="livesuggestionPrompt"
                  value={formData.livesuggestionPrompt}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  placeholder="Leave empty to use default prompt"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Detailed Answer Prompt
                </label>
                <textarea
                  name="detailedAnswerPrompt"
                  value={formData.detailedAnswerPrompt}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  placeholder="Leave empty to use default prompt"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Chat Prompt
                </label>
                <textarea
                  name="chatPrompt"
                  value={formData.chatPrompt}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  placeholder="Leave empty to use default prompt"
                />
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 justify-end border-t border-gray-200 pt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-900 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Save Settings
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
