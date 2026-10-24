# Implementation Roadmap

## Milestone 0 — Design handoff and source control

- [x] Receive and preserve current Stitch export.
- [x] Consolidate design tokens into root `DESIGN.md`.
- [x] Draft Product Brief, PRD, user stories, architecture, API notes and test plan.
- [ ] Create a Git repository and first commit.
- [ ] Install dependencies and create a package lock.
- [ ] Run initial typecheck/lint/build.

## Milestone 1 — Surah browser

- [x] Implement typed adapter for `/surah`.
- [x] Implement search and Makkiyah/Madaniyah filters.
- [x] Add error, empty and retry states.
- [ ] Verify upstream response in a local browser.
- [ ] Compare layout to the approved Stitch screen.
- [ ] Verify keyboard use and mobile adaptation.

## Milestone 2 — Reader basics

- [x] Implement reader route and data adapter for Arabic + Indonesian + English editions.
- [x] Implement translation selector.
- [x] Implement local bookmark and last-read state.
- [x] Add audio lookup/controls.
- [ ] Verify exact edition IDs and content mapping.
- [ ] Check verses against source for several surahs and edge cases.
- [ ] Check reader visual rhythm and audio playback in supported browsers.

## Milestone 3 — QA and deployment

- [ ] Run the complete manual test plan.
- [ ] Resolve critical/high severity issues.
- [ ] Review content licensing/attribution and privacy.
- [ ] Deploy a Vercel preview from GitHub.
- [ ] QA preview and only then promote to public deployment.

## Milestone 4 — Gus AI

- [ ] Define source corpus and retrieval plan.
- [ ] Select model/provider after reviewing price, free-tier, data policy and usage conditions.
- [ ] Add a server-only `/api/chat` route with input validation and abuse controls.
- [ ] Add source references and distinguish source text from AI explanation.
- [ ] Create AI evaluation cases and privacy notice.
- [ ] Activate UI only after gates are passed.
