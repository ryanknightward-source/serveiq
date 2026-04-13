"use client";

import { useCallback, useEffect, useState } from "react";
import type { EscalationKeyword } from "./escalation";

export interface DemoEvent {
  id: string;
  customer: string;
  channel: "SMS" | "Email";
  userMessage: string;
  reply: string;
  timestamp: number;
  durationMs: number;
  escalated: boolean;
  keywords: EscalationKeyword[];
}

export const EVENTS_STORAGE_KEY = "serveiq.events.v1";
const MAX_EVENTS = 50;
const STORAGE_EVENT = "serveiq:events-changed";

function readEvents(): DemoEvent[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(EVENTS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isValidEvent);
  } catch {
    return [];
  }
}

function writeEvents(events: DemoEvent[]) {
  if (typeof window === "undefined") return;
  try {
    const trimmed = events.slice(-MAX_EVENTS);
    localStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(trimmed));
    window.dispatchEvent(new Event(STORAGE_EVENT));
  } catch {
    // ignore quota / private mode failures
  }
}

function isValidEvent(e: unknown): e is DemoEvent {
  if (!e || typeof e !== "object") return false;
  const o = e as Record<string, unknown>;
  return (
    typeof o.id === "string" &&
    typeof o.userMessage === "string" &&
    typeof o.reply === "string" &&
    typeof o.timestamp === "number" &&
    typeof o.durationMs === "number" &&
    typeof o.escalated === "boolean" &&
    Array.isArray(o.keywords)
  );
}

export function appendEvent(event: Omit<DemoEvent, "id">): DemoEvent {
  const full: DemoEvent = {
    id: `${event.timestamp}-${Math.random().toString(36).slice(2, 8)}`,
    ...event,
  };
  const events = readEvents();
  events.push(full);
  writeEvents(events);
  return full;
}

export function clearEvents() {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(EVENTS_STORAGE_KEY);
    window.dispatchEvent(new Event(STORAGE_EVENT));
  } catch {
    // ignore
  }
}

/**
 * Subscribe to the demo events log. Updates when events are appended in
 * this tab or in another tab (via the storage event).
 */
export function useEvents() {
  const [events, setEvents] = useState<DemoEvent[]>([]);
  const [loaded, setLoaded] = useState(false);

  const refresh = useCallback(() => {
    setEvents(readEvents());
  }, []);

  useEffect(() => {
    refresh();
    setLoaded(true);

    const onChange = () => refresh();
    const onStorage = (e: StorageEvent) => {
      if (e.key === EVENTS_STORAGE_KEY) refresh();
    };

    window.addEventListener(STORAGE_EVENT, onChange);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener(STORAGE_EVENT, onChange);
      window.removeEventListener("storage", onStorage);
    };
  }, [refresh]);

  return { events, loaded, refresh };
}

// ---- Derived data helpers ----------------------------------------------------

export interface DailyBucket {
  /** ISO date YYYY-MM-DD */
  date: string;
  /** Short label like "Mon" */
  label: string;
  /** Average response time in seconds, or null if no data */
  avgSeconds: number | null;
  /** Number of events in this bucket */
  count: number;
}

const DAY_MS = 24 * 60 * 60 * 1000;

/** Bucket events into the last `days` days (oldest first). */
export function bucketByDay(events: DemoEvent[], days = 7): DailyBucket[] {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const buckets: DailyBucket[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const day = new Date(now.getTime() - i * DAY_MS);
    const iso = day.toISOString().slice(0, 10);
    const label = day.toLocaleDateString("en-US", { weekday: "short" });
    buckets.push({ date: iso, label, avgSeconds: null, count: 0 });
  }
  const byIso = new Map(buckets.map((b) => [b.date, b]));

  for (const evt of events) {
    const day = new Date(evt.timestamp);
    day.setHours(0, 0, 0, 0);
    const iso = day.toISOString().slice(0, 10);
    const bucket = byIso.get(iso);
    if (!bucket) continue;
    const seconds = evt.durationMs / 1000;
    if (bucket.avgSeconds === null) {
      bucket.avgSeconds = seconds;
      bucket.count = 1;
    } else {
      bucket.avgSeconds =
        (bucket.avgSeconds * bucket.count + seconds) / (bucket.count + 1);
      bucket.count += 1;
    }
  }
  return buckets;
}

/** Overall average response time in seconds across all events. */
export function averageResponseSeconds(events: DemoEvent[]): number | null {
  if (events.length === 0) return null;
  const total = events.reduce((sum, e) => sum + e.durationMs, 0);
  return total / events.length / 1000;
}
