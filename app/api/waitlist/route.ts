import { getSqlDb } from "@/db";

const headers = { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" };
const received = () => Response.json({ message: "Early-access signup received." }, { headers });

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  const allowed = new Set([new URL(request.url).origin, "https://nodedots.com", "https://www.nodedots.com", "https://nodedots-waitlist.wiry-crane-9891.chatgpt.site"]);
  if (!origin || !allowed.has(origin)) return Response.json({ message: "Please join from the NodeDots website." }, { status: 403, headers });
  if (!request.headers.get("content-type")?.includes("application/json")) return Response.json({ message: "Invalid submission." }, { status: 415, headers });
  if (Number(request.headers.get("content-length") || 0) > 2048) return Response.json({ message: "Submission too large." }, { status: 413, headers });
  let data: Record<string, unknown>;
  try {
    const reader = request.body?.getReader();
    if (!reader) throw new Error("No body");
    const chunks: Uint8Array[] = []; let size = 0;
    while (true) { const part = await reader.read(); if (part.done) break; size += part.value.byteLength; if (size > 2048) { await reader.cancel(); return Response.json({ message: "Submission too large." }, { status: 413, headers }); } chunks.push(part.value); }
    const bytes = new Uint8Array(size); let offset = 0; for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
    data = JSON.parse(new TextDecoder().decode(bytes));
    if (!data || typeof data !== "object" || Array.isArray(data)) throw new Error("Invalid shape");
  } catch { return Response.json({ message: "Invalid submission." }, { status: 400, headers }); }
  if (typeof data.website === "string" && data.website.trim()) return received();
  if (typeof data.email !== "string" || data.consent !== true) return Response.json({ message: "An email address and permission to send updates are required." }, { status: 400, headers });
  const email = data.email.trim().toLowerCase();
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return Response.json({ message: "Enter a valid email address." }, { status: 400, headers });
  try {
    const db = getSqlDb(); const now = Math.floor(Date.now() / 1000); const window = Math.floor(now / 600);
    const ip = request.headers.get("cf-connecting-ip") || "local-preview";
    const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(`${ip}:${window}:nodedots-waitlist`));
    const key = Array.from(new Uint8Array(digest), b => b.toString(16).padStart(2, "0")).join("");
    const result = await db.batch([
      db.prepare("DELETE FROM signup_limits WHERE expires_at < ?").bind(now),
      db.prepare("INSERT INTO signup_limits (key, attempts, expires_at) VALUES (?, 1, ?) ON CONFLICT(key) DO UPDATE SET attempts = attempts + 1 RETURNING attempts").bind(key, now + 1200),
      db.prepare("INSERT INTO waitlist (id, email, joined_at, consent_version, source) SELECT ?, ?, ?, ?, ? WHERE (SELECT attempts FROM signup_limits WHERE key = ?) <= 5 ON CONFLICT(email) DO NOTHING").bind(crypto.randomUUID(), email, now, "waitlist-v1", "website", key),
    ]);
    const attemptRow = result[1].results[0] as { attempts?: number } | undefined;
    if (Number(attemptRow?.attempts || 0) > 5) return Response.json({ message: "Too many attempts. Please try again in ten minutes." }, { status: 429, headers: { ...headers, "Retry-After": "600" } });
    return received();
  } catch { console.error("waitlist_storage_unavailable"); return Response.json({ message: "We couldn't save your email right now. Please try again shortly." }, { status: 503, headers }); }
}
