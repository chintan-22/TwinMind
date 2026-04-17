"use client";

import { Suggestion } from "@/types";
import { ChevronRight } from "lucide-react";

interface SuggestionCardProps {
  suggestion: Suggestion;
  onClick: (suggestion: Suggestion) => void;
  isLoading?: boolean;
}

const TYPE_COLORS: Record<string, string> = {
  question: "bg-blue-100 text-blue-800",
  talking_point: "bg-slate-100 text-slate-700",
  answer: "bg-green-100 text-green-800",
  fact_check: "bg-orange-100 text-orange-800",
  clarification: "bg-cyan-100 text-cyan-800",
  next_step: "bg-amber-100 text-amber-800",
};

const TYPE_LABELS: Record<string, string> = {
  question: "Question",
  talking_point: "Talking Point",
  answer: "Answer",
  fact_check: "Fact Check",
  clarification: "Clarification",
  next_step: "Next Step",
};

export function SuggestionCard({
  suggestion,
  onClick,
  isLoading,
}: SuggestionCardProps) {
  return (
    <button
      onClick={() => onClick(suggestion)}
      disabled={isLoading}
      className="group w-full rounded-3xl border border-slate-200 bg-white p-4 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-blue-300 hover:bg-blue-50/40 disabled:cursor-not-allowed disabled:opacity-50"
      type="button"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="mb-3 flex items-center gap-2">
            <span
              className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                TYPE_COLORS[suggestion.type] || TYPE_COLORS.question
              }`}
            >
              {TYPE_LABELS[suggestion.type] || suggestion.type}
            </span>
          </div>
          <h3 className="mb-2 text-base font-semibold text-slate-900 transition-colors group-hover:text-blue-700">
            {suggestion.title}
          </h3>
          <p className="text-sm leading-6 text-slate-600">
            {suggestion.preview}
          </p>
          <p className="mt-4 text-xs font-semibold uppercase tracking-[0.16em] text-blue-600">
            Open in chat
          </p>
        </div>
        <ChevronRight
          className="mt-1 shrink-0 text-slate-400 transition-all group-hover:translate-x-0.5 group-hover:text-blue-600"
          size={20}
        />
      </div>
    </button>
  );
}
