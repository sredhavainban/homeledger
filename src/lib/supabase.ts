import { createClient } from "@supabase/supabase-js";

function getEnvOrStorage(keys: string[], storageKey: string): string | undefined {
  for (const k of keys) {
    const val = (import.meta.env as Record<string, string | undefined>)[k];
    if (val && !val.includes("YOUR-PROJECT") && !val.includes("YOUR-ANON-KEY") && val.trim() !== "") {
      return val.trim();
    }
  }
  try {
    const stored = localStorage.getItem(storageKey);
    if (stored && stored.trim() !== "") {
      return stored.trim();
    }
  } catch {
    // ignore
  }
  return undefined;
}

const url = getEnvOrStorage(["VITE_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_URL"], "hl_supabase_url");
const anonKey = getEnvOrStorage(
  ["VITE_SUPABASE_ANON_KEY", "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "NEXT_PUBLIC_SUPABASE_ANON_KEY"],
  "hl_supabase_anon"
);

export const isConfigured = Boolean(
  url &&
  anonKey &&
  url.startsWith("http") &&
  !url.includes("YOUR-PROJECT") &&
  !anonKey.includes("YOUR-ANON-KEY")
);

export const supabase = createClient(
  isConfigured && url ? url : "https://placeholder.supabase.co",
  isConfigured && anonKey ? anonKey : "placeholder-anon-key"
);

export function saveSupabaseConfig(newUrl: string, newAnonKey: string) {
  try {
    localStorage.setItem("hl_supabase_url", newUrl.trim());
    localStorage.setItem("hl_supabase_anon", newAnonKey.trim());
  } catch {
    // ignore
  }
}
