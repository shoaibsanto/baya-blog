"use client";

import { useEffect, useRef, useState } from "react";

interface Source {
  title: string;
  url: string;
}

interface Message {
  role: "user" | "assistant";
  content: string;
  sources?: Source[];
}

const SUGGESTIONS = ["আজকের সরকারি চাকরি", "ব্যাংক জব সার্কুলার", "শীঘ্রই ডেডলাইন শেষ হচ্ছে এমন চাকরি"];

const WELCOME: Message = {
  role: "assistant",
  content:
    "আসসালামু আলাইকুম! আমি BAYA Blog-এর চাকরি সহায়ক। কোন ধরনের চাকরি খুঁজছেন — সরকারি, ব্যাংক, প্রাইভেট, নাকি অন্য কিছু?",
};

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([WELCOME]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const sessionIdRef = useRef<string>(
    typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`
  );

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    if (open) document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  async function sendMessage(text: string) {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    const nextMessages: Message[] = [...messages, { role: "user", content: trimmed }];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          messages: nextMessages.map(({ role, content }) => ({ role, content })),
          sessionId: sessionIdRef.current,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: data.error ?? "একটি সমস্যা হয়েছে। আবার চেষ্টা করুন।" },
        ]);
        return;
      }

      setMessages((prev) => [...prev, { role: "assistant", content: data.reply, sources: data.sources }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "নেটওয়ার্ক সমস্যার কারণে উত্তর পাওয়া যায়নি। আবার চেষ্টা করুন।" },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "চ্যাট বন্ধ করুন" : "চাকরি সহায়ক চ্যাটবট খুলুন"}
        aria-expanded={open}
        className="fixed bottom-4 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-brand text-white shadow-lg transition hover:bg-brand-dark sm:bottom-6 sm:right-6"
      >
        <span aria-hidden="true" className="text-2xl">
          {open ? "✕" : "💬"}
        </span>
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="চাকরি সহায়ক চ্যাটবট"
          className="fixed inset-x-0 bottom-0 z-40 flex h-[85vh] flex-col rounded-t-2xl border border-border bg-background shadow-2xl sm:inset-auto sm:bottom-24 sm:right-6 sm:h-[32rem] sm:w-96 sm:rounded-2xl"
        >
          <div className="flex items-center justify-between rounded-t-2xl border-b border-border bg-brand px-4 py-3 text-white sm:rounded-t-2xl">
            <div>
              <p className="text-sm font-semibold">চাকরি সহায়ক</p>
              <p className="text-xs opacity-90">BAYA Blog · AI চ্যাটবট</p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="বন্ধ করুন"
              className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-white/20"
            >
              ✕
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${
                    m.role === "user"
                      ? "rounded-br-sm bg-brand text-white"
                      : "rounded-bl-sm bg-muted/10 text-foreground"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{m.content}</p>
                  {m.sources && m.sources.length > 0 && (
                    <ul className="mt-2 space-y-1 border-t border-border/50 pt-2">
                      {m.sources.map((s) => (
                        <li key={s.url}>
                          <a
                            href={s.url}
                            className="text-xs font-medium text-brand underline underline-offset-2 hover:text-brand-dark"
                          >
                            {s.title}
                          </a>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="rounded-2xl rounded-bl-sm bg-muted/10 px-3 py-2 text-sm text-muted">
                  লিখছে...
                </div>
              </div>
            )}
            {messages.length === 1 && !loading && (
              <div className="flex flex-wrap gap-2 pt-1">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => sendMessage(s)}
                    className="rounded-full border border-border px-3 py-1.5 text-xs text-foreground hover:border-brand hover:text-brand-dark"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage(input);
            }}
            className="flex items-center gap-2 border-t border-border p-3"
          >
            <label htmlFor="chat-input" className="sr-only">
              আপনার প্রশ্ন লিখুন
            </label>
            <input
              id="chat-input"
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="যেমন: প্রাইমারি শিক্ষক নিয়োগ..."
              disabled={loading}
              maxLength={500}
              className="h-11 flex-1 rounded-full border border-border bg-background px-4 text-sm outline-none focus:border-brand disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              aria-label="পাঠান"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand text-white hover:bg-brand-dark disabled:opacity-50"
            >
              ➤
            </button>
          </form>
        </div>
      )}
    </>
  );
}
