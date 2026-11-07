# Deploying the AgentDiet site

The site is a static-rendered Next.js app. Every route (`/`, `/docs`, `/sitemap.xml`,
`/robots.txt`, `/opengraph-image`, `/icon.svg`) is prerendered at build time, so it
runs anywhere that can serve a Node process or a static directory.

Set the canonical origin before building:

```bash
export NEXT_PUBLIC_SITE_URL="https://agentdiet.example.com"
```

It feeds `metadataBase`, canonical URLs, Open Graph URLs and `sitemap.xml`.
If it is unset the build falls back to `https://agentdiet.qansa.dev`.

---

## Vercel (recommended)

The site lives in `website/` inside the Go repository, so the project root must be
pointed there.

### Dashboard

1. **Add New → Project**, import `qansaid/agentdiet`.
2. **Root Directory**: `website`.
3. Framework preset: **Next.js** (auto-detected). Build command and output
   directory stay at their defaults (`next build`, `.next`).
4. **Environment Variables**: add `NEXT_PUBLIC_SITE_URL` = your production origin
   for Production and Preview.
5. Deploy, then add the custom domain under **Settings → Domains**.

### CLI

```bash
cd website
npm run check                     # lint + typecheck + build must pass first
npx vercel link                   # select the project
npx vercel env add NEXT_PUBLIC_SITE_URL production
npx vercel deploy --prod
```

Preview deployments inherit the Vercel URL; leave `NEXT_PUBLIC_SITE_URL` unset for
Preview if you want canonical URLs to point at production rather than at a
throwaway preview host.

### Notes for Vercel

- No `vercel.json` is needed. Security headers and the immutable cache policy for
  `/_next/static/*` are declared in `next.config.ts`.
- No server runtime dependency, no database, no secrets, no image optimisation
  service calls — the OG image is generated at build time with `next/og`.
- Node 20.9+ is required by Next 16; Vercel's default Node 22 image is fine.

---

## Docker (self-hosted)

`Dockerfile` is a three-stage build that ships the Next standalone server and
nothing else. No `node_modules` in the runtime layer.

```bash
cd website
docker build -t agentdiet-site .
docker run -d --name agentdiet-site -p 3000:3000 \
  -e NEXT_PUBLIC_SITE_URL=https://agentdiet.example.com \
  agentdiet-site
```

`NEXT_PUBLIC_*` variables are inlined at **build** time, so pass it as a build
argument if you need a non-default origin:

```bash
docker build --build-arg NEXT_PUBLIC_SITE_URL=https://agentdiet.example.com -t agentdiet-site .
```

The image is ~75 MB, runs as uid 1001, exposes port 3000 and has a `HEALTHCHECK`
that fetches `/`.

### Behind nginx

```nginx
server {
  listen 443 ssl http2;
  server_name agentdiet.example.com;

  location / {
    proxy_pass http://127.0.0.1:3000;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
  }
}
```

Because the pages are prerendered, nginx may cache them, but keep the cache short
or purge on deploy — Next marks HTML `s-maxage` for CDN consumption and a long
edge TTL without invalidation will serve the previous build after a release.

---

## plain Node

```bash
npm ci
npm run build
NEXT_PUBLIC_SITE_URL=https://agentdiet.example.com PORT=3000 npm run start
```

Run it under systemd, pm2 or any process supervisor. The process is stateless.

---

## Post-deploy verification

```bash
BASE=https://agentdiet.example.com

curl -sI  $BASE/ | grep -E "HTTP/|x-content-type|referrer-policy"
curl -s   $BASE/robots.txt
curl -s   $BASE/sitemap.xml | head -20
curl -sI  $BASE/opengraph-image | grep -i content-type   # image/png
curl -so /dev/null -w "404 page: %{http_code}\n" $BASE/definitely-not-a-page

# canonical + social tags point at the deployed origin
curl -s $BASE/ | grep -o '<link rel="canonical"[^>]*>'
curl -s $BASE/ | grep -o '<meta property="og:image"[^>]*>'
```

Then check the two things a curl cannot: toggle the theme (it should persist
across reloads), and click a copy button on an https origin (the clipboard API
requires a secure context).

## Rebuilding after a CLI release

The demo figures in `lib/demo.ts` are generated from a real run of the binary.
When the CLI's output format or a headline number changes, regenerate that file
and re-run `npm run check`; see the "Where the numbers come from" section of
[README.md](./README.md).
