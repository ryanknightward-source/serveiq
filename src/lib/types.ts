export type ServiceKey =
  | "pest_control"
  | "pool_cleaning"
  | "pool_repair"
  | "lawn_care";

export const SERVICE_LABELS: Record<ServiceKey, string> = {
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
  /** Real text-message examples the owner has written, used to mimic voice. */
  voiceExamples: string;
}

export const DEFAULT_CONFIG: BusinessConfig = {
  businessName: "",
  ownerName: "",
  phone: "",
  email: "",
  services: [],
  pricing: {},
  tone: "Friendly",
  voiceExamples: "",
};

export const STORAGE_KEY = "serveiq.config.v1";
