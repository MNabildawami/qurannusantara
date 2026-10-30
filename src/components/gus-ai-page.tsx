"use client";

import Link from "next/link";
import {
  AlertCircle,
  Bot,
  BookOpenText,
  LoaderCircle,
  MessageSquare,
  Plus,
  Send,
  Sparkles,
  Trash2,
} from "lucide-react";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { sendGusAiMessage } from "@/lib/gus-ai-client";
import { GusAiMarkdown } from "@/components/gus-ai-markdown";

type ChatRole = "user" | "assistant";

type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
  createdAt: string;
};

type ChatConversation = {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages: ChatMessage[];
};

type RequestError = {
  conversationId: string;
  prompt: string;
  message: string;
};

const STORAGE_KEY = "qn-gus-ai-conversations-v1";
const examplePrompts = [
  "Temukan ayat tentang kesabaran",
  "Apa tema utama Surah Al-Fatihah?",
  "Bantu saya memulai membaca Al-Qur'an",
];

function createId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `qn-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

function shortTitle(value: string): string {
  const title = value.trim().replace(/\\s+/g, " ");
  return title.length > 38 ? `${title.slice(0, 38)}…` : title || "Percakapan baru";
}

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Baru saja";
  return date.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
}

function formatTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
}

export function GusAiPage() {
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [historyOpen, setHistoryOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [requestError, setRequestError] = useState<RequestError | null>(null);
  const composerRef = useRef<HTMLTextAreaElement>(null);
  const messageEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    queueMicrotask(() => {
      try {
        const saved = window.localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved) as ChatConversation[];
          if (Array.isArray(parsed)) {
            const safeConversations = parsed.filter(
              (item) => item && typeof item.id === "string" && Array.isArray(item.messages),
            );
            setConversations(safeConversations);
            setActiveId(safeConversations[0]?.id ?? null);
          }
        }
      } catch {
        setConversations([]);
        setActiveId(null);
      } finally {
        setHydrated(true);
      }
    });
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
    } catch {
      // Local history may be unavailable in private browsing or under a storage limit.
    }
  }, [conversations, hydrated]);

  const activeConversation = useMemo(
    () => conversations.find((conversation) => conversation.id === activeId) ?? null,
    [conversations, activeId],
  );

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [activeConversation?.messages.length, isSending]);

  function startNewChat() {
    setActiveId(null);
    setDraft("");
    setRequestError(null);
    setHistoryOpen(false);
    composerRef.current?.focus();
  }

  function removeConversation(id: string) {
    const remaining = conversations.filter((conversation) => conversation.id !== id);
    setConversations(remaining);
    if (activeId === id) setActiveId(remaining[0]?.id ?? null);
    if (requestError?.conversationId === id) setRequestError(null);
  }

  async function requestAnswer(message: string, conversationId: string) {
    setIsSending(true);
    setRequestError(null);

    try {
      const answer = await sendGusAiMessage(message);
      const now = new Date().toISOString();
      const assistantMessage: ChatMessage = {
        id: createId(),
        role: "assistant",
        content: answer,
        createdAt: now,
      };
      setConversations((items) =>
        items.map((item) =>
          item.id === conversationId
            ? { ...item, updatedAt: now, messages: [...item.messages, assistantMessage] }
            : item,
        ),
      );
    } catch (error) {
      setRequestError({
        conversationId,
        prompt: message,
        message: error instanceof Error ? error.message : "Gus AI belum dapat menjawab. Silakan coba lagi.",
      });
    } finally {
      setIsSending(false);
    }
  }

  function submitMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const content = draft.trim();
    if (!content || isSending) return;

    const now = new Date().toISOString();
    const conversation = activeConversation;
    const id = conversation?.id ?? createId();
    const userMessage: ChatMessage = {
      id: createId(),
      role: "user",
      content,
      createdAt: now,
    };

    if (conversation) {
      const updated: ChatConversation = {
        ...conversation,
        title: conversation.messages.length === 0 ? shortTitle(content) : conversation.title,
        updatedAt: now,
        messages: [...conversation.messages, userMessage],
      };
      setConversations((items) => [updated, ...items.filter((item) => item.id !== id)]);
    } else {
      const next: ChatConversation = {
        id,
        title: shortTitle(content),
        createdAt: now,
        updatedAt: now,
        messages: [userMessage],
      };
      setConversations((items) => [next, ...items]);
    }

    setActiveId(id);
    setDraft("");
    setRequestError(null);
    setHistoryOpen(false);
    void requestAnswer(content, id);
  }

  function retryFailedMessage() {
    if (!requestError || isSending) return;
    void requestAnswer(requestError.prompt, requestError.conversationId);
  }

  const messages = activeConversation?.messages ?? [];
  const visibleError = requestError?.conversationId === activeId ? requestError : null;

  return (
    <section className="gus-chat-page" aria-label="Halaman Gus AI">
      <aside className={`gus-chat-history${historyOpen ? " is-open" : ""}`} aria-label="Riwayat percakapan">
        <div className="gus-history-topline">
          <div className="gus-chat-mini-brand"><span className="gus-mini-icon"><Bot size={18} /></span><span>Gus AI</span></div>
          <button type="button" className="gus-history-new" onClick={startNewChat} aria-label="Percakapan baru" title="Percakapan baru"><Plus size={17} /></button>
        </div>
        <button type="button" className="gus-new-chat-button" onClick={startNewChat}>
          <Plus size={16} /> Percakapan baru
        </button>
        <div className="gus-history-heading">RIWAYAT</div>
        <div className="gus-history-list">
          {!hydrated ? (
            <p className="gus-history-empty">Memuat riwayat…</p>
          ) : conversations.length === 0 ? (
            <p className="gus-history-empty">Percakapan yang kamu mulai akan tersimpan di sini pada browser ini.</p>
          ) : (
            conversations.map((conversation) => (
              <div className={`gus-history-entry${conversation.id === activeId ? " is-active" : ""}`} key={conversation.id}>
                <button type="button" className="gus-history-entry-main" onClick={() => { setActiveId(conversation.id); setRequestError(null); setHistoryOpen(false); }}>
                  <MessageSquare size={15} />
                  <span><strong>{conversation.title}</strong><small>{formatDate(conversation.updatedAt)}</small></span>
                </button>
                <button type="button" className="gus-history-delete" onClick={() => removeConversation(conversation.id)} aria-label={`Hapus ${conversation.title}`} title="Hapus riwayat"><Trash2 size={14} /></button>
              </div>
            ))
          )}
        </div>
        <div className="gus-history-bottom">
          <span className="gus-history-status-dot" /> Riwayat disimpan di perangkat ini
        </div>
      </aside>

      {historyOpen && <button className="gus-history-scrim" type="button" aria-label="Tutup riwayat" onClick={() => setHistoryOpen(false)} />}

      <div className="gus-chat-main">
        <div className="gus-chat-toolbar">
          <button type="button" className="gus-history-toggle" onClick={() => setHistoryOpen((open) => !open)} aria-expanded={historyOpen}>
            <MessageSquare size={16} /> Riwayat
          </button>
          <div className="gus-chat-title"><span className="gus-chat-title-icon"><Bot size={17} /></span><span>Gus AI</span><span className="preview-badge">AI</span></div>
          <Link href="/" className="gus-back-reader"><BookOpenText size={15} /> Baca Al-Qur&apos;an</Link>
        </div>

        <div className="gus-chat-scroll-area">
          <div className={`gus-chat-conversation${messages.length === 0 ? " is-empty" : ""}`}>
            {messages.length === 0 ? (
              <div className="gus-chat-welcome">
                <span className="gus-welcome-icon"><Sparkles size={23} /></span>
                <p className="eyebrow">ASISTEN EKSPLORASI AL-QUR&apos;AN</p>
                <h1>Ada yang ingin kamu pelajari?</h1>
                <p className="gus-welcome-description">Mulai dengan pertanyaan tentang bacaan, tema surah, atau cara menemukan ayat. Riwayat percakapan akan tersimpan agar mudah dibuka kembali.</p>
                <div className="gus-prompt-grid">
                  {examplePrompts.map((prompt) => (
                    <button key={prompt} type="button" onClick={() => { setDraft(prompt); composerRef.current?.focus(); }}>
                      <span>{prompt}</span><Sparkles size={15} />
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="gus-chat-messages" aria-live="polite">
                <div className="gus-chat-conversation-heading"><h1>{activeConversation?.title}</h1><p>Riwayat ini tersimpan secara lokal di browser.</p></div>
                {messages.map((message) => (
                  <article className={`gus-chat-message is-${message.role}`} key={message.id}>
                    {message.role === "assistant" && <span className="gus-message-avatar"><Bot size={17} /></span>}
                    <div className="gus-message-body">
                      <div className="gus-message-role">{message.role === "user" ? "Kamu" : "Gus AI"}<time>{formatTime(message.createdAt)}</time></div>
                      {message.role === "assistant" ? <GusAiMarkdown content={message.content} /> : <p>{message.content}</p>}
                    </div>
                  </article>
                ))}
                {isSending && activeId && (
                  <article className="gus-chat-message is-assistant" aria-label="Gus AI sedang mengetik">
                    <span className="gus-message-avatar"><Bot size={17} /></span>
                    <div className="gus-message-body">
                      <div className="gus-message-role">Gus AI</div>
                      <p className="gus-typing-status"><LoaderCircle size={14} /> Sedang menyusun jawaban…</p>
                    </div>
                  </article>
                )}
                <div ref={messageEndRef} />
              </div>
            )}
          </div>
        </div>

        <div className="gus-chat-composer-wrap">
          <div className="gus-chat-preview-notice"><AlertCircle size={15} /><span>Jawaban AI dapat keliru atau kurang lengkap. Periksa kembali rujukan ayat, terjemahan, dan tafsir melalui sumber tepercaya.</span></div>
          {visibleError && (
            <div className="gus-chat-error" role="alert">
              <span>{visibleError.message}</span>
              <button type="button" onClick={retryFailedMessage} disabled={isSending}>Coba lagi</button>
            </div>
          )}
          <form className="gus-chat-composer" onSubmit={submitMessage}>
            <label className="sr-only" htmlFor="gus-chat-input">Kirim pertanyaan kepada Gus AI</label>
            <textarea
              id="gus-chat-input"
              ref={composerRef}
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="Tulis pertanyaanmu di sini…"
              rows={1}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  event.currentTarget.form?.requestSubmit();
                }
              }}
            />
            <button type="submit" disabled={!draft.trim() || isSending} aria-label="Kirim pesan">
              {isSending ? <LoaderCircle size={17} className="gus-send-spinner" /> : <Send size={17} />}
            </button>
          </form>
          <p className="gus-chat-disclaimer">Gus AI membantu eksplorasi awal, bukan pengganti tafsir, fatwa, atau bimbingan ahli agama.</p>
        </div>
      </div>
    </section>
  );
}
