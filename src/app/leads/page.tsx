"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2, Mail, Phone, Search, Users } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { createClient } from "@/lib/supabase-browser";
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

type LeadStatus = "new" | "responded" | "followed_up" | "review_requested";
type LeadChannel = "sms" | "email";

interface Lead {
  id: string;
  customer_name: string | null;
  customer_phone: string | null;
  customer_email: string | null;
  message: string;
  ai_response: string | null;
  channel: LeadChannel;
  status: LeadStatus;
  is_escalated: boolean;
  created_at: string;
}

// Mock data for non-logged-in users
const MOCK_LEADS: Lead[] = [
  {
    id: "l-001",
    customer_name: "Sarah Mitchell",
    customer_phone: "+15551234567",
    customer_email: null,
    message: "Hey, got a wasp nest under my eaves — can someone come look today?",
    ai_response: "Hey Sarah! Thanks for reaching out — happy to take a look at the wasp nest.",
    channel: "sms",
    status: "responded",
    is_escalated: false,
    created_at: new Date(Date.now() - 4 * 60_000).toISOString(),
  },
  {
    id: "l-002",
    customer_name: "James Rodriguez",
    customer_phone: "+15559876543",
    customer_email: null,
    message: "My pool is turning green and I have a birthday party Saturday. Help!",
    ai_response: null,
    channel: "sms",
    status: "new",
    is_escalated: false,
    created_at: new Date(Date.now() - 12 * 60_000).toISOString(),
  },
  {
    id: "l-003",
    customer_name: "Emily Chen",
    customer_phone: null,
    customer_email: "emily@example.com",
    message: "Do you guys do quarterly pest control? How much for a 3BR?",
    ai_response: "Hi Emily! Yes we do — quarterly pest control for a 3BR runs about $89/visit.",
    channel: "email",
    status: "responded",
    is_escalated: false,
    created_at: new Date(Date.now() - 38 * 60_000).toISOString(),
  },
  {
    id: "l-004",
    customer_name: "Tom Walker",
    customer_phone: "+15555551234",
    customer_email: null,
    message: "Need a quote on weekly pool cleaning for a 15,000 gallon pool.",
    ai_response: "Hey Tom! Weekly pool cleaning for 15k gallons runs about $140/mo.",
    channel: "sms",
    status: "followed_up",
    is_escalated: false,
    created_at: new Date(Date.now() - 92 * 60_000).toISOString(),
  },
];

type FilterKey = "all" | "new" | "responded";

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "all", label: "All" },
  { key: "new", label: "New" },
  { key: "responded", label: "Responded" },
];

const STATUS_BADGE: Record<
  string,
  { variant: "amber" | "emerald" | "slate"; label: string }
> = {
  new: { variant: "amber", label: "New" },
  responded: { variant: "emerald", label: "Responded" },
  followed_up: { variant: "slate", label: "Followed Up" },
  review_requested: { variant: "emerald", label: "Review Requested" },
};

function formatTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  if (diff < 60_000) return "just now";
  const mins = Math.floor(diff / 60_000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function getDisplayName(lead: Lead): string {
  if (lead.customer_name) return lead.customer_name;
  if (lead.customer_phone) return lead.customer_phone;
  if (lead.customer_email) return lead.customer_email;
  return "Unknown";
}

function getInitials(name: string): string {
  // For phone numbers, use first 2 digits after +
  if (name.startsWith("+")) return name.slice(1, 3);
  return name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function LeadsPage() {
  const [filter, setFilter] = useState<FilterKey>("all");
  const [query, setQuery] = useState("");
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    async function fetchLeads() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setLeads(MOCK_LEADS);
        setLoading(false);
        return;
      }

      setIsLoggedIn(true);

      const { data, error } = await supabase
        .from("leads")
        .select("*")
        .eq("business_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Failed to fetch leads:", error);
        setLeads([]);
      } else {
        setLeads((data as Lead[]) ?? []);
      }
      setLoading(false);
    }
    fetchLeads();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return leads.filter((lead) => {
      if (filter === "new" && lead.status !== "new") return false;
      if (filter === "responded" && lead.status !== "responded") return false;
      if (!q) return true;
      const name = getDisplayName(lead).toLowerCase();
      return (
        name.includes(q) ||
        lead.message?.toLowerCase().includes(q)
      );
    });
  }, [filter, query, leads]);

  const counts = useMemo(
    () => ({
      all: leads.length,
      new: leads.filter((l) => l.status === "new").length,
      responded: leads.filter((l) => l.status === "responded").length,
    }),
    [leads]
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
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
            </div>
          ) : filtered.length > 0 ? (
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
                  const name = getDisplayName(lead);
                  const statusMeta = STATUS_BADGE[lead.status] || STATUS_BADGE["new"];
                  return (
                    <TableRow key={lead.id}>
                      <TableCell>
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#1a1a2e] to-[#2d2d4e] text-white text-[11px] font-semibold flex items-center justify-center shrink-0">
                            {getInitials(name)}
                          </div>
                          <span className="font-medium text-sm text-gray-900 whitespace-nowrap">
                            {name}
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
                          {lead.channel === "sms" ? (
                            <Phone className="w-3.5 h-3.5 text-gray-400" />
                          ) : (
                            <Mail className="w-3.5 h-3.5 text-gray-400" />
                          )}
                          {lead.channel.toUpperCase()}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusMeta.variant}>
                          {statusMeta.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="text-xs text-gray-500 whitespace-nowrap">
                          {formatTimeAgo(lead.created_at)}
                        </span>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : isLoggedIn && leads.length === 0 ? (
            <EmptyStateReal />
          ) : (
            <EmptyStateSearch />
          )}
        </Card>

        {!isLoggedIn && (
          <p className="mt-4 text-[11px] text-gray-400 text-center">
            Sample data shown for preview — your real leads will appear here once a phone
            number is connected.
          </p>
        )}
      </div>
    </AppShell>
  );
}

function EmptyStateReal() {
  return (
    <Card className="border-0 shadow-none">
      <CardHeader className="text-center pt-10">
        <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
          <Users className="w-6 h-6" />
        </div>
        <CardTitle className="mt-4 text-[15px]">No leads yet</CardTitle>
        <CardDescription>
          Once customers text your number, they will appear here.
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-10" />
    </Card>
  );
}

function EmptyStateSearch() {
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
