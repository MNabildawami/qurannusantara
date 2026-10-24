# References and Verification Log

Last reviewed: 2026-10-24. Review again before production release.

## Provider and framework sources

1. **AlQuran Cloud API documentation** — operations include surah, editions, search, audio-related resources and other Quran content endpoints.
   https://alquran.cloud/api

2. **Quran Foundation API reference** — documents content APIs for Quran text, chapters, verses, translations, tafsir, audio and search; it notes that content/search calls use app credentials server-side or the JavaScript SDK server client, while user APIs use OAuth2 session tokens.
   https://api-docs.quran.com/docs/api-reference/

3. **Next.js App Router installation** — official instructions for creating a Next.js app with TypeScript, Tailwind CSS, App Router and an import alias; currently lists Node.js 20.9 as the minimum requirement.
   https://nextjs.org/docs/app/getting-started/installation

4. **Next.js Route Handlers** — official route handlers using Web Request/Response APIs.
   https://nextjs.org/docs/app/getting-started/route-handlers

5. **shadcn/ui for Next.js** — official installation path for adding customizable UI components.
   https://ui.shadcn.com/docs/installation/next

6. **Vercel + Next.js** — official deployment overview.
   https://vercel.com/frameworks/nextjs

## Decisions based on current documentation

- Next.js App Router is the selected application framework.
- AlQuran Cloud is the initial API candidate, subject to verifying exact editions and content terms.
- Quran Foundation is an alternative if the product later needs richer content/search/user APIs and accepts the setup/authentication requirements.
- Vercel is the target deployment platform, not a guarantee of unlimited free usage.

## Verification required before release

- Re-check the current API route and response schema for each call in `docs/04-integrations/quran-api.md`.
- Re-check exact edition IDs and available languages.
- Record translation source metadata and attribution terms.
- Verify current free-tier limits and non-commercial/personal-use eligibility for Vercel and any AI provider.
- Re-run typecheck, lint, build, integration checks, and accessibility review after installing dependencies.
