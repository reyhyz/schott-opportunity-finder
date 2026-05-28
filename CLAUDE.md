# SCHOTT Opportunity Finder

RAG-based market intelligence tool for SCHOTT AG's pharmaceutical glass team. Ingests public signals (patents, clinical trials, grants, FDA approvals), retrieves relevant chunks semantically, and uses Gemini 1.5 Pro to output ranked packaging opportunities matched to SCHOTT's capabilities with traceable evidence.

Built at LAUNCH Rhein-Main Build Days (2-day hackathon, 3 people).

## Repo Structure

```
schott-opportunity-finder/
├── backend/          # Python 3.13 RAG pipeline + FastAPI — see backend/CLAUDE.md
├── frontend/         # No-build React app (Signal.html) — see frontend/CLAUDE.md
├── pyproject.toml    # uv-managed dependencies
├── .env.template     # Copy to .env and add GEMINI_API_KEY
└── uv.lock
```

## Quick Start

```bash
# 1. Install dependencies
uv sync

# 2. Set API key
cp .env.template .env   # then fill in GEMINI_API_KEY

# 3. (Optional) Pre-load static documents
#    Drop PDFs/TXTs/CSVs into backend/data/{patents,papers,funding,trials}/
uv run python backend/ingest/ingest_static.py

# 4. Start backend
uv run uvicorn backend.main:app --reload --port 8000

# 5. Open frontend
start frontend/Signal.html
```

## Architecture

```
Static data (PDFs) ──► ingest_static.py ──┐
Live APIs (CT.gov, FDA) ► ingest_live.py ──┼──► ChromaDB (3 collections)
User uploads ───────────► ingest_upload.py ─┘         │
                                                  scoring.py
                                                  retrieval.py
                                                  prompt.py (Gemini)
                                                       │
                                              FastAPI /query endpoint
                                                       │
                                              frontend/Signal.html
```

## Key Constraints

- Every opportunity must map to a specific SCHOTT competency (not a generic trend)
- Every claim must be traceable to a public source — no black box output
- Do not commit `.env`, `backend/chroma_db/`, or `backend/data/` (all gitignored)
- Run all Python commands from the repo root so `backend.*` imports resolve correctly

## Sub-module Docs

- **Backend:** `backend/CLAUDE.md` — stack, endpoints, file map, scoring formula, Gemini output format
- **Frontend:** `frontend/CLAUDE.md` — no-build React setup, script load order, global namespace pattern, component reference
