"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Two-part cursor: a dot pinned to the real pointer position and a ring that
 * lerps toward it, so the ring lags slightly and grows over anything
 * interactive. Fine pointers only, and never on touch.
 */
export function Cursor() {
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const [enabled, setEnabled] = useState(false);
  const [hover, setHover] = useState(false);

  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    setEnabled(true);

    const target = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const pos = { ...target };
    let raf = 0;

    const onMove = (e: MouseEvent) => {
      target.x = e.clientX;
      target.y = e.clientY;
      if (dot.current) {
        dot.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0) translate(-50%, -50%)`;
      }
      const el = e.target as HTMLElement | null;
      setHover(Boolean(el?.closest("a, button, [data-cursor='hover']")));
    };

    const loop = () => {
      pos.x += (target.x - pos.x) * 0.16;
      pos.y += (target.y - pos.y) * 0.16;
      if (ring.current) {
        ring.current.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0) translate(-50%, -50%)`;
      }
      raf = requestAnimationFrame(loop);
    };

    raf = requestAnimationFrame(loop);
    window.addEventListener("mousemove", onMove);
    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  if (!enabled) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[70] hidden md:block">
      <div
        ref={ring}
        className="fixed left-0 top-0 rounded-full border border-primary transition-[width,height,opacity] duration-300"
        style={{
          width: hover ? 56 : 30,
          height: hover ? 56 : 30,
          opacity: hover ? 1 : 0.5,
        }}
      />
      <div
        ref={dot}
        className="fixed left-0 top-0 h-1.5 w-1.5 rounded-full bg-primary"
      />
    </div>
  );
}
