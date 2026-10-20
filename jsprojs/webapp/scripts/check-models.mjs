// Checks that every model in lib/models.ts exists in the AI Gateway catalog
// and has no_training: "all". Run with `npm run check:models`.
import { readFileSync } from 'node:fs';

const source = readFileSync(new URL('../lib/models.ts', import.meta.url), 'utf8');
const ids = [...source.matchAll(/id: '([^']+)'/g)].map((m) => m[1]);

const res = await fetch('https://ai-gateway.vercel.sh/v1/models');
const catalog = new Map((await res.json()).data.map((m) => [m.id, m]));

let failed = false;
for (const id of ids) {
  const model = catalog.get(id);
  const ok = model && model.no_training === 'all';
  if (!ok) failed = true;
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${id} ${model ? `no_training=${model.no_training}` : 'missing from catalog'}`);
}
process.exit(failed ? 1 : 0);
