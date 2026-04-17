"use client";

import { TranscriptChunk } from "@/types";
import { useRef, useEffect } from "react";

interface TranscriptPanelProps {
  transcript: TranscriptChunk[];
  isLoading?: boolean;
}

export function TranscriptPanel({ transcript, isLoading }: TranscriptPanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [transcript]);

  return (
    <div className="flex flex-col h-full bg-white border-r border-gray-200">
      <div className="sticky top-0 bg-white border-b border-gray-200 p-4 z-10">
        <h2 className="text-lg font-semibold text-gray-900">Transcript</h2>
        <p className="text-sm text-gray-500 mt-1">
          {transcript.length} chunk{transcript.length !== 1 ? "s" : ""}
        </p>
      </div>

      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-3"
      >
        {transcript.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">
              {isLoading ? "Transcribing..." : "No transcript yet. Start recording."}
            </p>
          </div>
        ) : (
          transcript.map((chunk) => (
            <div
              key={chunk.id}
              className="bg-gray-50 rounded-lg p-3 border border-gray-100 hover:border-gray-300 transition-colors"
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <span className="text-xs font-medium text-gray-500 bg-gray-200 px-2 py-1 rounded">
                  {chunk.timestamp}
                </span>
                {chunk.duration > 0 && (
                  <span className="text-xs text-gray-400">
                    {chunk.duration.toFixed(1)}s
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-800 leading-relaxed">
                {chunk.text}
              </p>
            </div>
          ))
        )}
        {isLoading && transcript.length > 0 && (
          <div className="text-center py-4">
            <div className="inline-block">
              <div className="animate-spin rounded-full h-4 w-4 border border-gray-300 border-t-blue-500" />
            </div>
            <p className="text-sm text-gray-500 mt-2">Transcribing...</p>
          </div>
        )}
      </div>
    </div>
  );
}
