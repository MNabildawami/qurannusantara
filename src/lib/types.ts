export type RevelationType = "Meccan" | "Medinan" | string;

export interface SurahSummary {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  numberOfAyahs: number;
  revelationType: RevelationType;
}

export interface QuranAyah {
  number: number;
  numberInSurah: number;
  text: string;
  audio?: string;
  audioSecondary?: string[];
}

export interface SurahEdition {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  numberOfAyahs: number;
  revelationType: RevelationType;
  ayahs: QuranAyah[];
}

export interface SurahContent {
  arabic: SurahEdition;
  indonesian: SurahEdition;
  english: SurahEdition;
  /** Transliterasi Latin, jika edisi API tersedia. */
  transliteration?: SurahEdition;
}

export interface StoredBookmark {
  id: string;
  surahNumber: number;
  surahName: string;
  ayahNumber: number;
  arabicText: string;
  indonesianText: string;
  createdAt: string;
}

export interface LastRead {
  surahNumber: number;
  surahName: string;
  ayahNumber: number;
  updatedAt: string;
}

export type ApiEnvelope<T> = {
  code: number;
  status: string;
  data: T;
};
