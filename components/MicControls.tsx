"use client";

import { useRef, useState, useEffect } from "react";
import { Mic, Square } from "lucide-react";
import { getErrorMessage } from "@/lib/errors";

interface MicControlsProps {
  onAudioChunk: (audioBlob: Blob) => void;
  chunkDuration: number;
  isRecording: boolean;
  onRecordingChange: (recording: boolean) => void;
}

const RECORDER_MIME_TYPES = [
  "audio/webm;codecs=opus",
  "audio/webm",
  "audio/mp4",
  "audio/ogg;codecs=opus",
  "audio/ogg",
] as const;

function getSupportedMimeType(): string | undefined {
  if (
    typeof MediaRecorder === "undefined" ||
    typeof MediaRecorder.isTypeSupported !== "function"
  ) {
    return undefined;
  }

  return RECORDER_MIME_TYPES.find((mimeType) =>
    MediaRecorder.isTypeSupported(mimeType)
  );
}

export function MicControls({
  onAudioChunk,
  chunkDuration,
  isRecording,
  onRecordingChange,
}: MicControlsProps) {
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }

      if (mediaRecorderRef.current?.state === "recording") {
        mediaRecorderRef.current.stop();
      }

      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  const startRecording = async () => {
    try {
      setError(null);

      if (typeof MediaRecorder === "undefined") {
        throw new Error("This browser does not support audio recording.");
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const supportedMimeType = getSupportedMimeType();
      const mediaRecorder = supportedMimeType
        ? new MediaRecorder(stream, { mimeType: supportedMimeType })
        : new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      const recordingMimeType =
        mediaRecorder.mimeType || supportedMimeType || "audio/webm";

      const chunks: BlobPart[] = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        if (chunks.length === 0) {
          return;
        }

        const audioBlob = new Blob(chunks, { type: recordingMimeType });
        chunks.length = 0;
        onAudioChunk(audioBlob);
      };

      mediaRecorder.start();
      onRecordingChange(true);

      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }

      intervalRef.current = setInterval(() => {
        if (mediaRecorderRef.current?.state === "recording") {
          mediaRecorderRef.current.stop();
          mediaRecorderRef.current.start();
        }
      }, chunkDuration * 1000);
    } catch (error: unknown) {
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      mediaRecorderRef.current = null;
      setError(getErrorMessage(error, "Failed to access microphone"));
      onRecordingChange(false);
    }
  };

  const stopRecording = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop();
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }

    mediaRecorderRef.current = null;
    streamRef.current = null;
    onRecordingChange(false);
  };

  const toggleRecording = async () => {
    if (isRecording) {
      stopRecording();
    } else {
      await startRecording();
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-900">
            Capture the conversation
          </p>
          <p className="mt-1 text-sm leading-6 text-slate-500">
            Records in {chunkDuration}-second chunks and transcribes
            automatically so suggestions stay fresh.
          </p>
        </div>
        <button
          onClick={toggleRecording}
          className={`inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold shadow-sm transition-colors ${
            isRecording
              ? "bg-red-500 text-white hover:bg-red-600"
              : "bg-blue-600 text-white hover:bg-blue-700"
          }`}
          type="button"
        >
          {isRecording ? (
            <>
              <Square size={18} fill="currentColor" />
              Stop Recording
            </>
          ) : (
            <>
              <Mic size={18} />
              Start Recording
            </>
          )}
        </button>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <div
          className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium ${
            isRecording
              ? "bg-red-50 text-red-600"
              : "bg-slate-100 text-slate-600"
          }`}
        >
          <div
            className={`h-2.5 w-2.5 rounded-full ${
              isRecording ? "animate-pulse bg-red-500" : "bg-slate-400"
            }`}
          />
          {isRecording ? "Recording live" : "Ready when you are"}
        </div>
        <div className="rounded-full bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-600">
          Auto transcript every {chunkDuration}s
        </div>
      </div>
      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}
    </div>
  );
}
