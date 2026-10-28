"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookMarked, BookOpenText, MessageCircle } from "lucide-react";
import { useState } from "react";
import { GusAiPanel } from "@/components/gus-ai-panel";
import { ThemeToggle } from "@/components/theme-toggle";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [assistantOpen, setAssistantOpen] = useState(false);
  const pathname = usePathname();
  const isDedicatedChatPage = pathname === "/gus-ai";

  return (
    <div className={`app-frame${assistantOpen && !isDedicatedChatPage ? " assistant-open" : ""}`}>
      <header className="site-header">
        <div className="header-inner">
          <Link className="wordmark" href="/" aria-label="QuranNusantara, beranda">
            <Image
              src="/brand/qurannusantara-mark.svg"
              alt=""
              aria-hidden="true"
              className="wordmark-logo"
              width={36}
              height={36}
              priority
            />
            <span>QuranNusantara</span>
          </Link>
          <span className="brand-caption">BACAAN DIGITAL NUSANTARA</span>
          <nav className="main-nav" aria-label="Navigasi utama">
            <Link href="/" className="nav-link"><BookOpenText size={15} /> <span>Daftar Surah</span></Link>
            <Link href="/bookmarks" className="nav-link"><BookMarked size={15} /> <span>Tersimpan</span></Link>
          </nav>
          <div className="header-actions">
            <ThemeToggle />
            <Link
              className={"gus-trigger" + (isDedicatedChatPage ? " is-active" : "")}
              href="/gus-ai"
              aria-current={isDedicatedChatPage ? "page" : undefined}
            >
              <MessageCircle size={15} strokeWidth={1.8} />
              <span>Chatbot</span>
            </Link>
          </div>
        </div>
      </header>

      <div className="workspace">
        <main className="main-content">{children}</main>
        {!isDedicatedChatPage && (
          <>
            <GusAiPanel isOpen={assistantOpen} onClose={() => setAssistantOpen(false)} />
            {!assistantOpen && (
              <button
                type="button"
                className="gus-preview-launcher"
                aria-label="Buka pratinjau Gus AI"
                title="Buka pratinjau Gus AI"
                onClick={() => setAssistantOpen(true)}
              >
                <MessageCircle size={22} />
              </button>
            )}
          </>
        )}
      </div>
      {!isDedicatedChatPage && <footer className="site-footer">
        <div className="site-footer-inner">
          <Link href="/" className="footer-brand">
            <Image src="/brand/qurannusantara-mark.svg" alt="" width={26} height={26} aria-hidden="true" />
            <span>QuranNusantara</span>
          </Link>
          <p>Bacaan digital Nusantara — ruang tenang untuk membaca dan menjelajahi Al-Qur&apos;an.</p>
          <nav aria-label="Navigasi footer">
            <Link href="/">Daftar Surah</Link>
            <Link href="/bookmarks">Ayat Tersimpan</Link>
            <Link href="/gus-ai">Gus AI</Link>
          </nav>
          <small>Gunakan terjemahan dan tafsir dari sumber tepercaya untuk pendalaman makna.</small>
        </div>
      </footer>}
    </div>
  );
}
