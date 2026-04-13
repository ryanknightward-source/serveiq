"use client";

import { useCallback, useEffect, useState } from "react";
import {
  BusinessConfig,
  DEFAULT_CONFIG,
  STORAGE_KEY,
} from "./types";

export function useBusinessConfig() {
  const [config, setConfig] = useState<BusinessConfig>(DEFAULT_CONFIG);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as BusinessConfig;
        setConfig({ ...DEFAULT_CONFIG, ...parsed });
      }
    } catch {
      // ignore
    }
    setLoaded(true);
  }, []);

  const save = useCallback((next: BusinessConfig) => {
    setConfig(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // ignore
    }
  }, []);

  return { config, setConfig: save, loaded };
}

export function readConfigSync(): BusinessConfig | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return { ...DEFAULT_CONFIG, ...(JSON.parse(raw) as BusinessConfig) };
  } catch {
    return null;
  }
}
