# Test Plan — QuranNusantara MVP

## 1. Objective

Verify that primary reading journeys work, content is presented without accidental corruption, state persistence behaves as documented, and desktop/mobile themes remain readable before public release.

## 2. Scope

In scope:
- Surah browser and search/filter.
- Reader route and edition loading.
- Indonesian/English translation switch.
- Audio URL lookup and playback.
- Bookmarks and last-read state.
- Theme persistence.
- Gus AI preview state.
- Loading, error, empty and not-found states.
- Desktop and mobile responsive behavior.

Out of scope for Phase 1:
- AI answer quality/backend.
- User accounts or cloud sync.
- Formal security certification or full standards compliance claim.

## 3. Test types

- Manual functional tests.
- Responsive visual review.
- Browser compatibility checks.
- External API integration checks.
- Accessibility spot checks (keyboard, focus, labels, reduced motion, contrast).
- Production build and typecheck.
- Content integrity sampling against the selected provider/source.

## 4. Test cases

| ID | Scenario | Expected result |
|---|---|---|
| TC-001 | Open `/` with API available | Surah browser loads with provider metadata. |
| TC-002 | Search by surah number | Matching surah remains visible. |
| TC-003 | Search by Latin/Arabic name | Matching items filter without a new request on each keystroke. |
| TC-004 | Filter Makkiyah/Madaniyah | Only surahs with matching provider metadata appear. |
| TC-005 | Open `/surah/1` | Arabic text and selected translation display with verse references. |
| TC-006 | Open `/surah/0` or `/surah/115` | Not-found page is shown. |
| TC-007 | Switch Indonesian to English | Translation changes without leaving the reader. |
| TC-008 | Reload after translation selection | Preference restores in the same browser. |
| TC-009 | Bookmark an ayah | Bookmark state is visible and stored locally. |
| TC-010 | Open `/bookmarks` | Saved ayah appears with a link back to the verse. |
| TC-011 | Remove a bookmark | Item is removed from the stored list and screen. |
| TC-012 | Scroll reader | Last-read position updates to an ayah visible on screen. |
| TC-013 | Play an ayah audio | Audio loads and plays or a useful error is shown. |
| TC-014 | Toggle light/dark | Theme changes consistently and persists after reload. |
| TC-015 | Open Gus AI in Phase 1 | Preview is explicit; input cannot send a fabricated request. |
| TC-016 | Disable network while loading surah list | Friendly error and retry action display. |
| TC-017 | Search for no matching surah | Empty state appears and can be cleared. |
| TC-018 | Test 1440px, 1024px, 768px, 390px, 360px widths | No unintended horizontal overflow; essential controls remain usable. |
| TC-019 | Keyboard-only navigation | Links/controls are reachable and focus is visible. |
| TC-020 | Inspect several source verses/translations | Text, translation, order and surah/ayah references match the chosen source. |

## 5. Release gate

Do not mark the MVP as release-ready until:
- `npm install` completes successfully with the selected lockfile/package manager.
- `npm run typecheck`, `npm run lint`, and `npm run build` pass.
- TC-001 through TC-020 have documented results or explicit, justified exceptions.
- Source terms/attribution have been reviewed.
- The live preview's limitations are documented.
- No secret or placeholder content is exposed in production.

## 6. Test evidence

Record screenshots, dates, browser/version, viewport, result, issue reference, and notes in `docs/05-quality/test-results.md` or the GitHub issue. Do not label tests Passed before they have actually run.
