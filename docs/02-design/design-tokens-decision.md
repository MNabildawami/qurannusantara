# Design Token Decision

The Stitch ZIP contains two `DESIGN.md` files with different light palette values. We consolidate them into the root `DESIGN.md` to avoid two competing sources of truth.

Chosen palette is the one most consistent with the export's warm ivory appearance:
- `surface`: `#F7F5EF`
- `primary`: `#145A43`
- `on-surface`: `#252923`
- `on-surface-variant`: `#666D65`
- `outline`: `#E2E1D8`

Selected font families:
- Newsreader for editorial Latin headings.
- Amiri for Arabic Quran text.
- Plus Jakarta Sans for UI controls and Indonesian translation.

The dark palette exists in the root `DESIGN.md` so it can be implemented from the same token system. It was not generated as an additional Stitch screenshot by design to conserve Stitch usage.

Any future change to the design source of truth should update:
1. Root `DESIGN.md`.
2. `src/app/globals.css` token values.
3. `docs/02-design/design-handoff.md` if the approved direction changes.
4. Relevant visual regression screenshots after they have been captured.
