---
name: Quran Nusantara Editorial
colors:
  surface: '#F7F5EF'
  surface-dim: '#ECEAE2'
  surface-bright: '#FAF9F5'
  surface-container-lowest: '#FFFFFF'
  surface-container-low: '#F4F2EC'
  surface-container: '#EEEEE6'
  surface-container-high: '#E8E7DE'
  surface-container-highest: '#E2E1D8'
  on-surface: '#252923'
  on-surface-variant: '#666D65'
  outline: '#E2E1D8'
  outline-variant: '#D4D3C9'
  primary: '#145A43'
  on-primary: '#FFFFFF'
  primary-container: '#E3EDE8'
  on-primary-container: '#0D3D2D'
  secondary: '#3D5447'
  on-secondary: '#FFFFFF'
  muted: '#666D65'
  inverse-surface: '#2e312f'
  inverse-on-surface: '#eff1ed'
  surface-tint: '#286a51'
  inverse-primary: '#92d4b7'
  secondary-container: '#cfe9d7'
  on-secondary-container: '#526a5c'
  tertiary: '#5e2824'
  on-tertiary: '#ffffff'
  tertiary-container: '#7a3e39'
  on-tertiary-container: '#feada5'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#aef1d2'
  primary-fixed-dim: '#92d4b7'
  on-primary-fixed: '#002115'
  on-primary-fixed-variant: '#04513b'
  secondary-fixed: '#cfe9d7'
  secondary-fixed-dim: '#b3cdbc'
  on-secondary-fixed: '#092015'
  on-secondary-fixed-variant: '#354c3f'
  tertiary-fixed: '#ffdad6'
  tertiary-fixed-dim: '#ffb3ac'
  on-tertiary-fixed: '#390b0a'
  on-tertiary-fixed-variant: '#6f3631'
  background: '#f8faf6'
  on-background: '#191c1a'
  surface-variant: '#e1e3df'
typography:
  fontFamily:
    serif: Newsreader, Georgia, serif
    sans: Plus Jakarta Sans, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
      sans-serif
    arabic: Amiri, "Traditional Arabic", serif
  display-lg:
    fontFamily: Newsreader
    fontSize: 48px
    fontWeight: '400'
    lineHeight: 56px
  display-lg-mobile:
    fontFamily: Newsreader
    fontSize: 36px
    fontWeight: '400'
    lineHeight: 44px
  headline-lg:
    fontFamily: Newsreader
    fontSize: 32px
    fontWeight: '500'
    lineHeight: 40px
  headline-md:
    fontFamily: Newsreader
    fontSize: 26px
    fontWeight: '500'
    lineHeight: 34px
  headline-sm:
    fontFamily: Newsreader
    fontSize: 22px
    fontWeight: '500'
    lineHeight: 30px
  quran-arabic-lg:
    fontFamily: Amiri, "Traditional Arabic", serif
    fontSize: 34px
    fontWeight: '400'
    lineHeight: 84px
  quran-arabic-md:
    fontFamily: Amiri, "Traditional Arabic", serif
    fontSize: 28px
    fontWeight: '400'
    lineHeight: 70px
  body-lg:
    fontFamily: Newsreader
    fontSize: 19px
    fontWeight: '400'
    lineHeight: 32px
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 26px
  body-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 22px
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 13px
    fontWeight: '500'
    lineHeight: 18px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.04em
dark:
  colors:
    surface: '#151A17'
    surface-dim: '#111513'
    surface-bright: '#1B211D'
    surface-container-lowest: '#0E1210'
    surface-container-low: '#19201C'
    surface-container: '#1D241F'
    surface-container-high: '#252D28'
    surface-container-highest: '#2D3731'
    on-surface: '#F0F1E9'
    on-surface-variant: '#B2BBB3'
    outline: '#343D36'
    outline-variant: '#2A332C'
    primary: '#83B79A'
    on-primary: '#0D3321'
    primary-container: '#1E3B2C'
    on-primary-container: '#A6D8BC'
    secondary: '#A2B3A7'
    on-secondary: '#1A251E'
    muted: '#8E998F'
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  gutter: 1.5rem
  gutter-mobile: 1rem
  margin: 3rem
  margin-mobile: 1.25rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

# QuranNusantara Editorial Design System

A minimalist editorial, content-first design system for a serene and focused Quran reading experience.

## Foundations
- **Light Theme Background:** `#F7F5EF` — warm paper / mushaf parchment texture that eliminates eye strain.
- **Main Text:** `#252923` — deep olive-charcoal with WCAG AAA readability.
- **Primary Accent:** `#145A43` — restrained emerald tone used sparingly for active states and primary reading cues.
- **Secondary Surfaces & Borders:** `#EEEEE6` surface container, `#E2E1D8` hairline borders.
- **Muted Metadata:** `#666D65` for verse numbers, translation labels, and revelation metadata.

## Typography
- **Headings & Editorial Titles:** `Newsreader` (optical size auto, serif editorial weight).
- **Quranic Arabic Text:** `Amiri` with generous line-height (`2.2` to `2.6`), crisp right-to-left alignment, and authentic Tashkeel harakat rendering.
- **UI & Reading Controls:** `Plus Jakarta Sans` for clean, neutral, highly legible microcopy.