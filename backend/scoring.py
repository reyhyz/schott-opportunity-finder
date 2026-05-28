"""
Composite scoring for retrieved ChromaDB chunks.

composite = relevance * 0.40
           + source_weight * 0.25
           + timing_score  * 0.25
           + fit_score     * 0.10
"""

from __future__ import annotations

SOURCE_WEIGHTS: dict[str, float] = {
    "clinical_trial_phase3": 1.0,
    "clinical_trial_phase2": 0.8,
    "fda_approval":          1.0,
    "patent":                0.7,
    "academic_paper":        0.6,
    "nih_grant":             0.6,
    "eu_cordis_grant":       0.5,
    "competitor_filing":     0.7,
    "user_upload":           0.9,
}

TIMING_SCORES: dict[str, float] = {
    "approved":   1.0,
    "phase_3":    0.8,
    "phase_2":    0.5,
    "nih_grant":  0.2,
    "paper":      0.1,
}

SCHOTT_FIT_KEYWORDS: dict[str, list[str]] = {
    "pharmaceutical_glass": [
        "vial", "syringe", "ampoule", "borosilicate",
        "injectable", "primary packaging", "cartridge",
    ],
    "specialty_glass": [
        "containment", "cryogenic", "high temperature",
        "chemically inert", "novel formulation",
    ],
    "fiber_optics": [
        "endoscope", "optical", "light guide", "imaging",
    ],
}

# Flatten all keywords once for quick lookup
_ALL_KEYWORDS: list[str] = [kw for kws in SCHOTT_FIT_KEYWORDS.values() for kw in kws]


def _source_weight(metadata: dict) -> float:
    category = metadata.get("category", "")
    phase = metadata.get("trial_phase", "")

    if category == "clinical_trial":
        if phase == "phase_3":
            return SOURCE_WEIGHTS["clinical_trial_phase3"]
        return SOURCE_WEIGHTS["clinical_trial_phase2"]
    return SOURCE_WEIGHTS.get(category, 0.5)


def _timing_score(metadata: dict) -> float:
    phase = metadata.get("trial_phase", "")
    category = metadata.get("category", "")

    if phase == "approved":
        return TIMING_SCORES["approved"]
    if phase == "phase_3":
        return TIMING_SCORES["phase_3"]
    if phase == "phase_2":
        return TIMING_SCORES["phase_2"]
    if category in ("nih_grant", "eu_cordis_grant"):
        return TIMING_SCORES["nih_grant"]
    if category == "academic_paper":
        return TIMING_SCORES["paper"]
    return 0.3


def _fit_score(text: str) -> float:
    lower = text.lower()
    hits = sum(1 for kw in _ALL_KEYWORDS if kw in lower)
    return min(hits / max(len(_ALL_KEYWORDS) * 0.3, 1), 1.0)


def score_chunk(chunk_text: str, metadata: dict, relevance_score: float) -> float:
    """Return composite [0, 1] score for a retrieved chunk."""
    composite = (
        relevance_score          * 0.40
        + _source_weight(metadata) * 0.25
        + _timing_score(metadata)  * 0.25
        + _fit_score(chunk_text)   * 0.10
    )
    return round(min(max(composite, 0.0), 1.0), 4)
