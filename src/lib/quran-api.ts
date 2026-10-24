import type { ApiEnvelope, QuranAyah, SurahContent, SurahEdition, SurahSummary } from "@/lib/types";

const DEFAULT_API_BASE_URL = "https://api.alquran.cloud/v1";

function apiBaseUrl(): string {
  return (process.env.QURAN_API_BASE_URL || DEFAULT_API_BASE_URL).replace(/\/$/, "");
}

function configuredEdition(variable: string, fallback: string): string {
  return process.env[variable]?.trim() || fallback;
}

async function readApiJson<T>(url: string, revalidateSeconds = 3600): Promise<T> {
  const response = await fetch(url, {
    next: { revalidate: revalidateSeconds },
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    throw new Error(`Quran API returned HTTP ${response.status}`);
  }

  const payload = (await response.json()) as ApiEnvelope<T>;
  if (payload.code !== 200 || payload.data === undefined || payload.data === null) {
    throw new Error(`Quran API returned an unexpected response: ${payload.status || "unknown status"}`);
  }

  return payload.data;
}

export async function getSurahs(): Promise<SurahSummary[]> {
  const surahs = await readApiJson<SurahSummary[]>(`${apiBaseUrl()}/surah`, 86400);
  if (!Array.isArray(surahs) || surahs.length !== 114) {
    throw new Error("Quran API returned an unexpected surah list.");
  }
  return surahs;
}

export async function getSurahContent(number: number): Promise<SurahContent> {
  const arabicEdition = configuredEdition("QURAN_ARABIC_EDITION", "quran-uthmani");
  const indonesianEdition = configuredEdition("QURAN_TRANSLATION_ID_EDITION", "id.indonesian");
  const englishEdition = configuredEdition("QURAN_TRANSLATION_EN_EDITION", "en.sahih");
  const editions = [arabicEdition, indonesianEdition, englishEdition].join(",");
  const data = await readApiJson<SurahEdition[]>(`${apiBaseUrl()}/surah/${number}/editions/${editions}`, 86400);

  if (!Array.isArray(data) || data.length !== 3) {
    throw new Error("Quran API did not return the three requested editions.");
  }

  const [arabic, indonesian, english] = data;
  if (!arabic.ayahs?.length || !indonesian.ayahs?.length || !english.ayahs?.length) {
    throw new Error("Quran API returned an empty surah edition.");
  }
  if (
    arabic.ayahs.length !== indonesian.ayahs.length ||
    arabic.ayahs.length !== english.ayahs.length ||
    arabic.numberOfAyahs !== indonesian.numberOfAyahs ||
    arabic.numberOfAyahs !== english.numberOfAyahs
  ) {
    throw new Error("The requested Quran editions do not align by ayah count.");
  }

  return { arabic, indonesian, english };
}

export async function getAyahAudioUrl(globalAyahNumber: number): Promise<string> {
  const edition = "ar.alafasy";
  const data = await readApiJson<QuranAyah & { audio?: string }>(
    `${apiBaseUrl()}/ayah/${globalAyahNumber}/${edition}`,
    86400,
  );

  if (!data.audio || !data.audio.startsWith("https://")) {
    throw new Error("Audio is not available for this verse.");
  }

  return data.audio;
}
