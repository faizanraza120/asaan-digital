"use client";

import { useEffect, useRef, useState } from "react";
import { process } from "@/lib/site";

/**
 * How it goes, ported from apps/studio-site's Pipeline component: a
 * serpentine road on desktop, a straight rail on mobile. The stretch already
 * scrolled past is a solid glowing stroke, the road ahead stays a grey
 * dashed line, and steps light up as the stroke reaches them.
 *
 * Two decisions carried over unchanged because they are what make it smooth:
 *  1. The stroke offset is written DIRECTLY to the DOM node inside rAF.
 *     Calling setState every scroll frame re-renders React 60x/s and drops
 *     frames.
 *  2. No CSS transition on the offset. A transition makes the draw chase
 *     the scrollbar a frame or two behind; mapping straight from scroll
 *     position keeps it locked 1:1.
 *
 * React only re-renders when the number of lit nodes actually changes.
 */

/**
 * viewBox is 600 x 1200, drawn with preserveAspectRatio="none" so x maps to
 * a percentage of the container width and y to a percentage of its height.
 * Percentage-based positioning of the HTML overlay therefore lands on
 * exactly the same point the stretched SVG curve does, regardless of the
 * container's real pixel size.
 */
const PATH =
  "M300 10 C 300 110, 450 150, 450 250 S 150 380, 150 480 S 450 610, 450 700 S 150 850, 150 950 C 140 1010, 122 1028, 114 1036";

/**
 * The exact turns. Each is the literal end point of a segment where the
 * curve reverses horizontal direction — read straight off PATH above, not
 * eyeballed — so a step's icon sits at the precise spot the road bends back
 * on itself, not somewhere approximately near it.
 */
const TURNS: { x: number; y: number; side: "left" | "right" }[] = [
  { x: 450, y: 250, side: "right" },
  { x: 150, y: 480, side: "left" },
  { x: 450, y: 700, side: "right" },
  { x: 150, y: 950, side: "left" },
];

/**
 * The cumulative `d` up to each turn, used once on mount to measure the
 * exact arc-length fraction at that point (see the length-fraction
 * calculation below). Order matches TURNS.
 */
const D_UP_TO_TURN = [
  "M300 10 C 300 110, 450 150, 450 250",
  "M300 10 C 300 110, 450 150, 450 250 S 150 380, 150 480",
  "M300 10 C 300 110, 450 150, 450 250 S 150 380, 150 480 S 450 610, 450 700",
  "M300 10 C 300 110, 450 150, 450 250 S 150 380, 150 480 S 450 610, 450 700 S 150 850, 150 950",
];

/** Screen pixels the icon sits clear of the stroke, so both stay legible. */
const ICON_CLEARANCE = 26;

export function Process() {
  const wrap = useRef<HTMLDivElement>(null);
  const glow = useRef<SVGPathElement>(null);
  const rail = useRef<HTMLDivElement>(null);
  const [lit, setLit] = useState(0);
  // Arc-length fraction of each turn. Falls back to a rough estimate until
  // the effect below measures it exactly, so the very first frame still has
  // a sane value.
  const nodeAt = useRef<number[]>([0.08, 0.34, 0.6, 0.9]);

  useEffect(() => {
    const path = glow.current;
    if (!path) return;

    const len = path.getTotalLength();
    path.style.strokeDasharray = String(len);

    /*
     * Measure exactly where each turn falls along the path, rather than
     * guessing a fraction. A temporary, unattached path sharing the same
     * `d` up to each turn gives its exact length, and dividing by the full
     * path length gives the fraction — so "lit" fires the instant the drawn
     * stroke visually reaches that turn, not roughly around when it does.
     */
    const svgNS = "http://www.w3.org/2000/svg";
    const probe = document.createElementNS(svgNS, "path");
    nodeAt.current = D_UP_TO_TURN.map((d) => {
      probe.setAttribute("d", d);
      return probe.getTotalLength() / len;
    });

    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (still) {
      path.style.strokeDashoffset = "0";
      if (rail.current) rail.current.style.transform = "scaleY(1)";
      setLit(process.length);
      return;
    }

    let frame = 0;
    let lastLit = -1;

    function read() {
      frame = 0;
      const el = wrap.current;
      if (!el) return;

      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      // Linear map: 0 when the block's top sits at 78% of the viewport, 1
      // once its bottom has risen past 60%. Same curve on every device.
      const span = r.height + vh * 0.18;
      const p = Math.min(1, Math.max(0, (vh * 0.78 - r.top) / span));

      // Written straight to the DOM, no React involved.
      path!.style.strokeDashoffset = String(len - len * p);
      if (rail.current) rail.current.style.transform = `scaleY(${p})`;

      const count = nodeAt.current.filter((n) => p >= n).length;
      if (count !== lastLit) {
        lastLit = count;
        setLit(count);
      }
    }

    function onScroll() {
      if (!frame) frame = requestAnimationFrame(read);
    }

    read();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <section
      id="process"
      className="px-6 py-24 md:px-10 md:py-36"
    >
      <p className="label-xs mb-5">How it goes</p>
      <h2 className="display max-w-3xl text-[clamp(1.9rem,4vw,3.6rem)]">
        From first idea <span className="text-primary">to useful momentum</span>
      </h2>

      <div ref={wrap} className="relative mt-12 lg:mt-16">
        {/* ---------- desktop: the serpentine ---------- */}
        <div className="relative hidden lg:block" style={{ height: 1180 }}>
          <svg
            viewBox="0 0 600 1200"
            preserveAspectRatio="none"
            aria-hidden="true"
            className="absolute inset-0 h-full w-full"
          >
            {/* the road ahead */}
            <path
              d={PATH}
              fill="none"
              stroke="var(--color-line)"
              strokeWidth="2.5"
              strokeDasharray="10 12"
              strokeLinecap="round"
            />
            {/* the stretch travelled */}
            <path
              ref={glow}
              d={PATH}
              fill="none"
              stroke="var(--color-foreground)"
              strokeWidth="2.5"
              strokeLinecap="round"
              style={{
                filter:
                  "drop-shadow(0 0 6px rgba(216,216,216,.55)) drop-shadow(0 0 18px rgba(216,216,216,.3))",
              }}
            />
          </svg>

          {process.map((step, i) => {
            const on = lit > i;
            const turn = TURNS[i];
            const right = turn.side === "right";
            return (
              <div
                key={step.n}
                // Anchored on whichever edge the icon sits against, so the
                // group's intrinsic width extends away from the turn rather
                // than from a fixed 38% box. `left`/`right` here land the
                // anchor at the turn's exact x; the translate then shifts
                // the whole group ICON_CLEARANCE px further still, so the
                // icon's near edge clears the stroke instead of sitting on
                // top of it.
                className="absolute flex items-start gap-5"
                style={
                  right
                    ? {
                        left: `${(turn.x / 600) * 100}%`,
                        top: `${(turn.y / 1200) * 100}%`,
                        transform: `translate(${ICON_CLEARANCE}px, -50%)`,
                      }
                    : {
                        right: `${100 - (turn.x / 600) * 100}%`,
                        top: `${(turn.y / 1200) * 100}%`,
                        transform: `translate(${-ICON_CLEARANCE}px, -50%)`,
                      }
                }
              >
                {!right && <StepText step={step} on={on} align="right" />}

                {/*
                  No card, no number. The icon is what the road actually
                  arrives at, so it is the thing that lights and it is sized
                  to carry the step on its own rather than sitting as a small
                  bullet next to the real content.
                */}
                <span
                  className={`flex h-20 w-20 shrink-0 items-center justify-center rounded-full border transition-all duration-500 ${
                    on
                      ? "border-foreground/60 bg-foreground/10 shadow-[0_0_26px_rgba(216,216,216,0.3)]"
                      : "border-line"
                  }`}
                >
                  <StepIcon i={i} on={on} />
                </span>

                {right && <StepText step={step} on={on} align="left" />}
              </div>
            );
          })}
        </div>

        {/* ---------- mobile: a straight rail ---------- */}
        <div className="relative lg:hidden">
          <div
            aria-hidden="true"
            className="absolute bottom-2 left-[21px] top-2 w-px border-l-2 border-dashed border-line"
          />
          <div
            ref={rail}
            aria-hidden="true"
            className="absolute left-[21px] top-2 w-px origin-top bg-foreground"
            style={{
              height: "calc(100% - 1rem)",
              transform: "scaleY(0)",
              filter: "drop-shadow(0 0 6px rgba(216,216,216,.5))",
            }}
          />
          <ol className="space-y-10">
            {process.map((step, i) => {
              const on = lit > i;
              return (
                <li key={step.n} className="relative pl-[4.75rem]">
                  <span
                    className={`absolute left-0 top-0 flex h-16 w-16 items-center justify-center rounded-full border bg-background transition-all duration-500 ${
                      on
                        ? "border-foreground/60 shadow-[0_0_22px_rgba(216,216,216,0.3)]"
                        : "border-line"
                    }`}
                  >
                    <StepIcon i={i} on={on} />
                  </span>
                  <div
                    className={`pt-1 transition-all duration-500 ${
                      on ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
                    }`}
                    style={{ transitionDelay: on ? "150ms" : "0ms" }}
                  >
                    <p className="display text-2xl">{step.title}</p>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {step.body}
                    </p>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}

/**
 * Title and body for a step. Split out because the JSX now needs to render
 * this on either side of the icon depending on which edge the icon has
 * pinned to. `align` mirrors the text so it reads toward the icon rather
 * than every step reading left-to-right regardless of which way its icon
 * lies.
 */
function StepText({
  step,
  on,
  align,
}: {
  step: (typeof process)[number];
  on: boolean;
  align: "left" | "right";
}) {
  return (
    <div
      className={`w-72 max-w-[70vw] shrink-0 pt-4 transition-all duration-500 ${
        align === "right" ? "text-right" : ""
      } ${on ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"}`}
      style={{ transitionDelay: on ? "180ms" : "0ms" }}
    >
      <p className="display text-3xl">{step.title}</p>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
        {step.body}
      </p>
    </div>
  );
}

/**
 * Line icons: phone, mockup frame, code, rocket. Sized up now that the icon
 * carries the step alone rather than sitting beside a number, and dimmed
 * along with everything else until the road actually reaches it.
 */
function StepIcon({ i, on }: { i: number; on: boolean }) {
  const common = {
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.4,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  return (
    <svg
      viewBox="0 0 24 24"
      className={`h-9 w-9 transition-colors duration-500 ${
        on ? "text-foreground" : "text-muted-foreground"
      }`}
      aria-hidden="true"
    >
      {i === 0 && (
        <path
          {...common}
          d="M4.5 5.5c0 8 6 14 14 14l1.5-3-4-2-2 2c-2-1-4.5-3.5-5.5-5.5l2-2-2-4z"
        />
      )}
      {i === 1 && (
        <>
          <rect {...common} x="3" y="4.5" width="18" height="15" rx="2" />
          <path {...common} d="M3 9h18M7 13h7" />
        </>
      )}
      {i === 2 && <path {...common} d="M9 8l-4 4 4 4M15 8l4 4-4 4" />}
      {i === 3 && (
        <path
          {...common}
          d="M12 3c3.5 2 5.5 5.5 5.5 9L12 17l-5.5-5c0-3.5 2-7 5.5-9zM9 18l-2 3M15 18l2 3"
        />
      )}
    </svg>
  );
}
