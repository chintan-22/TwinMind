"use client";

import { SuggestionBatch, Suggestion } from "@/types";
import { SuggestionCard } from "./SuggestionCard";
import { Lightbulb, RefreshCw } from "lucide-react";

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
    <div className="flex h-full min-h-[24rem] flex-col overflow-hidden rounded-[28px] border border-slate-200/80 bg-white/88 shadow-[0_20px_60px_-40px_rgba(15,23,42,0.45)] backdrop-blur">
      <div className="shrink-0 border-b border-slate-200/80 bg-white/90 p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
              <Lightbulb size={18} />
            </span>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Suggestions
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Fresh prompts appear here as the conversation evolves.
              </p>
            </div>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <span className="shrink-0 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
              {batches.length} batch{batches.length !== 1 ? "es" : ""}
            </span>
            <button
              onClick={onRefresh}
              disabled={isLoading}
              className="rounded-2xl border border-slate-200 bg-white p-2.5 text-slate-500 transition-colors hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
              title="Refresh suggestions"
              type="button"
            >
              <RefreshCw
                size={20}
                className={isLoading ? "animate-spin" : ""}
              />
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 space-y-6 overflow-y-auto bg-slate-50/60 p-4 sm:p-5">
        {batches.length === 0 ? (
          <div className="flex min-h-[16rem] items-center justify-center py-6">
            <div className="max-w-sm rounded-3xl border border-dashed border-slate-200 bg-white px-5 py-6 shadow-sm">
              <p className="text-sm font-semibold text-slate-900">
                {isLoading ? "Generating suggestions..." : "Suggestions will show up here"}
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Start recording and TwinMind will automatically suggest talking
                points, questions, and next steps after transcription.
              </p>
            </div>
          </div>
        ) : (
          batches.map((batch) => (
            <div
              key={batch.id}
              className="space-y-3 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <div className="flex items-center justify-between gap-3 px-1">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                  {new Date(batch.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                  })}
                </p>
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-500">
                  {batch.suggestions.length} cards
                </span>
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
              <div className="h-4 w-4 animate-spin rounded-full border border-slate-300 border-t-blue-500" />
            </div>
            <p className="mt-2 text-sm text-slate-500">Generating...</p>
          </div>
        )}
      </div>
    </div>
  );
}
