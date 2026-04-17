"use client";

import { TranscriptChunk } from "@/types";
import { useRef, useEffect } from "react";
import { Captions } from "lucide-react";

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
    <div className="flex h-full min-h-[24rem] flex-col overflow-hidden rounded-[28px] border border-slate-200/80 bg-white/88 shadow-[0_20px_60px_-40px_rgba(15,23,42,0.45)] backdrop-blur">
      <div className="shrink-0 border-b border-slate-200/80 bg-white/90 p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-slate-600">
              <Captions size={18} />
            </span>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Transcript
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Every audio chunk appears here with a timestamp.
              </p>
            </div>
          </div>
          <span className="shrink-0 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
            {transcript.length} chunk{transcript.length !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex-1 space-y-3 overflow-y-auto bg-slate-50/60 p-4 sm:p-5"
      >
        {transcript.length === 0 ? (
          <div className="flex min-h-[16rem] items-center justify-center py-6">
            <div className="max-w-sm rounded-3xl border border-dashed border-slate-200 bg-white px-5 py-6 text-center shadow-sm">
              <p className="text-sm font-semibold text-slate-900">
                {isLoading ? "Transcribing your audio..." : "No transcript yet"}
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Start recording and TwinMind will place clean, timestamped
                transcript chunks here automatically.
              </p>
            </div>
          </div>
        ) : (
          transcript.map((chunk) => (
            <div
              key={chunk.id}
              className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-slate-300"
            >
              <div className="mb-3 flex items-start justify-between gap-3">
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                  {chunk.timestamp}
                </span>
                {chunk.duration > 0 && (
                  <span className="text-xs font-medium text-slate-400">
                    {chunk.duration.toFixed(1)}s
                  </span>
                )}
              </div>
              <p className="text-sm leading-6 text-slate-800">
                {chunk.text}
              </p>
            </div>
          ))
        )}
        {isLoading && transcript.length > 0 && (
          <div className="text-center py-4">
            <div className="inline-block">
              <div className="h-4 w-4 animate-spin rounded-full border border-slate-300 border-t-blue-500" />
            </div>
            <p className="mt-2 text-sm text-slate-500">Transcribing...</p>
          </div>
        )}
      </div>
    </div>
  );
}
