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
  talking_point: "bg-purple-100 text-purple-800",
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
      className="w-full text-left bg-white border border-gray-200 rounded-lg p-4 hover:border-blue-400 hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span
              className={`text-xs font-semibold px-2 py-1 rounded-full ${
                TYPE_COLORS[suggestion.type] || TYPE_COLORS.question
              }`}
            >
              {TYPE_LABELS[suggestion.type] || suggestion.type}
            </span>
          </div>
          <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors mb-2">
            {suggestion.title}
          </h3>
          <p className="text-sm text-gray-600 leading-snug">
            {suggestion.preview}
          </p>
        </div>
        <ChevronRight className="text-gray-400 group-hover:text-blue-600 flex-shrink-0 mt-1 transition-colors" size={20} />
      </div>
    </button>
  );
}
