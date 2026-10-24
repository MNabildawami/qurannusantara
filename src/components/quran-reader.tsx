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

  Menu,

  X,

  Search,

  RotateCcw,

  Headphones,

} from "lucide-react";

import {

  type ReactNode,

  useCallback,

  useEffect,

  useMemo,

  useRef,

  useState,

} from "react";

import { AudioButton } from "@/components/audio-button";

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
  normalizeSurahNameLanguage,
  SURAH_NAME_LANGUAGE_EVENT,
  SURAH_NAME_LANGUAGE_STORAGE_KEY,
  type SurahNameLanguage,
} from "@/lib/surah-names";

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
      parts.push(
        <span className="tajweed-ayah-end" key={`tajweed-end-${index++}`}>
          {stripMarkup(match[3] || "")}
        </span>,
      );
    }
    cursor = pattern.lastIndex;
  }

  if (cursor < markup.length) {
    parts.push(stripMarkup(markup.slice(cursor)));
  }

  return parts;
}

type SurahItem = {

  number: number;

  name: string;

  englishName: string;

  englishNameTranslation: string;

  numberOfAyahs: number;

};

export function QuranReader({

  content,

}: {

  content: SurahContent;

}) {

  const { arabic, indonesian, english } = content;

  const [translationLanguage, setTranslationLanguage] =

    useState<"id" | "en">("id");

  const [bookmarks, setBookmarks] =

    useState<StoredBookmark[]>([]);

  const [fontScale, setFontScale] = useState(1);

  const [notice, setNotice] = useState<string | null>(null);

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [surahSearch, setSurahSearch] = useState("");

  const [surahs, setSurahs] = useState<SurahItem[]>([]);
  const [surahNameLanguage, setSurahNameLanguage] =
    useState<SurahNameLanguage>("id");
  const [tajweedEnabled, setTajweedEnabled] = useState(true);
  const [tajweedByAyah, setTajweedByAyah] =
    useState<Record<string, string>>({});
  const [tajweedLoadFailed, setTajweedLoadFailed] = useState(false);

  const [playback, setPlayback] = useState(

    getAudioPlaybackState,

  );

  const [surahLoading, setSurahLoading] = useState(false);

  const surahSessionRef = useRef<number | null>(null);

  const lastScrolledAyahRef = useRef<number | null>(null);

  const noticeTimeoutRef = useRef<ReturnType<

    typeof setTimeout

  > | null>(null);

  useEffect(() => {
    setBookmarks(readBookmarks());

    const savedTranslation = window.localStorage.getItem(TRANSLATION_STORAGE_KEY);
    if (savedTranslation === "en" || savedTranslation === "id") {
      setTranslationLanguage(savedTranslation);
    }

    const syncSurahNameLanguage = () => {
      setSurahNameLanguage(
        normalizeSurahNameLanguage(
          window.localStorage.getItem(SURAH_NAME_LANGUAGE_STORAGE_KEY),
        ),
      );
    };

    syncSurahNameLanguage();
    window.addEventListener(SURAH_NAME_LANGUAGE_EVENT, syncSurahNameLanguage);
    window.addEventListener("storage", syncSurahNameLanguage);
    return () => {
      window.removeEventListener(SURAH_NAME_LANGUAGE_EVENT, syncSurahNameLanguage);
      window.removeEventListener("storage", syncSurahNameLanguage);
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

  // Ambil daftar surah untuk sidebar.

  useEffect(() => {

    let cancelled = false;

    async function loadSurahs() {

      try {

        const response = await fetch(

          "https://api.alquran.cloud/v1/surah",

        );

        if (!response.ok) {

          throw new Error("Daftar surah tidak tersedia.");

        }

        const payload = (await response.json()) as {

          data?: SurahItem[];

        };

        if (!cancelled && Array.isArray(payload.data)) {

          setSurahs(payload.data);

        }

      } catch {

        if (!cancelled) {

          setNotice(

            "Daftar surah gagal dimuat. Periksa koneksi internet.",

          );

        }

      }

    }

    void loadSurahs();

    return () => {

      cancelled = true;

    };

  }, []);

  useEffect(() => {
    const controller = new AbortController();
    setTajweedByAyah({});
    setTajweedLoadFailed(false);

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

      })),

    [

      arabic.ayahs,

      indonesian.ayahs,

      selectedTranslation.ayahs,

    ],

  );

  const filteredSurahs = useMemo(() => {
    const query = surahSearch.trim().toLocaleLowerCase();
    if (!query) return surahs;
    return surahs.filter((surah) => {
      const displayName = getSurahDisplayName(
        surah.number,
        surah.englishName,
        surahNameLanguage,
      );
      return (
        displayName.toLocaleLowerCase().includes(query) ||
        surah.englishName.toLocaleLowerCase().includes(query) ||
        surah.englishNameTranslation.toLocaleLowerCase().includes(query) ||
        String(surah.number).includes(query) ||
        surah.name.includes(surahSearch.trim())
      );
    });
  }, [surahs, surahSearch, surahNameLanguage]);

  const isSurahMode = playback.mode === "surah";

  // Mini-player mengikuti audio ayat tunggal maupun audio satu surah.
  const surahPlaying =

    playback.mode !== null && playback.status === "playing";

  const surahActive =

    playback.mode !== null && playback.status !== "stopped";

  const currentAyah =

    playback.mode === "surah"

      ? playback.localAyahNumber ?? 0

      : playback.mode === "single"

        ? arabic.ayahs.find(
            (ayah) => ayah.number === playback.globalAyahNumber,
          )?.numberInSurah ?? playback.localAyahNumber ?? 0

        : 0;

  const currentAudioIsLoading =

    playback.mode !== null && playback.status === "loading";

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

  function updateSurahNameLanguage(value: string) {
    const next = normalizeSurahNameLanguage(value);
    setSurahNameLanguage(next);
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

          url: `${window.location.origin}/surah/${arabic.number}#ayah-${ayahNumber}`,

        });

      } catch {

        // Pembatalan berbagi oleh pengguna bukan kesalahan.

      }

    } else {

      await copyText(shareText);

    }

  }

  const playSurahAyah = useCallback(

    async (index: number, sessionId: number) => {

      if (!isAudioSessionCurrent(sessionId)) return;

      // Surah selesai.

      if (index >= arabic.ayahs.length) {

        finishAudioSession(sessionId);

        surahSessionRef.current = null;

        lastScrolledAyahRef.current = null;

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

    },

    [arabic.ayahs, arabic.number],

  );

  function startSurahFromBeginning() {

    if (!arabic.ayahs.length) return;

    const firstAyah = arabic.ayahs[0];

    const sessionId = beginAudioSession("surah", {

      surahNumber: arabic.number,

      localAyahNumber: 1,

      globalAyahNumber: firstAyah.number,

      totalAyahs: arabic.ayahs.length,

    });

    surahSessionRef.current = sessionId;

    lastScrolledAyahRef.current = null;

    setSurahLoading(true);

    void playSurahAyah(0, sessionId).finally(() => {

      if (isAudioSessionCurrent(sessionId)) {

        setSurahLoading(false);

      }

    });

  }

  async function handleSurahPlayPause() {

    const current = getAudioPlaybackState();

    // Jika mini-player sedang mengendalikan audio ayat atau surah,
    // tombol ini menjeda atau melanjutkan audio yang sama.
    if (current.mode !== null && current.status === "playing") {

      pauseActiveAudio();

      return;

    }

    if (current.mode !== null && current.status === "paused") {

      try {

        await resumeActiveAudio();

      } catch {

        showNotice("Audio gagal dilanjutkan.");

      }

      return;

    }

    // Ketika tidak ada audio aktif, mulai putar seluruh surah dari ayat 1.
    startSurahFromBeginning();

  }

  function handleStopSurah() {

    stopAudioPlayback();

    surahSessionRef.current = null;

    lastScrolledAyahRef.current = null;

    setSurahLoading(false);

    showNotice("Pemutaran surah dihentikan.");

  }

  function handleRepeatSurah() {

    // Tombol ulang selalu memulai lagi dari ayat pertama.

    startSurahFromBeginning();

  }

  return (

    <div

      className={`reader-layout${sidebarOpen ? " sidebar-open" : ""}`}

    >

      {/* Sidebar navigasi surah */}

      {sidebarOpen && (

        <button

          type="button"

          className="surah-sidebar-backdrop"

          aria-label="Tutup sidebar"

          onClick={() => setSidebarOpen(false)}

        />

      )}

      <aside

        className={`surah-sidebar${sidebarOpen ? " is-open" : ""}`}

        aria-label="Navigasi daftar surah"

        aria-hidden={!sidebarOpen}

      >

        <div className="surah-sidebar-header">

          <div>

            <span className="surah-sidebar-eyebrow">

              QURANNUSANTARA

            </span>

            <h2>Daftar Surah</h2>

          </div>

          <button

            type="button"

            className="sidebar-close-button"

            onClick={() => setSidebarOpen(false)}

            aria-label="Tutup sidebar"

          >

            <X size={20} />

          </button>

        </div>

        <label className="surah-search">

          <Search size={17} />

          <input

            type="search"

            placeholder="Cari nama surah..."

            value={surahSearch}

            onChange={(event) =>

              setSurahSearch(event.target.value)

            }

          />

        </label>

        <div className="surah-sidebar-list">

          {surahs.length === 0 ? (

            <p className="surah-sidebar-empty">

              Memuat daftar surah...

            </p>

          ) : filteredSurahs.length === 0 ? (

            <p className="surah-sidebar-empty">

              Surah tidak ditemukan.

            </p>

          ) : (

            filteredSurahs.map((surah) => {

              const isCurrent =

                surah.number === arabic.number;

              return (

                <Link

                  key={surah.number}

                  href={`/surah/${surah.number}`}

                  className={`surah-sidebar-item${isCurrent ? " is-current" : ""}`}

                  aria-current={isCurrent ? "page" : undefined}

                  onClick={() => {

                    setSidebarOpen(false);

                    stopAudioPlayback();

                  }}

                >

                  <span className="surah-sidebar-number">

                    {surah.number}

                  </span>

                  <span className="surah-sidebar-name">

                    <strong>{getSurahDisplayName(surah.number, surah.englishName, surahNameLanguage)}</strong>

                    <small>

                      {surah.englishNameTranslation}

                    </small>

                  </span>

                  <span className="surah-sidebar-arabic" lang="ar">

                    {surah.name}

                  </span>

                </Link>

              );

            })

          )}

        </div>

      </aside>

      <article className="reader-page">

        <div className="reader-toolbar">

          <div className="reader-toolbar-leading">

            <button

              type="button"

              className="sidebar-toggle-button"

              onClick={() =>

                setSidebarOpen((open) => !open)

              }

              aria-label={

                sidebarOpen

                  ? "Tutup daftar surah"

                  : "Buka daftar surah"

              }

              aria-expanded={sidebarOpen}

            >

              {sidebarOpen ? (

                <X size={19} />

              ) : (

                <Menu size={19} />

              )}

              <span>Surah</span>

            </button>

            <Link href="/" className="back-link">

              <ChevronLeft size={16} />

              Beranda

            </Link>

          </div>

          <div className="reader-toolbar-actions">

            <label className="translation-select-label">

              <span className="sr-only">

                Pilih bahasa terjemahan

              </span>

              <select

                value={translationLanguage}

                onChange={(event) => {

                  const value =

                    event.target.value === "en" ? "en" : "id";

                  setTranslationLanguage(value);

                  window.localStorage.setItem(

                    TRANSLATION_STORAGE_KEY,

                    value,

                  );

                }}

              >

                <option value="id">Indonesia</option>

                <option value="en">English</option>

              </select>

            </label>

            <label className="surah-name-language-select">
              <span className="sr-only">Pilih ejaan nama surah</span>
              <select
                value={surahNameLanguage}
                onChange={(event) => updateSurahNameLanguage(event.target.value)}
                aria-label="Ejaan nama surah"
              >
                <option value="id">Nama Indonesia</option>
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

          <p className="surah-english-name">

            {arabic.englishNameTranslation}

          </p>

          <p

            className="surah-arabic-title"

            lang="ar"

            dir="rtl"

          >

            {arabic.name}

          </p>

        </header>

        {/* Kontrol pemutaran seluruh surah */}

        <section

          className={`surah-audio-player${surahActive ? " is-active" : ""}`}

          aria-label="Pemutar audio Al-Qur’an"

        >

          <div className="surah-audio-info">

            <span className="surah-audio-label">

              <Headphones size={14} />

              PEMUTAR AL-QUR’AN

            </span>

            <strong>{getSurahDisplayName(arabic.number, arabic.englishName, surahNameLanguage)}</strong>

            <span

              className="surah-audio-progress"

              aria-live="polite"

            >

              {surahActive && currentAyah > 0

                ? playback.mode === "single"
                  ? `Sedang diputar: Ayat ${currentAyah}`
                  : `Sedang diputar: Ayat ${currentAyah} dari ${arabic.ayahs.length}`

                : "Putar seluruh ayat secara berurutan"}

            </span>

          </div>

          <div className="surah-audio-actions">

            <button

              type="button"

              className="button-primary"

              onClick={() => void handleSurahPlayPause()}

              disabled={surahLoading || currentAudioIsLoading}

            >

              {surahLoading || currentAudioIsLoading ? (

                <LoaderCircle

                  size={16}

                  className="spin"

                />

              ) : surahPlaying ? (

                <Pause size={16} />

              ) : (

                <Play size={16} />

              )}

              {surahPlaying

                ? "Jeda"

                : surahActive

                  ? "Lanjutkan"

                  : "Putar Surah"}

            </button>

            <button

              type="button"

              className="button-secondary"

              onClick={handleRepeatSurah}

              title="Putar ulang dari ayat pertama"

              aria-label="Putar ulang dari awal"

              disabled={

                surahLoading || currentAudioIsLoading

              }

            >

              <RotateCcw size={16} />

              Ulang dari awal

            </button>

            <button

              type="button"

              className="button-secondary"

              onClick={handleStopSurah}

              title="Berhenti"

              aria-label="Berhenti memutar audio"

              disabled={!surahActive}

            >

              <Square size={15} />

              Berhenti

            </button>

          </div>

        </section>

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

            }) => {

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

              return (

                <section

                  className={`verse-block${isCurrentAudioAyah ? " is-audio-playing" : ""}`}

                  id={`ayah-${arabicAyah.numberInSurah}`}

                  data-ayah-number={arabicAyah.numberInSurah}

                  key={arabicAyah.number}

                >

                  <div className="verse-meta-row">

                    <span className="ayah-number">

                      {arabic.number}:{arabicAyah.numberInSurah}

                    </span>

                    <div className="verse-actions">

                      <AudioButton

                        ayahNumber={arabicAyah.number}

                      />

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
                  </p>

                  <p

                    className={`verse-translation${translationLanguage === "en" ? " is-english" : ""}`}

                    style={{

                      fontSize: `${18 * fontScale}px`,

                    }}

                    lang={

                      translationLanguage === "id" ? "id" : "en"

                    }

                  >

                    {translatedAyah.text}

                  </p>

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

              href={`/surah/${arabic.number - 1}`}

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

              href={`/surah/${arabic.number + 1}`}

              onClick={() => stopAudioPlayback()}

            >

              Surah berikutnya

              <ChevronRight size={16} />

            </Link>

          ) : (

            <span />

          )}

        </nav>

      </article>

    </div>

  );

}
