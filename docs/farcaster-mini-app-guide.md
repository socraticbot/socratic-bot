# Building a Farcaster Mini App: lessons from Socratic Bot

This guide covers how we turned Socratic Bot (a Next.js app on Vercel) into a Farcaster Mini App with a daily card, share embeds, sign-in, streaks and a leaderboard. It records what worked and what didn't, so we can build more Mini Apps and so anyone else can learn from it.

Written October 2026 against `@farcaster/miniapp-sdk` 0.3.0, `@farcaster/quick-auth` 0.0.8, `@neynar/nodejs-sdk` 3.177.0, Next.js 15 and AI SDK 6. The ecosystem moves fast (Warpcast became the Farcaster app, Frames became Mini Apps, Neynar acquired Farcaster in January 2026), so check the official docs before relying on any detail here:

- Mini App docs: https://miniapps.farcaster.xyz (an LLM-friendly full text is at `/llms-full.txt`)
- Neynar docs: https://docs.neynar.com

Live example: https://www.socratic.bot/farcaster. Code: [`jsprojs/webapp`](../jsprojs/webapp).

## 1. What a Mini App is

A Mini App is an ordinary web page that a Farcaster client opens in an in-app webview (on mobile) or an iframe (on web). It has three parts:

| Part | Where it lives | What it does |
| --- | --- | --- |
| **Embed** | A `<meta name="fc:miniapp">` tag on each shareable page | When a cast contains your URL, the client shows an image and a launch button instead of a plain link |
| **SDK** | `@farcaster/miniapp-sdk` in your page | Talks to the host client: hide the splash screen, sign in, open the cast composer, and so on |
| **Manifest** | `/.well-known/farcaster.json` on your domain | Registers the app: name, icon, home URL, notification webhook, and a signature proving which Farcaster account owns the domain |

You don't need a separate app. The same Next.js routes serve normal web visitors and Mini App users. Detect which one you're in and adapt.

## 2. Minimum viable Mini App

### 2.1 Call `ready()` or users see an endless splash screen

The host shows a splash screen until your app says it has loaded. Call `sdk.actions.ready()` once your first screen renders. We load the SDK lazily so plain web visitors don't download it:

```ts
// lib/miniapp.ts
async function loadSdk() {
  const { sdk } = await import('@farcaster/miniapp-sdk');
  return sdk;
}

export async function isInMiniApp() {
  try {
    return await (await loadSdk()).isInMiniApp();
  } catch {
    return false;
  }
}

export async function signalReady() {
  if (await isInMiniApp()) await (await loadSdk()).actions.ready();
}
```

A tiny client component calls `signalReady()` in a `useEffect` and is mounted in the root layout ([`MiniAppReady.tsx`](../jsprojs/webapp/app/components/MiniAppReady.tsx)).

### 2.2 Add the embed tag

Each shareable page gets a `fc:miniapp` meta tag with stringified JSON. In Next.js, use `generateMetadata`:

```ts
other: {
  'fc:miniapp': JSON.stringify({
    version: '1',
    imageUrl: 'https://www.socratic.bot/api/og/today?day=3', // must be 3:2
    button: {
      title: "Spot today's bias", // max 32 characters
      action: {
        type: 'launch_miniapp',
        name: 'Socratic Bot',
        url: 'https://www.socratic.bot/farcaster?day=3',
        splashImageUrl: 'https://www.socratic.bot/splash-200.png',
        splashBackgroundColor: '#FDFBF9',
      },
    },
  }),
},
```

Rules we hit:

- The image **must be 3:2**. We render it with `next/og` (`ImageResponse`) at 1200×800.
- The button title is **at most 32 characters**.
- Use `fc:miniapp`, not the legacy `fc:frame`, for new apps.
- **Put state in the URL if the page changes over time.** Our card changes daily. A cast posted on Monday keeps Monday's image, so its button must open Monday's card (`?day=N`), not "today". Otherwise the picture and the app disagree.
- **Don't let shared links peek ahead.** We clamp `?day=` to today or earlier, on the page and the image route alike.

### 2.3 Make sure the page can be framed

Farcaster's web client loads your app in an iframe. Check that you don't send `X-Frame-Options: DENY` or a CSP `frame-ancestors` that blocks it: `curl -sI https://your.domain | grep -i -E "x-frame|content-security"`.

### 2.4 Sharing

Inside a Mini App, use the host's composer. On the plain web, use the compose intent URL:

```ts
if (await isInMiniApp()) {
  await sdk.actions.composeCast({ text, embeds: [url] }); // max 2 embeds
} else {
  window.open(`https://farcaster.xyz/~/compose?text=${encodeURIComponent(text)}&embeds[]=${encodeURIComponent(url)}`);
}
```

We share the question, never the answer, so the share invites people to play.

## 3. The manifest

### 3.1 Turn on Developer Mode

Go to https://farcaster.xyz/~/settings/developer-tools and toggle on Developer Mode. On desktop, a developer section appears with the manifest tool, a preview tool, audits and analytics.

### 3.2 Hosted versus self-hosted

Farcaster offers **hosted manifests**: you fill in a form, then redirect `/.well-known/farcaster.json` (HTTP 307) to `https://api.farcaster.xyz/miniapps/hosted-manifest/<id>`. In theory you then edit the app without redeploying.

**What happened to us:** the hosted manifest URL kept returning `{"errors":[{"message":"Hosted miniapp manifest not found"}]}`, even while the editor showed the ID. Signing the account association fetches the manifest from your domain, the domain redirected to a manifest that didn't exist yet, and signing failed with "error fetching manifest". It was a loop.

**What worked: self-hosting.** We serve [`public/.well-known/farcaster.json`](../jsprojs/webapp/public/.well-known/farcaster.json) from the app, so the fetch succeeds. We signed in the tool, then pasted the resulting `accountAssociation` into our file. If you hit the same loop, self-host. Changes then need a deploy, which takes a minute on Vercel.

### 3.3 Signing (account association)

The tool shows a QR code. Scan it with the Farcaster mobile app, logged in as the account that should own the app, and it produces:

```json
"accountAssociation": {
  "header": "eyJ...",
  "payload": "eyJ...",
  "signature": "..."
}
```

This is a **public signature, not a secret**, so it's safe to commit. Decode `header` and `payload` (base64url JSON) to check you signed the right thing. The header holds `fid` and `type: "custody"`; the payload holds `domain`, which must be exactly your domain.

### 3.4 Fields and limits

Validate before you deploy. The SDK ships the schema:

```js
const { domainManifestSchema } = require('@farcaster/miniapp-core');
domainManifestSchema.safeParse(require('./public/.well-known/farcaster.json'));
```

| Field | Notes |
| --- | --- |
| Domain (in the signed payload) | **Exact host, no path.** We use `www.socratic.bot` everywhere because the apex redirects to `www`. A mismatch breaks verification and notifications |
| `homeUrl` | Where the app opens. Can be a path: ours is `/farcaster`, a soft-launch page not yet linked from the main site |
| `name`, `iconUrl`, `homeUrl`, `description` | Required for search listing |
| `iconUrl` | 1024×1024 PNG, **opaque**. Clients round the corners, so keep the art inside the frame. We upscaled pixel art with nearest-neighbour (`sharp`, `kernel: 'nearest'`) to keep it crisp |
| `splashImageUrl` | 200×200 |
| `subtitle`, `tagline` | Max 30 characters each |
| `description` | Max 170 characters |
| `tags` | Max 5 |
| `buttonTitle` | Max 32 characters |
| `primaryCategory` | One of: games, social, finance, utility, productivity, health-fitness, news-media, music, shopping, education, developer-tools, entertainment, art-creativity |
| `imageUrl` | **Deprecated**: use `ogImageUrl`. If you set it, use 3:2 |
| `heroImageUrl`, `ogImageUrl` | 1200×630 |
| `webhookUrl` | Where the client sends add / remove / notification events. See section 5 |
| `castShareUrl` | **Not a compose link**, despite the tool's placeholder (`warpcast.com/~/compose...`). It registers a *share extension*: your app appears in the share sheet on any cast and opens with that cast's details. Leave it empty unless you've built a page to handle it |

Use **static** images in the manifest. Clients cache manifests, so a dynamic daily image there would go stale. Page-level embeds can be dynamic.

The hosted tool generates a `"frame"` key; the current spec calls it `"miniapp"`, and both are accepted. We use `"miniapp"` in our self-hosted file.

### 3.5 Test

- **Preview:** `https://farcaster.xyz/~/developers/mini-apps/preview?url=<encoded url>`. Check there's no endless splash, and that the composer opens from inside the app.
- **Audit:** the manifest and embed audit tools in the developer section.
- **Refresh:** after changing the manifest, refresh the domain in Developer Tools. Clients cache it.
- **Real cast:** paste the URL into a draft on your phone and tap the button.
- Use a **production domain**. Tunnels (ngrok and similar) are excluded from search, and `addMiniApp()` fails on them.

## 4. Sign-in with Quick Auth

Quick Auth gives you a verified Farcaster ID (FID) with no extra UI.

Client: `sdk.quickAuth.fetch(url, init)` works like `fetch` but adds `Authorization: Bearer <jwt>`.

Server ([`lib/server/auth.ts`](../jsprojs/webapp/lib/server/auth.ts)):

```ts
import { createClient } from '@farcaster/quick-auth';
const quickAuth = createClient();

export async function fidFromRequest(request: Request) {
  const header = request.headers.get('authorization');
  if (!header?.startsWith('Bearer ')) return null;
  try {
    const payload = await quickAuth.verifyJwt({ token: header.slice(7), domain: 'www.socratic.bot' });
    return payload.sub; // the FID
  } catch {
    return null;
  }
}
```

The `domain` must match your manifest domain exactly.

## 5. Notifications (managed by Neynar)

Users who add your app can receive notifications. You can store the tokens yourself or let Neynar manage them. We use Neynar:

1. Create an app at https://dev.neynar.com. Its **Mini App** tab shows a notifications URL like `https://api.neynar.com/f/app/<client_id>/event`. Use the copy button; the box truncates it.
2. Put that URL in the manifest's `webhookUrl`. It's public by design.
3. Send with `client.publishFrameNotifications({ targetFids: [], notification: { title, body, target_url, uuid } })`. An empty `targetFids` sends to everyone with notifications enabled.

Things to know:

- **Choosing `webhookUrl` is effectively permanent.** Changing it later strands the tokens you've already collected, and notifications break for existing users. Create the Neynar app under the account that will own the project long-term.
- `title` is 1 to 32 characters and `body` 1 to 128. `uuid` is an idempotency key, so derive it deterministically (a UUIDv5 of `daily-YYYY-MM-DD`, for example) and retries won't double-send.
- **`target_url` must use exactly your registered host.** Per Neynar's docs, a mismatch returns `target_url_mismatch` and **permanently invalidates** the affected tokens. Unit-test the host.
- Hosts limit each token to about 1 notification per 30 seconds and 100 per day.
- Neynar's docs still use some older names (`frame`, `addFrame`). Use the current ones (`miniapp`, `addMiniApp`).

## 6. Storage, streaks and a leaderboard

We wanted daily streaks and an opt-in leaderboard.

- **Storage:** Upstash Redis from the Vercel Marketplace (free tier). Connect it to the project and Vercel injects the variables. **Keep the default `KV` prefix or none.** `@upstash/redis`'s `Redis.fromEnv()` reads `UPSTASH_REDIS_REST_URL`/`_TOKEN` or `KV_REST_API_URL`/`_TOKEN`, so a custom prefix won't be found. **New env vars need a redeploy.**
- **Degrade gracefully:** every streak route returns 503 when Redis isn't configured, and the UI hides itself. You can ship the code before the infrastructure exists.
- **One play per day:** `SET played:<fid>:<day> <answer> NX EX 172800` makes repeats and retries harmless. Storing the answer lets a reopened app (or another device) show the result instead of the question.
- **Streak rules as pure functions** ([`lib/streaks/streak.ts`](../jsprojs/webapp/lib/streaks/streak.ts)), unit-tested without a database. We rank by consecutive days played, not correct answers: ranking by correctness rewards looking answers up.
- **Leaderboard:** a sorted set of opted-in FIDs. Read extra entries and filter out dead streaks, because stored scores can go stale.
- **Profiles and bot filtering:** `neynar.fetchBulkUsers({ fids })` returns `username`, `pfp_url` and a `score` from 0 to 1. We hide accounts below 0.5 from the public board; their own streaks still count.
- **Opt-in:** nobody appears publicly without ticking "Show me on the leaderboard".
- **Only today's card counts.** Old cards opened from shared links can be played but don't extend a streak.

## 7. Gotchas, in the order we hit them

1. **Base App:** it was reported that from 2026-04-09 the Base App treats Farcaster Mini Apps as plain web apps, and Base's docs no longer cover them. We couldn't read the original notice, so check this yourself. We plan for reach in the Farcaster app.
2. **AI Gateway free tier:** on a free-tier Vercel AI Gateway account, models outside the free subset return **403** (`GatewayInternalServerError:403`). The free-tier list is on `vercel.com/ai-gateway/models?freeTier=true`; each model's page data has `availableToFreeTier`. Test every model on production after deploying.
3. **Streaming can hide errors.** With `streamText(...).toTextStreamResponse()`, a failing model returned an empty 200. Switching to `generateText` surfaced the real error. Short replies don't need streaming.
4. **Reasoning models and output caps:** a reasoning model with a 600-token cap spent the budget thinking and returned cut-off or empty replies. Prefer non-reasoning chat models for short turns, or raise the cap.
5. **Safety before launch:** a model questioned "nobody would miss me" as if it were a belief to debate. We added a deterministic crisis check that runs *before* any model call ([`lib/tutor/safety.ts`](../jsprojs/webapp/lib/tutor/safety.ts)) and moved safety rules to the top of the prompt. If your app talks to people, test this before launch, and do it again for every new language.
6. **A Python `.gitignore` hid our TypeScript.** The repo root's `lib/` rule silently excluded `jsprojs/webapp/lib`, so new files never reached git or the deploy. Check `git status` shows every new file.
7. **Git author identity:** commit with the identity your Vercel project expects, or deploys can be blocked. Also, don't publish a work email on a public repo by accident.
8. **Hosted manifest loop:** see 3.2.

## 8. Checklist for the next Mini App

- [ ] Page works on mobile width and inside an iframe (no blocking frame headers)
- [ ] `sdk.actions.ready()` called after first render
- [ ] `fc:miniapp` embed on every shareable page: 3:2 image, button ≤32 characters, URL carries any state the image depends on
- [ ] Developer Mode on; manifest self-hosted at `/.well-known/farcaster.json`
- [ ] Domain exact (`www` or not, consistently); `homeUrl` correct
- [ ] Icon 1024×1024 opaque, splash 200×200, hero/OG 1200×630, all static
- [ ] Manifest validates with `domainManifestSchema`
- [ ] `accountAssociation` signed by the right FID (decode and check `fid` and `domain`)
- [ ] `webhookUrl` decided once, from the long-term Neynar app
- [ ] Quick Auth verified server-side with the exact domain
- [ ] Any storage-backed feature degrades gracefully without its env vars
- [ ] Rate limits and a spending cap on anything that costs money
- [ ] Safety tested if the app talks to people
- [ ] Preview tool, audits, a real cast from a phone, and "add app" all tested on production

## 9. Where things live in this repo

| Concern | File |
| --- | --- |
| SDK wrapper (ready, compose, Quick Auth fetch) | [`lib/miniapp.ts`](../jsprojs/webapp/lib/miniapp.ts) |
| Manifest | [`public/.well-known/farcaster.json`](../jsprojs/webapp/public/.well-known/farcaster.json) |
| Embed and share helpers | [`lib/biases/share.ts`](../jsprojs/webapp/lib/biases/share.ts) |
| Dynamic 3:2 share image | [`app/api/og/today/route.tsx`](../jsprojs/webapp/app/api/og/today/route.tsx) |
| Mini App page (tabs, card, leaderboard) | [`app/farcaster/`](../jsprojs/webapp/app/farcaster) |
| Quick Auth verification | [`lib/server/auth.ts`](../jsprojs/webapp/lib/server/auth.ts) |
| Streak rules | [`lib/streaks/streak.ts`](../jsprojs/webapp/lib/streaks/streak.ts) |
| Redis store, leaderboard | [`lib/server/players.ts`](../jsprojs/webapp/lib/server/players.ts) |
| Neynar profiles and bot filter | [`lib/server/neynar.ts`](../jsprojs/webapp/lib/server/neynar.ts) |
| Streak and leaderboard API | [`app/api/rep`](../jsprojs/webapp/app/api/rep), [`app/api/me`](../jsprojs/webapp/app/api/me), [`app/api/leaderboard`](../jsprojs/webapp/app/api/leaderboard) |
| Tests | [`lib/__tests__/`](../jsprojs/webapp/lib/__tests__) (`npm test` in `jsprojs/webapp`) |
