"use client";

import { useMemo, useState } from "react";
import { Mail, Phone, Search, Users } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

type LeadStatus = "New" | "Responded" | "Followed Up";
type LeadChannel = "SMS" | "Email";

interface Lead {
  id: string;
  name: string;
  message: string;
  channel: LeadChannel;
  status: LeadStatus;
  // Minutes ago since the lead came in (for deterministic mock data).
  minutesAgo: number;
}

// Deterministic mock data — not randomized so server and client render the same.
const LEADS: Lead[] = [
  {
    id: "l-001",
    name: "Sarah Mitchell",
    message: "Hey, got a wasp nest under my eaves — can someone come look today?",
    channel: "SMS",
    status: "Responded",
    minutesAgo: 4,
  },
  {
    id: "l-002",
    name: "James Rodriguez",
    message: "My pool is turning green and I have a birthday party Saturday. Help!",
    channel: "SMS",
    status: "New",
    minutesAgo: 12,
  },
  {
    id: "l-003",
    name: "Emily Chen",
    message: "Do you guys do quarterly pest control? How much for a 3BR?",
    channel: "Email",
    status: "Responded",
    minutesAgo: 38,
  },
  {
    id: "l-004",
    name: "Tom Walker",
    message: "Need a quote on weekly pool cleaning for a 15,000 gallon pool.",
    channel: "SMS",
    status: "Followed Up",
    minutesAgo: 92,
  },
  {
    id: "l-005",
    name: "Linda Park",
    message: "Pool pump is making a grinding noise. Is that something you repair?",
    channel: "Email",
    status: "New",
    minutesAgo: 121,
  },
  {
    id: "l-006",
    name: "Marcus Bailey",
    message: "Saw roaches in my kitchen last night. What's your next available slot?",
    channel: "SMS",
    status: "Responded",
    minutesAgo: 186,
  },
  {
    id: "l-007",
    name: "Jessica Nguyen",
    message: "Hi! Quoted me $220 for tile cleaning 6 weeks ago — still want to book that.",
    channel: "Email",
    status: "Followed Up",
    minutesAgo: 240,
  },
  {
    id: "l-008",
    name: "David Hoffman",
    message: "Rodent issue in the garage — traps aren't working. Got any openings this week?",
    channel: "SMS",
    status: "New",
    minutesAgo: 305,
  },
];

type FilterKey = "all" | "new" | "responded";

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "all", label: "All" },
  { key: "new", label: "New" },
  { key: "responded", label: "Responded" },
];

function formatMinutesAgo(mins: number): string {
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) {
    const rem = mins % 60;
    return rem === 0 ? `${hours}h ago` : `${hours}h ${rem}m ago`;
  }
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

const STATUS_BADGE: Record<
  LeadStatus,
  { variant: "amber" | "emerald" | "slate"; label: string }
> = {
  New: { variant: "amber", label: "New" },
  Responded: { variant: "emerald", label: "Responded" },
  "Followed Up": { variant: "slate", label: "Followed Up" },
};

export default function LeadsPage() {
  const [filter, setFilter] = useState<FilterKey>("all");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return LEADS.filter((lead) => {
      if (filter === "new" && lead.status !== "New") return false;
      if (filter === "responded" && lead.status !== "Responded") return false;
      if (!q) return true;
      return (
        lead.name.toLowerCase().includes(q) ||
        lead.message.toLowerCase().includes(q)
      );
    });
  }, [filter, query]);

  const counts = useMemo(
    () => ({
      all: LEADS.length,
      new: LEADS.filter((l) => l.status === "New").length,
      responded: LEADS.filter((l) => l.status === "Responded").length,
    }),
    []
  );

  return (
    <AppShell title="Leads">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-gray-900">
              Leads inbox
            </h2>
            <p className="text-gray-500 mt-1.5 text-sm">
              Every incoming lead, the AI&apos;s reply, and where each conversation stands.
            </p>
          </div>
        </div>

        <Card>
          {/* Filter bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 p-4">
            <div
              role="tablist"
              aria-label="Lead status filter"
              className="inline-flex items-center gap-1 rounded-lg bg-gray-100/70 p-1"
            >
              {FILTERS.map(({ key, label }) => {
                const active = filter === key;
                return (
                  <button
                    key={key}
                    role="tab"
                    aria-selected={active}
                    onClick={() => setFilter(key)}
                    className={`text-sm font-medium px-3 h-8 rounded-md transition-colors inline-flex items-center gap-1.5 ${
                      active
                        ? "bg-white text-gray-900 shadow-sm"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    {label}
                    <span
                      className={`text-[11px] px-1.5 rounded-full ${
                        active
                          ? "bg-amber-100 text-amber-800"
                          : "bg-gray-200 text-gray-600"
                      }`}
                    >
                      {counts[key]}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search leads…"
                className="pl-8 h-9"
                aria-label="Search leads"
              />
            </div>
          </div>

          {/* Table */}
          {filtered.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead className="min-w-[260px]">Message</TableHead>
                  <TableHead>Channel</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((lead) => {
                  const statusMeta = STATUS_BADGE[lead.status];
                  return (
                    <TableRow key={lead.id}>
                      <TableCell>
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#1a1a2e] to-[#2d2d4e] text-white text-[11px] font-semibold flex items-center justify-center shrink-0">
                            {lead.name
                              .split(" ")
                              .map((p) => p[0])
                              .join("")
                              .slice(0, 2)}
                          </div>
                          <span className="font-medium text-sm text-gray-900 whitespace-nowrap">
                            {lead.name}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm text-gray-600 line-clamp-2 max-w-md">
                          {lead.message}
                        </p>
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center gap-1.5 text-xs text-gray-600">
                          {lead.channel === "SMS" ? (
                            <Phone className="w-3.5 h-3.5 text-gray-400" />
                          ) : (
                            <Mail className="w-3.5 h-3.5 text-gray-400" />
                          )}
                          {lead.channel}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusMeta.variant}>
                          {statusMeta.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="text-xs text-gray-500 whitespace-nowrap">
                          {formatMinutesAgo(lead.minutesAgo)}
                        </span>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <EmptyState />
          )}
        </Card>

        <p className="mt-4 text-[11px] text-gray-400 text-center">
          Sample data shown for preview — your real leads will appear here once a phone
          number is connected.
        </p>
      </div>
    </AppShell>
  );
}

function EmptyState() {
  return (
    <Card className="border-0 shadow-none">
      <CardHeader className="text-center pt-10">
        <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
          <Users className="w-6 h-6" />
        </div>
        <CardTitle className="mt-4 text-[15px]">No matching leads</CardTitle>
        <CardDescription>
          Try a different filter or clear your search.
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-10" />
    </Card>
  );
}
