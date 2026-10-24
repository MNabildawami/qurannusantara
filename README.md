# QuranNusantara

QuranNusantara is a reading-first, responsive digital Quran web application for Indonesian users. It opens directly to the surah browser and prioritizes a calm reading experience, Indonesian/English translation selection, saved verses, and a future assistant named **Gus AI**.

> **Project stage:** engineering starter / early implementation. The app depends on an external Quran data API. Content editions, source terms, and attribution must be verified before a public release. Gus AI is only a UI preview and does not generate answers yet.

## Product scope

### Phase 1 — Quran reader

- Direct surah browser (no marketing landing page).
- Quranic Arabic text and Indonesian/English translation selection.
- Search by surah name or number.
- Audio playback where the selected API provides a valid audio URL.
- Local bookmarks and last-opened reading position.
- Light and dark themes, implemented from one token system.
- Responsive layout; the Stitch reference is desktop light mode, while mobile adaptation is done in CSS/components.
- Explicit loading, empty, error, and unavailable states.

### Phase 2 — Gus AI

The panel is currently an inactive preview. Activation requires a server-side model integration, source retrieval/grounding, request limits, source references, privacy notice, and evaluation cases. Never put a model API key in browser code.

## Technology

- Next.js App Router
- TypeScript
- React
- Tailwind CSS v4 foundation (custom visual tokens and CSS are the design source of truth)
- `next-themes` for theme preference
- Lucide React icons
- AlQuran Cloud API as the initial read-only API candidate
- Vercel for the initial deployment target

Official Next.js installation guidance uses `create-next-app` with TypeScript, Tailwind CSS, App Router, and an import alias. See [Next.js installation](https://nextjs.org/docs/app/getting-started/installation).

## Requirements

- Node.js 20.9 or newer (confirm against the current Next.js requirements).
- npm 10+ or another supported package manager.
- Internet access for dependency installation and the external Quran API.

## Run locally

1. Extract or clone this repository.
2. Copy `.env.example` to `.env.local`.
3. Install dependencies:

   ```bash
   npm install
   ```

4. Start the development server:

   ```bash
   npm run dev
   ```

5. Open `http://localhost:3000`.

Useful commands:

```bash
npm run typecheck
npm run lint
npm run build
npm run start
```

The package dependency ranges are starter ranges; dependency installation and build still need to be executed locally. No `package-lock.json` is included because dependency resolution was not run in this environment.

## Configuration

`.env.example` contains the API base URL and edition identifiers used by the initial adapter:

- `QURAN_API_BASE_URL`
- `QURAN_ARABIC_EDITION`
- `QURAN_TRANSLATION_ID_EDITION`
- `QURAN_TRANSLATION_EN_EDITION`

Do not commit `.env.local` or any secret. These fields configure the initial content integration; verify the exact editions and terms before release.

## Repository map

```text
src/
  app/
    api/audio/[number]/route.ts  # server-side audio URL lookup
    bookmarks/page.tsx           # saved verses
    surah/[number]/page.tsx      # Quran reader
    page.tsx                     # root surah browser
    layout.tsx                   # root layout and app shell
    globals.css                  # source-of-truth design tokens and responsive CSS
  components/
    app-shell.tsx
    surah-browser.tsx
    quran-reader.tsx
    bookmarks-page.tsx
    gus-ai-panel.tsx
    theme-provider.tsx
    theme-toggle.tsx
    audio-button.tsx
  lib/
    quran-api.ts
    bookmarks.ts
    types.ts

docs/                            # engineering documentation
DESIGN.md                        # normalized design system
 design-reference/stitch-export/ # original Stitch HTML/screens and exported DESIGN.md files
```

## Data integrity and attribution

- Text, translations, and audio are requested from the configured external provider.
- The adapter uses the requested edition identifiers in `.env.example`; verify the identifiers and available editions before release.
- Do not edit or reconstruct Quranic text from mockups.
- Keep Arabic text, translation, and any future AI-generated explanation visibly distinct.
- Verify source terms, edition details, and attribution requirements before publishing.

## Current limitations

- Bookmark and last-read state are stored in this browser only; there is no account synchronization or database.
- The active UI is a first implementation pass and still requires visual comparison with the Stitch screens.
- Audio playback relies on the external API and internet connectivity.
- Gus AI is not connected to a model or a retrieval source.
- Dependency installation, lint, typecheck, and production build have not been run in this environment; execute these locally before treating the package as release-ready.

## Documentation

Start with:

1. `docs/00-overview/product-brief.md`
2. `docs/01-requirements/prd.md`
3. `docs/02-design/design-handoff.md`
4. `docs/03-architecture/architecture.md`
5. `docs/04-integrations/quran-api.md`
6. `docs/05-quality/test-plan.md`
7. `docs/06-operations/deployment.md`
8. `docs/07-ai/gus-ai-scope.md`

## References

- [AlQuran Cloud API](https://alquran.cloud/api)
- [Next.js installation](https://nextjs.org/docs/app/getting-started/installation)
- [Next.js Route Handlers](https://nextjs.org/docs/app/getting-started/route-handlers)
- [shadcn/ui for Next.js](https://ui.shadcn.com/docs/installation/next)
- [Vercel + Next.js](https://vercel.com/frameworks/nextjs)
