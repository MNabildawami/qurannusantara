"use client";

import Link from "next/link";
import { BookOpen, Search, RotateCw } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { readLastRead, TRANSLATION_STORAGE_KEY } from "@/lib/bookmarks";
import type { LastRead, SurahSummary } from "@/lib/types";
import {
  getSurahDisplayName,
  getSurahSlug,
  normalizeSurahNameLanguage,
  SURAH_NAME_LANGUAGE_EVENT,
  SURAH_NAME_LANGUAGE_STORAGE_KEY,
  type SurahNameLanguage,
} from "@/lib/surah-names";

interface SurahBrowserProps {
  surahs: SurahSummary[];
  loadError: boolean;
}

type RevelationFilter = "all" | "Meccan" | "Medinan";

function revelationLabel(value: string): string {
  if (value === "Meccan") return "Makkiyah";
  if (value === "Medinan") return "Madaniyah";
  return value;
}

export function SurahBrowser({ surahs, loadError }: SurahBrowserProps) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<RevelationFilter>("all");
  const [lastRead, setLastRead] = useState<LastRead | null>(null);
  const [nameLanguage, setNameLanguage] = useState<SurahNameLanguage>("id");

  useEffect(() => {
    const updateLastRead = () => setLastRead(readLastRead());
    const updateNameLanguage = () => {
      const savedTranslation = window.localStorage.getItem(TRANSLATION_STORAGE_KEY);
      const savedName = window.localStorage.getItem(SURAH_NAME_LANGUAGE_STORAGE_KEY);
      setNameLanguage(savedTranslation === "id" || savedTranslation === "en"
        ? savedTranslation
        : normalizeSurahNameLanguage(savedName));
    };
    queueMicrotask(() => {
      setLastRead(readLastRead());
      updateNameLanguage();
    });
    window.addEventListener("qn-last-read-updated", updateLastRead);
    window.addEventListener("storage", updateLastRead);
    window.addEventListener("storage", updateNameLanguage);
    window.addEventListener(SURAH_NAME_LANGUAGE_EVENT, updateNameLanguage);
    return () => {
      window.removeEventListener("qn-last-read-updated", updateLastRead);
      window.removeEventListener("storage", updateLastRead);
      window.removeEventListener("storage", updateNameLanguage);
      window.removeEventListener(SURAH_NAME_LANGUAGE_EVENT, updateNameLanguage);
    };
  }, []);


  const filteredSurahs = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase();
    return surahs.filter((surah) => {
      const displayName = getSurahDisplayName(
        surah.number, surah.englishName, nameLanguage,
      );
      const matchesQuery = !normalizedQuery || [
        String(surah.number),
        displayName,
        surah.name,
        surah.englishName,
        surah.englishNameTranslation,
      ].some((value) => value.toLocaleLowerCase().includes(normalizedQuery));
      return matchesQuery && (filter === "all" || surah.revelationType === filter);
    });
  }, [surahs, query, filter, nameLanguage]);

  return (
    <section className="index-page content-container">
      <div className="page-heading">
        <p className="eyebrow">AL-QUR&apos;AN</p>
        <h1>Daftar Surah</h1>
        <p className="page-intro">Pilih surah dengan tulisan yang lebih besar dan nyaman dibaca.</p>
      </div>

      {lastRead && !loadError && (
        <Link className="continue-reading" href={`/surah/${getSurahSlug(lastRead.surahNumber)}#ayah-${lastRead.ayahNumber}`}>
          <span className="continue-icon"><BookOpen size={18} /></span>
          <span className="continue-copy">
            <span className="continue-label">TERAKHIR DIBACA</span>
            <strong>{getSurahDisplayName(
              lastRead.surahNumber,
              surahs.find((surah) => surah.number === lastRead.surahNumber)?.englishName ?? lastRead.surahName,
              nameLanguage,
            )} : {lastRead.ayahNumber}</strong>
          </span>
          <span className="continue-action">Lanjutkan <span aria-hidden="true">→</span></span>
        </Link>
      )}

      <div className="surah-tools">
        <label className="search-field">
          <Search size={20} aria-hidden="true" />
          <span className="sr-only">Cari surah</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Cari nama, bahasa Arab, atau nomor surah…"
          />
          {query && <button type="button" className="clear-search" onClick={() => setQuery("")}>Hapus</button>}
        </label>
        <div className="surah-tools-bottom">
          <div className="filter-row" role="group" aria-label="Filter tempat turunnya surah">
            {([
              ["all", "Semua"],
              ["Meccan", "Makkiyah"],
              ["Medinan", "Madaniyah"],
            ] as const).map(([value, label]) => (
              <button
                className={`filter-button${filter === value ? " is-selected" : ""}`}
                key={value}
                type="button"
                onClick={() => setFilter(value)}
                aria-pressed={filter === value}
              >
                {label}
              </button>
            ))}
          </div>
          <span className="result-count">{loadError ? "Data tidak tersedia" : `${filteredSurahs.length} surah`}</span>
        </div>
      </div>

      {loadError ? (
        <div className="state-panel">
          <h2>Daftar surah belum dapat dimuat</h2>
          <p>Periksa koneksi internet atau coba lagi beberapa saat. Data diambil dari layanan API eksternal.</p>
          <button className="button-secondary" type="button" onClick={() => window.location.reload()}><RotateCw size={17} /> Coba lagi</button>
        </div>
      ) : filteredSurahs.length === 0 ? (
        <div className="state-panel">
          <h2>Surah tidak ditemukan</h2>
          <p>Coba kata pencarian lain atau ubah filter.</p>
          <button className="button-secondary" type="button" onClick={() => { setQuery(""); setFilter("all"); }}>Hapus pencarian</button>
        </div>
      ) : (
        <>
          <div className="list-heading">
            <h2>Surah</h2>
            <span>Menampilkan {filteredSurahs.length} dari {surahs.length}</span>
          </div>
          <div className="surah-grid">
            {filteredSurahs.map((surah) => (
              <Link className="surah-item" href={`/surah/${getSurahSlug(surah.number)}`} key={surah.number}>
                <span className="surah-number">{surah.number}</span>
                <span className="surah-item-copy">
                  <strong>{getSurahDisplayName(surah.number, surah.englishName, nameLanguage)}</strong>
                  <span>{surah.numberOfAyahs} ayat · {revelationLabel(surah.revelationType)}</span>
                </span>
                <span className="surah-arabic" lang="ar" dir="rtl">{surah.name}</span>
                <span className="sr-only">, {revelationLabel(surah.revelationType)}</span>
              </Link>
            ))}
          </div>
        </>
      )}

      <footer className="source-footer">
        <p>Data teks dan nama Arab ditampilkan dari layanan API Al-Qur&apos;an. Pilihan ejaan Indonesia menggunakan padanan nama yang disiapkan untuk QuranNusantara.</p>
      </footer>
    </section>
  );
}
