"use client";

import Link from "next/link";
import { Bookmark, BookmarkX } from "lucide-react";
import { useEffect, useState } from "react";
import { readBookmarks, writeBookmarks } from "@/lib/bookmarks";
import type { StoredBookmark } from "@/lib/types";
import {
  getSurahDisplayName,
  normalizeSurahNameLanguage,
  SURAH_NAME_LANGUAGE_EVENT,
  SURAH_NAME_LANGUAGE_STORAGE_KEY,
  type SurahNameLanguage,
} from "@/lib/surah-names";

export function BookmarksPage() {
  const [bookmarks, setBookmarks] = useState<StoredBookmark[]>([]);
  const [nameLanguage, setNameLanguage] = useState<SurahNameLanguage>("id");

  useEffect(() => {
    setBookmarks(readBookmarks());
    const updateBookmarks = () => setBookmarks(readBookmarks());
    const updateNameLanguage = () => {
      setNameLanguage(
        normalizeSurahNameLanguage(
          window.localStorage.getItem(SURAH_NAME_LANGUAGE_STORAGE_KEY),
        ),
      );
    };
    updateNameLanguage();
    window.addEventListener("qn-bookmarks-updated", updateBookmarks);
    window.addEventListener("storage", updateBookmarks);
    window.addEventListener("storage", updateNameLanguage);
    window.addEventListener(SURAH_NAME_LANGUAGE_EVENT, updateNameLanguage);
    return () => {
      window.removeEventListener("qn-bookmarks-updated", updateBookmarks);
      window.removeEventListener("storage", updateBookmarks);
      window.removeEventListener("storage", updateNameLanguage);
      window.removeEventListener(SURAH_NAME_LANGUAGE_EVENT, updateNameLanguage);
    };
  }, []);

  function removeBookmark(id: string) {
    const next = bookmarks.filter((bookmark) => bookmark.id !== id);
    setBookmarks(next);
    writeBookmarks(next);
  }

  return (
    <section className="content-container bookmarks-page">
      <div className="page-heading">
        <p className="eyebrow">KOLEKSI PRIBADI</p>
        <h1>Ayat Tersimpan</h1>
        <p className="page-intro">Bookmark disimpan di browser ini dan tidak memerlukan akun.</p>
      </div>

      {bookmarks.length === 0 ? (
        <div className="state-panel empty-bookmarks">
          <Bookmark size={24} strokeWidth={1.5} />
          <h2>Belum ada ayat tersimpan</h2>
          <p>Saat membaca, gunakan tombol bookmark pada ayat untuk menyimpannya di sini.</p>
          <Link href="/" className="button-primary">Jelajahi surah</Link>
        </div>
      ) : (
        <div className="bookmark-list">
          {bookmarks.slice().sort((a, b) => b.createdAt.localeCompare(a.createdAt)).map((bookmark) => (
            <article className="bookmark-item" key={bookmark.id}>
              <div className="bookmark-item-top">
                <span className="ayah-number">{bookmark.surahNumber}:{bookmark.ayahNumber}</span>
                <button type="button" className="verse-action" aria-label="Hapus bookmark" title="Hapus bookmark" onClick={() => removeBookmark(bookmark.id)}><BookmarkX size={16} /></button>
              </div>
              <p className="bookmark-arabic" dir="rtl" lang="ar">{bookmark.arabicText}</p>
              <p className="bookmark-translation">{bookmark.indonesianText || "Terjemahan belum tersedia dalam data tersimpan."}</p>
              <Link href={`/surah/${bookmark.surahNumber}#ayah-${bookmark.ayahNumber}`} className="text-link">Buka {getSurahDisplayName(bookmark.surahNumber, bookmark.surahName, nameLanguage)} : {bookmark.ayahNumber} <span aria-hidden="true">→</span></Link>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
