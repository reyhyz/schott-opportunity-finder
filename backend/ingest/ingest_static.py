"""
Pre-hackathon ingestion script.
Walk backend/data/, extract text, chunk, embed, upsert into ChromaDB `static_documents`.

Run once:
    uv run python backend/ingest/ingest_static.py
"""

from __future__ import annotations

import hashlib
import io
import logging
import os
import sys
from pathlib import Path

import chromadb
import pandas as pd
from pypdf import PdfReader
from sentence_transformers import SentenceTransformer

logging.basicConfig(level=logging.INFO, format="%(levelname)s %(message)s")
log = logging.getLogger(__name__)

# Paths are relative to the repo root (where you run the script from)
DATA_DIR = Path("backend/data")
CHROMA_DIR = Path("backend/chroma_db")
COLLECTION_NAME = "static_documents"
CHUNK_SIZE = 500       # words
CHUNK_OVERLAP = 50     # words
MODEL_NAME = "all-MiniLM-L6-v2"

# Map parent directory name to category metadata value
DIR_CATEGORY: dict[str, str] = {
    "patents": "patent",
    "papers":  "academic_paper",
    "funding": "nih_grant",
    "trials":  "clinical_trial",
}


def _extract_text(path: Path) -> str:
    suffix = path.suffix.lower()
    if suffix == ".pdf":
        reader = PdfReader(str(path))
        return "\n".join(page.extract_text() or "" for page in reader.pages)
    if suffix == ".csv":
        df = pd.read_csv(path, dtype=str).fillna("")
        return df.to_string(index=False)
    return path.read_text(encoding="utf-8", errors="ignore")


def _chunk(text: str, size: int = CHUNK_SIZE, overlap: int = CHUNK_OVERLAP) -> list[str]:
    words = text.split()
    chunks, start = [], 0
    while start < len(words):
        chunks.append(" ".join(words[start : start + size]))
        start += size - overlap
    return [c for c in chunks if c.strip()]


def _doc_id(source: str, chunk_index: int, text: str) -> str:
    digest = hashlib.md5(text.encode()).hexdigest()[:8]
    return f"{source}::chunk{chunk_index}::{digest}"


def ingest(data_dir: Path = DATA_DIR, chroma_dir: Path = CHROMA_DIR) -> None:
    embedder = SentenceTransformer(MODEL_NAME)
    client = chromadb.PersistentClient(path=str(chroma_dir))
    collection = client.get_or_create_collection(COLLECTION_NAME)

    files = [p for p in data_dir.rglob("*") if p.is_file() and p.suffix.lower() in {".pdf", ".txt", ".csv"}]

    if not files:
        log.warning("No files found in %s — drop PDFs/TXTs/CSVs into backend/data/ sub-folders first.", data_dir)
        return

    total_chunks = 0
    for path in files:
        category = DIR_CATEGORY.get(path.parent.name, "other")
        log.info("Processing %s (%s)…", path.name, category)

        try:
            text = _extract_text(path)
        except Exception as exc:
            log.warning("  Skipping %s — could not extract text: %s", path.name, exc)
            continue

        chunks = _chunk(text)
        if not chunks:
            log.warning("  Skipping %s — no text extracted.", path.name)
            continue

        ids, embeddings, documents, metadatas = [], [], [], []
        for i, chunk in enumerate(chunks):
            doc_id = _doc_id(path.name, i, chunk)
            ids.append(doc_id)
            embeddings.append(embedder.encode(chunk).tolist())
            documents.append(chunk)
            metadatas.append({
                "source":     path.name,
                "category":   category,
                "drug_class": "",
                "trial_phase": "",
                "date":       "",
                "url":        "",
            })

        collection.upsert(ids=ids, embeddings=embeddings, documents=documents, metadatas=metadatas)
        log.info("  → %d chunks upserted.", len(chunks))
        total_chunks += len(chunks)

    log.info("Done. Total chunks in static_documents: %d", total_chunks)


if __name__ == "__main__":
    ingest()
