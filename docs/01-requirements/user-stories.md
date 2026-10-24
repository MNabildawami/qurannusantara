# User Stories and Acceptance Criteria

## US-001 — Find a surah

**As a reader,** I want to search by surah name or number so I can open a surah quickly.

Acceptance criteria:
- Search filters the visible list as the user types.
- Search is case-insensitive for Latin text.
- Empty results show a helpful message and a clear way to clear the query.
- Search does not require a network request for every keystroke after metadata has loaded.

## US-002 — Read a surah

**As a reader,** I want Arabic text and a selected translation to appear in a readable layout.

Acceptance criteria:
- The route identifies the selected surah.
- Arabic text is right-aligned and rendered RTL with its source diacritics.
- Translation text is visually distinct from Arabic.
- The UI does not add unverified tafsir, transliteration, or mock quotations.
- Invalid surah route numbers show a not-found state.

## US-003 — Switch translation

**As a reader,** I want to change between Indonesian and English translations without leaving the reader.

Acceptance criteria:
- Indonesian is the default.
- English can be selected in the same toolbar.
- Only one translation is shown at a time in the MVP.
- Selection is stored locally and restored on a later visit in the same browser.
- Content comes from the configured edition source.

## US-004 — Save a verse

**As a reader,** I want to bookmark an ayah and revisit it later.

Acceptance criteria:
- Bookmark action has a clear selected/unselected state.
- Saving creates a stable key from surah number and ayah number.
- The saved page displays reference, Arabic text, saved Indonesian translation and a link back to the ayah.
- Removing a bookmark removes it from localStorage and from the page.
- The interface explains that bookmarks are local to this browser.

## US-005 — Continue reading

**As a returning reader,** I want the home page to offer the last surah/ayah I viewed.

Acceptance criteria:
- Latest reading location is stored locally.
- The home page does not show a fabricated Continue Reading item when no saved history exists.
- Clicking the item opens the surah and targets the stored ayah when possible.

## US-006 — Listen to recitation

**As a reader,** I want to play an ayah's recitation when audio is available.

Acceptance criteria:
- Audio URL is obtained from the configured source adapter.
- Loading, playing, paused, ended, and failed states are handled.
- Audio failure does not block reading.

## US-007 — Change theme

**As a reader,** I want to choose light or dark mode.

Acceptance criteria:
- A compact theme control is available from the header.
- All application screens use semantic color tokens.
- The chosen theme persists in the same browser.
- Both themes retain visible focus states and readable text.

## US-008 — Preview Gus AI

**As a reader,** I want to understand the planned assistant without being misled about its availability.

Acceptance criteria:
- Gus AI can be opened from the header.
- Desktop uses a side panel; mobile uses a full-screen view.
- Preview/unavailable state is explicit.
- Message input and send control do not imply a functioning model during Phase 1.
- No fabricated answer or religious-source claim is displayed as real.
