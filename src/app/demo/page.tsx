"use client";

import { useEffect, useRef, useState } from "react";
import {
  X,
  ArrowUp,
  Phone,
  Bot,
  Calendar,
  CheckCircle2,
  MessageSquare,
  AlertCircle,
  AlertTriangle,
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { AppShell } from "@/components/AppShell";
import { useBusinessConfig } from "@/lib/useBusinessConfig";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { appendEvent } from "@/lib/events";
import {
  detectEscalation,
  type EscalationKeyword,
} from "@/lib/escalation";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface LastEscalation {
  keywords: EscalationKeyword[];
  message: string;
}

const SUGGESTIONS = [
  "Hey, do you guys do quarterly pest control? How much?",
  "My pool is turning green and I have a party Saturday — can you help?",
  "Got a quote from you last month, still thinking. What's the best price you can do?",
];

function TypingIndicator() {
  return (
    <motion.div
      className="flex justify-start"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
    >
      <div className="bg-gray-100 rounded-2xl rounded-bl-md px-4 py-3">
        <motion.div
          className="flex items-center gap-1.5"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.15 } },
          }}
        >
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="block w-2 h-2 rounded-full bg-amber-500"
              variants={{
                hidden: { opacity: 0.4, scale: 0.8 },
                visible: { opacity: 1, scale: 1 },
              }}
              animate={{
                opacity: [0.4, 1, 0.4],
                scale: [0.8, 1, 0.8],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                delay: i * 0.15,
                ease: "easeInOut",
              }}
            />
          ))}
        </motion.div>
      </div>
    </motion.div>
  );
}

export default function DemoPage() {
  const { config, loaded } = useBusinessConfig();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [streaming, setStreaming] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [escalation, setEscalation] = useState<LastEscalation | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, loading, streaming]);

  // Cancel any in-flight request when the page unmounts.
  useEffect(() => {
    return () => abortRef.current?.abort();
  }, []);

  async function sendMessage(text: string) {
    const trimmed = text.trim();
    if (!trimmed || loading) return;
    setError(null);
    setEscalation(null);

    const next: ChatMessage[] = [...messages, { role: "user", content: trimmed }];
    setMessages(next);
    setInput("");
    setLoading(true);
    setStreaming("");

    const controller = new AbortController();
    abortRef.current = controller;
    const startedAt = Date.now();

    try {
      const res = await fetch("/api/respond", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next, config }),
        signal: controller.signal,
      });

      if (!res.ok) {
        let serverMsg = "Something went wrong. Please try again.";
        try {
          const data = await res.json();
          if (typeof data?.error === "string") serverMsg = data.error;
        } catch {
          // non-JSON error response
        }
        throw new Error(serverMsg);
      }

      if (!res.body) {
        throw new Error("No response from the AI. Please try again.");
      }

      // Read escalation from server header (fallback to client detection if
      // the header isn't exposed for any reason).
      const headerKeywords = (res.headers.get("X-ServeIQ-Escalation") || "")
        .split(",")
        .map((k) => k.trim())
        .filter(Boolean) as EscalationKeyword[];
      const detected =
        headerKeywords.length > 0
          ? { escalated: true, keywords: headerKeywords }
          : detectEscalation(trimmed);

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        setStreaming(acc);
      }
      acc += decoder.decode();

      const finalText = acc.trim();
      if (!finalText) {
        throw new Error("The AI returned an empty reply. Please try again.");
      }
      setMessages([...next, { role: "assistant", content: finalText }]);
      setStreaming("");

      const durationMs = Date.now() - startedAt;
      appendEvent({
        customer: "Demo Customer",
        channel: "SMS",
        userMessage: trimmed,
        reply: finalText,
        timestamp: startedAt,
        durationMs,
        escalated: detected.escalated,
        keywords: detected.keywords,
      });

      if (detected.escalated) {
        setEscalation({ keywords: detected.keywords, message: trimmed });
      }
    } catch (e) {
      if (e instanceof DOMException && e.name === "AbortError") {
        // user navigated away or cancelled — silent
      } else {
        const msg = e instanceof Error ? e.message : "Something went wrong";
        setError(msg);
      }
      setStreaming("");
    } finally {
      if (abortRef.current === controller) abortRef.current = null;
      setLoading(false);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    sendMessage(input);
  }

  function reset() {
    abortRef.current?.abort();
    setMessages([]);
    setStreaming("");
    setError(null);
    setEscalation(null);
  }

  const businessName = loaded && config.businessName ? config.businessName : "Your Business";

  return (
    <AppShell title="Live Demo">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6 flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h2 className="text-2xl font-semibold tracking-tight text-gray-900">
              Live demo
            </h2>
            <p className="text-gray-500 mt-1.5 text-sm max-w-2xl">
              Type a message as if you were a customer texting in. ServeIQ will reply
              using your business profile, pricing, and tone.
            </p>
          </div>
          {messages.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={reset}
              className="shrink-0"
            >
              <span className="hidden sm:inline">Clear conversation</span>
              <span className="sm:hidden">Clear</span>
            </Button>
          )}
        </div>

        {escalation && (
          <Card
            role="alert"
            className="mb-4 border-red-300 bg-red-50 animate-fade-in"
          >
            <CardContent className="flex items-start gap-3 p-4">
              <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 shrink-0" />
              <div className="flex-1 text-sm min-w-0">
                <div className="font-semibold text-red-900 flex items-center gap-2 flex-wrap">
                  <span>ServeIQ flagged this for your attention</span>
                  <Badge
                    variant="destructive"
                    className="bg-red-600 text-white border-transparent"
                  >
                    URGENT
                  </Badge>
                </div>
                <p className="text-red-800/90 text-xs mt-1">
                  A real notification would be sent to the owner. Triggered by:{" "}
                  <span className="font-medium">
                    {escalation.keywords.join(", ")}
                  </span>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEscalation(null)}
                className="text-red-500 hover:text-red-700 shrink-0"
                aria-label="Dismiss alert"
              >
                <X className="w-4 h-4" />
              </button>
            </CardContent>
          </Card>
        )}

        {loaded && !config.businessName && (
          <div className="mb-4 flex items-start gap-3 rounded-lg border-l-4 border-amber-500 bg-white px-4 py-3 shadow-sm">
            <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
            <div className="flex-1 text-sm">
              <div className="font-medium text-gray-900">
                No business configured yet
              </div>
              <p className="text-gray-500 text-xs mt-0.5">
                The AI will still respond, but it&apos;ll be more impressive once you fill in your
                services and tone.{" "}
                <Link href="/setup" className="font-medium text-amber-600 underline">
                  Open setup
                </Link>
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chat */}
          <div className="lg:col-span-2">
            <Card className="rounded-2xl overflow-hidden">
              {/* Phone header */}
              <div className="px-5 py-3 border-b bg-gray-50/60 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#1a1a2e] flex items-center justify-center text-amber-400">
                  <Bot className="w-[18px] h-[18px]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-gray-900 truncate">
                    {businessName}
                  </div>
                  <Badge
                    variant="emerald"
                    className="border-0 bg-transparent p-0 normal-case tracking-normal text-[11px] text-emerald-600"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1" />
                    AI auto-responder active
                  </Badge>
                </div>
                <Phone className="w-4 h-4 text-gray-400" />
              </div>

              {/* Messages */}
              <div
                ref={scrollRef}
                className="h-[55vh] min-h-[360px] sm:h-[460px] overflow-y-auto px-4 sm:px-5 py-6 space-y-3 bg-white"
              >
                {messages.length === 0 && !loading && (
                  <div className="h-full flex flex-col items-center justify-center text-center px-6">
                    <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center mb-3">
                      <MessageSquare className="w-6 h-6 text-amber-600" />
                    </div>
                    <div className="text-sm font-medium text-gray-900">
                      Send a customer message
                    </div>
                    <p className="text-xs text-gray-500 mt-1 max-w-xs">
                      Pretend you&apos;re a customer texting your business. ServeIQ will reply
                      automatically.
                    </p>
                    <div className="mt-5 space-y-2 w-full max-w-sm">
                      {SUGGESTIONS.map((s) => (
                        <ShimmerButton
                          key={s}
                          onClick={() => sendMessage(s)}
                          className="w-full text-left h-auto"
                        >
                          {s}
                        </ShimmerButton>
                      ))}
                    </div>
                  </div>
                )}

                <AnimatePresence initial={false}>
                  {messages.map((m, i) => (
                    <motion.div
                      key={i}
                      className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.15 }}
                    >
                      <div
                        className={`max-w-[78%] px-3.5 py-2.5 text-sm leading-relaxed shadow-sm whitespace-pre-wrap ${
                          m.role === "user"
                            ? "bg-gray-200 text-gray-900 rounded-2xl rounded-br-md"
                            : "bg-gray-100 text-gray-900 rounded-2xl rounded-bl-md"
                        }`}
                      >
                        {m.content}
                      </div>
                    </motion.div>
                  ))}

                  {streaming && (
                    <motion.div
                      key="streaming"
                      className="flex justify-start"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.15 }}
                    >
                      <div className="max-w-[78%] px-3.5 py-2.5 text-sm leading-relaxed shadow-sm whitespace-pre-wrap bg-gray-100 text-gray-900 rounded-2xl rounded-bl-md">
                        {streaming}
                        <span className="ml-0.5 inline-block w-1.5 h-3.5 bg-amber-500/60 align-middle animate-pulse" />
                      </div>
                    </motion.div>
                  )}

                  {loading && !streaming && (
                    <TypingIndicator key="typing" />
                  )}
                </AnimatePresence>

                {error && (
                  <div
                    role="alert"
                    className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700 flex items-start gap-2"
                  >
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span className="flex-1">{error}</span>
                    <button
                      type="button"
                      onClick={() => setError(null)}
                      className="text-red-500 hover:text-red-700 shrink-0"
                      aria-label="Dismiss error"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

              {/* Composer — iMessage style */}
              <form
                onSubmit={handleSubmit}
                className="border-t bg-white px-3 py-3 flex items-center gap-2"
              >
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type a customer message..."
                  disabled={loading}
                  className="flex-1 h-10 rounded-full bg-gray-100 px-4 text-sm text-gray-900 placeholder:text-gray-400 shadow-inner outline-none focus:ring-2 focus:ring-amber-300/50 focus:bg-white transition-colors disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={loading || !input.trim()}
                  className="flex items-center justify-center w-10 h-10 rounded-full bg-amber-500 hover:bg-amber-600 text-white transition-colors disabled:bg-gray-200 disabled:text-gray-400 shrink-0"
                  aria-label="Send"
                >
                  <ArrowUp className="w-5 h-5" />
                </button>
              </form>
            </Card>
          </div>

          {/* What happens next */}
          <Card className="h-fit">
            <CardHeader className="p-5 pb-4">
              <CardTitle>What happens next</CardTitle>
              <CardDescription>
                Behind the scenes after the AI replies.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-5 pt-0">
              <ol className="space-y-4">
                <NextStep
                  index={1}
                  icon={MessageSquare}
                  title="Lead is captured"
                  description="Customer info, message, and the AI's reply are saved to your Leads inbox."
                />
                <NextStep
                  index={2}
                  icon={Calendar}
                  title="Smart follow-up scheduled"
                  description="If they don't reply within 24 hours, ServeIQ sends a follow-up nudge automatically."
                />
                <NextStep
                  index={3}
                  icon={Phone}
                  title="Hot leads get escalated"
                  description="Emergencies or booking-ready leads ping you on your phone right away."
                />
                <NextStep
                  index={4}
                  icon={CheckCircle2}
                  title="Review request after the job"
                  description="Once the job is marked complete, the AI texts the customer for a Google review."
                />
              </ol>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}

function NextStep({
  index,
  icon: Icon,
  title,
  description,
}: {
  index: number;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}) {
  return (
    <li className="flex items-start gap-3">
      <div className="relative shrink-0">
        <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
          <Icon className="w-[18px] h-[18px]" />
        </div>
        <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#1a1a2e] text-white text-[10px] font-semibold flex items-center justify-center">
          {index}
        </span>
      </div>
      <div className="flex-1 min-w-0 pt-0.5">
        <div className="text-sm font-medium text-gray-900">{title}</div>
        <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{description}</p>
      </div>
    </li>
  );
}
