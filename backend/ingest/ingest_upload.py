"""
User file upload ingestion.
Accepts raw bytes + filename, extracts text, chunks, embeds, upserts into `user_uploads`.

Run standalone (test with a local file):
    uv run python backend/ingest/ingest_upload.py path/to/file.pdf
"""

from __future__ import annotations

import hashlib
import io
import logging
import sys
from datetime import datetime
from pathlib import Path

import chromadb
import pandas as pd
from pypdf import PdfReader
from sentence_transformers import SentenceTransformer

log = logging.getLogger(__name__)

CHROMA_DIR = Path("backend/chroma_db")
COLLECTION_NAME = "user_uploads"
MODEL_NAME = "all-MiniLM-L6-v2"
CHUNK_SIZE = 400
CHUNK_OVERLAP = 40


def _extract_text(data: bytes, filename: str) -> str:
    ext = Path(filename).suffix.lower()
    if ext == ".pdf":
        reader = PdfReader(io.BytesIO(data))
        return "\n".join(page.extract_text() or "" for page in reader.pages)
    if ext == ".csv":
        import io as _io
        df = pd.read_csv(_io.BytesIO(data), dtype=str).fillna("")
        return df.to_string(index=False)
    return data.decode("utf-8", errors="ignore")


def _chunk(text: str, size: int = CHUNK_SIZE, overlap: int = CHUNK_OVERLAP) -> list[str]:
    words = text.split()
    chunks, start = [], 0
    while start < len(words):
        chunks.append(" ".join(words[start : start + size]))
        start += size - overlap
    return [c for c in chunks if c.strip()]


def ingest_upload(
    data: bytes,
    filename: str,
    chroma_dir: Path = CHROMA_DIR,
    embedder: SentenceTransformer | None = None,
    chroma_client: chromadb.PersistentClient | None = None,
) -> dict:
    """Extract, chunk, embed, upsert. Returns status dict."""
    own_embedder = embedder is None
    own_client = chroma_client is None

    if own_embedder:
        embedder = SentenceTransformer(MODEL_NAME)
    if own_client:
        chroma_client = chromadb.PersistentClient(path=str(chroma_dir))

    collection = chroma_client.get_or_create_collection(COLLECTION_NAME)

    text = _extract_text(data, filename)
    chunks = _chunk(text)

    if not chunks:
        return {"status": "error", "detail": "No extractable text found.", "filename": filename}

    timestamp = datetime.utcnow().isoformat()
    file_hash = hashlib.md5(data).hexdigest()[:8]

    ids, embeddings, documents, metadatas = [], [], [], []
    for i, chunk in enumerate(chunks):
        doc_id = f"upload::{file_hash}::chunk{i}"
        ids.append(doc_id)
        embeddings.append(embedder.encode(chunk).tolist())
        documents.append(chunk)
        metadatas.append({
            "source":      filename,
            "category":    "user_upload",
            "drug_class":  "",
            "trial_phase": "",
            "date":        timestamp,
            "url":         "",
        })

    collection.upsert(ids=ids, embeddings=embeddings, documents=documents, metadatas=metadatas)
    log.info("ingest_upload(%r): %d chunks stored.", filename, len(chunks))
    return {"status": "success", "chunks_stored": len(chunks), "filename": filename}


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO, format="%(levelname)s %(message)s")
    if len(sys.argv) < 2:
        print("Usage: uv run python backend/ingest/ingest_upload.py <path/to/file>")
        sys.exit(1)
    path = Path(sys.argv[1])
    result = ingest_upload(path.read_bytes(), path.name)
    print(result)
