# InsightFlow — Frontend

Premium dark-themed product-analytics dashboard (Obsidian & Amber theme) built with
React + Vite, Tailwind CSS, Framer Motion, Lenis, Apache ECharts, and TanStack Table.

## Run

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # type-check + production bundle
```

## Views

| Route | View |
|---|---|
| `/` | **Executive Hub** — bento KPI grid, slot-machine revenue ticker, count-up stats, 90-day revenue trend with brush/scroll zoom, DAU columns |
| `/funnel` | **Funnel Engine** — animated ordinal-amber funnel; click any drop-off to slide out a device/city breakdown panel |
| `/cohorts` | **Customer Cohorts** — retention heatmap with diagonal cascade load and row/column cross-highlight; radial-draw donuts |
| `/products` | **Product Leaderboard** — TanStack table with sticky header, sortable columns, animated row shuffle, inline revenue sparklines |

## Wiring to the backend

`src/data/api.ts` mirrors the FastAPI endpoints (`/api/kpi`, `/api/funnel`,
`/api/customer`, `/api/product`) and currently resolves deterministic mock data
with simulated latency (so skeleton states render). Replace the resolvers with
`axios.get(import.meta.env.VITE_API_URL + '/api/…')` calls and map the response
shapes in `src/data/types.ts` to go live.

## Palette

All chart colors live in `src/lib/palette.ts` and were validated against the
`#121212` surface with a CVD-simulation palette validator:

- **Categorical** (6 slots, fixed order): emerald → red → teal → amber → rose → lime.
  Worst adjacent CVD ΔE 9.3 (target ≥ 8), normal-vision ΔE 20.3 (floor ≥ 15), all ≥ 3:1 contrast.
- **Ordinal** (funnel stages): single-hue amber ramp, monotone lightness (OKLCH H≈70°).
- **Sequential** (retention heatmap): emerald ramp, low values recede toward the surface.

Never re-order or eyeball-edit these — re-run the validator if you change them.
