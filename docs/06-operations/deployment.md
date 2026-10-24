# Deployment Guide — QuranNusantara

## Current status

Deployment has not been performed. This guide describes the intended process and must be adjusted to match the actual Vercel project configuration.

## Pre-deployment requirements

- [ ] Git repository created and source committed.
- [ ] `npm run typecheck` passes.
- [ ] `npm run lint` passes.
- [ ] `npm run build` passes.
- [ ] Provider edition identifiers and terms verified.
- [ ] Responsive and keyboard QA completed.
- [ ] `.env.local` is not committed.
- [ ] Privacy and content attribution copy reviewed.

## Local verification

```bash
cp .env.example .env.local
npm install
npm run typecheck
npm run lint
npm run build
npm run dev
```

On Windows PowerShell, copy the environment file using:

```powershell
Copy-Item .env.example .env.local
```

## Vercel deployment outline

1. Push the repository to GitHub.
2. Import the repository into Vercel.
3. Keep the framework preset on Next.js.
4. Add the required `QURAN_*` environment variables in the Vercel project settings. The starter values can also work as defaults, but explicit environment configuration makes provenance and changes easier to track.
5. Deploy a preview first.
6. Test the preview, especially API failure states, audio playback, theme, bookmarks, and translation switch.
7. Promote/merge to production only after review.

Official guide: https://vercel.com/frameworks/nextjs

## Rollback

For the MVP, deploys should be connected to Git commits. If a release has a functional regression, redeploy the last known good commit/deployment and record the incident as a GitHub issue. Confirm Vercel's current rollback controls for the actual plan/project.

## Free-tier caution

A target cost of IDR 0 is an objective, not a guarantee. External service policies, quotas, plan eligibility and terms can change. Review the current Vercel Hobby and API provider limits before public promotion or heavy use.

## Monitoring and troubleshooting

- Surah list fails: check the deployed function logs, API base URL, provider status, and upstream response.
- Reader fails for one surah: check the route number and configured editions.
- Translation absent: verify edition identifier and alignment of ayah arrays.
- Audio fails: inspect `/api/audio/{globalAyahNumber}` response and the returned URL's availability.
- Theme flash/wrong state: verify ThemeProvider settings and stored `qn-theme` value.
- Bookmark missing: confirm same browser profile, localStorage availability, and key version.
