export const PIN_HASH_KEY = "admin_pin_hash_v1";
export const AUTH_KEY = "admin_authed_v1";

async function sha256(text: string): Promise<string> {
  const enc = new TextEncoder().encode(text);
  const buf = await crypto.subtle.digest("SHA-256", enc);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export const isPinSet = () => typeof window !== "undefined" && !!localStorage.getItem(PIN_HASH_KEY);
export const isAuthed = () => typeof window !== "undefined" && localStorage.getItem(AUTH_KEY) === "true";
export const logout = () => localStorage.removeItem(AUTH_KEY);

export async function createPin(pin: string) {
  const hash = await sha256(pin);
  localStorage.setItem(PIN_HASH_KEY, hash);
  localStorage.setItem(AUTH_KEY, "true");
}

export async function loginWithPin(pin: string): Promise<boolean> {
  const saved = localStorage.getItem(PIN_HASH_KEY);
  if (!saved) return false;
  const hash = await sha256(pin);
  const ok = saved === hash;
  if (ok) localStorage.setItem(AUTH_KEY, "true");
  return ok;
}
