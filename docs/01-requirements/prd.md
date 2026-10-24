# Product Requirements Document — QuranNusantara

## 1. Scope

This PRD covers Phase 1 reader functionality and identifies Phase 2 Gus AI requirements. Requirements are intentionally small enough for an individual portfolio project.

## 2. Functional requirements

| ID | Requirement | Priority | Acceptance summary |
|---|---|---|---|
| FR-001 | Direct surah browser | Must | Opening `/` shows the surah browser without a marketing page. |
| FR-002 | Surah list | Must | API data is rendered as selectable rows/items with number, Arabic name, familiar name and ayah count when available. |
| FR-003 | Search | Must | User can filter by surah number, Arabic name, Latin name, or translation name present in metadata. |
| FR-004 | Revelation filter | Should | User may filter by Makkiyah/Madaniyah based on source metadata. |
| FR-005 | Reader route | Must | Selecting a surah opens `/surah/[number]`. |
| FR-006 | Arabic display | Must | Arabic text is marked `lang="ar"`, `dir="rtl"`, and readable with diacritics. |
| FR-007 | Translation selection | Must | User can switch between Indonesian and English from the reader toolbar. |
| FR-008 | Audio | Should | User can request and play per-ayah recitation when an audio URL is returned; failures are visible and recoverable. |
| FR-009 | Bookmark | Must | User can save/remove a verse locally. |
| FR-010 | Bookmark page | Must | `/bookmarks` lists stored verses and links back to the verse. |
| FR-011 | Last-read state | Should | The last visible verse/surah is saved locally and offered on the home page. |
| FR-012 | Theme | Must | User can switch light/dark; all screens use the same semantic theme tokens. |
| FR-013 | Responsive layout | Must | Browser, reader, bookmarks and assistant preview adapt without horizontal overflow. |
| FR-014 | Gus AI preview | Must | Header opens a desktop side panel / mobile full-screen panel marked preview and not active. |
| FR-015 | Error states | Must | API failure, no search results, no bookmarks, and invalid route are handled explicitly. |
| FR-016 | Copy/share verse | Should | Where browser permissions permit, a verse can be copied or shared; failure is handled without losing reading state. |

## 3. Nonfunctional requirements

- **Usability:** primary reading flow has few interactions and no required login.
- **Accessibility:** keyboard focus is visible; controls have accessible labels; color is not the only status cue; honor reduced-motion preferences.
- **Content integrity:** do not invent ayat, translation, surah metadata, or source citations.
- **Performance:** cache external Quran content where appropriate; avoid fetching the entire Quran for each verse action.
- **Reliability:** graceful API error state and retry option.
- **Security:** no secrets in browser code or public repository; user input in future AI endpoint must be validated.
- **Maintainability:** TypeScript types and provider adapter isolate external API schema from UI components.
- **Privacy:** bookmark and reading history remain in browser localStorage for MVP; disclose external processing before adding AI.

## 4. User-facing language

- Interface language: Indonesian in Phase 1.
- Translation choices: Indonesian and English.
- Quranic Arabic remains distinct from translations and any future AI-generated content.

## 5. Out of scope

- Authenticated profiles, sync, database, admin, personalized recommendations, or public chat history.
- Any claim that Gus AI provides authoritative tafsir/fatwa.

## 6. Dependencies

- External API endpoint, translation editions, audio availability, terms and attribution.
- Browser localStorage and Web Audio/media playback behavior.
- Vercel hosting quota and policies for deployment.

## 7. Open decisions before public release

1. Verify the selected Indonesian and English translation edition identifiers and their applicable terms.
2. Confirm whether provider attribution text or links must be displayed.
3. Test the API's audio URL response and browser playback behavior.
4. Decide exact source/provenance approach for any Gus AI verse search/retrieval.
