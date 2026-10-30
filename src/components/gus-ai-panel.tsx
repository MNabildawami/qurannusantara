"use client";

import Link from "next/link";
import { Bot, LoaderCircle, MessageCircle, Send, X } from "lucide-react";
import { FormEvent, useState } from "react";
import { sendGusAiMessage } from "@/lib/gus-ai-client";

interface GusAiPanelProps { isOpen: boolean; onClose: () => void; }
type PreviewMessage = { id: string; role: "user" | "assistant"; content: string };
const greeting: PreviewMessage = {
  id: "gus-welcome",
  role: "assistant",
  content: "Halo! Saya Gus AI, asisten untuk membantu eksplorasi Al-Qur’an. Silakan ajukan pertanyaan tentang ayat atau tema tertentu.",
};

export function GusAiPanel({ isOpen, onClose }: GusAiPanelProps) {
  const [messages, setMessages] = useState<PreviewMessage[]>([greeting]);
  const [draft, setDraft] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  function submitMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const content = draft.trim();
    if (!content || isSending) return;

    const now = Date.now().toString();
    setMessages((current) => [...current, { id: "user-" + now, role: "user", content }]);
    setDraft("");
    setError("");
    setIsSending(true);

    void sendGusAiMessage(content)
      .then((reply) => {
        setMessages((current) => [
          ...current,
          { id: "assistant-" + Date.now().toString(), role: "assistant", content: reply },
        ]);
      })
      .catch((requestError: unknown) => {
        setError(requestError instanceof Error ? requestError.message : "Gus AI belum dapat menjawab. Silakan coba lagi.");
      })
      .finally(() => setIsSending(false));
  }

  return (
    <>
      <button className="assistant-scrim" aria-label="Tutup Gus AI" onClick={onClose} />
      <aside id="gus-ai-panel" className="gus-panel" aria-label="Gus AI">
        <div className="gus-panel-header">
          <div className="gus-brand-icon"><Bot size={19} strokeWidth={1.7} /></div>
          <div className="gus-heading">
            <div className="inline-heading"><h2>Gus AI</h2></div>
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
          {isSending && (
            <article className="gus-preview-message is-assistant">
              <span className="gus-preview-avatar"><Bot size={15} /></span>
              <p className="gus-panel-thinking"><LoaderCircle size={13} /> Sedang menyusun jawaban…</p>
            </article>
          )}
        </div>
        <div className="gus-panel-bottom">
          <p className="gus-preview-status">Jawaban AI dapat keliru. Periksa kembali rujukan melalui sumber tepercaya.</p>
          {error && <p className="gus-panel-error" role="alert">{error}</p>}
          <form className="gus-panel-composer" onSubmit={submitMessage}>
            <label htmlFor="gus-preview-input" className="sr-only">Ketik pertanyaan untuk Gus AI</label>
            <input
              id="gus-preview-input"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="Ketik pertanyaan Anda…"
              autoComplete="off"
            />
            <button type="submit" aria-label="Kirim pertanyaan" disabled={!draft.trim() || isSending}>
              {isSending ? <LoaderCircle size={17} className="gus-send-spinner" /> : <Send size={17} />}
            </button>
          </form>
          <Link className="gus-panel-fullpage-link" href="/gus-ai" onClick={onClose}><MessageCircle size={14} /> Buka halaman Chatbot <span aria-hidden="true">↗</span></Link>
        </div>
      </aside>
    </>
  );
}
