import { NextRequest, NextResponse } from "next/server";
import { Groq } from "groq-sdk";
import { getChatPrompt } from "@/prompts/chat";
import { getErrorMessage, hasStatusCode } from "@/lib/errors";
import { extractRecentContext } from "@/lib/heuristics";
import { validateApiKey } from "@/lib/validators";
import { TranscriptChunk, ChatMessage } from "@/types";
import { v4 as uuidv4 } from "uuid";

export async function POST(request: NextRequest) {
  try {
    const {
      userMessage,
      transcript = [],
      apiKey,
      contextWindow = 8,
      model = "mixtral-8x7b-32768",
      temperature = 0.7,
      topP = 0.9,
    } = await request.json();

    if (!apiKey || !validateApiKey(apiKey)) {
      return NextResponse.json(
        { error: "Invalid API key" },
        { status: 400 }
      );
    }

    if (!userMessage || typeof userMessage !== "string") {
      return NextResponse.json(
        { error: "User message required" },
        { status: 400 }
      );
    }

    const recentContext = extractRecentContext(
      transcript as TranscriptChunk[],
      Math.max(contextWindow, 1)
    );

    const prompt = getChatPrompt(userMessage, recentContext);

    const groq = new Groq({ apiKey });

    const completion = await groq.chat.completions.create({
      model,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature,
      top_p: topP,
      max_tokens: 1500,
    });

    const responseText = completion.choices[0]?.message?.content || "";

    const message: ChatMessage = {
      id: uuidv4(),
      role: "assistant",
      content: responseText,
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(
      { message },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error("Chat error:", error);
    const message = getErrorMessage(error, "Unknown chat error");

    if (hasStatusCode(error, 401)) {
      return NextResponse.json(
        { error: "Invalid API key" },
        { status: 401 }
      );
    }

    if (hasStatusCode(error, 429)) {
      return NextResponse.json(
        { error: "Rate limited. Please try again." },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { error: "Failed to generate response: " + message },
      { status: 500 }
    );
  }
}
