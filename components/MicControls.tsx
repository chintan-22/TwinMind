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
    <div className="flex flex-col gap-2">
      <button
        onClick={toggleRecording}
        className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-colors ${
          isRecording
            ? "bg-red-500 hover:bg-red-600 text-white"
            : "bg-blue-500 hover:bg-blue-600 text-white"
        }`}
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
      {isRecording && (
        <div className="flex items-center gap-2 text-sm text-red-600">
          <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse" />
          Recording...
        </div>
      )}
      {error && <div className="text-sm text-red-600">{error}</div>}
    </div>
  );
}
