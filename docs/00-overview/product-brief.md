# Product Brief — QuranNusantara

- **Version:** 0.1
- **Status:** Baseline for implementation
- **Owner:** M. Nabil Dawami
- **Product type:** Personal portfolio project

## Vision

Build a calm, accessible, reading-first digital Quran experience that lets Indonesian users find a surah and begin reading with minimal friction. The product will later add a source-grounded assistant called Gus AI.

## Problem

A reader should not have to pass through a marketing homepage, account creation, or an overly complex interface just to find and read a surah. Quran text, translations, audio controls, and saved verses should remain easy to reach.

## Target users

Primary: Indonesian-speaking readers using desktop and mobile browsers.
Secondary: English readers who want to view an English translation alongside Arabic text.

## Product principles

1. Reading comes first.
2. The root route displays the surah browser directly.
3. Light and dark themes share one semantic design-token system.
4. Indonesian is the initial UI and translation language; English is an additional translation option.
5. No login or paid subscription in the MVP.
6. Source text and translations must originate from identified providers/editions.
7. Gus AI must not be represented as working until its backend is implemented and evaluated.

## Phased scope

### Phase 1 — Reader MVP

- Browse and search the 114 surahs.
- Open a surah and read Arabic text.
- Switch between Indonesian and English translations.
- Play per-ayah audio if a valid source URL is provided.
- Bookmark ayat and access a saved-verse page.
- Keep last-opened reading location locally.
- Light/dark theme and responsive adaptation.
- Loading/error/empty states for external API behavior.
- Gus AI desktop panel preview, intentionally inactive.

### Phase 2 — Gus AI

- A server-side endpoint accepts validated questions.
- Retrieval/source lookup provides relevant Quran references before model generation.
- Assistant response separates verified source quotations, translations, and AI explanation.
- Basic rate limiting/abuse protection and request limits.
- Privacy notice that explains external model processing.
- Evaluation cases for source faithfulness, unknown/ambiguous requests, and unsafe or unsupported religious claims.

## Non-goals for MVP

- User accounts and cross-device synchronization.
- Database-backed bookmarks.
- User-generated Quran text or tafsir.
- Fatwa/religious ruling service.
- Paid plans, analytics dashboards, streaks, gamification, and admin console.
- Offline Quran data bundle (may be considered after checking content and license requirements).

## Success criteria

- A first-time visitor can find and open a surah without an onboarding flow.
- The reading view distinguishes Arabic text from translations.
- Translation can be changed without navigating away from the reader.
- Saved verses can be reopened in the same browser.
- A theme choice is preserved locally.
- API errors have a useful message and retry path.
- Gus AI preview clearly states that chat functionality is not active in Phase 1.
- The initial app builds and passes the documented manual checks before public deployment.

## Constraints and assumptions

- Target cost: IDR 0 for the initial portfolio prototype, subject to current service limits and terms.
- Initial content source: AlQuran Cloud API, pending edition and attribution verification.
- Initial deployment target: Vercel Hobby, subject to its current eligibility/usage policy.
- No production deployment is claimed by this repository package.
