"use client";

import { useMemo } from "react";
import {
  Calendar,
  CheckCircle2,
  Clock,
  Eye,
  Mail,
  MessageSquare,
  Phone,
  Send,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type FollowUpStatus = "Scheduled" | "Sent" | "Opened";
type Channel = "SMS" | "Email";

interface FollowUp {
  id: string;
  customer: string;
  channel: Channel;
  originalInquiry: string;
  messagePreview: string;
  // Hours relative to "now" — negative = past, positive = future. Deterministic.
  hoursOffset: number;
  status: FollowUpStatus;
}

const FOLLOW_UPS: FollowUp[] = [
  {
    id: "f-001",
    customer: "Sarah Mitchell",
    channel: "SMS",
    originalInquiry: "Quarterly pest control quote — $89/visit",
    messagePreview:
      "Hey Sarah! Just circling back on the pest control quote from last week — still want me to get you on the Tuesday route?",
    hoursOffset: 2,
    status: "Scheduled",
  },
  {
    id: "f-002",
    customer: "James Rodriguez",
    channel: "SMS",
    originalInquiry: "Weekly pool cleaning — 15,000 gallons, $140/mo",
    messagePreview:
      "Hi James, wanted to follow up on the weekly pool cleaning estimate. We just had a Saturday slot open up if you want it.",
    hoursOffset: -3,
    status: "Sent",
  },
  {
    id: "f-003",
    customer: "Emily Chen",
    channel: "Email",
    originalInquiry: "Termite inspection — $175 one-time",
    messagePreview:
      "Hi Emily — checking back on the termite inspection. We can usually squeeze these in within 48 hours, just let me know.",
    hoursOffset: -26,
    status: "Opened",
  },
  {
    id: "f-004",
    customer: "Tom Walker",
    channel: "SMS",
    originalInquiry: "Pool heater repair quote — $320",
    messagePreview:
      "Hey Tom, still thinking about the heater repair? Happy to answer any questions — it's a 2-3 hour job tops.",
    hoursOffset: 24,
    status: "Scheduled",
  },
  {
    id: "f-005",
    customer: "Linda Park",
    channel: "Email",
    originalInquiry: "Monthly pest control renewal",
    messagePreview:
      "Hi Linda, your monthly pest service is due to renew next week — want me to keep you on the schedule for your usual Thursday?",
    hoursOffset: -48,
    status: "Opened",
  },
  {
    id: "f-006",
    customer: "Marcus Bailey",
    channel: "SMS",
    originalInquiry: "Tile cleaning quote — $220",
    messagePreview:
      "Hey Marcus, touching base on the tile cleaning quote. If Friday morning works I can lock it in right now.",
    hoursOffset: 48,
    status: "Scheduled",
  },
];

const STATUS_META: Record<
  FollowUpStatus,
  { badge: "amber" | "slate" | "emerald"; icon: React.ComponentType<{ className?: string }> }
> = {
  Scheduled: { badge: "amber", icon: Clock },
  Sent: { badge: "slate", icon: Send },
  Opened: { badge: "emerald", icon: Eye },
};

function formatScheduleTime(hoursOffset: number): string {
  if (hoursOffset === 0) return "now";
  const abs = Math.abs(hoursOffset);
  if (hoursOffset > 0) {
    if (abs < 24) return `in ${abs}h`;
    const days = Math.round(abs / 24);
    return `in ${days}d`;
  }
  if (abs < 24) return `${abs}h ago`;
  const days = Math.round(abs / 24);
  return `${days}d ago`;
}

export default function FollowUpsPage() {
  const counts = useMemo(
    () => ({
      scheduled: FOLLOW_UPS.filter((f) => f.status === "Scheduled").length,
      sent: FOLLOW_UPS.filter((f) => f.status === "Sent").length,
      opened: FOLLOW_UPS.filter((f) => f.status === "Opened").length,
    }),
    []
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
          />
          <StatCard
            label="Sent"
            value={counts.sent}
            icon={Send}
            accent="from-[#1a1a2e] to-[#2d2d4e]"
          />
          <StatCard
            label="Opened"
            value={counts.opened}
            icon={Eye}
            accent="from-emerald-500 to-emerald-600"
          />
        </div>

        {/* Queue */}
        <Card>
          <CardHeader className="px-5 py-4 border-b">
            <CardTitle className="inline-flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-amber-600" />
              Upcoming & recent follow-ups
            </CardTitle>
            <CardDescription>
              {FOLLOW_UPS.length} follow-ups across your active customers.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <ul className="divide-y divide-gray-100">
              {FOLLOW_UPS.map((f) => {
                const meta = STATUS_META[f.status];
                const Icon = meta.icon;
                return (
                  <li
                    key={f.id}
                    className="px-5 py-4 hover:bg-gray-50/60 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#1a1a2e] to-[#2d2d4e] text-white text-[11px] font-semibold flex items-center justify-center shrink-0">
                        {f.customer
                          .split(" ")
                          .map((p) => p[0])
                          .join("")
                          .slice(0, 2)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-medium text-gray-900">
                            {f.customer}
                          </span>
                          <Badge variant={meta.badge} className="gap-1">
                            <Icon className="w-2.5 h-2.5" />
                            {f.status}
                          </Badge>
                          <span className="inline-flex items-center gap-1 text-[11px] text-gray-500">
                            {f.channel === "SMS" ? (
                              <Phone className="w-3 h-3" />
                            ) : (
                              <Mail className="w-3 h-3" />
                            )}
                            {f.channel}
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-500 mt-1 uppercase tracking-wide">
                          Original inquiry
                        </p>
                        <p className="text-xs text-gray-600 -mt-0.5">
                          {f.originalInquiry}
                        </p>
                        <p className="text-sm text-gray-700 mt-2 leading-relaxed line-clamp-2">
                          &ldquo;{f.messagePreview}&rdquo;
                        </p>
                      </div>
                      <div className="shrink-0 text-right">
                        <div className="inline-flex items-center gap-1 text-[11px] font-medium text-gray-500">
                          <Calendar className="w-3 h-3" />
                          {formatScheduleTime(f.hoursOffset)}
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
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
}: {
  label: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  accent: string;
}) {
  return (
    <Card>
      <CardContent className="p-5 flex items-center justify-between">
        <div>
          <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
            {label}
          </div>
          <div className="text-3xl font-semibold text-gray-900 mt-2 tracking-tight">
            {value}
          </div>
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
