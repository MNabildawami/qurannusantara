import type { Metadata } from "next";
import { BookmarksPage } from "@/components/bookmarks-page";

export const metadata: Metadata = {
  title: "Ayat Tersimpan",
  description: "Temukan ayat Al-Qur'an yang disimpan di browser ini.",
};

export default function SavedVersesPage() {
  return <BookmarksPage />;
}
