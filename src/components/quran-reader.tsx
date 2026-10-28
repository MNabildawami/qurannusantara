"use client";

import Link from "next/link";

import {

  Bookmark,

  BookmarkCheck,

  ChevronLeft,

  ChevronRight,

  Copy,

  Share2,

  Type,

  Play,

  Pause,

  Square,

  LoaderCircle,

  X,

  RotateCcw,
  BookOpenText,

} from "lucide-react";

import {

  type ReactNode,


  useEffect,

  useMemo,

  useRef,

  useState,

} from "react";

import {

  beginAudioSession,

  fetchAyahAudioUrl,

  finishAudioSession,

  getAudioPlaybackState,

  isAudioSessionCurrent,

  pauseActiveAudio,

  resumeActiveAudio,

  setActiveAudio,

  stopAudioPlayback,

  subscribeAudioPlayback,

  updateAudioPlayback,

} from "@/lib/audio-playback";

import {

  readBookmarks,

  TRANSLATION_STORAGE_KEY,

  writeBookmarks,

  writeLastRead,

} from "@/lib/bookmarks";

import type {

  StoredBookmark,

  SurahContent,

} from "@/lib/types";

import {
  getSurahDisplayName,
  getSurahSlug,
  normalizeSurahNameLanguage,
  SURAH_NAME_LANGUAGE_EVENT,
  SURAH_NAME_LANGUAGE_STORAGE_KEY,
  type SurahNameLanguage,
} from "@/lib/surah-names";

function toArabicIndicNumber(value: number): string {
  const digits = "٠١٢٣٤٥٦٧٨٩";
  return String(value).replace(/\d/g, (digit) => digits[Number(digit)]);
}

function stripMarkup(value: string): string {
  return value.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ");
}

function renderTajweedMarkup(markup: string): ReactNode[] {
  const pattern = /<tajweed\s+class=["']?([\w-]+)["']?>([\s\S]*?)<\/tajweed>|<span\s+class=["']?end["']?>([\s\S]*?)<\/span>/gi;
  const parts: ReactNode[] = [];
  let cursor = 0;
  let match: RegExpExecArray | null;
  let index = 0;

  while ((match = pattern.exec(markup)) !== null) {
    if (match.index > cursor) {
      parts.push(stripMarkup(markup.slice(cursor, match.index)));
    }

    if (match[1]) {
      const rule = match[1].toLowerCase().replace(/[^a-z0-9_-]/g, "");
      parts.push(
        <span className={`tajweed-mark tajweed-${rule}`} key={`tajweed-${index++}`}>
          {stripMarkup(match[2])}
        </span>,
      );
    } else {
      // The reader adds one consistent ayah-number marker after the Arabic text.
      index += 1;
    }
    cursor = pattern.lastIndex;
  }

  if (cursor < markup.length) {
    parts.push(stripMarkup(markup.slice(cursor)));
  }

  return parts;
}

export function QuranReader({

  content,

}: {

  content: SurahContent;

}) {

  const { arabic, indonesian, english, transliteration } = content;

  const [translationLanguage, setTranslationLanguage] =

    useState<"id" | "en">("id");

  const [bookmarks, setBookmarks] =

    useState<StoredBookmark[]>([]);

  const [fontScale, setFontScale] = useState(1);

  const [notice, setNotice] = useState<string | null>(null);

  const [surahNameLanguage, setSurahNameLanguage] =
    useState<SurahNameLanguage>("id");
  const [tajweedEnabled, setTajweedEnabled] = useState(true);
  const [tajweedByAyah, setTajweedByAyah] =
    useState<Record<string, string>>({});
  const [tajweedLoadFailed, setTajweedLoadFailed] = useState(false);

  const [playback, setPlayback] = useState(

    getAudioPlaybackState,

  );

  const [endOfSurahOpen, setEndOfSurahOpen] = useState(false);
  const [selectedAyahNumber, setSelectedAyahNumber] = useState(1);

  const surahSessionRef = useRef<number | null>(null);

  const lastScrolledAyahRef = useRef<number | null>(null);

  const noticeTimeoutRef = useRef<ReturnType<

    typeof setTimeout

  > | null>(null);

  useEffect(() => {
    const syncDisplayLanguage = () => {
      const savedTranslation = window.localStorage.getItem(TRANSLATION_STORAGE_KEY);
      const savedNameLanguage = window.localStorage.getItem(SURAH_NAME_LANGUAGE_STORAGE_KEY);
      const next = savedTranslation === "id" || savedTranslation === "en"
        ? savedTranslation
        : normalizeSurahNameLanguage(savedNameLanguage);
      setTranslationLanguage(next);
      setSurahNameLanguage(next);
    };

    queueMicrotask(() => {
      setBookmarks(readBookmarks());
      syncDisplayLanguage();
    });
    window.addEventListener(SURAH_NAME_LANGUAGE_EVENT, syncDisplayLanguage);
    window.addEventListener("storage", syncDisplayLanguage);
    return () => {
      window.removeEventListener(SURAH_NAME_LANGUAGE_EVENT, syncDisplayLanguage);
      window.removeEventListener("storage", syncDisplayLanguage);
    };
  }, []);

  // Sinkronisasi semua kontrol audio.

  useEffect(() => {

    const syncPlayback = () => {

      setPlayback(getAudioPlaybackState());

    };

    syncPlayback();

    return subscribeAudioPlayback(syncPlayback);

  }, []);

  useEffect(() => {
    const controller = new AbortController();

    async function loadTajweed() {
      try {
        const response = await fetch(`/api/tajweed/${arabic.number}`, {
          signal: controller.signal,
        });
        if (!response.ok) throw new Error("Data tajwid tidak tersedia.");

        const payload = (await response.json()) as {
          verses?: { verse_key: string; text_uthmani_tajweed: string }[];
        };
        const next: Record<string, string> = {};
        for (const verse of payload.verses ?? []) {
          if (verse.verse_key && verse.text_uthmani_tajweed) {
            next[verse.verse_key] = verse.text_uthmani_tajweed;
          }
        }
        if (Object.keys(next).length === 0) throw new Error("Penanda tajwid kosong.");
        setTajweedLoadFailed(false);
        setTajweedByAyah(next);
      } catch {
        if (!controller.signal.aborted) setTajweedLoadFailed(true);
      }
    }

    void loadTajweed();
    return () => controller.abort();
  }, [arabic.number]);

  const selectedTranslation =
    translationLanguage === "id" ? indonesian : english;

  const ayahPairs = useMemo(

    () =>

      arabic.ayahs.map((ayah, index) => ({

        arabicAyah: ayah,

        translatedAyah: selectedTranslation.ayahs[index],

        indonesianAyah: indonesian.ayahs[index],

        transliteratedAyah: transliteration?.ayahs[index],

      })),

    [

      arabic.ayahs,

      indonesian.ayahs,

      selectedTranslation.ayahs,

      transliteration?.ayahs,

    ],

  );

  const isSurahMode = playback.mode === "surah";

  const currentAyah =
    playback.mode === "surah"
      ? playback.localAyahNumber ?? 0
      : playback.mode === "single"
        ? arabic.ayahs.find(
            (ayah) => ayah.number === playback.globalAyahNumber,
          )?.numberInSurah ?? playback.localAyahNumber ?? 0
        : 0;

  // Perbarui riwayat bacaan dan ikuti ayat aktif.

  useEffect(() => {

    if (!isSurahMode || !currentAyah) return;

    writeLastRead({

      surahNumber: arabic.number,

      surahName: arabic.englishName,

      ayahNumber: currentAyah,

      updatedAt: new Date().toISOString(),

    });

    if (lastScrolledAyahRef.current === currentAyah) {

      return;

    }

    lastScrolledAyahRef.current = currentAyah;

    const target = document.getElementById(

      `ayah-${currentAyah}`,

    );

    target?.scrollIntoView({

      behavior: "smooth",

      block: "center",

    });

  }, [

    isSurahMode,

    currentAyah,

    arabic.number,

    arabic.englishName,

  ]);

  // Simpan riwayat bacaan ketika membuka halaman surah.

  useEffect(() => {

    if (!arabic.ayahs.length) return;

    const updateLastRead = (ayahNumber: number) => {

      writeLastRead({

        surahNumber: arabic.number,

        surahName: arabic.englishName,

        ayahNumber,

        updatedAt: new Date().toISOString(),

      });

    };

    const hashMatch = window.location.hash.match(/^#ayah-(\d+)$/);

    if (hashMatch) {

      const number = Number(hashMatch[1]);

      document

        .getElementById(`ayah-${number}`)

        ?.scrollIntoView({ block: "start" });

      updateLastRead(number);

    } else {

      updateLastRead(1);

    }

    const elements = Array.from(

      document.querySelectorAll<HTMLElement>(

        "[data-ayah-number]",

      ),

    );

    if (typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(

      (entries) => {

        // Jangan biarkan posisi scroll menimpa riwayat ayat

        // yang sedang diputar.

        if (getAudioPlaybackState().mode === "surah") return;

        const visible = entries

          .filter((entry) => entry.isIntersecting)

          .sort(

            (a, b) => b.intersectionRatio - a.intersectionRatio,

          )[0];

        if (visible) {

          updateLastRead(

            Number(

              (visible.target as HTMLElement).dataset.ayahNumber,

            ),

          );

        }

      },

      { threshold: [0.25, 0.5, 0.75] },

    );

    elements.forEach((element) => observer.observe(element));

    return () => observer.disconnect();

  }, [

    arabic.ayahs,

    arabic.englishName,

    arabic.number,

  ]);

  // Hentikan audio ketika halaman surah ditutup.

  useEffect(() => {

    return () => {

      if (noticeTimeoutRef.current) {

        clearTimeout(noticeTimeoutRef.current);

      }

      stopAudioPlayback();

    };

  }, []);

  function showNotice(message: string) {

    setNotice(message);

    if (noticeTimeoutRef.current) {

      clearTimeout(noticeTimeoutRef.current);

    }

    noticeTimeoutRef.current = setTimeout(() => {

      setNotice(null);

    }, 2500);

  }

  function updateDisplayLanguage(value: string) {
    const next = normalizeSurahNameLanguage(value);
    setTranslationLanguage(next);
    setSurahNameLanguage(next);
    window.localStorage.setItem(TRANSLATION_STORAGE_KEY, next);
    window.localStorage.setItem(SURAH_NAME_LANGUAGE_STORAGE_KEY, next);
    window.dispatchEvent(new Event(SURAH_NAME_LANGUAGE_EVENT));
  }

  function toggleBookmark(

    ayahNumber: number,

    arabicText: string,

    indonesianText: string,

  ) {

    const id = `${arabic.number}:${ayahNumber}`;

    const exists = bookmarks.some(

      (bookmark) => bookmark.id === id,

    );

    const next = exists

      ? bookmarks.filter((bookmark) => bookmark.id !== id)

      : [

          ...bookmarks,

          {

            id,

            surahNumber: arabic.number,

            surahName: arabic.englishName,

            ayahNumber,

            arabicText,

            indonesianText,

            createdAt: new Date().toISOString(),

          },

        ];

    setBookmarks(next);

    writeBookmarks(next);

    showNotice(

      exists ? "Bookmark dihapus." : "Ayat disimpan.",

    );

  }

  async function copyText(text: string) {

    try {

      await navigator.clipboard.writeText(text);

      showNotice("Teks ayat disalin.");

    } catch {

      showNotice(

        "Browser tidak mengizinkan penyalinan otomatis.",

      );

    }

  }

  async function shareAyah(

    ayahNumber: number,

    translation: string,

  ) {

    const displaySurahName = getSurahDisplayName(arabic.number, arabic.englishName, surahNameLanguage);
    const shareText = `${displaySurahName} ${ayahNumber}

${translation}

QuranNusantara`;

    if (navigator.share) {

      try {

        await navigator.share({

          title: `${displaySurahName} ${ayahNumber}`,

          text: shareText,

          url: `${window.location.origin}/surah/${getSurahSlug(arabic.number)}#ayah-${ayahNumber}`,

        });

      } catch {

        // Pembatalan berbagi oleh pengguna bukan kesalahan.

      }

    } else {

      await copyText(shareText);

    }

  }

  async function playSurahAyah(index: number, sessionId: number) {

      if (!isAudioSessionCurrent(sessionId)) return;

      // Surah selesai.

      if (index >= arabic.ayahs.length) {
        finishAudioSession(sessionId);
        surahSessionRef.current = null;
        lastScrolledAyahRef.current = null;
        setSelectedAyahNumber(1);
        setEndOfSurahOpen(true);
        return;
      }

      const ayah = arabic.ayahs[index];

      const localAyahNumber = ayah.numberInSurah;

      updateAudioPlayback(sessionId, {

        mode: "surah",

        status: "loading",

        globalAyahNumber: ayah.number,

        surahNumber: arabic.number,

        localAyahNumber,

        totalAyahs: arabic.ayahs.length,

      });

      try {

        const url = await fetchAyahAudioUrl(ayah.number);

        // Abaikan respons lama apabila pengguna sudah

        // mengganti audio atau menghentikan pemutaran.

        if (!isAudioSessionCurrent(sessionId)) return;

        const audio = new Audio(url);

        const registered = setActiveAudio(audio, sessionId, {

          globalAyahNumber: ayah.number,

          surahNumber: arabic.number,

          localAyahNumber,

          totalAyahs: arabic.ayahs.length,

        });

        if (!registered) return;

        audio.addEventListener(

          "ended",

          () => {

            if (!isAudioSessionCurrent(sessionId)) return;

            void playSurahAyah(index + 1, sessionId);

          },

          { once: true },

        );

        audio.addEventListener(

          "error",

          () => {

            if (!isAudioSessionCurrent(sessionId)) return;

            finishAudioSession(sessionId);

            surahSessionRef.current = null;

            showNotice(

              `Audio ayat ${localAyahNumber} gagal dimuat.`,

            );

          },

          { once: true },

        );

        await audio.play();

        if (!isAudioSessionCurrent(sessionId)) {

          audio.pause();

          return;

        }

        updateAudioPlayback(sessionId, {

          status: "playing",

        });

      } catch {

        if (!isAudioSessionCurrent(sessionId)) return;

        finishAudioSession(sessionId);

        surahSessionRef.current = null;

        showNotice(

          `Audio ayat ${localAyahNumber} gagal diputar. Periksa koneksi internet.`,

        );

      }

  }

  async function handleAyahPlayPause(index: number) {
    const ayah = arabic.ayahs[index];
    if (!ayah) return;

    const current = getAudioPlaybackState();
    const isSameAyah = current.mode !== null && current.globalAyahNumber === ayah.number;

    if (isSameAyah && current.status === "playing") {
      pauseActiveAudio();
      return;
    }

    if (isSameAyah && current.status === "paused") {
      try {
        await resumeActiveAudio();
      } catch {
        showNotice("Audio gagal dilanjutkan.");
      }
      return;
    }

    if (isSameAyah && current.status === "loading") return;

    const sessionId = beginAudioSession("surah", {
      surahNumber: arabic.number,
      localAyahNumber: ayah.numberInSurah,
      globalAyahNumber: ayah.number,
      totalAyahs: arabic.ayahs.length,
    });

    setEndOfSurahOpen(false);
    surahSessionRef.current = sessionId;
    lastScrolledAyahRef.current = null;
    void playSurahAyah(index, sessionId);
  }

  function handleStopAudio() {
    stopAudioPlayback();
    surahSessionRef.current = null;
    lastScrolledAyahRef.current = null;
    setEndOfSurahOpen(false);
    showNotice("Pemutaran audio dihentikan.");
  }

  function handleRepeatFromBeginning() {
    setEndOfSurahOpen(false);
    void handleAyahPlayPause(0);
  }

  function handlePlaySelectedAyah() {
    const index = arabic.ayahs.findIndex(
      (ayah) => ayah.numberInSurah === selectedAyahNumber,
    );
    setEndOfSurahOpen(false);
    void handleAyahPlayPause(index >= 0 ? index : 0);
  }

  return (

    <div className="reader-layout">
      <article className="reader-page">

        <div className="reader-toolbar">

          <div className="reader-toolbar-leading">
            <Link href="/" className="back-link">
              <ChevronLeft size={16} />
              Daftar Surah
            </Link>
          </div>

          <div className="reader-toolbar-actions">

            <label className="translation-select-label">
              <span className="sr-only">Pilih bahasa tampilan</span>
              <select
                value={translationLanguage}
                onChange={(event) => updateDisplayLanguage(event.target.value)}
                aria-label="Bahasa terjemahan dan nama surah"
              >
                <option value="id">Bahasa Indonesia</option>
                <option value="en">English</option>
              </select>
            </label>

            <button
              type="button"
              className={`tajweed-toggle-button${tajweedEnabled ? " is-active" : ""}`}
              onClick={() => setTajweedEnabled((enabled) => !enabled)}
              aria-pressed={tajweedEnabled}
              title={tajweedEnabled ? "Matikan warna tajwid" : "Aktifkan warna tajwid"}
            >
              Tajwid {tajweedEnabled ? "Aktif" : "Nonaktif"}
            </button>

            <div

              className="font-size-control"

              aria-label="Ukuran teks terjemahan"

            >

              <Type size={15} />

              <button

                type="button"

                onClick={() =>

                  setFontScale((scale) =>

                    Math.max(

                      0.9,

                      Number((scale - 0.1).toFixed(1)),

                    ),

                  )

                }

                aria-label="Perkecil teks"

                disabled={fontScale <= 0.9}

              >

                −

              </button>

              <button

                type="button"

                onClick={() =>

                  setFontScale((scale) =>

                    Math.min(

                      1.3,

                      Number((scale + 0.1).toFixed(1)),

                    ),

                  )

                }

                aria-label="Perbesar teks"

                disabled={fontScale >= 1.3}

              >

                +

              </button>

            </div>

          </div>

        </div>

        <header className="surah-intro">

          <p className="eyebrow">

            SURAH KE-{arabic.number} · {arabic.numberOfAyahs} AYAT ·{" "}

            {arabic.revelationType === "Meccan"

              ? "MAKKIYAH"

              : "MADANIYAH"}

          </p>

          <h1>{getSurahDisplayName(arabic.number, arabic.englishName, surahNameLanguage)}</h1>

          {translationLanguage === "en" && (
            <p className="surah-english-name">{arabic.englishNameTranslation}</p>
          )}

          <p

            className="surah-arabic-title"

            lang="ar"

            dir="rtl"

          >

            {arabic.name}

          </p>

        </header>

        {arabic.number !== 1 && arabic.number !== 9 && (
          <section className="bismillah-intro" aria-label="Basmalah">
            <p className="bismillah-arabic" lang="ar" dir="rtl">
              بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
            </p>
            <p className="bismillah-transliteration" lang="en-Latn">
              Bismillāhir-raḥmānir-raḥīm
            </p>
            <p className="bismillah-translation">
              {translationLanguage === "id"
                ? "Dengan nama Allah Yang Maha Pengasih lagi Maha Penyayang."
                : "In the name of Allah, the Most Compassionate, the Most Merciful."}
            </p>
          </section>
        )}

        {notice && (

          <div className="reader-notice" role="status">

            {notice}

          </div>

        )}

        {tajweedEnabled && (
          <section className="tajweed-guide" aria-label="Legenda warna tajwid">
            <div className="tajweed-guide-heading">
              <strong>Warna tajwid</strong>
              {Object.keys(tajweedByAyah).length === 0 && !tajweedLoadFailed && (
                <span>Memuat penanda tajwid…</span>
              )}
            </div>
            {tajweedLoadFailed ? (
              <p className="tajweed-status">
                Penanda tajwid berwarna belum dapat dimuat. Teks Al-Qur’an tetap tersedia dalam tampilan biasa.
              </p>
            ) : Object.keys(tajweedByAyah).length > 0 ? (
              <div className="tajweed-legend-items">
                <span><i className="tajweed-swatch tajweed-swatch-madd" /> Mad</span>
                <span><i className="tajweed-swatch tajweed-swatch-ghunnah" /> Ghunnah, ikhfa, iqlab</span>
                <span><i className="tajweed-swatch tajweed-swatch-idgham" /> Idgham</span>
                <span><i className="tajweed-swatch tajweed-swatch-qalqalah" /> Qalqalah</span>
                <span><i className="tajweed-swatch tajweed-swatch-symbol" /> Tanda khusus</span>
              </div>
            ) : null}
          </section>
        )}

        <div className="verse-list">

          {ayahPairs.map(

            ({

              arabicAyah,

              translatedAyah,

              indonesianAyah,

              transliteratedAyah,

            }, audioIndex) => {

              if (!translatedAyah) return null;

              const isBookmarked = bookmarks.some(

                (bookmark) =>

                  bookmark.id ===

                  `${arabic.number}:${arabicAyah.numberInSurah}`,

              );

              const isCurrentAudioAyah =
                playback.globalAyahNumber === arabicAyah.number &&
                playback.mode !== null &&
                playback.status !== "stopped";
              const isCurrentAudioPlaying = isCurrentAudioAyah && playback.status === "playing";
              const isCurrentAudioLoading = isCurrentAudioAyah && playback.status === "loading";

              return (

                <section

                  className={`verse-block${isCurrentAudioAyah ? " is-audio-playing" : ""}`}

                  id={`ayah-${arabicAyah.numberInSurah}`}

                  data-ayah-number={arabicAyah.numberInSurah}

                  key={arabicAyah.number}

                >

                  <div className="verse-meta-row">
                    <div className="verse-actions">
                      <button

                        type="button"

                        className="verse-action"

                        aria-label="Salin ayat"

                        title="Salin ayat"

                        onClick={() =>

                          void copyText(

                            `${arabicAyah.text}\n${translatedAyah.text}`,

                          )

                        }

                      >

                        <Copy size={15} />

                      </button>

                      <button

                        type="button"

                        className={`verse-action${isBookmarked ? " is-bookmarked" : ""}`}

                        aria-label={

                          isBookmarked

                            ? "Hapus bookmark"

                            : "Simpan bookmark"

                        }

                        title={

                          isBookmarked

                            ? "Hapus bookmark"

                            : "Simpan bookmark"

                        }

                        onClick={() =>

                          toggleBookmark(

                            arabicAyah.numberInSurah,

                            arabicAyah.text,

                            indonesianAyah?.text || "",

                          )

                        }

                      >

                        {isBookmarked ? (

                          <BookmarkCheck size={16} />

                        ) : (

                          <Bookmark size={16} />

                        )}

                      </button>

                      <button

                        type="button"

                        className="verse-action"

                        aria-label="Bagikan ayat"

                        title="Bagikan ayat"

                        onClick={() =>

                          void shareAyah(

                            arabicAyah.numberInSurah,

                            translatedAyah.text,

                          )

                        }

                      >

                        <Share2 size={15} />

                      </button>

                    </div>

                  </div>

                  <p

                    className="verse-arabic"

                    lang="ar"

                    dir="rtl"

                  >
                    {tajweedEnabled &&
                    tajweedByAyah[`${arabic.number}:${arabicAyah.numberInSurah}`]
                      ? renderTajweedMarkup(
                          tajweedByAyah[`${arabic.number}:${arabicAyah.numberInSurah}`],
                        )
                      : arabicAyah.text}
                    {" "}
                    <span
                      className="verse-end-marker"
                      role="img"
                      aria-label={`Nomor ayat ${arabicAyah.numberInSurah}`}
                    >
                      {toArabicIndicNumber(arabicAyah.numberInSurah)}
                    </span>
                  </p>

                  {transliteratedAyah?.text && (
                    <p className="verse-transliteration" lang="en-Latn" dir="ltr">
                      {transliteratedAyah.text}
                    </p>
                  )}

                  <p

                    className={`verse-translation${translationLanguage === "en" ? " is-english" : ""}`}

                    style={{

                      fontSize: `${16 * fontScale}px`,

                    }}

                    lang={

                      translationLanguage === "id" ? "id" : "en"

                    }

                  >

                    {translatedAyah.text}

                  </p>

                  <div className="verse-footer-controls">
                    <button
                      type="button"
                      className={`verse-audio-button${isCurrentAudioPlaying ? " is-playing" : ""}`}
                      onClick={() => void handleAyahPlayPause(audioIndex)}
                      disabled={isCurrentAudioLoading}
                      aria-label={isCurrentAudioPlaying ? "Jeda audio dari ayat ini" : "Putar mulai ayat ini sampai akhir surah"}
                      title="Putar ayat ini lalu lanjutkan hingga akhir surah"
                    >
                      {isCurrentAudioLoading ? (
                        <LoaderCircle size={16} className="spin" />
                      ) : isCurrentAudioPlaying ? (
                        <Pause size={16} />
                      ) : (
                        <Play size={16} />
                      )}
                      <span>{isCurrentAudioPlaying ? "Jeda" : isCurrentAudioLoading ? "Memuat audio…" : playback.globalAyahNumber === arabicAyah.number && playback.status === "paused" ? "Lanjutkan" : "Putar dari ayat ini"}</span>
                    </button>
                    {isCurrentAudioAyah && (
                      <button type="button" className="verse-stop-button" onClick={handleStopAudio}>
                        <Square size={14} />
                        <span>Berhenti</span>
                      </button>
                    )}
                  </div>

                </section>

              );

            },

          )}

        </div>

        <nav

          className="surah-pagination"

          aria-label="Navigasi surah"

        >

          {arabic.number > 1 ? (

            <Link

              className="button-secondary"

              href={`/surah/${getSurahSlug(arabic.number - 1)}`}

              onClick={() => stopAudioPlayback()}

            >

              <ChevronLeft size={16} />

              Surah sebelumnya

            </Link>

          ) : (

            <span />

          )}

          <span className="pagination-position">

            Surah {arabic.number} dari 114

          </span>

          {arabic.number < 114 ? (

            <Link

              className="button-primary"

              href={`/surah/${getSurahSlug(arabic.number + 1)}`}

              onClick={() => stopAudioPlayback()}

            >

              Surah berikutnya

              <ChevronRight size={16} />

            </Link>

          ) : (

            <span />

          )}

        </nav>

        {endOfSurahOpen && (
          <div className="surah-end-overlay" role="presentation">
            <section className="surah-end-dialog" role="dialog" aria-modal="true" aria-labelledby="surah-end-title">
              <button type="button" className="surah-end-close" onClick={() => setEndOfSurahOpen(false)} aria-label="Tutup dialog">
                <X size={18} />
              </button>
              <span className="surah-end-icon"><BookOpenText size={22} /></span>
              <p className="eyebrow">PEMUTARAN SELESAI</p>
              <h2 id="surah-end-title">Surah {getSurahDisplayName(arabic.number, arabic.englishName, surahNameLanguage)} selesai dibaca</h2>
              <p className="surah-end-copy">Kamu sudah sampai di ayat terakhir. Mau melanjutkan ke surah berikutnya atau mengulang bacaan?</p>
              <div className="surah-end-actions">
                {arabic.number < 114 ? (
                  <Link className="button-primary" href={`/surah/${getSurahSlug(arabic.number + 1)}`} onClick={() => stopAudioPlayback()}>
                    Lanjut surah berikutnya <ChevronRight size={16} />
                  </Link>
                ) : (
                  <span className="surah-end-last-note">Ini adalah surah terakhir dalam Al-Qur&apos;an.</span>
                )}
                <button type="button" className="button-secondary" onClick={handleRepeatFromBeginning}>
                  <RotateCcw size={15} /> Ulang dari awal
                </button>
              </div>
              <div className="surah-end-select-row">
                <label htmlFor="selected-ayah-choice">Atau pilih ayat untuk mulai mengulang</label>
                <select
                  id="selected-ayah-choice"
                  value={selectedAyahNumber}
                  onChange={(event) => setSelectedAyahNumber(Number(event.target.value))}
                >
                  {arabic.ayahs.map((ayah) => (
                    <option key={ayah.numberInSurah} value={ayah.numberInSurah}>
                      Ayat {ayah.numberInSurah}
                    </option>
                  ))}
                </select>
                <button type="button" className="button-secondary" onClick={handlePlaySelectedAyah}>
                  Putar dari ayat <ChevronRight size={15} />
                </button>
              </div>
            </section>
          </div>
        )}

      </article>

    </div>

  );

}
