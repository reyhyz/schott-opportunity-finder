"""
Live data ingestion — called at query time.
Fetches ClinicalTrials.gov and openFDA for the given drug-class keyword,
embeds, and upserts into ChromaDB `live_cache`.

Returns the list of chunk IDs added (skips URLs already cached today).

Run standalone:
    uv run python backend/ingest/ingest_live.py "mRNA therapeutics"
"""

from __future__ import annotations

import hashlib
import logging
import sys
from datetime import date
from pathlib import Path

import chromadb
import httpx
from sentence_transformers import SentenceTransformer

log = logging.getLogger(__name__)

CHROMA_DIR = Path("backend/chroma_db")
COLLECTION_NAME = "live_cache"
MODEL_NAME = "all-MiniLM-L6-v2"
CHUNK_SIZE = 400
CHUNK_OVERLAP = 40

CT_BASE = "https://clinicaltrials.gov/api/v2/studies"
FDA_BASE = "https://api.fda.gov/drug/drugsfda.json"


def _chunk(text: str, size: int = CHUNK_SIZE, overlap: int = CHUNK_OVERLAP) -> list[str]:
    words = text.split()
    chunks, start = [], 0
    while start < len(words):
        chunks.append(" ".join(words[start : start + size]))
        start += size - overlap
    return [c for c in chunks if c.strip()]


def _cache_key(url: str) -> str:
    today = date.today().isoformat()
    return hashlib.md5(f"{today}::{url}".encode()).hexdigest()


def _fetch_clinical_trials(drug_class: str, limit: int = 20) -> list[dict]:
    """Return list of {title, description, url, phase} dicts."""
    params = {
        "query.term": drug_class,
        "filter.overallStatus": "RECRUITING,ACTIVE_NOT_RECRUITING",
        "pageSize": limit,
        "format": "json",
    }
    try:
        resp = httpx.get(CT_BASE, params=params, timeout=15)
        resp.raise_for_status()
        studies = resp.json().get("studies", [])
    except Exception as exc:
        log.warning("ClinicalTrials.gov fetch failed: %s", exc)
        return []

    results = []
    for s in studies:
        proto = s.get("protocolSection", {})
        id_mod = proto.get("identificationModule", {})
        desc_mod = proto.get("descriptionModule", {})
        design_mod = proto.get("designModule", {})

        nct_id = id_mod.get("nctId", "")
        title = id_mod.get("briefTitle", "")
        brief = desc_mod.get("briefSummary", "")
        phases = design_mod.get("phases", [])
        phase = phases[0].lower().replace(" ", "_") if phases else ""

        if not title:
            continue
        results.append({
            "title": title,
            "description": brief,
            "url": f"clinicaltrials.gov/study/{nct_id}",
            "phase": phase,
            "nct_id": nct_id,
        })
    return results


def _fetch_openfda(drug_class: str, limit: int = 10) -> list[dict]:
    """Return list of {title, description, url} dicts."""
    params = {
        "search": f'active_ingredients:"{drug_class}"',
        "limit": limit,
    }
    try:
        resp = httpx.get(FDA_BASE, params=params, timeout=15)
        resp.raise_for_status()
        results_raw = resp.json().get("results", [])
    except Exception as exc:
        log.warning("openFDA fetch failed: %s", exc)
        return []

    results = []
    for r in results_raw:
        app_no = r.get("application_number", "")
        brand = r.get("brand_name", "")
        generic = r.get("generic_name", "")
        products = r.get("products", [{}])
        status = products[0].get("marketing_status", "") if products else ""
        title = f"{brand or generic} ({app_no})"
        results.append({
            "title": title,
            "description": f"Marketing status: {status}. Active ingredient: {generic}.",
            "url": f"open.fda.gov/drug/drugsfda/{app_no}",
            "phase": "approved" if "prescription" in status.lower() else "",
        })
    return results


def ingest_live(
    drug_class: str,
    chroma_dir: Path = CHROMA_DIR,
    embedder: SentenceTransformer | None = None,
    chroma_client: chromadb.PersistentClient | None = None,
) -> list[str]:
    """Fetch live data, embed, upsert. Returns list of new chunk IDs."""
    own_embedder = embedder is None
    own_client = chroma_client is None

    if own_embedder:
        embedder = SentenceTransformer(MODEL_NAME)
    if own_client:
        chroma_client = chromadb.PersistentClient(path=str(chroma_dir))

    collection = chroma_client.get_or_create_collection(COLLECTION_NAME)
    existing_ids: set[str] = set(collection.get()["ids"])

    ct_records = _fetch_clinical_trials(drug_class)
    fda_records = _fetch_openfda(drug_class)
    all_records = [(r, "clinical_trial", r.get("phase", "")) for r in ct_records] + \
                  [(r, "fda_approval", "approved") for r in fda_records]

    added_ids: list[str] = []
    for record, category, phase in all_records:
        url = record["url"]
        text = f"{record['title']}\n{record['description']}".strip()
        if not text:
            continue

        chunks = _chunk(text)
        for i, chunk in enumerate(chunks):
            doc_id = f"{_cache_key(url)}::chunk{i}"
            if doc_id in existing_ids:
                continue

            collection.upsert(
                ids=[doc_id],
                embeddings=[embedder.encode(chunk).tolist()],
                documents=[chunk],
                metadatas=[{
                    "source":      record.get("nct_id", url),
                    "category":    category,
                    "drug_class":  drug_class,
                    "trial_phase": phase,
                    "date":        date.today().isoformat(),
                    "url":         f"https://{url}",
                }],
            )
            added_ids.append(doc_id)

    log.info("ingest_live(%r): %d new chunks added.", drug_class, len(added_ids))
    return added_ids


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO, format="%(levelname)s %(message)s")
    keyword = sys.argv[1] if len(sys.argv) > 1 else "mRNA therapeutics"
    ids = ingest_live(keyword)
    print(f"Added {len(ids)} chunks for '{keyword}'.")
