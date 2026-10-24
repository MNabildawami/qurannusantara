# Contributing to QuranNusantara

This is a personal portfolio project, but changes should still be reviewable and documented.

## Before changing code

1. Read `README.md`, `DESIGN.md`, the relevant requirement, and the relevant ADR.
2. Create or select a GitHub issue with a clear outcome and acceptance criteria.
3. Keep the change scoped; avoid combining unrelated UI, API, and documentation changes.

## Implementation conventions

- Use TypeScript for app code.
- Keep external provider requests in `src/lib/quran-api.ts` or server Route Handlers; do not construct third-party API URLs throughout UI components.
- Keep components focused on one responsibility.
- Use semantic HTML and accessible labels.
- Use semantic CSS variables from the root `DESIGN.md`; avoid scattering raw color hex values in components.
- Do not add invented Quranic text, translation, tafsir, or source claims.
- Do not expose secrets in browser bundles or commits.
- Update docs and tests when behavior changes.

## Before opening a pull request

Run:

```bash
npm run typecheck
npm run lint
npm run build
```

Also perform the relevant manual test cases in `docs/05-quality/test-plan.md` and record any known limitation.
