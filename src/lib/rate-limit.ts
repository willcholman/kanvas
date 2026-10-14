/**
 * Basic fixed-window rate limiter, per IP, in memory.
 *
 * On Vercel each serverless instance keeps its own memory, so this is best-effort: it stops
 * a single client hammering one instance, not a distributed attack. If abuse shows up, move
 * this to Upstash Redis or Vercel's firewall rate limiting.
 */
const WINDOW_MS = 10 * 60 * 1000;
const MAX_HITS = 5;

const hits = new Map<string, { count: number; reset: number }>();

export function rateLimit(key: string): boolean {
  const now = Date.now();
  if (hits.size > 5000) {
    for (const [k, v] of hits) if (v.reset < now) hits.delete(k);
  }
  const entry = hits.get(key);
  if (!entry || entry.reset < now) {
    hits.set(key, { count: 1, reset: now + WINDOW_MS });
    return true;
  }
  entry.count += 1;
  return entry.count <= MAX_HITS;
}
