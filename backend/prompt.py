"""
Gemini prompt construction and LLM call.
Returns a parsed list of opportunity dicts.
"""

from __future__ import annotations

import json
import logging
import re

from google import genai
from google.genai import types as genai_types

log = logging.getLogger(__name__)

SYSTEM_PROMPT = """You are a market intelligence analyst for SCHOTT AG, a specialty glass manufacturer \
(Mainz, Germany). Your job is to analyze signals from patents, clinical trials, research funding and \
drug approvals, and identify concrete opportunities for SCHOTT's pharmaceutical glass business.

SCHOTT's relevant competencies:
- Pharmaceutical glass: borosilicate syringes, vials, ampoules for injectable drugs. \
Ultra-pure, chemically inert, compatible with biologics, mRNA, GLP-1.
- Specialty glass: custom compositions for novel containment requirements.
- Manufacturing: clean room, FDA/EMA certified, high precision, global network.

DOMAIN FOCUS:
Target drug classes: mRNA, GLP-1, ADCs, cell therapies, biologics.

SIGNAL TIMING LOGIC:
- Phase II → Phase III = packaging demand in 2–4 years
- FDA/EMA approval = immediate demand signal
- Research grant = 5–7 year horizon signal
- Competitor investment = validates near-term opportunity

OUTPUT RULES:
- Return ONLY a valid JSON array. No preamble, no markdown, no explanation.
- 3–5 ranked opportunities.
- Every claim must be traceable to a provided source document.
- Always include a timing argument — not just what, but why now.
- Never invent data not present in the provided context.
- Rank by urgency and commercial potential for SCHOTT.

OUTPUT FORMAT per opportunity:
{
  "rank": 1,
  "title": "string",
  "description": "string",
  "drug_class": "string",
  "schott_competency": "string",
  "timing_argument": "string",
  "confidence": "high | medium | low",
  "sources": ["filename1", "filename2"],
  "evidence_summary": "string"
}"""

_FENCE_RE = re.compile(r"```(?:json)?\s*([\s\S]*?)\s*```")


def _strip_fences(text: str) -> str:
    match = _FENCE_RE.search(text)
    return match.group(1) if match else text.strip()


def build_prompt(chunks: list[dict]) -> str:
    parts = []
    for chunk in chunks:
        meta = chunk["metadata"]
        header = (
            f"[SOURCE: {meta.get('source', 'unknown')} | "
            f"CATEGORY: {meta.get('category', '')} | "
            f"PHASE: {meta.get('trial_phase', '')}]"
        )
        parts.append(f"{header}\n{chunk['text']}")
    return "\n\n".join(parts)


def call_gemini(prompt_text: str, api_key: str) -> list[dict]:
    """Call Gemini 1.5 Pro with the system prompt + formatted chunks. Returns parsed list."""
    client = genai.Client(api_key=api_key)

    for attempt in range(2):
        response = client.models.generate_content(
            model="gemini-1.5-pro",
            contents=prompt_text,
            config=genai_types.GenerateContentConfig(
                system_instruction=SYSTEM_PROMPT,
            ),
        )
        raw = response.text
        cleaned = _strip_fences(raw)

        try:
            opportunities = json.loads(cleaned)
            if not isinstance(opportunities, list):
                raise ValueError("Expected a JSON array.")
            log.info("call_gemini(): %d opportunities returned.", len(opportunities))
            return opportunities
        except (json.JSONDecodeError, ValueError) as exc:
            if attempt == 0:
                log.warning("JSON parse failed on attempt 1: %s — retrying.", exc)
                continue
            log.error("Gemini returned unparseable JSON after 2 attempts.\nRaw:\n%s", raw)
            raise ValueError(f"Gemini response could not be parsed as JSON: {exc}") from exc

    return []  # unreachable, satisfies type checkers
