import type { LastRead, StoredBookmark } from "@/lib/types";

export const BOOKMARKS_STORAGE_KEY = "qn-bookmarks-v1";
export const LAST_READ_STORAGE_KEY = "qn-last-read-v1";
export const TRANSLATION_STORAGE_KEY = "qn-translation-v1";

export function readBookmarks(): StoredBookmark[] {
  if (typeof window === "undefined") return [];
  try {
    const parsed = JSON.parse(window.localStorage.getItem(BOOKMARKS_STORAGE_KEY) || "[]");
    return Array.isArray(parsed) ? (parsed as StoredBookmark[]) : [];
  } catch {
    return [];
  }
}

export function writeBookmarks(bookmarks: StoredBookmark[]): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(BOOKMARKS_STORAGE_KEY, JSON.stringify(bookmarks));
  window.dispatchEvent(new CustomEvent("qn-bookmarks-updated"));
}

export function readLastRead(): LastRead | null {
  if (typeof window === "undefined") return null;
  try {
    const value = window.localStorage.getItem(LAST_READ_STORAGE_KEY);
    return value ? (JSON.parse(value) as LastRead) : null;
  } catch {
    return null;
  }
}

export function writeLastRead(lastRead: LastRead): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(LAST_READ_STORAGE_KEY, JSON.stringify(lastRead));
  window.dispatchEvent(new CustomEvent("qn-last-read-updated"));
}
