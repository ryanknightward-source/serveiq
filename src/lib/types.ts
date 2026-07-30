// ── Lesson types ─────────────────────────────────────────────────────────────

export type LessonTypeId = "30min-solo" | "60min-solo" | "60min-2kids";

export interface LessonType {
  id: LessonTypeId;
  name: string;
  durationMinutes: number;
  maxStudents: number;
  priceCents: number;
  priceDisplay: string;
  description: string;
}

export const LESSON_TYPES: Record<LessonTypeId, LessonType> = {
  "30min-solo": {
    id: "30min-solo",
    name: "30-Minute Private Lesson",
    durationMinutes: 30,
    maxStudents: 1,
    priceCents: 5000,
    priceDisplay: "$50",
    description: "Focused 30-minute session for one player.",
  },
  "60min-solo": {
    id: "60min-solo",
    name: "60-Minute Private Lesson",
    durationMinutes: 60,
    maxStudents: 1,
    priceCents: 8000,
    priceDisplay: "$80",
    description: "Full 60-minute session for one player.",
  },
  "60min-2kids": {
    id: "60min-2kids",
    name: "60-Minute Lesson (2 Kids)",
    durationMinutes: 60,
    maxStudents: 2,
    priceCents: 12000,
    priceDisplay: "$120",
    description: "60-minute session for two players — siblings or teammates.",
  },
};

// ── Booking ───────────────────────────────────────────────────────────────────

export interface BookingFormData {
  lessonTypeId: LessonTypeId;
  preferredDate: string;      // YYYY-MM-DD
  preferredTime: string;      // HH:MM (24h)
  parentName: string;
  parentEmail: string;
  parentPhone: string;
  student1Name: string;
  student1Age: string;
  student2Name: string;       // only for 60min-2kids
  student2Age: string;        // only for 60min-2kids
  notes: string;
}

export type PaymentStatus = "pending" | "paid" | "cancelled";

export interface Booking {
  id: string;
  lessonTypeId: LessonTypeId;
  preferredDate: string;
  preferredTime: string;
  parentName: string;
  parentEmail: string;
  parentPhone: string;
  student1Name: string;
  student1Age: number;
  student2Name?: string;
  student2Age?: number;
  notes?: string;
  stripeSessionId?: string;
  paymentStatus: PaymentStatus;
  createdAt: string;
}

// ── Legacy exports — kept so existing admin pages (setup, dashboard) compile ──

export type ServiceKey =
  | "hitting"
  | "fielding"
  | "throwing"
  | "footwork"
  | "pest_control"
  | "pool_cleaning"
  | "pool_repair"
  | "lawn_care";

export const SERVICE_LABELS: Record<ServiceKey, string> = {
  hitting: "Hitting",
  fielding: "Fielding",
  throwing: "Throwing",
  footwork: "Footwork",
  pest_control: "Pest Control",
  pool_cleaning: "Pool Cleaning",
  pool_repair: "Pool Repair",
  lawn_care: "Lawn Care",
};

export type Tone = "Friendly" | "Professional" | "Direct";

export interface BusinessConfig {
  businessName: string;
  ownerName: string;
  phone: string;
  email: string;
  services: ServiceKey[];
  pricing: Partial<Record<ServiceKey, string>>;
  tone: Tone;
  voiceExamples: string;
}

export const DEFAULT_CONFIG: BusinessConfig = {
  businessName: "Ryan Ward Baseball",
  ownerName: "Ryan Ward",
  phone: "",
  email: "ryanknightward@gmail.com",
  services: [],
  pricing: {},
  tone: "Friendly",
  voiceExamples: "",
};

export const STORAGE_KEY = "ryanward.config.v1";
