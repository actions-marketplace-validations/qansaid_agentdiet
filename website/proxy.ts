import { NextResponse, type NextRequest } from "next/server";

// Three layers, cheapest first. All of it runs at the origin, which is only
// reachable through cloudflared (the container binds to loopback), so
// CF-Connecting-IP cannot be forged by anyone who is not already inside the
// tunnel. Cloudflare's free plan allows one rate-limit rule per zone and that
// slot is held by its credential-stuffing check, so nothing here exists at the
// edge.
//
//   1. global token bucket  - protects the process itself from any flood,
//                             distributed or not, by shedding load with 503.
//   2. per-subnet bucket    - catches a botnet spread across one hosting block,
//                             where per-IP limits see only innocents.
//   3. per-IP bucket        - catches the ordinary single-source scraper.

const WINDOW_MS = 60_000;
const MAX_PER_IP = 60;
const MAX_PER_SUBNET = 300;

// Measured capacity of this container is ~190 req/s before latency quadruples
// (p50 54ms at concurrency 10, 205ms at 40). The cap sits below that so the
// process degrades by refusing work instead of queueing it.
const GLOBAL_RPS = 120;
const GLOBAL_BURST = 240;

const MAX_TRACKED = 20_000;

type Bucket = { count: number; resetAt: number };

const ipBuckets = new Map<string, Bucket>();
const subnetBuckets = new Map<string, Bucket>();

let tokens = GLOBAL_BURST;
let lastRefill = Date.now();

function clientIp(request: NextRequest): string {
  const cf = request.headers.get("cf-connecting-ip");
  if (cf) return cf.trim();
  const forwarded = request.headers.get("x-forwarded-for");
  const first = forwarded?.split(",")[0];
  if (first) return first.trim();
  return "unknown";
}

// /24 for IPv4 and the first three hextets for IPv6. Compressed IPv6 forms are
// grouped imprecisely on purpose: the bucket only needs to be roughly one
// provider block wide, and exact prefix parsing is not worth the code here.
function subnetOf(ip: string): string {
  if (ip.includes(":")) {
    const groups = ip.split(":").filter((part) => part.length > 0);
    return groups.slice(0, 3).join(":") + "::/48";
  }
  const parts = ip.split(".");
  if (parts.length === 4) return `${parts[0]}.${parts[1]}.${parts[2]}.0/24`;
  return ip;
}

function takeToken(now: number): boolean {
  const elapsed = now - lastRefill;
  if (elapsed > 0) {
    tokens = Math.min(GLOBAL_BURST, tokens + (elapsed / 1000) * GLOBAL_RPS);
    lastRefill = now;
  }
  if (tokens < 1) return false;
  tokens -= 1;
  return true;
}

function prune(map: Map<string, Bucket>, now: number) {
  if (map.size <= MAX_TRACKED) return;
  for (const [key, bucket] of map) {
    if (now >= bucket.resetAt) map.delete(key);
  }
}

function withinLimit(map: Map<string, Bucket>, key: string, limit: number, now: number): boolean {
  const bucket = map.get(key);
  if (!bucket || now >= bucket.resetAt) {
    map.set(key, { count: 1, resetAt: now + WINDOW_MS });
    prune(map, now);
    return true;
  }
  bucket.count += 1;
  return bucket.count <= limit;
}

function retryAfterFor(map: Map<string, Bucket>, key: string, now: number): number {
  const bucket = map.get(key);
  if (!bucket) return 60;
  return Math.max(1, Math.ceil((bucket.resetAt - now) / 1000));
}

function refuse(message: string, retryAfter: number, status: number) {
  return new NextResponse(`${message}\n`, {
    status,
    headers: {
      "Retry-After": String(retryAfter),
      "Cache-Control": "no-store",
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
}

export function proxy(request: NextRequest) {
  const now = Date.now();

  if (!takeToken(now)) {
    return refuse("Server is shedding load. Retry shortly.", 1, 503);
  }

  const ip = clientIp(request);

  if (!withinLimit(ipBuckets, ip, MAX_PER_IP, now)) {
    return refuse("Too many requests.", retryAfterFor(ipBuckets, ip, now), 429);
  }

  const subnet = subnetOf(ip);
  if (!withinLimit(subnetBuckets, subnet, MAX_PER_SUBNET, now)) {
    return refuse("Too many requests from this network.", retryAfterFor(subnetBuckets, subnet, now), 429);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icon.svg).*)"],
};
