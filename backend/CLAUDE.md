# Backend — SCHOTT Opportunity Finder

RAG pipeline that ingests public signals (patents, clinical trials, grants, FDA), retrieves relevant chunks semantically, and uses Gemini to output ranked packaging opportunities for SCHOTT AG.

## Stack

- **Python 3.13**, managed with **uv**
- **FastAPI** + **uvicorn** — REST API
- **ChromaDB** (local persistent) — vector store, 3 collections
- **sentence-transformers** (`all-MiniLM-L6-v2`) — embeddings, CPU, no API cost
- **Gemini 1.5 Pro** via `google-genai` SDK — LLM synthesis
- **pypdf** / **pandas** / **httpx** — parsing and live API calls

## Running

```bash
# From repo root
uv run uvicorn backend.main:app --reload --port 8000
```

Requires `.env` at repo root (copy from `.env.template`):
```
GEMINI_API_KEY=your-key-here
```

## API Endpoints

| Method | Path | Purpose |
|--------|------|---------|
| `GET` | `/health` | Liveness check |
| `POST` | `/query` | `{"query": str}` → ranked opportunities JSON |
| `POST` | `/upload` | multipart file (PDF/TXT/CSV) → ingested into `user_uploads` |
| `GET` | `/sources` | chunk counts per collection |
| `POST` | `/ingest/live` | `{"drug_class": str}` → force-refresh live cache |

CORS is open (`allow_origins=["*"]`) — hackathon setting.

## File Map

```
backend/
├── main.py              # FastAPI app, lifespan startup (loads embedder + ChromaDB once)
├── scoring.py           # Pure composite scorer: relevance×0.4 + source×0.25 + timing×0.25 + fit×0.1
├── retrieval.py         # Queries all 3 collections, deduplicates by source, returns top 15
├── prompt.py            # Formats chunks → Gemini prompt, strips JSON fences, parses response
├── ingest/
│   ├── ingest_static.py # Run once: walks backend/data/, chunks+embeds → static_documents
│   ├── ingest_live.py   # Called at query time: ClinicalTrials.gov + openFDA → live_cache
│   └── ingest_upload.py # User file uploads → user_uploads
├── data/                # Drop PDFs/TXTs/CSVs here before running ingest_static.py
│   ├── patents/
│   ├── papers/
│   ├── funding/
│   └── trials/
└── chroma_db/           # Auto-generated, gitignored
```

## ChromaDB Collections

| Collection | Populated by | Contents |
|---|---|---|
| `static_documents` | `ingest_static.py` (run once) | Patents, papers, grants, competitor docs |
| `live_cache` | `ingest_live.py` (per query) | ClinicalTrials.gov + openFDA results, keyed by URL+date |
| `user_uploads` | `ingest_upload.py` (per upload) | User-provided PDFs/TXTs/CSVs |

## Shared Resources

`main.py` initialises `SentenceTransformer` and `chromadb.PersistentClient` once at startup via the `lifespan` context manager and attaches them to `app.state`. All endpoints access them via `request.app.state.embedder` and `request.app.state.chroma`. The ingest modules accept these as optional parameters so they can be called both from the API (passing shared instances) and standalone (creating their own).

## Scoring Formula

```
composite = relevance_score * 0.40   # ChromaDB cosine similarity
          + source_weight  * 0.25   # clinical_trial_phase3=1.0, patent=0.7, paper=0.6 …
          + timing_score   * 0.25   # approved=1.0, phase_3=0.8, phase_2=0.5 …
          + fit_score      * 0.10   # keyword hits against SCHOTT competency list
```

Constants live in `scoring.py`: `SOURCE_WEIGHTS`, `TIMING_SCORES`, `SCHOTT_FIT_KEYWORDS`.

## Ingesting Static Data

```bash
# Drop files into backend/data/{patents,papers,funding,trials}/
uv run python backend/ingest/ingest_static.py
```

Chunks: 500 words, 50-word overlap. Doc IDs are content-hashed so re-running is safe (upsert).

## Gemini Output Format

`prompt.py` expects Gemini to return a JSON array (no markdown fences). Each element:
```json
{
  "rank": 1,
  "title": "string",
  "description": "string",
  "drug_class": "string",
  "schott_competency": "string",
  "timing_argument": "string",
  "confidence": "high | medium | low",
  "sources": ["filename1"],
  "evidence_summary": "string"
}
```

If Gemini wraps the output in ` ```json ``` ` fences, `_strip_fences()` in `prompt.py` removes them before parsing. One retry on parse failure.
