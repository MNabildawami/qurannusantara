# QuranNusantara — Design System (Source of Truth)

Status: Baseline v1.0, desktop light-mode design approved for implementation. Dark-mode and responsive tokens are defined here for implementation, even though Stitch generated only desktop light-mode screens.

The original export includes two different `DESIGN.md` files. This file consolidates the selected palette and typography so implementation has one source of truth. Review `docs/02-design/design-handoff.md` for the reconciliation notes.

## Design principles

- Reading-first: the root route opens the surah browser directly; no marketing landing page.
- Editorial, calm, restrained, and content-first.
- Whitespace and typography establish hierarchy; decorative effects do not.
- Avoid generic dashboard cards, excessive rounded corners, gradients, glassmorphism, and fabricated metrics.
- Arabic Quran text is a distinct, RTL content block; translation is clearly separate.
- All UI features must be represented honestly. Preview UI is not evidence that its backend works.

## Color tokens — light

| Token | Value | Use |
|---|---|---|
| `--surface` | `#F7F5EF` | Page canvas |
| `--surface-dim` | `#ECEAE2` | Scrim and muted background |
| `--surface-raised` | `#FFFFFF` | Reading rows, controls, panel surface |
| `--surface-soft` | `#EEEEE6` | Subtle controls and hover surfaces |
| `--surface-selected` | `#E3EDE8` | Selected/active surface |
| `--text` | `#252923` | Main text |
| `--text-muted` | `#666D65` | Metadata and supporting text |
| `--primary` | `#145A43` | Primary action and active accents |
| `--primary-hover` | `#0D4935` | Hover state |
| `--on-primary` | `#FFFFFF` | Text on primary button |
| `--border` | `#E2E1D8` | Hairline borders |
| `--border-strong` | `#D4D3C9` | Stronger control borders |
| `--error` | `#A52828` | Error text |
| `--success` | `#28694B` | Success text |

## Color tokens — dark

| Token | Value | Use |
|---|---|---|
| `--surface` | `#151A17` | Page canvas |
| `--surface-dim` | `#111513` | Scrim and deepest surface |
| `--surface-raised` | `#1D241F` | Raised surfaces |
| `--surface-soft` | `#252D28` | Controls and hover surfaces |
| `--surface-selected` | `#1E3B2C` | Selected/active surface |
| `--text` | `#F0F1E9` | Main text |
| `--text-muted` | `#B2BBB3` | Metadata and supporting text |
| `--primary` | `#83B79A` | Primary accent |
| `--primary-hover` | `#A6D8BC` | Hover state |
| `--on-primary` | `#0D3321` | Text on primary button |
| `--border` | `#343D36` | Hairline borders |
| `--border-strong` | `#465149` | Stronger control borders |
| `--error` | `#FFB4AB` | Error text |
| `--success` | `#83D4A6` | Success text |

Dark mode should adapt surface relationships intentionally, not merely invert colors. Verify contrast during QA; do not claim WCAG conformance without testing.

## Typography

| Role | Font stack | Initial guideline |
|---|---|---|
| Editorial headings | Newsreader, Georgia, serif | 31–42px page title; medium or regular weight |
| Quranic Arabic | Amiri, Traditional Arabic, serif | 29–34px desktop; line-height around 2.2 |
| UI and Indonesian translation | Plus Jakarta Sans, system sans-serif | 14–16px; body line-height 1.7–1.85 |
| English translation | Newsreader, Georgia, serif | 16–18px; body line-height around 1.8 |
| Metadata | Plus Jakarta Sans | 9–11px, muted, restrained letter spacing |

Use `dir="rtl"` and `lang="ar"` for Arabic text. Do not place transliteration by default in the MVP.

## Layout and spacing

- Utility header: approximately 64px desktop; compact on mobile.
- Page gutters: approximately 28px desktop; 16px mobile.
- Reader measure: maximum width approximately 900px, with a narrower visual reading column when appropriate.
- Compact radius: 4px; standard radius: 6px; panel radius: 8px.
- Borders should be subtle and shadows rare.
- Surah browser follows the current Stitch reference grid on desktop; CSS may adapt it to two and then one column on smaller viewports without generating extra Stitch designs.
- Gus AI is a right-side desktop panel and full-screen mobile experience.

## Interaction rules

- The theme toggle is available from the first implementation.
- Indonesian translation is the default; English is selectable from the reader toolbar.
- Search and choosing a surah should require minimal steps.
- Bookmark and reading history are local-browser features in the MVP; do not imply account sync.
- Gus AI is explicitly marked as preview/unavailable until its backend exists.
- Keyboard focus must remain visible; support reduced motion.
