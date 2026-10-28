"use client";

import { ArrowUpRight, Bot, X } from "lucide-react";
import Link from "next/link";

interface GusAiPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const examplePrompts = [
  "Temukan ayat tentang kesabaran",
  "Jelaskan tema sebuah surah",
  "Cari ayat berdasarkan kata kunci",
];

export function GusAiPanel({ isOpen, onClose }: GusAiPanelProps) {
  if (!isOpen) return null;

  return (
    <>
      <button className="assistant-scrim" aria-label="Tutup Gus AI" onClick={onClose} />
      <aside id="gus-ai-panel" className="gus-panel" aria-label="Pratinjau Gus AI">
        <div className="gus-panel-header">
          <div className="gus-brand-icon"><Bot size={19} strokeWidth={1.7} /></div>
          <div className="gus-heading">
            <div className="inline-heading">
              <h2>Gus AI</h2>
              <span className="preview-badge">Pratinjau</span>
            </div>
            <p>Asisten eksplorasi Al-Qur&apos;an</p>
          </div>
          <button type="button" className="icon-button" aria-label="Tutup Gus AI" onClick={onClose}>
            <X size={17} />
          </button>
        </div>

        <div className="gus-preview-notice">
          <span className="status-dot" />
          <div>
            <strong>Belum aktif</strong>
            <p>Fitur percakapan akan diaktifkan pada tahap pengembangan berikutnya.</p>
          </div>
        </div>

        <div className="gus-panel-content">
          <p className="eyebrow">CONTOH YANG DAPAT DITANYAKAN</p>
          <div className="suggested-prompts">
            {examplePrompts.map((prompt) => (
              <div className="suggested-prompt" key={prompt}>
                <span>{prompt}</span>
                <ArrowUpRight size={15} />
              </div>
            ))}
          </div>
          <p className="gus-disclaimer">
            Mode pratinjau: backend AI belum diaktifkan. Jawaban nantinya perlu merujuk sumber Al-Qur&apos;an dan tafsir terverifikasi.
          </p>
          <Link className="gus-full-page-link" href="/gus-ai">
            Buka halaman Gus AI <ArrowUpRight size={15} />
          </Link>
        </div>

        <form className="gus-composer" onSubmit={(event) => event.preventDefault()}>
          <label className="sr-only" htmlFor="gus-message">Pesan untuk Gus AI</label>
          <input id="gus-message" type="text" placeholder="Gus AI belum aktif" disabled />
          <button type="submit" disabled aria-label="Kirim pesan"><ArrowUpRight size={17} /></button>
        </form>
      </aside>
    </>
  );
}
