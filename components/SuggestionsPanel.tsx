"use client";

import { SuggestionBatch, Suggestion } from "@/types";
import { SuggestionCard } from "./SuggestionCard";
import { RefreshCw } from "lucide-react";

interface SuggestionsPanelProps {
  batches: SuggestionBatch[];
  onSuggestionClick: (suggestion: Suggestion) => void;
  onRefresh: () => void | Promise<void>;
  isLoading?: boolean;
}

export function SuggestionsPanel({
  batches,
  onSuggestionClick,
  onRefresh,
  isLoading,
}: SuggestionsPanelProps) {
  return (
    <div className="flex flex-col h-full bg-gray-50 border-r border-gray-200">
      <div className="sticky top-0 bg-white border-b border-gray-200 p-4 z-10">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Suggestions</h2>
            <p className="text-sm text-gray-500 mt-1">
              {batches.length} batch{batches.length !== 1 ? "es" : ""}
            </p>
          </div>
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Refresh suggestions"
          >
            <RefreshCw
              size={20}
              className={isLoading ? "animate-spin" : ""}
            />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {batches.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 text-sm">
              {isLoading
                ? "Generating suggestions..."
                : "No suggestions yet. Start recording to generate suggestions."}
            </p>
          </div>
        ) : (
          batches.map((batch) => (
            <div key={batch.id} className="space-y-3">
              <div className="px-2">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {new Date(batch.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                  })}
                </p>
              </div>
              <div className="space-y-2">
                {batch.suggestions.map((suggestion) => (
                  <SuggestionCard
                    key={suggestion.id}
                    suggestion={suggestion}
                    onClick={onSuggestionClick}
                    isLoading={isLoading}
                  />
                ))}
              </div>
            </div>
          ))
        )}

        {isLoading && batches.length > 0 && (
          <div className="text-center py-4">
            <div className="inline-block">
              <div className="animate-spin rounded-full h-4 w-4 border border-gray-300 border-t-blue-500" />
            </div>
            <p className="text-sm text-gray-500 mt-2">Generating...</p>
          </div>
        )}
      </div>
    </div>
  );
}
