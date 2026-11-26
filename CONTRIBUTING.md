# Contributing

Thanks for helping build open source critical thinking tools.

## Start

1. Pick an issue labeled `good first issue`, or open a Discussion with an idea.
2. Comment on the issue so others know you are on it.
3. Open a small PR. One change per PR.

## Run it locally

```
cd jsprojs/webapp
npm install
echo "AI_GATEWAY_API_KEY=<your key>" > .env.local
npm run dev
```

Before you open a PR:

```
npm test
npm run lint
```

## Rules

- The tutor asks, it does not tell. Keep it Socratic.
- Privacy first. Never log or store conversation text.
- Use only models whose providers do not train on prompts.
- Keep UI text short and plain.

## Questions

Ask in GitHub Discussions.
