// Loads and validates catalog.json into runtime "products".
//
// A product declares an ACP offering name, the PulseNetwork endpoint that fulfills it,
// and a `query` template that maps the buyer's requirement JSON onto the endpoint's
// query string. Templates use two forms:
//   "{field}"          → required; taken verbatim from the requirement payload
//   "{field|default}"  → optional; falls back to `default` when the buyer omits it
// Anything without braces is a literal.
//
// This is the whole point of the starter kit: to add or change what your agent sells,
// you edit catalog.json — not TypeScript.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

export type Product = {
  offering: string;
  description: string;
  endpoint: string;
  query: Record<string, string>;
  required: string[];
  wholesale: number;
  retail: number;
};

export type Catalog = {
  agent: { name: string; tagline?: string };
  products: Product[];
};

const TEMPLATE = /^\{([a-zA-Z0-9_]+)(?:\|([^}]*))?\}$/;

/** Resolve one template value against the requirement payload. Returns undefined when a
 *  required (no-default) field is missing so the caller can reject the job cleanly. */
export function fill(template: string, req: Record<string, unknown>): string | undefined {
  const m = TEMPLATE.exec(template);
  if (!m) return template; // literal
  const [, field, dflt] = m;
  const v = req[field];
  if (v !== undefined && v !== null && String(v) !== '') return String(v);
  return dflt; // undefined when the field is required and absent
}

/** Build the full endpoint URL for a product from a requirement payload.
 *  Throws with the offending field name if a required value is missing. */
export function buildUrl(p: Product, req: Record<string, unknown>): string {
  const u = new URL(p.endpoint);
  for (const [param, template] of Object.entries(p.query)) {
    const val = fill(template, req);
    if (val === undefined) {
      const field = TEMPLATE.exec(template)?.[1] ?? param;
      throw new Error(`missing required field: ${field}`);
    }
    u.searchParams.set(param, val);
  }
  return u.toString();
}

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(`catalog.json: ${msg}`);
}

export function loadCatalog(path?: string): Catalog {
  const here = dirname(fileURLToPath(import.meta.url));
  const file = path ?? process.env.CATALOG_PATH ?? resolve(here, '..', 'catalog.json');
  const raw = JSON.parse(readFileSync(file, 'utf8'));

  assert(raw.agent?.name, 'agent.name is required');
  assert(Array.isArray(raw.products) && raw.products.length, 'products[] must be non-empty');

  const names = new Set<string>();
  for (const p of raw.products as Product[]) {
    assert(p.offering, 'each product needs an "offering" name');
    assert(!names.has(p.offering), `duplicate offering "${p.offering}"`);
    names.add(p.offering);
    assert(/^https?:\/\//.test(p.endpoint ?? ''), `product "${p.offering}" needs a valid "endpoint" URL`);
    assert(p.query && typeof p.query === 'object', `product "${p.offering}" needs a "query" map`);
    assert(typeof p.retail === 'number' && p.retail > 0, `product "${p.offering}" needs a positive "retail" price`);
    p.required ??= [];
  }
  return raw as Catalog;
}
