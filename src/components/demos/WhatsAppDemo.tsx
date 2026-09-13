"use client";

import { useEffect, useRef, useState } from "react";
import { chatScript } from "@/lib/site";

/**
 * A scripted WhatsApp sequence, rendered entirely in HTML/CSS — no video
 * file, no embed, a few KB.
 *
 * Scenes: home screen → tap the icon → app opens → chat list with unread
 * badges → tap the customer → the conversation books the job.
 *
 * Colours are WhatsApp's real light theme (#008069 header, #efeae2 chat
 * wallpaper, #d9fdd3 outgoing bubble, #25d366 unread badge, #53bdeb read
 * ticks) so it reads as the actual product. This is the one place the
 * monochrome palette is deliberately broken, because a recoloured WhatsApp
 * would stop being recognisable and the whole point is that an owner
 * recognises their own phone.
 *
 * Labelled a demonstration — it is not a live bot.
 */

type Scene = "home" | "opening" | "list" | "chat";

const CHATS = [
  { name: "Maya — Brand refresh", msg: "hi, I want to refresh our brand", time: "6:02 PM", unread: 2, tint: "#6b9b8a" },
  { name: "Mum", msg: "Don't forget Sunday 😊", time: "5:41 PM", unread: 0, tint: "#a2856b" },
  { name: "Supplier — Trane", msg: "Order #4471 shipped", time: "4:12 PM", unread: 1, tint: "#7b8bb0" },
  { name: "Studio team", msg: "The latest concept is ready", time: "2:58 PM", unread: 0, tint: "#9b7b8b" },
];

export function WhatsAppDemo() {
  const ref = useRef<HTMLDivElement>(null);
  const [scene, setScene] = useState<Scene>("home");
  const [tapped, setTapped] = useState(false);
  const [rowTap, setRowTap] = useState(false);
  const [shown, setShown] = useState(0);
  const [typing, setTyping] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (still) {
      setScene("chat");
      setShown(chatScript.length);
      return;
    }

    let timers: ReturnType<typeof setTimeout>[] = [];
    const at = (ms: number, fn: () => void) => timers.push(setTimeout(fn, ms));

    function run() {
      timers.forEach(clearTimeout);
      timers = [];
      setScene("home");
      setTapped(false);
      setRowTap(false);
      setShown(0);
      setTyping(false);

      at(1100, () => setTapped(true));
      at(1500, () => setScene("opening"));
      at(2000, () => setScene("list"));
      at(3300, () => setRowTap(true));
      at(3800, () => setScene("chat"));

      const START = 4200;
      chatScript.forEach((_, i) => {
        at(START + i * 1150, () => {
          setShown(i + 1);
          setTyping(i + 1 < chatScript.length);
        });
      });
      at(START + chatScript.length * 1150, () => setTyping(false));
      at(START + chatScript.length * 1150 + 3200, run);
    }

    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        run();
      },
      { threshold: 0.35 }
    );
    io.observe(el);

    return () => {
      io.disconnect();
      timers.forEach(clearTimeout);
    };
  }, []);

  const inApp = scene === "list" || scene === "chat";

  return (
    <div ref={ref} className="flex justify-center">
      {/* phone shell */}
      <div className="relative w-[19rem] shrink-0 rounded-[2.2rem] border-[10px] border-[#15181b] bg-black shadow-[0_40px_90px_-30px_rgba(0,0,0,0.95)] sm:w-[21rem]">
        <span className="absolute left-1/2 top-0 z-30 h-5 w-24 -translate-x-1/2 rounded-b-2xl bg-[#15181b]" />

        <div className="relative h-[36rem] overflow-hidden rounded-[1.5rem] bg-[#0b141a]">
          {/* ---------- home screen ---------- */}
          <div
            className={`absolute inset-0 transition-all duration-500 ${
              scene === "home" ? "opacity-100" : "scale-110 opacity-0"
            }`}
            style={{
              background:
                "linear-gradient(165deg,#20303a 0%,#131c22 55%,#0b141a 100%)",
            }}
          >
            <p className="pt-12 text-center text-5xl font-light text-white/90">
              6:02
            </p>
            <p className="mt-1 text-center text-xs text-white/50">
              Tuesday, 14 July
            </p>

            <div className="mt-14 grid grid-cols-4 gap-y-7 px-7">
              {["#3a5a7d", "#7d5a3a", "#5a7d3a", "#7d3a5a", "#3a7d75", "#55507d"].map(
                (c, i) => (
                  <div key={i} className="flex flex-col items-center gap-1.5">
                    <span
                      className="h-11 w-11 rounded-[0.85rem]"
                      style={{ background: c, opacity: 0.55 }}
                    />
                    <span className="h-1.5 w-7 rounded bg-white/20" />
                  </div>
                )
              )}

              {/* the WhatsApp icon */}
              <div className="relative col-start-1 flex flex-col items-center gap-1.5">
                <span
                  className={`relative flex h-11 w-11 items-center justify-center rounded-[0.85rem] transition-transform duration-300 ${
                    tapped ? "scale-90" : "scale-100"
                  }`}
                  style={{
                    background: "linear-gradient(160deg,#25d366,#128c7e)",
                    boxShadow: "0 6px 16px rgba(37,211,102,.35)",
                  }}
                >
                  <WaGlyph />
                  {tapped && (
                    <span className="absolute inset-0 animate-ping rounded-[0.85rem] bg-white/40" />
                  )}
                </span>
                <span className="text-[0.6rem] text-white/80">WhatsApp</span>
                {/* fingertip */}
                <span
                  className={`pointer-events-none absolute -right-1 top-6 h-7 w-7 rounded-full border-2 border-white/70 bg-white/20 transition-all duration-700 ${
                    tapped ? "scale-75 opacity-100" : "scale-125 opacity-0"
                  }`}
                />
              </div>
            </div>
          </div>

          {/* ---------- app (list + chat share the shell) ---------- */}
          <div
            className={`absolute inset-0 origin-[15%_58%] transition-all duration-500 ${
              inApp ? "scale-100 opacity-100" : "pointer-events-none scale-[0.15] opacity-0"
            }`}
          >
            {/* header */}
            <div className="flex items-center gap-3 bg-[#008069] px-4 pb-3 pt-7 text-white">
              {scene === "chat" ? (
                <>
                  <span className="text-lg leading-none">‹</span>
                  <span
                    className="flex h-8 w-8 items-center justify-center rounded-full text-[0.62rem] font-bold text-white"
                    style={{ background: CHATS[0].tint }}
                  >
                    D
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{CHATS[0].name}</p>
                    <p className="text-[0.62rem] text-white/75">online</p>
                  </div>
                </>
              ) : (
                <>
                  <p className="flex-1 text-lg font-semibold">WhatsApp</p>
                  <span className="text-base opacity-90">⌕</span>
                  <span className="text-base opacity-90">⋮</span>
                </>
              )}
            </div>

            {/* chat list */}
            <div
              className={`absolute inset-x-0 bottom-0 top-[4.4rem] bg-white transition-transform duration-400 ${
                scene === "chat" ? "-translate-x-full" : "translate-x-0"
              }`}
            >
              {CHATS.map((c, i) => (
                <div
                  key={c.name}
                  className={`flex items-center gap-3 border-b border-[#f0f2f5] px-4 py-3 transition-colors duration-200 ${
                    i === 0 && rowTap ? "bg-[#e9edef]" : "bg-white"
                  }`}
                >
                  <span
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white"
                    style={{ background: c.tint }}
                  >
                    {c.name[0]}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[0.82rem] font-semibold text-[#111b21]">
                      {c.name}
                    </p>
                    <p className="truncate text-[0.72rem] text-[#667781]">{c.msg}</p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    <span
                      className={`text-[0.6rem] ${c.unread ? "text-[#25d366]" : "text-[#667781]"}`}
                    >
                      {c.time}
                    </span>
                    {c.unread > 0 && (
                      <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-[#25d366] px-1 text-[0.6rem] font-bold text-white">
                        {c.unread}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* conversation */}
            {/*
              Thread fills from the TOP. It previously used justify-end, which
              parked a short conversation at the bottom and left a large empty
              band above it, and the newest bubbles ended up tucked behind the
              composer. Now: a flex column, the messages take the remaining
              space and start at the top, and the composer is a fixed-height
              sibling that can never overlap them.
            */}
            <div
              className={`absolute inset-x-0 bottom-0 top-[4.4rem] flex flex-col overflow-hidden transition-transform duration-400 ${
                scene === "chat" ? "translate-x-0" : "translate-x-full"
              }`}
              style={{
                background: "#efeae2",
                backgroundImage:
                  "radial-gradient(circle at 15% 25%, rgba(0,0,0,.035) 0 3px, transparent 4px), radial-gradient(circle at 65% 55%, rgba(0,0,0,.03) 0 4px, transparent 5px), radial-gradient(circle at 88% 82%, rgba(0,0,0,.032) 0 3px, transparent 4px)",
                backgroundSize: "120px 120px",
              }}
            >
              {/*
                justify-end so the thread grows UPWARD from the composer and
                fills the whole panel, with the oldest messages clipped off
                under the header — which is exactly where messages disappear
                in the real app. Enough are kept in view that the area is
                never half empty.
              */}
              <div className="flex min-h-0 flex-1 flex-col justify-end gap-1 overflow-hidden px-3 pt-3">
              {chatScript.slice(0, shown).slice(-9).map((m, i) => {
                const mine = m.from === "us";
                return (
                  <div
                    key={`${m.text}-${i}`}
                    className={`max-w-[80%] px-2.5 py-1.5 text-[0.76rem] leading-snug text-[#111b21] shadow-[0_1px_0.5px_rgba(11,20,26,.13)] ${
                      mine ? "self-end" : "self-start"
                    }`}
                    style={{
                      background: mine ? "#d9fdd3" : "#ffffff",
                      borderRadius: "0.5rem",
                      borderTopRightRadius: mine ? "0" : "0.5rem",
                      borderTopLeftRadius: mine ? "0.5rem" : "0",
                      animation: "bubble-in .28s var(--ease-soft) both",
                    }}
                  >
                    {m.text}
                    <span className="ml-1.5 inline-flex items-baseline gap-0.5 align-bottom text-[0.55rem] text-[#667781]">
                      6:0{Math.min(9, 2 + i)}
                      {mine && <span className="text-[#53bdeb]">✓✓</span>}
                    </span>
                  </div>
                );
              })}

              {typing && (
                <div className="flex w-fit gap-1 self-start rounded-lg bg-white px-3 py-2.5 shadow-[0_1px_0.5px_rgba(11,20,26,.13)]">
                  {[0, 1, 2].map((d) => (
                    <span
                      key={d}
                      className="h-1.5 w-1.5 rounded-full bg-[#667781]"
                      style={{ animation: `dot-pulse 1.2s ${d * 0.15}s infinite` }}
                    />
                  ))}
                </div>
              )}
              </div>

              {/* composer sits outside the message column so it can never
                  cover the newest bubble */}
              <div className="flex shrink-0 items-center gap-2 px-3 pb-3 pt-2">
                <div className="flex-1 rounded-full bg-white px-3 py-2 text-[0.7rem] text-[#8696a0]">
                  Message
                </div>
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#00a884] text-xs text-white">
                  ➤
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function WaGlyph() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden="true">
      <path
        fill="#fff"
        d="M12 2.2A9.7 9.7 0 0 0 3.6 16.8L2.4 21.6l4.9-1.2A9.7 9.7 0 1 0 12 2.2Zm5.3 13.6c-.2.6-1.2 1.2-1.7 1.2-.5 0-.9.2-3-.9s-3.4-3.5-3.5-3.7c-.1-.2-.8-1.1-.8-2.1s.5-1.5.7-1.7c.2-.2.4-.3.6-.3h.4c.2 0 .4 0 .6.5l.7 1.7c.1.2.1.4 0 .5l-.3.4-.3.3c-.1.1-.2.3 0 .5.2.3.7 1.1 1.4 1.7.9.8 1.6 1 1.9 1.2.2.1.4 0 .5-.1l.7-.8c.2-.2.3-.2.5-.1l1.6.8c.2.1.4.2.4.3.1.1.1.5-.1 1Z"
      />
    </svg>
  );
}
