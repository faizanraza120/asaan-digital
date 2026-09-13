"use client";

import { useEffect, useRef } from "react";

type Node = {
  x: number;
  y: number;
  /** Rest position. Every node springs back to it once nothing disturbs it. */
  ox: number;
  oy: number;
  vx: number;
  vy: number;
};

/**
 * The line field. A grid of nodes joined into horizontal rows, each one
 * pushed away from the pointer and pulled back to its rest position by a
 * spring.
 *
 * One gesture drives everything: press and hold to charge, release to fire.
 * The charge is a single 0 to 1 scalar, and it decides the blast power, how
 * far the shockwave reaches, how hard the field rattles, and whether the
 * headline gets knocked out of the air. A quick click is a small local pop.
 * A full two second hold throws the whole field off screen and it swings
 * back over about a second, overshooting a couple of times on the way in
 * rather than sliding home like a drawer.
 *
 * Everything is one rAF loop writing to a 2D context. No WebGL, no library,
 * nothing to hydrate.
 */

/** Spring pulling each node home, and the energy it keeps each frame. */
const SPRING = 0.04;
const DAMPING = 0.91;
/** Below this charge a release is treated as an ordinary click. */
export const ARMED_AT = 0.25;

export function HeroCanvas({
  onRelease,
}: {
  /** Fires on release with the pointer position and the charge it reached. */
  onRelease?: (clientX: number, clientY: number, charge: number) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // Kept in a ref so a changing callback identity never rebuilds the field.
  const releaseRef = useRef(onRelease);
  releaseRef.current = onRelease;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // Pointer events bind to the section rather than the canvas, so the
    // gesture also works on touch, where the canvas itself is transparent to
    // gestures so the page can still be scrolled over the hero.
    const host: HTMLElement = canvas.parentElement ?? canvas;

    // Read the accent straight off the stylesheet so the charge ring can
    // never drift out of sync with the palette.
    const accent = getComputedStyle(document.documentElement)
      .getPropertyValue("--color-primary")
      .trim();

    let width = 0;
    let height = 0;
    let cols = 0;
    let rows = 0;
    let nodes: Node[] = [];
    const gap = 46;
    const mouse = { x: -9999, y: -9999, down: false, charge: 0 };
    let raf = 0;
    let running = false;
    /**
     * Detonation shock, 1 down to 0. While it burns off, every node gets a
     * random jitter added to its velocity, which is the vibrate: the field
     * does not just move outward, it rattles as it goes.
     */
    let shock = 0;

    const build = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cols = Math.ceil(width / gap) + 1;
      rows = Math.ceil(height / gap) + 1;
      nodes = [];
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const px = x * gap;
          const py = y * gap;
          nodes.push({ x: px, y: py, ox: px, oy: py, vx: 0, vy: 0 });
        }
      }
    };

    /**
     * Spend the accumulated charge as one outward impulse. Power and reach
     * both scale with the charge, so a full hold is a grenade and a tap is a
     * nudge. Distance is floored so a node sitting directly under the blast
     * cannot take a near infinite impulse.
     */
    const blast = () => {
      const c = mouse.charge;
      // Steep curve on purpose. A tap should be a local ripple and a full
      // hold should throw the entire field, so the difference between two
      // hold lengths is obvious without having to compare them side by side.
      const power = 60 + Math.pow(c, 1.7) * 5200;
      const reach = 260 + c * Math.max(width, height) * 1.5;

      for (const n of nodes) {
        const dx = n.x - mouse.x;
        const dy = n.y - mouse.y;
        const dist = Math.max(60, Math.hypot(dx, dy));
        if (dist > reach) continue;
        const force = (power / dist) * (1 - dist / reach);
        n.vx += (dx / dist) * force;
        n.vy += (dy / dist) * force;
      }

      shock = c;
      mouse.charge = 0;
    };

    const paint = () => {
      ctx.clearRect(0, 0, width, height);
      ctx.lineWidth = 1;
      ctx.globalAlpha = 1;
      ctx.strokeStyle = "rgba(255,255,255,0.13)";
      for (let y = 0; y < rows; y++) {
        ctx.beginPath();
        for (let x = 0; x < cols; x++) {
          const n = nodes[y * cols + x];
          if (x === 0) ctx.moveTo(n.x, n.y);
          else ctx.lineTo(n.x, n.y);
        }
        ctx.stroke();
      }

      if (mouse.charge > 0.02) {
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, 8 + mouse.charge * 70, 0, Math.PI * 2);
        ctx.globalAlpha = 0.15 + mouse.charge * 0.6;
        ctx.strokeStyle = accent;
        ctx.stroke();
        ctx.globalAlpha = 1;
      }
    };

    const step = () => {
      const radius = 150 + mouse.charge * 120;

      for (const n of nodes) {
        const dx = n.x - mouse.x;
        const dy = n.y - mouse.y;
        const dist = Math.hypot(dx, dy) || 1;
        if (dist < radius) {
          const force = ((radius - dist) / radius) * 2.2;
          n.vx += (dx / dist) * force;
          n.vy += (dy / dist) * force;
        }

        if (shock > 0) {
          const j = shock * 14;
          n.vx += (Math.random() - 0.5) * j;
          n.vy += (Math.random() - 0.5) * j;
        }

        n.vx += (n.ox - n.x) * SPRING;
        n.vy += (n.oy - n.y) * SPRING;
        n.vx *= DAMPING;
        n.vy *= DAMPING;
        n.x += n.vx;
        n.y += n.vy;
      }

      if (shock > 0) shock = Math.max(0, shock - 0.055);
      if (mouse.down) mouse.charge = Math.min(1, mouse.charge + 0.014);
      paint();
      raf = requestAnimationFrame(step);
    };

    const start = () => {
      if (running || reduced) return;
      running = true;
      raf = requestAnimationFrame(step);
    };

    const stop = () => {
      if (!running) return;
      running = false;
      cancelAnimationFrame(raf);
    };

    const track = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    };

    const onMove = (e: PointerEvent) => track(e);

    const onDown = (e: PointerEvent) => {
      // The CTA is a link first and a blast trigger never.
      if ((e.target as HTMLElement | null)?.closest("a, button")) return;
      track(e);
      mouse.down = true;
    };

    const onUp = (e: PointerEvent) => {
      if (!mouse.down) return;
      const charge = mouse.charge;
      mouse.down = false;
      blast();
      releaseRef.current?.(e.clientX, e.clientY, charge);
    };

    const onLeave = () => {
      mouse.x = -9999;
      mouse.y = -9999;
      mouse.down = false;
      mouse.charge = 0;
    };

    const onResize = () => {
      build();
      if (!running) paint();
    };

    build();
    paint();

    if (reduced) {
      // Static field, still visible, no motion and no gesture.
      window.addEventListener("resize", onResize);
      return () => window.removeEventListener("resize", onResize);
    }

    // Stop the loop the moment the hero leaves the viewport. Nothing below
    // the fold should be paying for a field nobody is looking at.
    const io = new IntersectionObserver(
      ([entry]) => (entry.isIntersecting ? start() : stop()),
      { threshold: 0 },
    );
    io.observe(canvas);

    window.addEventListener("resize", onResize);
    host.addEventListener("pointermove", onMove);
    host.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);
    host.addEventListener("pointerleave", onLeave);

    return () => {
      io.disconnect();
      stop();
      window.removeEventListener("resize", onResize);
      host.removeEventListener("pointermove", onMove);
      host.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      host.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      // Coarse pointers pass their gestures straight through to the page, so
      // a finger can still scroll over a full height hero.
      className="absolute inset-0 h-full w-full [@media(pointer:coarse)]:pointer-events-none"
    />
  );
}
