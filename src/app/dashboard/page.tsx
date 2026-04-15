"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  MessageCircle,
  RotateCcw,
  Star,
  ArrowUpRight,
  Bot,
  Phone,
  Mail,
  Sparkles,
  Zap,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { useBusinessConfig } from "@/lib/useBusinessConfig";
import {
  averageResponseSeconds,
  useEvents,
  type DemoEvent,
} from "@/lib/events";
import { createClient } from "@/lib/supabase-browser";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

type ActivityType = "Lead" | "Follow-Up" | "Review";

interface ActivityItem {
  id: string;
  channel: "SMS" | "Email";
  type: ActivityType;
  customer: string;
  preview: string;
  time: string;
  escalated?: boolean;
  keywords?: string[];
}

const MOCK_ACTIVITY: ActivityItem[] = [
  {
    id: "mock-1",
    channel: "SMS",
    type: "Lead",
    customer: "Sarah Mitchell",
    preview:
      "Hey Sarah! Thanks for reaching out — happy to take a look at the wasp nest. What's your address and is tomorrow morning okay?",
    time: "2 min ago",
  },
  {
    id: "mock-2",
    channel: "SMS",
    type: "Follow-Up",
    customer: "James Rodriguez",
    preview:
      "Hi James, just circling back on the pool cleaning quote from last week. Want me to get you on the schedule for Saturday?",
    time: "18 min ago",
  },
  {
    id: "mock-3",
    channel: "Email",
    type: "Review",
    customer: "Emily Chen",
    preview:
      "Hi Emily — hope your pool's looking great after Tuesday's service! If you have a minute, would you mind leaving us a quick Google review?",
    time: "1 hr ago",
  },
  {
    id: "mock-4",
    channel: "SMS",
    type: "Lead",
    customer: "Tom Walker",
    preview:
      "Hey Tom! Yes we handle quarterly pest control — runs $89/visit. What day this week works for a first treatment?",
    time: "2 hr ago",
  },
  {
    id: "mock-5",
    channel: "Email",
    type: "Follow-Up",
    customer: "Linda Park",
    preview:
      "Hi Linda, it's been about 6 months since your last lawn treatment. Want me to schedule your spring service?",
    time: "4 hr ago",
  },
];

const ACTIVITY_BADGE_VARIANT: Record<ActivityType, "amber" | "slate" | "emerald"> = {
  Lead: "amber",
  "Follow-Up": "slate",
  Review: "emerald",
};

const INDUSTRY_AVG_MINUTES = 47;
const FALLBACK_AVG_SECONDS = 42;

function formatRelativeTime(timestamp: number): string {
  const diff = Date.now() - timestamp;
  if (diff < 60_000) return "just now";
  if (diff < 3_600_000) {
    const m = Math.round(diff / 60_000);
    return `${m} min ago`;
  }
  if (diff < 86_400_000) {
    const h = Math.round(diff / 3_600_000);
    return `${h} hr ago`;
  }
  const d = Math.round(diff / 86_400_000);
  return `${d}d ago`;
}

function formatSeconds(seconds: number): string {
  if (seconds < 1) return "<1 sec";
  if (seconds < 60) return `${seconds.toFixed(seconds < 10 ? 1 : 0)} sec`;
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return `${m}m ${s}s`;
}

function eventToActivity(evt: DemoEvent): ActivityItem {
  return {
    id: evt.id,
    channel: evt.channel,
    type: "Lead",
    customer: evt.customer,
    preview: evt.reply,
    time: formatRelativeTime(evt.timestamp),
    escalated: evt.escalated,
    keywords: evt.keywords,
  };
}

interface DbLead {
  id: string;
  customer_phone: string;
  customer_name: string | null;
  message: string;
  ai_response: string | null;
  channel: string;
  status: string;
  is_escalated: boolean;
  created_at: string;
}

function dbLeadToActivity(lead: DbLead): ActivityItem {
  const name = lead.customer_name || lead.customer_phone || "Unknown";
  return {
    id: lead.id,
    channel: (lead.channel?.toUpperCase() === "EMAIL" ? "Email" : "SMS") as "SMS" | "Email",
    type: "Lead",
    customer: name,
    preview: lead.ai_response || lead.message || "",
    time: formatRelativeTime(new Date(lead.created_at).getTime()),
    escalated: lead.is_escalated,
  };
}

export default function DashboardPage() {
  const { config, loaded } = useBusinessConfig();
  const isConfigured = loaded && config.businessName.length > 0;
  const { events, loaded: eventsLoaded } = useEvents();

  // Supabase state
  const [dbLoading, setDbLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [businessName, setBusinessName] = useState<string | null>(null);
  const [leadsResponded, setLeadsResponded] = useState(0);
  const [followUpsSent, setFollowUpsSent] = useState(0);
  const [reviewsRequested, setReviewsRequested] = useState(0);
  const [recentLeads, setRecentLeads] = useState<DbLead[]>([]);

  useEffect(() => {
    async function fetchDashboardData() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setDbLoading(false);
        return;
      }
      setUserId(user.id);

      // Fetch business name
      const { data: biz } = await supabase
        .from("businesses")
        .select("business_name")
        .eq("id", user.id)
        .single();
      if (biz?.business_name) setBusinessName(biz.business_name);

      // Fetch counts
      const [leadsRes, followUpsRes, reviewsRes, recentRes] = await Promise.all([
        supabase
          .from("leads")
          .select("id", { count: "exact", head: true })
          .eq("business_id", user.id)
          .eq("status", "responded"),
        supabase
          .from("follow_ups")
          .select("id", { count: "exact", head: true })
          .eq("business_id", user.id)
          .eq("status", "sent"),
        supabase
          .from("leads")
          .select("id", { count: "exact", head: true })
          .eq("business_id", user.id)
          .eq("status", "review_requested"),
        supabase
          .from("leads")
          .select("*")
          .eq("business_id", user.id)
          .order("created_at", { ascending: false })
          .limit(10),
      ]);

      setLeadsResponded(leadsRes.count ?? 0);
      setFollowUpsSent(followUpsRes.count ?? 0);
      setReviewsRequested(reviewsRes.count ?? 0);
      setRecentLeads((recentRes.data as DbLead[]) ?? []);
      setDbLoading(false);
    }
    fetchDashboardData();
  }, []);

  const realEvents = useMemo(
    () => [...events].sort((a, b) => b.timestamp - a.timestamp),
    [events]
  );

  const activityFeed = useMemo<ActivityItem[]>(() => {
    // Logged-in users only see real Supabase leads (no mock data)
    if (userId) {
      return recentLeads.map(dbLeadToActivity).slice(0, 10);
    }
    // Not logged in — mix demo events with mock data for public demo
    const real = realEvents.map(eventToActivity);
    return [...real, ...MOCK_ACTIVITY].slice(0, 6);
  }, [userId, recentLeads, realEvents]);

  const escalatedEvents = useMemo(
    () => realEvents.filter((e) => e.escalated),
    [realEvents]
  );

  const avgSeconds = useMemo(() => {
    const real = averageResponseSeconds(events);
    return real ?? FALLBACK_AVG_SECONDS;
  }, [events]);

  const speedupMultiplier = Math.min(
    67,
    Math.max(1, Math.round((INDUSTRY_AVG_MINUTES * 60) / Math.max(1, avgSeconds)))
  );

  const stats = [
    {
      label: "Leads Responded",
      value: userId ? leadsResponded : 47,
      icon: MessageCircle,
      accent: "from-[#1a1a2e] to-[#2d2d4e]",
    },
    {
      label: "Follow-Ups Sent",
      value: userId ? followUpsSent : 23,
      icon: RotateCcw,
      accent: "from-amber-500 to-amber-600",
    },
    {
      label: "Reviews Requested",
      value: userId ? reviewsRequested : 15,
      icon: Star,
      accent: "from-amber-500 to-orange-500",
    },
  ];

  const displayName = businessName || config.businessName || config.ownerName?.split(" ")[0] || "";

  return (
    <AppShell title="Dashboard">
      <div className="max-w-6xl mx-auto">
        {/* Welcome */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div className="min-w-0">
            {loaded || !dbLoading ? (
              <h2 className="text-2xl font-semibold tracking-tight text-gray-900">
                {displayName
                  ? `Welcome back, ${displayName}`
                  : "Welcome back"}
              </h2>
            ) : (
              <Skeleton className="h-8 w-64" />
            )}
            <p className="text-gray-500 mt-1.5 text-sm">
              Your AI is active and ready to respond.
            </p>
          </div>
          <Button asChild className="self-start sm:self-auto">
            <Link href="/demo">
              <Sparkles />
              Try a live demo
            </Link>
          </Button>
        </div>

        {!isConfigured && loaded && (
          <Card className="mb-6 border-blue-200 bg-[#EFF6FF] border-l-4 border-l-blue-500">
            <CardContent className="flex items-start gap-3 p-4">
              <div className="w-9 h-9 rounded-md bg-blue-500/10 text-blue-600 flex items-center justify-center shrink-0">
                <Bot className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium text-blue-900">
                  Finish setting up your business
                </div>
                <p className="text-xs text-blue-800/80 mt-0.5">
                  Add your business name, services, and tone so the AI can reply in your voice.
                </p>
              </div>
              <Link
                href="/setup"
                className="text-xs font-medium text-blue-900 hover:text-blue-700 inline-flex items-center gap-1"
              >
                Open setup
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </CardContent>
          </Card>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          {stats.map(({ label, value, icon: Icon, accent }) => (
            <Card key={label} className="hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      {label}
                    </div>
                    {dbLoading && userId ? (
                      <Skeleton className="h-9 w-16 mt-2" />
                    ) : (
                      <div className="text-3xl font-semibold text-gray-900 mt-2 tracking-tight">
                        {value}
                      </div>
                    )}
                  </div>
                  <div
                    className={`w-10 h-10 rounded-lg bg-gradient-to-br ${accent} flex items-center justify-center text-white shadow-md`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Response Speed */}
        <SpeedCard
          avgSeconds={avgSeconds}
          speedupMultiplier={speedupMultiplier}
          loaded={eventsLoaded}
        />

        {/* Escalation Alerts */}
        {escalatedEvents.length > 0 && (
          <EscalationAlerts events={escalatedEvents} />
        )}

        {/* Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 px-5 py-4 border-b">
              <div>
                <CardTitle>Recent activity</CardTitle>
                <CardDescription className="mt-0.5">
                  {userId
                    ? "Your real customer messages and AI replies."
                    : realEvents.length > 0
                    ? `${realEvents.length} live demo ${
                        realEvents.length === 1 ? "reply" : "replies"
                      } + sample customer messages.`
                    : "The last messages your AI sent on your behalf."}
                </CardDescription>
              </div>
              <span className="text-xs text-gray-400">Live</span>
            </CardHeader>
            <CardContent className="p-0">
              {dbLoading && userId ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                </div>
              ) : activityFeed.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
                    <MessageCircle className="w-6 h-6" />
                  </div>
                  <p className="mt-4 text-sm font-medium text-gray-900">No activity yet</p>
                  <p className="mt-1 text-xs text-gray-500 max-w-xs mx-auto">
                    Once customers text your number, their messages and AI replies will appear here.
                  </p>
                </div>
              ) : (
                <ul className="divide-y divide-gray-100">
                  {activityFeed.map((a) => (
                    <li
                      key={a.id}
                      className={`px-5 py-4 hover:bg-gray-50/60 transition-colors ${
                        a.escalated ? "bg-red-50/40 border-l-2 border-l-red-500" : ""
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-9 h-9 rounded-full text-white text-xs font-semibold flex items-center justify-center shrink-0 ${
                            a.escalated
                              ? "bg-gradient-to-br from-red-500 to-red-600"
                              : "bg-gradient-to-br from-[#1a1a2e] to-[#2d2d4e]"
                          }`}
                        >
                          {a.customer
                            .split(" ")
                            .map((p) => p[0])
                            .join("")
                            .slice(0, 2)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-medium text-gray-900">
                              {a.customer}
                            </span>
                            {a.escalated ? (
                              <Badge
                                variant="destructive"
                                className="bg-red-600 text-white border-transparent gap-1"
                              >
                                <AlertTriangle className="w-2.5 h-2.5" />
                                URGENT
                              </Badge>
                            ) : (
                              <Badge variant={ACTIVITY_BADGE_VARIANT[a.type]}>
                                {a.type}
                              </Badge>
                            )}
                            <span className="inline-flex items-center gap-1 text-[11px] text-gray-500">
                              {a.channel === "SMS" ? (
                                <Phone className="w-3 h-3" />
                              ) : (
                                <Mail className="w-3 h-3" />
                              )}
                              {a.channel}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mt-1 leading-relaxed line-clamp-2">
                            {a.preview}
                          </p>
                        </div>
                        <span className="text-[11px] text-gray-400 shrink-0">
                          {a.time}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="px-5 py-4">
              <CardTitle>AI status</CardTitle>
              <CardDescription>Everything is running.</CardDescription>
            </CardHeader>
            <CardContent className="px-5 pb-5">
              <div className="space-y-3">
                <StatusRow label="SMS responder" ok />
                <StatusRow label="Email follow-ups" ok />
                <StatusRow label="Cold quote re-engagement" ok />
                <StatusRow label="Review requests" ok />
              </div>

              <Separator className="my-5" />

              <div>
                <div className="text-xs text-gray-500">Avg response time</div>
                <div className="text-xl font-semibold text-gray-900 mt-1">
                  {formatSeconds(avgSeconds)}
                </div>
                <div className="text-[11px] text-emerald-600 mt-0.5 font-medium">
                  {speedupMultiplier}× faster than your competitors
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}

function SpeedCard({
  avgSeconds,
  speedupMultiplier,
  loaded,
}: {
  avgSeconds: number;
  speedupMultiplier: number;
  loaded: boolean;
}) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="px-5 py-4 border-b flex flex-row items-start justify-between space-y-0 gap-4">
        <div>
          <CardTitle className="inline-flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-600" />
            Response Speed
          </CardTitle>
        </div>
        <Badge variant="emerald" className="normal-case tracking-normal shrink-0">
          {speedupMultiplier}× faster
        </Badge>
      </CardHeader>
      <CardContent className="p-10 text-center">
        <div className="text-xs font-medium text-gray-500 uppercase tracking-widest">
          Response Speed
        </div>
        {loaded ? (
          <div className="text-6xl font-bold tracking-tight text-gray-900 mt-3">
            {formatSeconds(avgSeconds)}
          </div>
        ) : (
          <Skeleton className="h-16 w-40 mt-3 mx-auto" />
        )}
        <div className="mt-4 text-sm text-gray-500">
          Industry average: {INDUSTRY_AVG_MINUTES} min
        </div>
        <div className="mt-1 text-sm font-medium text-emerald-600">
          {speedupMultiplier}× faster than your competitors
        </div>
      </CardContent>
    </Card>
  );
}

function EscalationAlerts({ events }: { events: DemoEvent[] }) {
  const sorted = [...events].sort((a, b) => b.timestamp - a.timestamp);
  return (
    <Card className="mt-6 border-red-200">
      <CardHeader className="px-5 py-4 border-b border-red-100 bg-red-50/40 flex flex-row items-start justify-between space-y-0 gap-4">
        <div>
          <CardTitle className="inline-flex items-center gap-2 text-red-900">
            <AlertTriangle className="w-4 h-4 text-red-600" />
            Escalation Alerts
          </CardTitle>
          <CardDescription className="mt-0.5 text-red-800/70">
            Customer messages flagged as urgent — a real notification would
            be sent to the owner.
          </CardDescription>
        </div>
        <Badge
          variant="destructive"
          className="bg-red-600 text-white border-transparent shrink-0"
        >
          {sorted.length} flagged
        </Badge>
      </CardHeader>
      <CardContent className="p-0">
        <ul className="divide-y divide-red-100">
          {sorted.map((e) => (
            <li key={e.id} className="px-5 py-4">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-red-500 to-red-600 text-white flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium text-gray-900">
                      {e.customer}
                    </span>
                    {e.keywords.map((k) => (
                      <Badge
                        key={k}
                        variant="destructive"
                        className="bg-red-100 text-red-800 border-red-200"
                      >
                        {k}
                      </Badge>
                    ))}
                  </div>
                  <p className="text-sm text-gray-700 mt-1.5 leading-relaxed">
                    <span className="text-xs text-gray-500">Customer said: </span>
                    &ldquo;{e.userMessage}&rdquo;
                  </p>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                    <span className="font-medium text-gray-700">AI replied: </span>
                    {e.reply}
                  </p>
                </div>
                <span className="text-[11px] text-gray-400 shrink-0">
                  {formatRelativeTime(e.timestamp)}
                </span>
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

function StatusRow({ label, ok }: { label: string; ok: boolean }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-gray-700">{label}</span>
      <span
        className={`inline-flex items-center gap-1.5 text-xs font-medium ${
          ok ? "text-emerald-600" : "text-gray-400"
        }`}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
        {ok ? "Online" : "Offline"}
      </span>
    </div>
  );
}
