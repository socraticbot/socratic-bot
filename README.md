# socratic-bot

## Vision

Socratic Bot is being transformed into a **fully decentralized, open-source critical thinking tutor** that:
- Prompts humans to think better through Socratic questioning
- Uses EVM-compatible wallets as identity
- Stores persistent memory in Swarm (decentralized storage)
- Uses Mistral models via Vercel AI Gateway for LLM capabilities
- Is transparent, open-source, and user-owned

## Migration in Progress

We are currently migrating to a fully decentralized stack:

**Current State**:
- **Hosting**: Framer (to be migrated)
- **LLM**: OpenAI GPT-4 via direct API
- **Storage**: PostgreSQL (centralized)
- **Identity**: Email-based authentication
- **Frontend**: Remix app (MVP in `jsprojs/mvp/`)
- **Backend**: FastAPI chat server (in `pyprojs/chatserver/`)

**Target State**:
- **Hosting**: Vercel (initial), exploring fully decentralized with ENS + Arkiv decentralized database + Swarm storage
- **LLM**: Mistral Large 3 via Vercel AI Gateway
- **Storage**: Swarm (decentralized) for persistent memory
- **Identity**: EVM-compatible wallet (MetaMask, WalletConnect)
- **Frontend**: Next.js on Vercel
- **Backend**: Vercel Serverless Functions + Edge Functions

## Getting started

From the root of the repository:

```
$ docker build -f pyprojs/chatserver/Dockerfile -t socraticbot .
$ docker run -p 8000:8000 -e OPENAI_API_KEY="<insert your own openai key>" -e SOCRATIC_CHATSERVER_TOKEN="any string" socraticbot
```
