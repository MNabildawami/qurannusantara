# Integration Note — AlQuran Cloud API

## Status

Initial adapter implemented at `src/lib/quran-api.ts`. Exact edition identifiers, terms, attribution, and API behavior remain release validation items. Do not treat this note as a substitute for reviewing the provider's current documentation and terms.

## Reference

- Official API documentation: https://alquran.cloud/api
- API base used by the starter: `https://api.alquran.cloud/v1`

## Operations used by the starter

| Purpose | Request shape | Used by |
|---|---|---|
| Surah list | `GET /surah` | Home browser |
| Surah Arabic + translations | `GET /surah/{number}/editions/{edition1,edition2,edition3}` | Reader |
| One ayah with audio edition | `GET /ayah/{globalAyahNumber}/ar.alafasy` | Audio lookup route |

The exact route and response shape should be confirmed against the current API reference during local integration tests.

## Edition identifiers configured by default

- Arabic text: `quran-uthmani`
- Indonesian translation: `id.indonesian`
- English translation: `en.sahih` (Saheeh International)

These are initial candidate identifiers, not a claim that every available endpoint currently supports every selection. The `.env.example` values can be adjusted once verified against the provider's edition catalogue.

## Adapter boundaries

Only `src/lib/quran-api.ts` should know the base URL, edition identifiers, upstream envelope shape, and audio lookup URL. UI components should consume typed `SurahSummary`, `SurahContent`, and `QuranAyah` values rather than building upstream request URLs themselves.

## Data mapping

Surah list fields used:
- `number`
- `name` (Arabic)
- `englishName`
- `englishNameTranslation`
- `numberOfAyahs`
- `revelationType`

Reader fields used:
- Arabic `ayahs[].text` and `ayahs[].numberInSurah`
- Global `ayahs[].number` for audio resolution
- Indonesian and English translation text aligned to the same verse index

If a response is missing fields, empty, or no longer aligned across editions, fail gracefully and do not invent data.

## Caching and failure policy

- Surah and reader fetches currently use Next.js fetch revalidation (24 hours) because content editions are not expected to change per request.
- The audio lookup is requested only after the user activates play, and the route returns a cacheable URL response.
- If the upstream service returns an error, display a friendly fallback and retry path.
- Do not repeatedly request audio URLs for all ayat at page render.

## Content integrity and source checks

Before public release:
1. Confirm the exact edition identifiers and languages with the edition catalogue.
2. Record the translation edition's public name and translator/source metadata where provided.
3. Review the provider's current terms, attribution and redistribution conditions.
4. Verify samples including Al-Fatihah, a longer surah, surah with basmalah conventions, and a medinan surah.
5. Verify audio and playback in current Chrome/Firefox/Edge/Safari.
6. Document source data date and any relevant content limitations.

## Error cases to test

- Network offline / DNS error.
- Provider returns non-2xx status.
- Provider returns a non-200 API code.
- Unknown edition identifier.
- Missing translation ayah in one edition.
- Audio URL missing or inaccessible.
- Rate limiting or upstream temporary failure.

## Future source alternative

Quran Foundation provides content APIs for chapters, verses, translations, tafsir, audio and more, plus separate search and user APIs. Its current documentation says Content and Search API calls use app credentials from the backend (or the server client); User APIs use OAuth2 sessions. It may be revisited if the MVP needs deeper content metadata/search. See https://api-docs.quran.com/docs/api-reference/.
