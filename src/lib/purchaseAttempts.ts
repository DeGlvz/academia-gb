/**
 * Tracks WhatsApp purchase attempts — persists to Supabase and falls back to localStorage.
 */

import { supabase } from "@/integrations/supabase/client";

export interface PurchaseAttempt {
  id: string;
  orderNumber: string;
  items: { title: string; price: number }[];
  total: number;
  timestamp: string;
}

const STORAGE_KEY = "gaby-purchase-attempts";
const SESSION_KEY = "gaby-session-id";

function getSessionId(): string {
  let sid = sessionStorage.getItem(SESSION_KEY);
  if (!sid) {
    sid = crypto.randomUUID();
    sessionStorage.setItem(SESSION_KEY, sid);
  }
  return sid;
}

function loadLocal(): PurchaseAttempt[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocal(attempts: PurchaseAttempt[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(attempts));
}

export async function recordPurchaseAttempt(
  items: { title: string; price: number }[]
): Promise<string> {
  const total = items.reduce((s, i) => s + i.price, 0);

  // Generate order number from DB
  let orderNumber = `GBC-${Date.now().toString(36).toUpperCase()}`;
  try {
    const { data, error } = await supabase.rpc("generate_order_number");
    if (data && !error) orderNumber = data as string;
  } catch {
    // fallback already set
  }

  const attempt: PurchaseAttempt = {
    id: crypto.randomUUID(),
    orderNumber,
    items,
    total,
    timestamp: new Date().toISOString(),
  };

  // Save locally as fallback
  const local = loadLocal();
  local.push(attempt);
  saveLocal(local);

  // Persist to Supabase
  try {
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from("purchase_attempts").insert({
      user_id: user?.id ?? null,
      session_id: getSessionId(),
      items: items as any,
      total,
      order_number: orderNumber,
    });
  } catch (err) {
    console.warn("Could not persist purchase attempt to DB:", err);
  }

  return orderNumber;
}

export function getPurchaseAttempts(): PurchaseAttempt[] {
  return loadLocal();
}

export function getLastAttemptDate(): string | null {
  const attempts = loadLocal();
  if (attempts.length === 0) return null;
  return attempts[attempts.length - 1].timestamp;
}