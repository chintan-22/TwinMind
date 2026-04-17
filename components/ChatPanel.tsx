"use client";

import { ChatMessage } from "@/types";
import { useRef, useEffect, useState } from "react";
import { MessageSquareText, Send, Sparkles } from "lucide-react";

interface ChatPanelProps {
  messages: ChatMessage[];
  onSendMessage: (message: string) => Promise<void>;
  isLoading?: boolean;
}

export function ChatPanel({
  messages,
  onSendMessage,
  isLoading,
}: ChatPanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [input, setInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isSubmitting || isLoading) return;

    const message = input.trim();
    setInput("");
    setIsSubmitting(true);

    try {
      await onSendMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex h-full min-h-[24rem] flex-col overflow-hidden rounded-[28px] border border-slate-200/80 bg-white/88 shadow-[0_20px_60px_-40px_rgba(15,23,42,0.45)] backdrop-blur">
      <div className="shrink-0 border-b border-slate-200/80 bg-white/90 p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-slate-600">
                <MessageSquareText size={18} />
              </span>
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Chat</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Ask follow-ups or tap a suggestion to dig deeper.
                </p>
              </div>
            </div>
          </div>
          <span className="shrink-0 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
            {messages.length} message{messages.length !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex-1 space-y-4 overflow-y-auto bg-slate-50/60 px-4 py-4 sm:px-5"
      >
        {messages.length === 0 ? (
          <div className="flex min-h-[16rem] items-center justify-center py-6">
            <div className="max-w-sm rounded-3xl border border-slate-200 bg-white px-5 py-6 shadow-sm">
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                <Sparkles size={20} />
              </div>
              <p className="text-sm font-semibold text-slate-900">
                Start the conversation here
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Click a suggestion for an instant answer, or type your own
                question to get a response grounded in the latest transcript.
              </p>
            </div>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${
                msg.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[88%] rounded-3xl px-4 py-3 shadow-sm ring-1 ${
                  msg.role === "user"
                    ? "rounded-br-lg bg-blue-600 text-white ring-blue-500/20"
                    : "rounded-bl-lg bg-white text-slate-900 ring-slate-200"
                }`}
              >
                <p
                  className={`whitespace-pre-wrap break-words text-sm leading-6 ${
                    msg.role === "user" ? "text-white" : "text-slate-800"
                  }`}
                >
                  {msg.content}
                </p>
                <div
                  className={`mt-3 text-[11px] font-medium ${
                    msg.role === "user"
                      ? "text-blue-100"
                      : "text-slate-400"
                  }`}
                >
                  {new Date(msg.timestamp).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>
            </div>
          ))
        )}
        {isLoading && (
          <div className="flex justify-start">
            <div className="rounded-3xl rounded-bl-lg border border-slate-200 bg-white px-4 py-3 shadow-sm">
              <div className="flex gap-1">
                <div className="h-2 w-2 rounded-full bg-slate-400 animate-bounce" />
                <div
                  className="h-2 w-2 rounded-full bg-slate-400 animate-bounce"
                  style={{ animationDelay: "0.1s" }}
                />
                <div
                  className="h-2 w-2 rounded-full bg-slate-400 animate-bounce"
                  style={{ animationDelay: "0.2s" }}
                />
              </div>
              <p className="mt-2 text-xs font-medium text-slate-400">
                Thinking...
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="shrink-0 border-t border-slate-200/80 bg-white/92 p-4">
        <div className="rounded-3xl border border-slate-200 bg-slate-50/80 p-3 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask a follow-up, request a summary, or clarify a point..."
              disabled={isSubmitting || isLoading}
              className="min-h-[5.5rem] flex-1 resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
              rows={3}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isSubmitting || isLoading}
              className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-2xl bg-blue-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
              type="button"
            >
              <Send size={16} />
              Send
            </button>
          </div>
          <p className="mt-3 text-xs text-slate-400">
            Press Enter to send. Use Shift+Enter for a new line.
          </p>
        </div>
      </div>
    </div>
  );
}
