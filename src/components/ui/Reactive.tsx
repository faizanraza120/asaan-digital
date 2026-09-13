"use client";

import { useRef, type ReactNode } from "react";

/**
 * Pointer-reactive surface. Writes --px/--py so CSS can draw a light where
 * the cursor is (the `.sheen` utility in globals.css). All the work is CSS,
 * this only reports coordinates, so it stays well under a kilobyte and
 * never triggers layout.
 */
export function Reactive({
  children,
  as: Tag = "div",
  className = "",
}: {
  children: ReactNode;
  as?: "div" | "section" | "a";
  className?: string;
}) {
  const ref = useRef<HTMLElement>(null);

  function onMove(e: React.PointerEvent) {
    const el = ref.current;
    if (!el || e.pointerType !== "mouse") return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--px", `${e.clientX - r.left}px`);
    el.style.setProperty("--py", `${e.clientY - r.top}px`);
  }

  return (
    // @ts-expect-error — polymorphic tag, ref type is compatible at runtime
    <Tag ref={ref} onPointerMove={onMove} className={className}>
      {children}
    </Tag>
  );
}
