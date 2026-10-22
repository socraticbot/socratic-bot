# Socratic Bot

**Try the daily bias mini app on Farcaster: [socratic.bot/farcaster](https://www.socratic.bot/farcaster)**

One cognitive bias a day. Spot it in a real-life scenario, then talk it through with a Socratic tutor that asks instead of telling. Keep a streak and, if you like, join the leaderboard. Available in English, 中文, Deutsch and Español.

Share the link in a cast and it opens as a mini app inside Farcaster. It also works in any browser.

## What it is

Socratic Bot is a free, open-source critical-thinking tutor. Its goal is to help people reason better on their own, so they need it less over time.

- **Socratic chat** ([socratic.bot/chat](https://www.socratic.bot/chat)): one question at a time, naming the reasoning move it uses, never giving a verdict on contested values.
- **Bias of the day**: a spot-the-bias card with instant feedback and a "Try this" thinking tool. Every 7th day reviews an earlier bias.
- **Private by default**: only models whose providers don't train on prompts, no conversation text stored or logged, and a crisis check that runs before any model call.

<img width="972" height="727" alt="Socratic Bot chat" src="https://github.com/user-attachments/assets/ae256080-0d65-4d6b-aa4c-a59b248a0cd8" />

## Guides

- [Building a Farcaster Mini App](docs/farcaster-mini-app-guide.md): how socratic.bot/farcaster works, the manifest and signing, Quick Auth, Neynar notifications, streaks and a leaderboard, and the gotchas we hit.

## Run it locally

The live app is the Next.js project in [`jsprojs/webapp`](jsprojs/webapp) (Vercel, AI SDK, Vercel AI Gateway).

```
cd jsprojs/webapp
npm install
echo "AI_GATEWAY_API_KEY=<your key>" > .env.local
npm run dev     # http://localhost:3000/farcaster
npm test        # unit tests
```

Streaks and the leaderboard also need Upstash Redis and `NEYNAR_API_KEY`. Without them, those features switch themselves off.

## Repository

| Path | What it is |
| --- | --- |
| `jsprojs/webapp` | The live site: chat, bias of the day, mini app |
| `pylibs/zoo` | The original depth-first Socratic workflows (dfs_v1, dfs_v2) and prompts |
| `pyprojs`, `pylibs/chat`, `jsprojs/mvp`, `jsprojs/farcaster`, `magictool` | Earlier 2024 versions, kept for reference |
| `docs` | Guides |

## Where it's heading

The longer-term vision is a user-owned tutor: model choice for privacy and comparison, wallet-based identity, and decentralized storage (ENS, Swarm, Arkiv), added only where they keep conversations private.
