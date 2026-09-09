# Arsis Gym — Persian static website

Four public pages (`index.html`, `plans.html`, `team.html`, `contact.html`) plus a local content editor and Persian maintenance guide. All publishable files are in `dist/`. No runtime backend, CMS, install step, framework, external font request, checkout, or visitor submission forms.

## Editing

Serve `dist/` over HTTP(S) and open `editor.html`. Drafts are explicitly local to that browser. Preview uses `?preview=1`; ordinary visitors always read published `content.json`. Export JSON and replace the hosted file to publish changes. This is not authenticated shared administration. Do not store secrets here. Full logo, font, image, plan and hosting instructions are in `dist/guide.html`.

## Source utilities (Node, no dependencies)

- `node scripts/render-pages.mjs`: regenerate the four initial HTML snapshots from `dist/content.json`.
- `node scripts/check.mjs`: validate routes/assets and price-comparison and import safety behavior.

The runtime still fetches fresh JSON. Regenerate HTML after content changes when initial SEO/no-JavaScript content must also match. `assets/brand.css` provides isolated logo/font/color replacement guidance. The public pages use local variable Vazirmatn; its OFL license is included.

## Sample content

The 15 initial prices are illustrative and individually labeled. Two AI-generated generic architectural photographs are labeled as sample images, not actual Arsis facilities. Staff names/photos, exact address, telephone and hours are explicit placeholders. Clear sample flags only after replacing the corresponding content.

Comparison is category-specific and separates sample and actual-price cohorts. Every per-session amount is computed from the full price and session count; missing prices or sessions are excluded. Multiple equal minimum rates all receive the lowest-rate badge when at least two comparable plans exist.

## Deployment

Upload the contents of `dist/` to any static host, with `index.html` at the web root. Relative paths support subdirectory hosting. The Sites identity is in `.openai/hosting.json`; source is versioned in the linked repository. The `_headers` file provides cache and indexing hints on hosts that support that format; pages also include metadata independently.

The downloadable ZIP contains ready-to-upload static files and source rendering utilities, with deployment internals and credentials excluded.
