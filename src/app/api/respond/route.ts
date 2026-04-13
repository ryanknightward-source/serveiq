import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { buildSystemPrompt } from "@/lib/prompt";
import { BusinessConfig, DEFAULT_CONFIG } from "@/lib/types";
import { detectEscalation } from "@/lib/escalation";

export const runtime = "nodejs";
// Cap server execution at 30s — well above expected (1-5s) but bounded.
export const maxDuration = 30;

interface IncomingMessage {
  role: "user" | "assistant";
  content: string;
}

const MAX_MESSAGES = 20;
const MAX_MESSAGE_CHARS = 2000;
const ANTHROPIC_TIMEOUT_MS = 25_000;

function validateMessages(input: unknown): {
  ok: true;
  messages: IncomingMessage[];
} | { ok: false; error: string } {
  if (!Array.isArray(input)) {
    return { ok: false, error: "messages must be an array" };
  }
  if (input.length === 0) {
    return { ok: false, error: "messages cannot be empty" };
  }
  if (input.length > MAX_MESSAGES) {
    return {
      ok: false,
      error: `conversation too long (max ${MAX_MESSAGES} messages)`,
    };
  }
  const out: IncomingMessage[] = [];
  for (const m of input) {
    if (!m || typeof m !== "object") {
      return { ok: false, error: "invalid message format" };
    }
    const role = (m as { role?: unknown }).role;
    const content = (m as { content?: unknown }).content;
    if (role !== "user" && role !== "assistant") {
      return { ok: false, error: "message role must be 'user' or 'assistant'" };
    }
    if (typeof content !== "string" || content.length === 0) {
      return { ok: false, error: "message content must be a non-empty string" };
    }
    if (content.length > MAX_MESSAGE_CHARS) {
      return {
        ok: false,
        error: `message too long (max ${MAX_MESSAGE_CHARS} characters)`,
      };
    }
    out.push({ role, content });
  }
  return { ok: true, messages: out };
}

export async function POST(req: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error("[/api/respond] ANTHROPIC_API_KEY missing");
    return NextResponse.json(
      { error: "The AI service is not configured. Please email ryanknightward@gmail.com for help." },
      { status: 503 }
    );
  }

  let body: { messages: unknown; config?: BusinessConfig };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const validation = validateMessages(body?.messages);
  if (!validation.ok) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  const config: BusinessConfig = { ...DEFAULT_CONFIG, ...(body.config ?? {}) };
  const system = buildSystemPrompt(config);

  // Scan the most recent customer message for escalation keywords. We expose
  // the result via a response header so the streaming body stays plain text.
  const lastUserMessage = [...validation.messages]
    .reverse()
    .find((m) => m.role === "user");
  const escalation = detectEscalation(lastUserMessage?.content ?? "");
  if (escalation.escalated) {
    console.warn(
      `[/api/respond] escalation detected: ${escalation.keywords.join(", ")}`
    );
  }

  const client = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
    timeout: ANTHROPIC_TIMEOUT_MS,
    maxRetries: 1,
  });

  try {
    const upstream = await client.messages.stream(
      {
        model: "claude-sonnet-4-6",
        max_tokens: 512,
        system,
        messages: validation.messages,
      },
      { signal: req.signal }
    );

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const event of upstream) {
            if (
              event.type === "content_block_delta" &&
              event.delta.type === "text_delta"
            ) {
              controller.enqueue(encoder.encode(event.delta.text));
            }
          }
          controller.close();
        } catch (err) {
          console.error("[/api/respond] stream error:", err);
          try {
            controller.error(err);
          } catch {
            // already closed
          }
        }
      },
      cancel() {
        upstream.controller.abort();
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-store, no-transform",
        "X-Content-Type-Options": "nosniff",
        "X-ServeIQ-Escalation": escalation.keywords.join(","),
        "Access-Control-Expose-Headers": "X-ServeIQ-Escalation",
      },
    });
  } catch (err) {
    console.error("[/api/respond] request failed:", err);

    if (err instanceof Anthropic.APIError) {
      if (err.status === 401) {
        return NextResponse.json(
          { error: "The AI service is not configured. Please email ryanknightward@gmail.com for help." },
          { status: 503 }
        );
      }
      if (err.status === 429) {
        return NextResponse.json(
          { error: "Too many requests right now. Please try again in a moment." },
          { status: 429 }
        );
      }
      if (err.status && err.status >= 500) {
        return NextResponse.json(
          { error: "The AI service is temporarily unavailable. Please try again." },
          { status: 502 }
        );
      }
    }

    return NextResponse.json(
      { error: "Something went wrong reaching the AI. Please try again." },
      { status: 500 }
    );
  }
}
