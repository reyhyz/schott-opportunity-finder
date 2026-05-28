"""
Semantic retrieval across all three ChromaDB collections.
Scores, deduplicates, and returns the top-k chunks.
"""

from __future__ import annotations

import logging
from pathlib import Path

import chromadb
from sentence_transformers import SentenceTransformer

from backend.scoring import score_chunk

log = logging.getLogger(__name__)

COLLECTION_QUERIES = {
    "static_documents": 10,
    "live_cache":        5,
    "user_uploads":      5,
}


def retrieve(
    query: str,
    embedder: SentenceTransformer,
    chroma_client: chromadb.PersistentClient,
    top_k: int = 15,
) -> list[dict]:
    """
    Embed `query`, search all collections, score, deduplicate by source, return top_k.
    Each returned dict: {text, metadata, composite_score}
    """
    query_embedding = embedder.encode(query).tolist()
    all_chunks: list[dict] = []

    for collection_name, n_results in COLLECTION_QUERIES.items():
        try:
            collection = chroma_client.get_collection(collection_name)
        except Exception:
            continue

        count = collection.count()
        if count == 0:
            continue

        n = min(n_results, count)
        results = collection.query(
            query_embeddings=[query_embedding],
            n_results=n,
            include=["documents", "metadatas", "distances"],
        )

        docs = results["documents"][0]
        metas = results["metadatas"][0]
        distances = results["distances"][0]

        for doc, meta, dist in zip(docs, metas, distances):
            # ChromaDB returns L2 distance; convert to cosine-like [0, 1] relevance
            relevance = max(0.0, 1.0 - dist / 2.0)
            composite = score_chunk(doc, meta, relevance)
            all_chunks.append({
                "text": doc,
                "metadata": meta,
                "composite_score": composite,
                "collection": collection_name,
            })

    # Deduplicate by source, keeping the highest-scored chunk per source
    best_by_source: dict[str, dict] = {}
    for chunk in all_chunks:
        source = chunk["metadata"].get("source", "unknown")
        if source not in best_by_source or chunk["composite_score"] > best_by_source[source]["composite_score"]:
            best_by_source[source] = chunk

    ranked = sorted(best_by_source.values(), key=lambda c: c["composite_score"], reverse=True)
    top = ranked[:top_k]
    log.info("retrieve(): %d unique sources, returning top %d.", len(best_by_source), len(top))
    return top
