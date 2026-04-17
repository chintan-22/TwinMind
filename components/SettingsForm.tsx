"use client";

import {
  SUPPORTED_TEXT_MODELS,
  SUPPORTED_TRANSCRIPTION_MODELS,
} from "@/lib/defaults";
import { SessionSettings } from "@/types";
import { useState } from "react";

interface SettingsFormProps {
  settings: SessionSettings;
  onSave: (settings: SessionSettings) => void;
  onCancel?: () => void;
  submitLabel?: string;
}

export function SettingsForm({
  settings,
  onSave,
  onCancel,
  submitLabel = "Save Settings",
}: SettingsFormProps) {
  const [formData, setFormData] = useState<SessionSettings>(() => settings);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
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
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-6">
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

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
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
            {SUPPORTED_TRANSCRIPTION_MODELS.map((model) => (
              <option key={model} value={model}>
                {model}
              </option>
            ))}
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
            {SUPPORTED_TEXT_MODELS.map((model) => (
              <option key={model} value={model}>
                {model}
              </option>
            ))}
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
            {SUPPORTED_TEXT_MODELS.map((model) => (
              <option key={model} value={model}>
                {model}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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

      <div className="flex flex-wrap gap-3 justify-end border-t border-gray-200 pt-6">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-900 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          {submitLabel}
        </button>
      </div>
    </form>
  );
}
