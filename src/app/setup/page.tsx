"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Bug,
  Waves,
  Wrench,
  Leaf,
  Save,
  Sparkles,
  Check,
  ArrowRight,
  Mic,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { useBusinessConfig } from "@/lib/useBusinessConfig";
import {
  BusinessConfig,
  ServiceKey,
  SERVICE_LABELS,
  Tone,
} from "@/lib/types";
import { buildVoicePreview } from "@/lib/prompt";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const SERVICES: { key: ServiceKey; icon: React.ComponentType<{ className?: string }> }[] = [
  { key: "pest_control", icon: Bug },
  { key: "pool_cleaning", icon: Waves },
  { key: "pool_repair", icon: Wrench },
  { key: "lawn_care", icon: Leaf },
];

const TONES: { key: Tone; description: string }[] = [
  { key: "Friendly", description: "Warm and neighborly" },
  { key: "Professional", description: "Polished and courteous" },
  { key: "Direct", description: "Concise, no fluff" },
];

const SAMPLE_PREVIEW_PROMPT =
  "Hi, do you handle the kind of work I'm looking for? What's the next step?";

export default function SetupPage() {
  const router = useRouter();
  const { config, setConfig, loaded } = useBusinessConfig();
  const [draft, setDraft] = useState<BusinessConfig>(config);
  const [saved, setSaved] = useState(false);
  const [aiPreview, setAiPreview] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const previewAbortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (loaded) setDraft(config);
  }, [loaded, config]);

  useEffect(() => {
    return () => previewAbortRef.current?.abort();
  }, []);

  const preview = useMemo(() => buildVoicePreview(draft), [draft]);
  const exampleCount = useMemo(
    () =>
      draft.voiceExamples
        .split(/\n\s*\n/)
        .map((s) => s.trim())
        .filter(Boolean).length,
    [draft.voiceExamples]
  );

  async function regeneratePreview() {
    previewAbortRef.current?.abort();
    const controller = new AbortController();
    previewAbortRef.current = controller;
    setPreviewLoading(true);
    setPreviewError(null);
    setAiPreview("");

    try {
      const res = await fetch("/api/respond", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: SAMPLE_PREVIEW_PROMPT }],
          config: draft,
        }),
        signal: controller.signal,
      });
      if (!res.ok) {
        let msg = "Couldn't generate preview. Try again.";
        try {
          const data = await res.json();
          if (typeof data?.error === "string") msg = data.error;
        } catch {
          // non-JSON error response
        }
        throw new Error(msg);
      }
      if (!res.body) throw new Error("Empty response from the AI.");
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        setAiPreview(acc);
      }
      acc += decoder.decode();
      setAiPreview(acc.trim());
    } catch (e) {
      if (e instanceof DOMException && e.name === "AbortError") return;
      setPreviewError(
        e instanceof Error ? e.message : "Couldn't generate preview."
      );
      setAiPreview(null);
    } finally {
      if (previewAbortRef.current === controller) previewAbortRef.current = null;
      setPreviewLoading(false);
    }
  }

  function toggleService(key: ServiceKey) {
    setDraft((d) => {
      const has = d.services.includes(key);
      return {
        ...d,
        services: has ? d.services.filter((s) => s !== key) : [...d.services, key],
      };
    });
  }

  function updatePricing(key: ServiceKey, value: string) {
    setDraft((d) => ({
      ...d,
      pricing: { ...d.pricing, [key]: value },
    }));
  }

  function handleSave(goToDashboard = false) {
    setConfig(draft);
    setSaved(true);
    setTimeout(() => setSaved(false), 2200);
    if (goToDashboard) {
      setTimeout(() => router.push("/dashboard"), 300);
    }
  }

  return (
    <AppShell title="Setup">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h2 className="text-2xl font-semibold tracking-tight text-gray-900">
            Set up your AI assistant
          </h2>
          <p className="text-gray-500 mt-1.5 text-sm">
            Tell ServeIQ about your business. We'll use this to respond to leads in your voice.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Business info */}
            <Card>
              <CardHeader className="p-5 sm:p-6 pb-4">
                <CardTitle>Business info</CardTitle>
              </CardHeader>
              <CardContent className="p-5 sm:p-6 pt-0">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="businessName">Business name</Label>
                    <Input
                      id="businessName"
                      placeholder="e.g. Sunshine Pest Control"
                      value={draft.businessName}
                      onChange={(e) =>
                        setDraft({ ...draft, businessName: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="ownerName">Owner name</Label>
                    <Input
                      id="ownerName"
                      placeholder="e.g. Mike Johnson"
                      value={draft.ownerName}
                      onChange={(e) =>
                        setDraft({ ...draft, ownerName: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      placeholder="(555) 123-4567"
                      value={draft.phone}
                      onChange={(e) =>
                        setDraft({ ...draft, phone: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      placeholder="hello@business.com"
                      value={draft.email}
                      onChange={(e) =>
                        setDraft({ ...draft, email: e.target.value })
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Services */}
            <Card>
              <CardHeader className="p-5 sm:p-6 pb-4">
                <CardTitle>Services & pricing</CardTitle>
                <CardDescription>
                  Pick what you offer and add typical pricing.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-5 sm:p-6 pt-0">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {SERVICES.map(({ key, icon: Icon }) => {
                    const checked = draft.services.includes(key);
                    return (
                      <div key={key}>
                        <button
                          type="button"
                          onClick={() => toggleService(key)}
                          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg border text-left transition-colors ${
                            checked
                              ? "border-amber-500 bg-amber-50/50"
                              : "border-gray-200 hover:border-gray-300 bg-white"
                          }`}
                        >
                          <div
                            className={`w-9 h-9 rounded-md flex items-center justify-center ${
                              checked
                                ? "bg-[#1a1a2e] text-white"
                                : "bg-gray-100 text-gray-500"
                            }`}
                          >
                            <Icon className="w-[18px] h-[18px]" />
                          </div>
                          <span className="text-sm font-medium text-gray-900 flex-1">
                            {SERVICE_LABELS[key]}
                          </span>
                          <span
                            className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                              checked
                                ? "bg-[#1a1a2e] border-[#1a1a2e]"
                                : "border-gray-300"
                            }`}
                          >
                            {checked && <Check className="w-3 h-3 text-white" />}
                          </span>
                        </button>
                        {checked && (
                          <Input
                            className="mt-2"
                            placeholder={`Pricing for ${SERVICE_LABELS[key]} — e.g. $89/visit`}
                            value={draft.pricing[key] ?? ""}
                            onChange={(e) => updatePricing(key, e.target.value)}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Tone */}
            <Card>
              <CardHeader className="p-5 sm:p-6 pb-4">
                <CardTitle>Response tone</CardTitle>
                <CardDescription>
                  How should your AI sound when it texts customers?
                </CardDescription>
              </CardHeader>
              <CardContent className="p-5 sm:p-6 pt-0">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {TONES.map(({ key, description }) => {
                    const active = draft.tone === key;
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setDraft({ ...draft, tone: key })}
                        className={`px-4 py-3 rounded-lg border text-left transition-colors ${
                          active
                            ? "border-amber-500 bg-amber-50/50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <div className="text-sm font-medium text-gray-900">
                          {key}
                        </div>
                        <div className="text-xs text-gray-500 mt-0.5">
                          {description}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Voice Training */}
            <Card>
              <CardHeader className="p-5 sm:p-6 pb-4">
                <CardTitle className="inline-flex items-center gap-2">
                  <Mic className="w-4 h-4 text-amber-600" />
                  Train Your AI Voice
                </CardTitle>
                <CardDescription>
                  Paste 2–3 examples of how you actually text customers. The
                  more examples you add, the more your AI sounds like you.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-5 sm:p-6 pt-0 space-y-3">
                <Textarea
                  value={draft.voiceExamples}
                  onChange={(e) =>
                    setDraft({ ...draft, voiceExamples: e.target.value })
                  }
                  placeholder={`Hey Sarah! yeah we can swing by tomorrow morning, $89 covers it. Want me to put you on the schedule?\n\nMorning! sorry for the wait — pulling up to your place around 10. cold one waiting? haha`}
                  rows={7}
                  className="font-normal text-[13.5px] leading-relaxed"
                />
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <span className="text-[11px] text-gray-500">
                    {exampleCount === 0
                      ? "No examples yet — your AI will use the generic tone above."
                      : exampleCount === 1
                      ? "1 example added"
                      : `${exampleCount} examples added`}
                  </span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={regeneratePreview}
                    disabled={previewLoading}
                  >
                    {previewLoading ? (
                      <Loader2 className="animate-spin" />
                    ) : (
                      <RefreshCw />
                    )}
                    Regenerate preview
                  </Button>
                </div>
                {previewError && (
                  <p className="text-xs text-red-600">{previewError}</p>
                )}
              </CardContent>
            </Card>

            <div className="flex flex-wrap items-center gap-3">
              <Button onClick={() => handleSave(false)}>
                <Save />
                Save settings
              </Button>
              <Button variant="brand" onClick={() => handleSave(true)}>
                Save & open dashboard
                <ArrowRight />
              </Button>
              {saved && (
                <span className="text-sm text-emerald-600 inline-flex items-center gap-1.5 animate-fade-in">
                  <Check className="w-4 h-4" />
                  Saved to your browser
                </span>
              )}
            </div>
          </div>

          {/* Preview */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <Card>
                <CardHeader className="p-5 sm:p-6 pb-4">
                  <CardTitle className="inline-flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-600" />
                    Your AI Voice
                  </CardTitle>
                  <CardDescription>
                    A live preview of how your AI replies.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-5 sm:p-6 pt-0">
                  <div className="rounded-xl bg-gradient-to-br from-amber-50 to-amber-100/50 border border-amber-200 p-4">
                    <div className="text-[11px] font-medium uppercase tracking-wide text-amber-600 mb-2 flex items-center gap-1.5">
                      Sample AI reply
                      {aiPreview !== null && (
                        <Badge variant="amber" className="text-[9px] px-1.5">
                          live
                        </Badge>
                      )}
                    </div>
                    <div className="bg-white rounded-2xl rounded-tl-sm p-3.5 text-sm text-gray-800 shadow-sm border border-white whitespace-pre-wrap min-h-[3rem]">
                      {aiPreview !== null ? (
                        <>
                          {aiPreview}
                          {previewLoading && (
                            <span className="ml-0.5 inline-block w-1.5 h-3.5 bg-gray-400 align-middle animate-pulse" />
                          )}
                        </>
                      ) : (
                        preview
                      )}
                    </div>
                    <div className="mt-3 text-[11px] text-gray-500 flex items-center justify-between gap-2">
                      <span>
                        Tone:{" "}
                        <span className="font-medium text-gray-700">
                          {draft.tone}
                        </span>
                        {exampleCount > 0 && (
                          <>
                            {" · "}
                            <span className="font-medium text-gray-700">
                              {exampleCount} voice example
                              {exampleCount === 1 ? "" : "s"}
                            </span>
                          </>
                        )}
                      </span>
                      {aiPreview !== null && (
                        <button
                          type="button"
                          onClick={() => setAiPreview(null)}
                          className="text-amber-600 hover:text-amber-700 underline-offset-2 hover:underline"
                        >
                          Show template
                        </button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
