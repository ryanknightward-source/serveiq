"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Calendar,
  CheckCircle2,
  Clock,
  Eye,
  Loader2,
  Mail,
  MessageSquare,
  Phone,
  Send,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { createClient } from "@/lib/supabase-browser";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type FollowUpStatus = "scheduled" | "sent" | "opened";
type Channel = "sms" | "email";

interface FollowUp {
  id: string;
  lead_id: string | null;
  message: string;
  channel: Channel;
  status: FollowUpStatus;
  scheduled_for: string | null;
  sent_at: string | null;
  opened_at: string | null;
  created_at: string;
  // Joined from lead
  customer_phone?: string;
  customer_name?: string;
  original_message?: string;
}

// Mock data for non-logged-in users
const MOCK_FOLLOW_UPS: FollowUp[] = [
  {
    id: "f-001",
    lead_id: null,
    message: "Hey Sarah! Just circling back on the pest control quote from last week — still want me to get you on the Tuesday route?",
    channel: "sms",
    status: "scheduled",
    scheduled_for: new Date(Date.now() + 2 * 3_600_000).toISOString(),
    sent_at: null,
    opened_at: null,
    created_at: new Date().toISOString(),
    customer_name: "Sarah Mitchell",
    original_message: "Quarterly pest control quote — $89/visit",
  },
  {
    id: "f-002",
    lead_id: null,
    message: "Hi James, wanted to follow up on the weekly pool cleaning estimate. We just had a Saturday slot open up if you want it.",
    channel: "sms",
    status: "sent",
    scheduled_for: null,
    sent_at: new Date(Date.now() - 3 * 3_600_000).toISOString(),
    opened_at: null,
    created_at: new Date(Date.now() - 4 * 3_600_000).toISOString(),
    customer_name: "James Rodriguez",
    original_message: "Weekly pool cleaning — 15,000 gallons, $140/mo",
  },
  {
    id: "f-003",
    lead_id: null,
    message: "Hi Emily — checking back on the termite inspection. We can usually squeeze these in within 48 hours, just let me know.",
    channel: "email",
    status: "opened",
    scheduled_for: null,
    sent_at: new Date(Date.now() - 26 * 3_600_000).toISOString(),
    opened_at: new Date(Date.now() - 24 * 3_600_000).toISOString(),
    created_at: new Date(Date.now() - 28 * 3_600_000).toISOString(),
    customer_name: "Emily Chen",
    original_message: "Termite inspection — $175 one-time",
  },
  {
    id: "f-004",
    lead_id: null,
    message: "Hey Tom, still thinking about the heater repair? Happy to answer any questions — it's a 2-3 hour job tops.",
    channel: "sms",
    status: "scheduled",
    scheduled_for: new Date(Date.now() + 24 * 3_600_000).toISOString(),
    sent_at: null,
    opened_at: null,
    created_at: new Date().toISOString(),
    customer_name: "Tom Walker",
    original_message: "Pool heater repair quote — $320",
  },
];

const STATUS_META: Record<
  string,
  { badge: "amber" | "slate" | "emerald"; icon: React.ComponentType<{ className?: string }> }
> = {
  scheduled: { badge: "amber", icon: Clock },
  sent: { badge: "slate", icon: Send },
  opened: { badge: "emerald", icon: Eye },
};

function formatScheduleTime(dateStr: string | null): string {
  if (!dateStr) return "";
  const diff = new Date(dateStr).getTime() - Date.now();
  const abs = Math.abs(diff);
  const hours = Math.floor(abs / 3_600_000);
  if (diff > 0) {
    if (hours < 24) return `in ${hours}h`;
    const days = Math.round(hours / 24);
    return `in ${days}d`;
  }
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  return `${days}d ago`;
}

function getDisplayName(f: FollowUp): string {
  if (f.customer_name) return f.customer_name;
  if (f.customer_phone) return f.customer_phone;
  return "Unknown";
}

function getInitials(name: string): string {
  if (name.startsWith("+")) return name.slice(1, 3);
  return name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function FollowUpsPage() {
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    async function fetchFollowUps() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setFollowUps(MOCK_FOLLOW_UPS);
        setLoading(false);
        return;
      }

      setIsLoggedIn(true);

      const { data, error } = await supabase
        .from("follow_ups")
        .select(`
          *,
          leads:lead_id (
            customer_phone,
            customer_name,
            message
          )
        `)
        .eq("business_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Failed to fetch follow-ups:", error);
        setFollowUps([]);
      } else {
        const mapped = (data ?? []).map((row: any) => ({
          ...row,
          customer_phone: row.leads?.customer_phone,
          customer_name: row.leads?.customer_name,
          original_message: row.leads?.message,
        }));
        setFollowUps(mapped);
      }
      setLoading(false);
    }
    fetchFollowUps();
  }, []);

  const counts = useMemo(
    () => ({
      scheduled: followUps.filter((f) => f.status === "scheduled").length,
      sent: followUps.filter((f) => f.status === "sent").length,
      opened: followUps.filter((f) => f.status === "opened").length,
    }),
    [followUps]
  );

  return (
    <AppShell title="Follow-Ups">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold tracking-tight text-gray-900">
            Follow-up queue
          </h2>
          <p className="text-gray-500 mt-1.5 text-sm">
            Automatic nudges ServeIQ has queued for cold quotes and lapsed customers.
          </p>
        </div>

        {/* Summary stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <StatCard
            label="Scheduled"
            value={counts.scheduled}
            icon={Clock}
            accent="from-amber-500 to-orange-500"
            loading={loading}
          />
          <StatCard
            label="Sent"
            value={counts.sent}
            icon={Send}
            accent="from-[#1a1a2e] to-[#2d2d4e]"
            loading={loading}
          />
          <StatCard
            label="Opened"
            value={counts.opened}
            icon={Eye}
            accent="from-emerald-500 to-emerald-600"
            loading={loading}
          />
        </div>

        {/* Queue */}
        <Card>
          <CardHeader className="px-5 py-4 border-b">
            <CardTitle className="inline-flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-amber-600" />
              Follow-up queue
            </CardTitle>
            <CardDescription>
              {loading
                ? "Loading follow-ups…"
                : followUps.length > 0
                ? `${followUps.length} follow-up${followUps.length === 1 ? "" : "s"} across your active customers.`
                : "No follow-ups yet."}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
              </div>
            ) : followUps.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <p className="mt-4 text-sm font-medium text-gray-900">No follow-ups scheduled yet.</p>
                <p className="mt-1 text-xs text-gray-500">
                  {isLoggedIn
                    ? "Follow-ups will appear here as ServeIQ engages with your leads."
                    : "Sign up and connect your phone number to get started."}
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-100">
                {followUps.map((f) => {
                  const meta = STATUS_META[f.status] || STATUS_META["scheduled"];
                  const Icon = meta.icon;
                  const name = getDisplayName(f);
                  const timeStr = f.status === "scheduled"
                    ? formatScheduleTime(f.scheduled_for)
                    : f.status === "opened"
                    ? formatScheduleTime(f.opened_at)
                    : formatScheduleTime(f.sent_at);
                  return (
                    <li
                      key={f.id}
                      className="px-5 py-4 hover:bg-gray-50/60 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#1a1a2e] to-[#2d2d4e] text-white text-[11px] font-semibold flex items-center justify-center shrink-0">
                          {getInitials(name)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-medium text-gray-900">
                              {name}
                            </span>
                            <Badge variant={meta.badge} className="gap-1">
                              <Icon className="w-2.5 h-2.5" />
                              {f.status.charAt(0).toUpperCase() + f.status.slice(1)}
                            </Badge>
                            <span className="inline-flex items-center gap-1 text-[11px] text-gray-500">
                              {f.channel === "sms" ? (
                                <Phone className="w-3 h-3" />
                              ) : (
                                <Mail className="w-3 h-3" />
                              )}
                              {f.channel.toUpperCase()}
                            </span>
                          </div>
                          {f.original_message && (
                            <>
                              <p className="text-[11px] text-gray-500 mt-1 uppercase tracking-wide">
                                Original inquiry
                              </p>
                              <p className="text-xs text-gray-600 -mt-0.5">
                                {f.original_message}
                              </p>
                            </>
                          )}
                          <p className="text-sm text-gray-700 mt-2 leading-relaxed line-clamp-2">
                            &ldquo;{f.message}&rdquo;
                          </p>
                        </div>
                        <div className="shrink-0 text-right">
                          <div className="inline-flex items-center gap-1 text-[11px] font-medium text-gray-500">
                            <Calendar className="w-3 h-3" />
                            {timeStr}
                          </div>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </CardContent>
        </Card>

        <div className="mt-6 rounded-xl border border-dashed border-gray-200 bg-white/40 p-5 flex items-start gap-3">
          <div className="w-9 h-9 rounded-md bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">
              ServeIQ pauses follow-ups as soon as a customer replies.
            </p>
            <p className="text-xs text-gray-500 mt-0.5">
              The goal is helpful, not annoying — scheduled nudges are canceled the
              moment a reply comes in on either channel.
            </p>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  accent,
  loading,
}: {
  label: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  accent: string;
  loading: boolean;
}) {
  return (
    <Card>
      <CardContent className="p-5 flex items-center justify-between">
        <div>
          <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
            {label}
          </div>
          {loading ? (
            <div className="h-9 w-10 mt-2 rounded bg-gray-100 animate-pulse" />
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
      </CardContent>
    </Card>
  );
}
