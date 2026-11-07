import { NextResponse, type NextRequest } from "next/server";

// Edge-level rate limit for the public site. Cloudflare's free plan allows a
// single rate-limit rule in the zone and that slot is taken by its managed
// credential-stuffing check, so the limiter lives here instead. The origin only
// accepts connections from cloudflared (bound to loopback), which is what makes
// trusting CF-Connecting-IP safe: a client that reaches this process directly
// cannot appear from outside the host.

const WINDOW_MS = 60_000;
const MAX_REQUESTS = 60;
const MAX_TRACKED_IPS = 5_000;

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

function clientKey(request: NextRequest): string {
  const cf = request.headers.get("cf-connecting-ip");
  if (cf) return cf;
  const forwarded = request.headers.get("x-forwarded-for");
  const first = forwarded?.split(",")[0];
  if (first) return first.trim();
  return "unknown";
}

function prune(now: number) {
  if (buckets.size <= MAX_TRACKED_IPS) return;
  for (const [key, bucket] of buckets) {
    if (now >= bucket.resetAt) buckets.delete(key);
  }
}

export function proxy(request: NextRequest) {
  const now = Date.now();
  const key = clientKey(request);
  const bucket = buckets.get(key);

  if (!bucket || now >= bucket.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + WINDOW_MS });
    prune(now);
    return NextResponse.next();
  }

  bucket.count += 1;
  if (bucket.count > MAX_REQUESTS) {
    const retryAfter = Math.max(1, Math.ceil((bucket.resetAt - now) / 1000));
    return new NextResponse("Too many requests. Retry later.\n", {
      status: 429,
      headers: {
        "Retry-After": String(retryAfter),
        "Cache-Control": "no-store",
        "Content-Type": "text/plain; charset=utf-8",
      },
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icon.svg).*)"],
};
