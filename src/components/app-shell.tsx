"use client";

import Link from "next/link";
import { BookMarked, BookOpenText, MessageCircle } from "lucide-react";
import { useState } from "react";
import { GusAiPanel } from "@/components/gus-ai-panel";
import { ThemeToggle } from "@/components/theme-toggle";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [assistantOpen, setAssistantOpen] = useState(false);

  return (
    <div className={`app-frame${assistantOpen ? " assistant-open" : ""}`}>
      <header className="site-header">
        <div className="header-inner">
          <Link className="wordmark" href="/" aria-label="QuranNusantara, beranda">
            <span className="wordmark-mark" aria-hidden="true">•</span>
            <span>QuranNusantara</span>
          </Link>
          <span className="brand-caption">BACAAN DIGITAL NUSANTARA</span>
          <nav className="main-nav" aria-label="Navigasi utama">
            <Link href="/" className="nav-link"><BookOpenText size={15} /> <span>Daftar Surah</span></Link>
            <Link href="/bookmarks" className="nav-link"><BookMarked size={15} /> <span>Tersimpan</span></Link>
          </nav>
          <div className="header-actions">
            <ThemeToggle />
            <button
              type="button"
              className={`gus-trigger${assistantOpen ? " is-active" : ""}`}
              onClick={() => setAssistantOpen((open) => !open)}
              aria-expanded={assistantOpen}
              aria-controls={assistantOpen ? "gus-ai-panel" : undefined}
            >
              <MessageCircle size={15} strokeWidth={1.8} />
              <span>Gus AI</span>
              <span className="preview-badge">Pratinjau</span>
            </button>
          </div>
        </div>
      </header>

      <div className="workspace">
        <main className="main-content">{children}</main>
        <GusAiPanel isOpen={assistantOpen} onClose={() => setAssistantOpen(false)} />
      </div>
    </div>
  );
}
