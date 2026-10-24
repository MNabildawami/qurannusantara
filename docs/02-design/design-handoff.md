# Design Handoff — QuranNusantara

## Design source

The source of visual intent is the latest Stitch export in `design-reference/stitch-export/stitch_qurannusantara_ui_design/`:

- `qurannusantara_daftar_surah_desktop_light/screen.png`
- `qurannusantara_pembaca_surah_desktop_light/screen.png`
- `qurannusantara_gus_ai_panel_samping_desktop_preview/screen.png`

Each screen directory also contains the original Stitch-generated `code.html`. These files are references, not production Next.js components. They use Tailwind CDN and contain design/mock content that must not be assumed to be real API data.

## Approved direction

- Product: QuranNusantara.
- One generated design variant for now: desktop light mode.
- Visual language: minimalist editorial, warm ivory, emerald accent, restrained borders.
- Fonts: Newsreader (editorial Latin), Amiri (Arabic Quranic text), Plus Jakarta Sans (UI).
- No marketing landing page: `/` opens the surah browser.
- Reader is content-first, with a centered reading area.
- Translation default: Indonesian; alternative: English.
- Gus AI: desktop side panel, clearly marked as preview until Phase 2.
- Dark mode and mobile are implemented by extending design tokens and responsive CSS, rather than asking Stitch to produce additional variants.

## Token reconciliation

The archive contains two `DESIGN.md` files with conflicting light palettes and typography. The root `DESIGN.md` consolidates the palette most directly consistent with the initial editorial reference:

- Surface: `#F7F5EF`
- Main text: `#252923`
- Muted text: `#666D65`
- Emerald: `#145A43`
- Border: `#E2E1D8`

The second exported file uses `#f7fbf1` for the surface and `#00412e` for primary. Those values are not used as the implementation source of truth. Keep `DESIGN.md` at the repository root as the single authoritative design-token file.

## Visual/content debt to avoid carrying forward

The visual prototype includes some decorative or placeholder content that cannot be accepted as real product data without verification. During implementation:

- Do not add fake user/profile/avatar state; the MVP has no login.
- Do not invent a previous reading timestamp or bookmark count.
- Do not show unverified tafsir excerpts, theological annotations, or claims about particular tafsir sources.
- Do not fabricate the surah's Indonesian title or metadata. Use provider fields and verified sources.
- Avoid duplicate Bismillah presentation. Render the selected edition's numbered ayat consistently and do not add an extra copy without a verified content rule.
- Only show translation/edition details that are actually used by the API adapter.
- Keep Gus AI explicitly inactive in Phase 1.

## Layout implementation notes

The current screenshot uses a compact three-column surah-item grid at desktop. The implementation may use three columns on wide desktop, two on intermediate widths, and one on mobile. Preserve row-based scanning, subtle surfaces, and low visual density. Do not expand into an analytics dashboard or marketing page.

The reader uses a centered content column. Secondary controls should remain compact. Translation selection is `Indonesia` / `English`; it is not an interface-language switch.

## Acceptance checklist

- [ ] Home opens directly to the surah browser.
- [ ] Reader is centered and Arabic text is comfortably spaced.
- [ ] Arabic, translation, and future AI explanation are visually distinct.
- [ ] No fictional data is rendered as actual history, attribution, or commentary.
- [ ] Indonesia/English selector works.
- [ ] Gus AI preview is clearly nonfunctional until Phase 2.
- [ ] CSS tokens exactly match the root `DESIGN.md`.
- [ ] Responsive and dark themes derive from the same semantic tokens.
