// `npm run check` — validate catalog.json before you go live.
// Loads the catalog, prints each product, and dry-runs its query template with a sample
// payload so you catch a bad {field} mapping before a buyer ever funds a job.
import { loadCatalog, buildUrl } from './catalog.js';

const catalog = loadCatalog();
console.log(`Agent: ${catalog.agent.name}`);
if (catalog.agent.tagline) console.log(`Tagline: ${catalog.agent.tagline}`);
console.log(`Products: ${catalog.products.length}\n`);

let ok = true;
for (const p of catalog.products) {
  const margin = p.retail - (p.wholesale ?? 0);
  console.log(`• ${p.offering}  —  retail $${p.retail}` + (p.wholesale != null ? `  (wholesale $${p.wholesale}, margin $${margin.toFixed(4)})` : ''));
  console.log(`    ${p.description || '(no description)'}`);
  console.log(`    endpoint: ${p.endpoint}`);
  // Dry-run with every required field filled by a placeholder.
  const sample: Record<string, string> = {};
  for (const f of p.required) sample[f] = `SAMPLE_${f}`;
  try {
    console.log(`    example call: ${buildUrl(p, sample)}\n`);
  } catch (err) {
    ok = false;
    console.log(`    ✗ ${String((err as Error).message)}\n`);
  }
}

if (!ok) {
  console.error('Catalog has errors (see ✗ above). Fix the query templates / required fields.');
  process.exit(1);
}
console.log('✓ catalog.json is valid.');
