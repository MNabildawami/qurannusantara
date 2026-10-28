"use client";

import Link from "next/link";
import { Bot, MessageCircle, Send, X } from "lucide-react";
import { FormEvent, useState } from "react";

interface GusAiPanelProps { isOpen: boolean; onClose: () => void; }
type PreviewMessage = { id: string; role: "user" | "assistant"; content: string };
const greeting: PreviewMessage = {
  id: "gus-welcome",
  role: "assistant",
  content: "Halo! Saya Gus AI. Kamu bisa mulai dengan pertanyaan seputar Al-Qur’an. Saat ini saya masih dalam mode pratinjau.",
};

export function GusAiPanel({ isOpen, onClose }: GusAiPanelProps) {
  const [messages, setMessages] = useState<PreviewMessage[]>([greeting]);
  const [draft, setDraft] = useState("");
  if (!isOpen) return null;

  function submitMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const content = draft.trim();
    if (!content) return;
    const now = Date.now().toString();
    setMessages((current) => [
      ...current,
      { id: "user-" + now, role: "user", content },
      {
        id: "preview-" + now,
        role: "assistant",
        content: "Terima kasih atas pertanyaannya. Gus AI masih berupa pratinjau statis dan belum terhubung ke backend AI. Untuk sementara, silakan baca ayat dan terjemahan dari halaman QuranNusantara.",
      },
    ]);
    setDraft("");
  }

  return (
    <>
      <button className="assistant-scrim" aria-label="Tutup pratinjau Gus AI" onClick={onClose} />
      <aside id="gus-ai-panel" className="gus-panel" aria-label="Pratinjau Gus AI">
        <div className="gus-panel-header">
          <div className="gus-brand-icon"><Bot size={19} strokeWidth={1.7} /></div>
          <div className="gus-heading">
            <div className="inline-heading"><h2>Gus AI</h2><span className="preview-badge">Pratinjau</span></div>
            <p>Asisten eksplorasi Al-Qur’an</p>
          </div>
          <button type="button" className="icon-button" aria-label="Tutup Gus AI" onClick={onClose}><X size={17} /></button>
        </div>
        <div className="gus-preview-messages" role="log" aria-live="polite">
          {messages.map((message) => (
            <article key={message.id} className={"gus-preview-message is-" + message.role}>
              {message.role === "assistant" && <span className="gus-preview-avatar"><Bot size={15} /></span>}
              <p>{message.content}</p>
            </article>
          ))}
        </div>
        <div className="gus-panel-bottom">
          <p className="gus-preview-status">Mode pratinjau · Respons belum dihasilkan AI.</p>
          <form className="gus-panel-composer" onSubmit={submitMessage}>
            <label htmlFor="gus-preview-input" className="sr-only">Ketik pertanyaan untuk Gus AI</label>
            <input
              id="gus-preview-input"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="Ketik pertanyaan Anda…"
              autoComplete="off"
            />
            <button type="submit" aria-label="Kirim pertanyaan" disabled={!draft.trim()}><Send size={17} /></button>
          </form>
          <Link className="gus-panel-fullpage-link" href="/gus-ai"><MessageCircle size={14} /> Buka halaman Chatbot <span aria-hidden="true">↗</span></Link>
        </div>
      </aside>
    </>
  );
}
