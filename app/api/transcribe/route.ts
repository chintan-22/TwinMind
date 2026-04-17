import { NextRequest, NextResponse } from "next/server";
import { Groq } from "groq-sdk";
import { getErrorMessage, hasStatusCode } from "@/lib/errors";
import { validateApiKey, validateTranscription } from "@/lib/validators";

export async function POST(request: NextRequest) {
  try {
    const { audioBlob, apiKey, model = "whisper-large-v3" } =
      await request.json();

    if (!apiKey) {
      return NextResponse.json(
        { error: "API key required" },
        { status: 400 }
      );
    }

    if (!validateApiKey(apiKey)) {
      return NextResponse.json(
        { error: "Invalid API key format" },
        { status: 400 }
      );
    }

    if (!audioBlob) {
      return NextResponse.json(
        { error: "Audio blob required" },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(audioBlob, "base64");

    const groq = new Groq({ apiKey });

    const transcriptionFile = new File([buffer], "audio.wav", {
      type: "audio/wav",
    });

    const transcription = await groq.audio.transcriptions.create({
      file: transcriptionFile,
      model,
    });

    const text = transcription.text || "";

    if (!validateTranscription(text)) {
      return NextResponse.json(
        { text: "", duration: 0 },
        { status: 200 }
      );
    }

    return NextResponse.json(
      {
        text: text.trim(),
        duration: 0,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error("Transcription error:", error);
    const message = getErrorMessage(error, "Unknown transcription error");

    if (hasStatusCode(error, 401)) {
      return NextResponse.json(
        { error: "Invalid API key" },
        { status: 401 }
      );
    }

    if (hasStatusCode(error, 429)) {
      return NextResponse.json(
        { error: "Rate limited. Please wait." },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { error: "Transcription failed: " + message },
      { status: 500 }
    );
  }
}
