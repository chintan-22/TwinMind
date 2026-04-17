import { NextRequest, NextResponse } from "next/server";
import { Groq } from "groq-sdk";
import { getErrorMessage, hasStatusCode } from "@/lib/errors";
import { getLiveSuggestionsPrompt, parseJson } from "@/prompts/liveSuggestions";
import { detectConversationSignals, extractRecentContext, extractPreviousSuggestionTitles } from "@/lib/heuristics";
import { validateAndSanitizeSuggestions, createSuggestionBatch, validateApiKey } from "@/lib/validators";
import { TranscriptChunk, Suggestion } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const {
      transcript = [],
      suggestionBatches = [],
      apiKey,
      contextWindow = 3,
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

    if (!Array.isArray(transcript) || transcript.length === 0) {
      return NextResponse.json(
        { error: "No transcript provided" },
        { status: 400 }
      );
    }

    const recentContext = extractRecentContext(
      transcript as TranscriptChunk[],
      contextWindow
    );

    if (recentContext.length === 0) {
      return NextResponse.json(
        { error: "Insufficient transcript context" },
        { status: 400 }
      );
    }

    const signals = detectConversationSignals(recentContext);
    const previousTitles = extractPreviousSuggestionTitles(suggestionBatches);

    const prompt = getLiveSuggestionsPrompt(
      recentContext,
      signals,
      previousTitles
    );

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
      max_tokens: 1000,
    });

    const responseText = completion.choices[0]?.message?.content || "";

    const suggestionsData = parseJson<Suggestion[]>(responseText);

    if (!suggestionsData) {
      return NextResponse.json(
        { error: "Failed to parse suggestions" },
        { status: 500 }
      );
    }

    const validatedSuggestions = validateAndSanitizeSuggestions(suggestionsData);

    if (!validatedSuggestions || validatedSuggestions.length === 0) {
      return NextResponse.json(
        { error: "No valid suggestions generated" },
        { status: 500 }
      );
    }

    const batch = createSuggestionBatch(validatedSuggestions.slice(0, 3));

    return NextResponse.json(
      {
        suggestions: batch.suggestions,
        batch,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error("Suggestions error:", error);
    const message = getErrorMessage(error, "Unknown suggestions error");

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
      { error: "Failed to generate suggestions: " + message },
      { status: 500 }
    );
  }
}
