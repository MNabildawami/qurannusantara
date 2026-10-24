# ADR-001: Select an External Quran Content API for the MVP

- **Status:** Proposed for MVP; verify before public release
- **Date:** 2026-10-24

## Context

The MVP should be built with minimal cost and should not require a separately managed Quran database. It needs surah metadata, Arabic text, Indonesian and English translations, and audio where available.

## Decision

Use AlQuran Cloud API as the initial read-only provider candidate, behind `src/lib/quran-api.ts`. Configure the base URL and edition identifiers through environment variables so source/edition changes do not need to be scattered throughout UI components.

## Alternatives considered

- Bundle a dataset locally: may improve offline reliability, but requires carefully reviewed data provenance, licensing, versioning, and distribution size.
- Use Quran Foundation APIs: offers extensive content/search/audio/user API families, but requires developer-console app credentials for content API server calls and has a larger setup for an unauthenticated MVP.

## Consequences

Positive:
- Fast start without a managed database.
- API exposes surah, edition, search, and audio-related operations.
- Data adapter keeps external service details isolated from components.

Negative:
- Runtime availability depends on third-party service and internet access.
- Edition identifiers and translation terms must be verified.
- Rate limits, response shape, content provenance, and attribution requirements must be documented before public release.
- A server cache/revalidation policy may be needed to reduce unnecessary requests.

## Validation needed

- Confirm `quran-uthmani`, `id.indonesian`, and `en.sahih` are available and appropriate for release.
- Review source and translation terms, attribution, and redistribution conditions.
- Test a sample of surahs against an independent verified reference.
- Verify audio endpoint behavior in supported browsers.

## References

- https://alquran.cloud/api
- https://api-docs.quran.com/docs/api-reference/
