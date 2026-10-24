# Gus AI — Phase 2 Scope and Safety Notes

## Current state

Gus AI is a visual preview only. No model provider, prompt orchestration, retrieval pipeline, or conversation API is connected in Phase 1.

## Intended user value

Help users discover relevant ayat and explore a topic while making the source and limits of the response clear. It must not present itself as an authoritative source of tafsir, fiqh, or fatwa.

## Proposed flow

1. User submits a question.
2. Server validates type and length; applies abuse/request controls.
3. Retrieval/search finds relevant source text and references from verified editions.
4. Server sends the relevant context to the configured model provider.
5. Response is returned with source references and clear separation between quoted source text and generated explanation.
6. UI displays source and uncertainty/limitations when the retrieval result is insufficient.

This is a proposal. Exact retrieval and model design remains an ADR for Phase 2.

## Must-have before activation

- Secret key stored only in server-side environment variables.
- API route schema validation and request size limits.
- Rate limiting or an equivalent abuse-control plan.
- Provider terms, billing/free-tier use and data handling reviewed.
- Privacy notice that describes the external AI provider and whether conversation data is retained.
- Source retrieval and references tested against a defined evaluation set.
- Tests for unsupported, ambiguous and adversarial queries.
- A user-facing statement that the assistant is informational and is not a substitute for qualified religious guidance.
- Avoid storing chat logs by default unless a defined need and retention policy exist.

## Initial evaluation cases

- Search for a theme (e.g. patience) and check source references.
- Ask a question that lacks enough context; assistant should clarify or state limitations.
- Ask for an exact verse quotation; compare against the verified source.
- Ask for a religious ruling; assistant should not overclaim authority and should direct the user to qualified sources when appropriate.
- Try long or malformed input; server rejects safely.
- Simulate model timeout or quota exhaustion; UI displays a recoverable error.

## UI state

Until all items above are met, keep the preview label and disabled composer. Do not show sample responses without clearly labeling them as mock prototype content.
