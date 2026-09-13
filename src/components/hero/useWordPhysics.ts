"use client";

import { useCallback, useEffect, useRef } from "react";

/**
 * Rigid body physics for the headline words.
 *
 * Each word is a body with a position offset, a velocity and an angular
 * velocity. A blast gives every word an impulse pointing away from the blast
 * origin, scaled by distance and by how long the charge was held, plus an
 * upward kick, so the line looks like it was floating and got knocked out of
 * the air. Gravity takes over, the words bounce off the floor and the walls
 * of the hero, collide with each other and pile up, tip flat, slide to a
 * stop, and then lift back into place. A hero that stays broken after one
 * gesture is a hero that has thrown away its own headline.
 *
 * Everything is expressed as a transform on the word span. No absolute
 * positioning, so the layout underneath never changes and the h1 stays a
 * single readable block of real text for a crawler or a screen reader.
 */

const GRAVITY = 2600; // px per second squared
const RESTITUTION = 0.3; // energy kept on each bounce off the floor
const WALL_RESTITUTION = 0.5;
const FLOOR_FRICTION = 0.86; // horizontal energy kept per frame on the ground
const SPIN_FRICTION = 0.82;
/**
 * How fast a grounded word tips flat. This is the single biggest lever on
 * how long the whole thing takes: too low and a word that spun several turns
 * spends seconds unwinding before it is allowed to sleep.
 */
const FLATTEN = 6;
const AIR_DRAG = 0.999;
/** A body is done when it is supported and this slow in every axis. */
const REST_V = 34;
const REST_SPIN = 0.7;
const SETTLE_HOLD = 450; // ms lying there before it lifts back
const RESTORE_MS = 750;
/** Passes per frame resolving word against word. More passes, firmer pile. */
const COLLISION_PASSES = 3;

type Body = {
  el: HTMLElement;
  x: number;
  y: number;
  vx: number;
  vy: number;
  rot: number; // radians
  vrot: number;
  /** Resting box, captured at blast time. Collisions work off this plus x/y. */
  w: number;
  h: number;
  restLeft: number;
  restTop: number;
  /** Limits, as offsets from the resting position. */
  floor: number;
  left: number;
  right: number;
  ceiling: number;
  grounded: boolean;
  asleep: boolean;
};

type Phase = "idle" | "falling" | "restoring";

export function useWordPhysics(containerRef: React.RefObject<HTMLElement | null>) {
  const bodies = useRef<Body[]>([]);
  const phase = useRef<Phase>("idle");
  const raf = useRef(0);

  /** Word spans register themselves as they mount. */
  const registerWord = useCallback((el: HTMLElement | null) => {
    if (!el) return;
    if (!bodies.current.some((b) => b.el === el)) {
      bodies.current.push({
        el,
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
        rot: 0,
        vrot: 0,
        w: 0,
        h: 0,
        restLeft: 0,
        restTop: 0,
        floor: 0,
        left: 0,
        right: 0,
        ceiling: 0,
        grounded: false,
        asleep: true,
      });
    }
  }, []);

  /** Did this point land on an actual word, rather than the gap beside it? */
  const hitTest = useCallback((x: number, y: number) => {
    return bodies.current.some((b) => {
      const r = b.el.getBoundingClientRect();
      return x >= r.left - 8 && x <= r.right + 8 && y >= r.top - 4 && y <= r.bottom + 4;
    });
  }, []);

  const paint = (b: Body) => {
    b.el.style.transform = `translate3d(${b.x.toFixed(2)}px, ${b.y.toFixed(2)}px, 0) rotate(${b.rot.toFixed(4)}rad)`;
  };

  const drop = useCallback(
    (originX: number, originY: number, strength = 1) => {
      // Only accept a fresh blast from rest, so impulses can never compound
      // into words flying off the screen.
      if (phase.current !== "idle") return;
      const container = containerRef.current;
      if (!container) return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      const bounds = container.getBoundingClientRect();
      const floorY = bounds.bottom - 18;

      for (const b of bodies.current) {
        const r = b.el.getBoundingClientRect();
        const cx = r.left + r.width / 2;
        const cy = r.top + r.height / 2;
        const dx = cx - originX;
        const dy = cy - originY;
        const dist = Math.hypot(dx, dy) || 1;
        // Words near the blast take almost all of it, far ones barely move,
        // and the whole impulse scales with how long the charge was held.
        const falloff = Math.max(0.12, 1 - dist / 1200) * strength;

        b.x = 0;
        b.y = 0;
        b.rot = 0;
        b.vx = (dx / dist) * 900 * falloff;
        b.vy = (dy / dist) * 700 * falloff - 340 * falloff;
        b.vrot = (dx / dist) * 3.4 * falloff;

        b.w = r.width;
        b.h = r.height;
        b.restLeft = r.left;
        b.restTop = r.top;

        // Everything falls to the real floor. Words come to rest on the
        // ground or on each other, never at a height computed from which
        // line they happened to start on.
        b.floor = floorY - r.bottom;
        b.left = bounds.left + 10 - r.left;
        b.right = bounds.right - 10 - r.right;
        b.ceiling = bounds.top + 10 - r.top;
        b.grounded = false;
        b.asleep = false;
      }

      phase.current = "falling";
    },
    [containerRef],
  );

  useEffect(() => {
    let last = performance.now();
    let settledAt = 0;
    let restoreFrom: { x: number; y: number; rot: number }[] = [];
    let restoreStart = 0;
    let lastPhase: Phase = "idle";
    let phaseSince = performance.now();

    /** Current screen box of a body, ignoring rotation. */
    const boxOf = (b: Body) => ({
      left: b.restLeft + b.x,
      top: b.restTop + b.y,
      right: b.restLeft + b.x + b.w,
      bottom: b.restTop + b.y + b.h,
    });

    /**
     * Word against word. Overlaps are pushed apart along whichever axis is
     * cheapest to fix, which is what makes a stack of words hold together
     * instead of every one of them sinking to the same floor.
     */
    const resolveCollisions = () => {
      const list = bodies.current;
      for (let pass = 0; pass < COLLISION_PASSES; pass++) {
        for (let i = 0; i < list.length; i++) {
          for (let j = i + 1; j < list.length; j++) {
            const a = list[i];
            const c = list[j];
            const A = boxOf(a);
            const C = boxOf(c);

            // Tight boxes: glyphs never fill their line box, so a literal
            // box test leaves visible gaps in the pile.
            const padX = a.w * 0.06 + c.w * 0.06;
            const padY = a.h * 0.22 + c.h * 0.22;

            const overlapX =
              Math.min(A.right, C.right) - Math.max(A.left, C.left) - padX;
            const overlapY =
              Math.min(A.bottom, C.bottom) - Math.max(A.top, C.top) - padY;
            if (overlapX <= 0 || overlapY <= 0) continue;

            if (overlapY < overlapX) {
              // Vertical separation: the higher body sits on the lower one.
              const upper = A.top < C.top ? a : c;
              const lower = upper === a ? c : a;
              upper.y -= overlapY / 2;
              lower.y += overlapY / 2;
              const rel = upper.vy - lower.vy;
              if (rel > 0) {
                upper.vy = -rel * 0.18 + lower.vy;
                lower.vy = Math.min(lower.vy, 0);
              }
              upper.grounded = true;
              upper.vx *= 0.9;
              upper.vrot *= 0.85;
            } else {
              const leftB = A.left < C.left ? a : c;
              const rightB = leftB === a ? c : a;
              leftB.x -= overlapX / 2;
              rightB.x += overlapX / 2;
              const rel = leftB.vx - rightB.vx;
              if (rel > 0) {
                leftB.vx = -rel * 0.25 + rightB.vx;
                rightB.vx = -rightB.vx * 0.25 + leftB.vx;
              }
            }
          }
        }
      }
    };

    const frame = (now: number) => {
      raf.current = requestAnimationFrame(frame);
      const dt = Math.min((now - last) / 1000, 1 / 30); // clamp after a stall
      last = now;

      if (phase.current !== lastPhase) {
        lastPhase = phase.current;
        phaseSince = now;
      }

      /*
       * Watchdog. A body that somehow never comes to rest would leave the
       * phase stuck and the headline scattered on the floor permanently,
       * with no gesture able to bring it back. Nothing here should take
       * more than about four seconds, so anything past nine is wrong and
       * gets put back by force. It is a safety net and should never fire in
       * normal use, which is why it sits well clear of the real timings.
       */
      if (phase.current !== "idle" && now - phaseSince > 9000) {
        for (const b of bodies.current) {
          b.el.style.transform = "";
          b.x = b.y = b.vx = b.vy = b.rot = b.vrot = 0;
          b.asleep = true;
        }
        phase.current = "idle";
        return;
      }

      if (phase.current === "falling") {
        for (const b of bodies.current) {
          if (b.asleep) continue;

          b.vy += GRAVITY * dt;
          b.vx *= AIR_DRAG;
          b.x += b.vx * dt;
          b.y += b.vy * dt;
          b.rot += b.vrot * dt;
          b.grounded = false;

          /*
           * A tilted word covers more ground than a flat one, and by exactly
           * this much. Using the live angle rather than a fixed inset means
           * a tumbling word stops short of the edge while a settled one
           * still comes to rest flush against it.
           */
          const sin = Math.abs(Math.sin(b.rot));
          const cos = Math.abs(Math.cos(b.rot));
          const sagY = (sin * b.w + cos * b.h - b.h) / 2;
          const sagX = (cos * b.w + sin * b.h - b.w) / 2;

          // Walls and ceiling: reverse, lose energy, pick up spin from the
          // scrape.
          const left = b.left + sagX;
          const right = b.right - sagX;
          if (b.x <= left || b.x >= right) {
            b.x = b.x <= left ? left : right;
            b.vx = -b.vx * WALL_RESTITUTION;
            b.vrot = -b.vrot * 0.7;
          }
          if (b.y <= b.ceiling + sagY) {
            b.y = b.ceiling + sagY;
            b.vy = -b.vy * 0.4;
          }

          const floor = b.floor - sagY;
          if (b.y >= floor) {
            b.y = floor;
            b.grounded = true;
            if (b.vy > 0) b.vy = -b.vy * RESTITUTION;
          }
        }

        resolveCollisions();

        // Ground behaviour and sleeping, after contacts are known.
        let allAsleep = true;
        for (const b of bodies.current) {
          if (b.asleep) continue;

          if (b.grounded) {
            // A word that tumbled through several turns is visually the same
            // as one that turned a fraction, so unwind the whole revolutions
            // first. Without this it spends seconds rotating back through
            // angles nobody can tell apart.
            b.rot = ((b.rot + Math.PI) % (Math.PI * 2)) - Math.PI;

            // Friction, and a word lying on the ground tips flat rather
            // than balancing on a corner. Easing the angle instead of
            // snapping it is the difference between settling and freezing.
            b.vx *= FLOOR_FRICTION;
            b.vrot *= SPIN_FRICTION;
            b.rot += (0 - b.rot) * FLATTEN * dt;

            if (
              Math.abs(b.vy) < REST_V &&
              Math.abs(b.vx) < REST_V &&
              Math.abs(b.vrot) < REST_SPIN &&
              Math.abs(b.rot) < 0.06
            ) {
              b.vx = b.vy = b.vrot = 0;
              b.rot = 0;
              b.asleep = true;
            }
          }

          if (!b.asleep) allAsleep = false;
          paint(b);
        }

        if (allAsleep) {
          settledAt = now;
          phase.current = "restoring";
          restoreFrom = bodies.current.map((b) => ({ x: b.x, y: b.y, rot: b.rot }));
          restoreStart = 0;
        }
      } else if (phase.current === "restoring") {
        if (!restoreStart) {
          if (now - settledAt < SETTLE_HOLD) return; // lie there a beat first
          restoreStart = now;
        }
        const t = Math.min(1, (now - restoreStart) / RESTORE_MS);
        // Soft ease out, the same curve the rest of the site reveals on.
        const e = 1 - Math.pow(1 - t, 3);

        bodies.current.forEach((b, i) => {
          const from = restoreFrom[i];
          if (!from) return;
          b.x = from.x * (1 - e);
          b.y = from.y * (1 - e);
          b.rot = from.rot * (1 - e);
          paint(b);
        });

        if (t >= 1) {
          for (const b of bodies.current) {
            b.el.style.transform = "";
            b.asleep = true;
          }
          phase.current = "idle";
        }
      }
    };

    raf.current = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf.current);
  }, []);

  return { registerWord, drop, hitTest };
}
