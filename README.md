# socratic-bot

## Vision

Socratic Bot is being transformed into a **fully decentralized, open-source critical thinking tutor** that:
- Prompts humans to think better through Socratic questioning
- Uses EVM-compatible wallets as identity
- Stores persistent memory in Swarm (decentralized storage)
- Uses Mistral models via Vercel AI Gateway for LLM capabilities
- Is transparent, open-source, and user-owned

**Model Selection & User Choice**: Users will be able to select between AI models to be their Socratic tutor, allowing user-choice with regards to privacy & overall comparison of model capabilities. This empowers users to choose the model that best aligns with their privacy preferences and learning needs, while enabling transparent comparison of how different models approach Socratic tutoring.

<img width="972" height="727" alt="Screenshot 2026-01-18 at 17 30 07" src="https://github.com/user-attachments/assets/ae256080-0d65-4d6b-aa4c-a59b248a0cd8" />


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
