"use client";

import { motion } from "motion/react";
import { comparison } from "@/lib/site";

/**
 * Why this goes differently, narrowed to just the Others/Us contrast now
 * rather than the full four card bento. Layout and motion are ported from
 * thewebta.com's third section ("The Webta Difference / AI solutions built
 * specifically for you."): a heading pinned on one side while two cards
 * stack in a tall column on the other, each one fading up into place as it
 * scrolls into view rather than arriving with the rest of the page.
 *
 * Dropped from the source on purpose: the fake progress bar and the giant
 * numeral watermark were flavour for their "system initialization" framing
 * and do not mean anything here, so they are not carried over. What is
 * carried over exactly is the mechanic that was actually asked for — the
 * sticky heading and the one-at-a-time slide reveal, not `once`, so
 * scrolling back up hides a card again exactly like the source does.
 */
export function Difference() {
  return (
    <section
      id="difference"
      className="flex w-full flex-col md:flex-row"
    >
      <div className="flex shrink-0 items-center p-6 md:sticky md:top-0 md:h-screen md:w-1/2 md:p-12 lg:p-20">
        <div className="max-w-xl">
          <p className="label-xs mb-5">The difference</p>
          <h2 className="display text-[clamp(1.9rem,4vw,3.6rem)]">
            Why this <span className="text-primary">goes differently</span>
          </h2>
          <p className="mt-8 max-w-md text-base leading-relaxed text-muted-foreground sm:text-lg">
            Same checkable list either way. What changes is which side of it
            you are standing on.
          </p>
        </div>
      </div>

      <div className="flex w-full flex-col gap-[24vh] px-6 py-[10vh] md:w-1/2 md:gap-[38vh] md:px-12 md:py-[38vh]">
        <DiffCard
          label="Others"
          lines={comparison.them}
          mark="✕"
          accent={false}
        />
        <DiffCard label="Us" lines={comparison.us} mark="→" accent />
      </div>
    </section>
  );
}

function DiffCard({
  label,
  lines,
  mark,
  accent,
}: {
  label: string;
  lines: readonly string[];
  mark: string;
  accent: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      // No `once`: scrolling back up hides the card again, same as the
      // source. Half the card has to cross the centre line before it
      // triggers, which is what makes the reveal read as "arriving in the
      // middle of the page" rather than at the edge of the viewport.
      viewport={{ margin: "-45% 0px -45% 0px" }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className={`mx-auto w-full max-w-xl rounded-2xl border p-10 sm:p-12 ${
        accent
          ? "border-primary/30 bg-primary/[0.05]"
          : "border-line bg-card/60"
      }`}
    >
      <p className="display text-3xl sm:text-4xl">{label}</p>

      <ul className="mt-8 space-y-4">
        {lines.map((line) => (
          <li
            key={line}
            className="flex gap-3 border-t border-line pt-4 text-sm leading-relaxed sm:text-base"
          >
            <span
              aria-hidden="true"
              className={accent ? "text-primary" : "text-muted-foreground"}
            >
              {mark}
            </span>
            <span className={accent ? "" : "text-muted-foreground"}>
              {line}
            </span>
          </li>
        ))}
      </ul>
    </motion.div>
  );
}
