"""
FastAPI application — entry point for the SCHOTT opportunity finder backend.

Start:
    uv run uvicorn backend.main:app --reload --port 8000
"""

from __future__ import annotations

import logging
import os
from contextlib import asynccontextmanager
from datetime import datetime, timezone
from pathlib import Path

import chromadb
from dotenv import load_dotenv
from fastapi import FastAPI, File, HTTPException, Request, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sentence_transformers import SentenceTransformer

from backend.ingest.ingest_live import ingest_live
from backend.ingest.ingest_upload import ingest_upload
from backend.prompt import build_prompt, call_gemini
from backend.retrieval import retrieve

load_dotenv()

logging.basicConfig(level=logging.INFO, format="%(levelname)s %(message)s")
log = logging.getLogger(__name__)

CHROMA_DIR = Path("backend/chroma_db")
MODEL_NAME = "all-MiniLM-L6-v2"

DRUG_CLASS_KEYWORDS = ["mRNA", "GLP-1", "ADC", "cell therapy", "biologic", "injectable"]


# ---------------------------------------------------------------------------
# Startup / shutdown
# ---------------------------------------------------------------------------

@asynccontextmanager
async def lifespan(app: FastAPI):
    log.info("Loading sentence-transformers model '%s'…", MODEL_NAME)
    app.state.embedder = SentenceTransformer(MODEL_NAME)
    log.info("Connecting to ChromaDB at '%s'…", CHROMA_DIR)
    app.state.chroma = chromadb.PersistentClient(path=str(CHROMA_DIR))
    app.state.gemini_api_key = os.environ.get("GEMINI_API_KEY", "")
    if not app.state.gemini_api_key:
        log.warning("GEMINI_API_KEY not set — /query will fail. Copy .env.template → .env and add your key.")
    yield
    log.info("Shutdown.")


# ---------------------------------------------------------------------------
# App
# ---------------------------------------------------------------------------

app = FastAPI(title="SCHOTT Opportunity Finder", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# Schemas
# ---------------------------------------------------------------------------

class QueryRequest(BaseModel):
    query: str

class LiveIngestRequest(BaseModel):
    drug_class: str


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------

@app.get("/health")
async def health():
    return {"status": "ok"}


@app.post("/query")
async def query_opportunities(body: QueryRequest, request: Request):
    if not body.query.strip():
        raise HTTPException(status_code=400, detail="query must not be empty.")

    api_key: str = request.app.state.gemini_api_key
    if not api_key:
        raise HTTPException(status_code=500, detail="GEMINI_API_KEY is not configured.")

    embedder: SentenceTransformer = request.app.state.embedder
    chroma: chromadb.PersistentClient = request.app.state.chroma

    # Detect relevant drug-class keyword and fetch live data
    detected = [kw for kw in DRUG_CLASS_KEYWORDS if kw.lower() in body.query.lower()]
    live_timestamp = datetime.now(timezone.utc).isoformat()
    for kw in detected or ["biologic"]:
        try:
            ingest_live(kw, chroma_dir=CHROMA_DIR, embedder=embedder, chroma_client=chroma)
        except Exception as exc:
            log.warning("Live ingest for '%s' failed: %s", kw, exc)

    # Retrieve top chunks
    chunks = retrieve(body.query, embedder, chroma)

    if not chunks:
        return {
            "opportunities": [],
            "sources_used": [],
            "live_data_timestamp": live_timestamp,
            "detail": "No relevant documents found. Run ingest_static.py to pre-load data.",
        }

    # Build Gemini prompt and call LLM
    prompt_text = build_prompt(chunks)
    try:
        opportunities = call_gemini(prompt_text, api_key)
    except ValueError as exc:
        raise HTTPException(status_code=502, detail=str(exc))

    sources_used = list({c["metadata"].get("source", "") for c in chunks})

    return {
        "opportunities": opportunities,
        "sources_used": sources_used,
        "live_data_timestamp": live_timestamp,
    }


@app.post("/upload")
async def upload_file(file: UploadFile = File(...), request: Request = None):
    allowed = {".pdf", ".txt", ".csv"}
    ext = Path(file.filename or "").suffix.lower()
    if ext not in allowed:
        raise HTTPException(status_code=400, detail=f"Unsupported file type '{ext}'. Allowed: {allowed}")

    data = await file.read()
    embedder: SentenceTransformer = request.app.state.embedder
    chroma: chromadb.PersistentClient = request.app.state.chroma

    result = ingest_upload(data, file.filename, chroma_dir=CHROMA_DIR, embedder=embedder, chroma_client=chroma)

    if result["status"] == "error":
        raise HTTPException(status_code=422, detail=result.get("detail", "Ingestion failed."))
    return result


@app.get("/sources")
async def list_sources(request: Request):
    chroma: chromadb.PersistentClient = request.app.state.chroma
    out = {}
    for name in ("static_documents", "live_cache", "user_uploads"):
        try:
            col = chroma.get_collection(name)
            out[name] = col.count()
        except Exception:
            out[name] = 0
    return out


@app.post("/ingest/live")
async def force_ingest_live(body: LiveIngestRequest, request: Request):
    embedder: SentenceTransformer = request.app.state.embedder
    chroma: chromadb.PersistentClient = request.app.state.chroma
    try:
        added = ingest_live(body.drug_class, chroma_dir=CHROMA_DIR, embedder=embedder, chroma_client=chroma)
    except Exception as exc:
        raise HTTPException(status_code=502, detail=str(exc))
    return {"status": "refreshed", "chunks_added": len(added)}
