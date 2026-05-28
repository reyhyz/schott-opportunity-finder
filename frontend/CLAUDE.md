# Frontend — Signal (Drug Packaging Intelligence)

No-build React app. No npm, no package.json, no bundler. React 18, ReactDOM, and Babel are loaded from CDN. Open `Signal.html` directly in a browser or serve with any static file server.

## Running

```bash
# Option A — open directly (works for most cases)
start frontend/Signal.html

# Option B — local static server (needed if browser blocks file:// fetch)
uv run python -m http.server 5173 --directory frontend
# then open http://localhost:5173/Signal.html
```

The backend must be running on `http://localhost:8000` for queries and uploads to work.

## File Map

```
frontend/
├── Signal.html        # Entry point — loads CDN scripts, mounts React to #root
├── styles.css         # Full design system (CSS custom properties, light + dark theme)
└── src/
    ├── data.js        # API client (plain JS, no JSX) — exposes window.queryOpportunities,
    │                  #   window.uploadFile, window.fetchSources
    ├── components.jsx # Shared UI: icons, pills, badges, cards, UploadPanel, ConfidenceBadge
    ├── views.jsx      # Page views: LoginView, DashboardView, OpportunityDetail
    └── app.jsx        # Auth context, theme, hash router, App root — mounts to #root
```

## Script Load Order

`Signal.html` loads scripts in this exact order — order matters because each file exposes globals used by the next:

1. `src/data.js` → sets `window.queryOpportunities`, `window.uploadFile`, `window.fetchSources`
2. `src/components.jsx` → exposes shared components via `Object.assign(window, {...})`
3. `src/views.jsx` → uses components from step 2; exposes `LoginView`, `DashboardView`, `OpportunityDetail`
4. `src/app.jsx` → uses views from step 3; calls `ReactDOM.createRoot(...).render(<App />)`

All JSX files use `type="text/babel"`. `data.js` is plain JS (no Babel needed).

## Global Namespace Pattern

Because there's no module system, cross-file sharing uses `window`:
- `components.jsx` ends with `Object.assign(window, { Icon, Logo, DrugClassPill, ... })`
- `views.jsx` ends with `Object.assign(window, { LoginView, DashboardView, OpportunityDetail })`
- Any new shared component must be added to the relevant `Object.assign` call

## API Client (`src/data.js`)

```js
window.API_BASE = "http://localhost:8000";
window.queryOpportunities(queryText)  // POST /query → {opportunities, sources_used, live_data_timestamp}
window.uploadFile(file)               // POST /upload → {status, chunks_stored, filename}
window.fetchSources()                 // GET /sources → {static_documents, live_cache, user_uploads}
```

## Key Components (`src/components.jsx`)

| Component | Props | Notes |
|---|---|---|
| `DrugClassPill` | `value` | Coloured pill for mRNA / GLP-1 / ADC / Biologic / Cell Therapy |
| `CapabilityBadge` | `value` | Teal badge showing matched SCHOTT competency |
| `TRLBadge` | `trl` | Coloured by TRL level (4=amber, 5=teal, 6=blue) |
| `ConfidenceBadge` | `value` | green/amber/gray for high/medium/low |
| `SignalStrengthBar` | `value` (0–1) | Progress bar with percentage |
| `Citation` | `source`, `url` | Linked citation row with source icon |
| `UploadPanel` | — | Drag-drop file uploader, calls `window.uploadFile` |
| `Skeleton` / `SkeletonCard` | — | Loading shimmer placeholders |

## Key Views (`src/views.jsx`)

**`DashboardView`** — main screen after login:
- Text search input + "Analyse" button → calls `window.queryOpportunities` → renders `ApiOpportunityCard` grid
- Upload drawer (toggle via nav button) → `UploadPanel`
- Shows skeleton cards while loading, empty state if no results

**`ApiOpportunityCard`** — renders one opportunity from the API response:
- Fields: `rank`, `title`, `drug_class`, `confidence`, `schott_competency`, `timing_argument`, `description`, `sources`, `evidence_summary`
- Expandable evidence panel toggled by "Show evidence" button

**`LoginView`** — demo auth (any credentials work), sets user in `AuthCtx`

**`OpportunityDetail`** — detail page, hash-routed to `#/dashboard/opportunity/:id`

## Routing

Hash-based router in `app.jsx`. No library.
- `#/login` → `LoginView`
- `#/dashboard` → `DashboardView`
- `#/dashboard/opportunity/:id` → `OpportunityDetail`

## Theming

Light/dark via `data-theme` attribute on `<html>`. CSS custom properties in `styles.css` under `:root` (light) and `[data-theme="dark"]`. Theme persisted to `localStorage` under key `signal_theme`.

## Adding a New Component

1. Define the function in `components.jsx`
2. Add it to the `Object.assign(window, {...})` call at the bottom
3. Use it in `views.jsx` or `app.jsx` directly — no import needed
