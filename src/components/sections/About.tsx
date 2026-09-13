"use client";

import { motion } from "motion/react";
import { useEffect, useRef } from "react";
import { about } from "@/lib/site";

/**
 * About, built on trionn.com's scroll-fill headline: the statement is set
 * very large in a heavily dimmed colour, and each character lights to full
 * as the section scrolls through the viewport, so the sentence reads as
 * being written rather than simply appearing.
 *
 * Mechanics taken from the live source, which sets the heading's base
 * colour to rgba(216,216,216,0.1), wraps every character in its own inline
 * element, and writes a colour onto each one as it passes. Words are kept
 * in white-space: nowrap spans so a filling line never breaks mid-word.
 *
 * Written straight to the DOM inside rAF rather than through React state,
 * the same decision as the process pipeline: a hundred-odd characters
 * re-rendering on every scroll frame is exactly how this kind of effect
 * ends up dropping frames.
 */
export function About() {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const heading = headingRef.current;
    if (!section || !heading) return;

    /*
     * Collected from the DOM rather than through ref callbacks. Ref
     * callbacks only fire on mount, so a list rebuilt during render would
     * be left empty by any later re-render.
     */
    const chars = [...heading.querySelectorAll<HTMLElement>("[data-char]")];
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduced) {
      // No scroll-driven reveal at all: the sentence is simply legible.
      for (const c of chars) c.style.opacity = "1";
      return;
    }

    let raf = 0;
    let running = false;

    const update = () => {
      // The HEADING's own position, not the section's. The section carries
      // large top and bottom padding to place the text where it should
      // sit on screen, and using the padded box as the reference meant the
      // fill was timed against a lot of scroll distance where the heading
      // itself was not actually visible yet — most of it was already lit
      // long before the text was comfortably on screen. Measuring the
      // heading directly means "readable" and "filling" happen together.
      const r = heading.getBoundingClientRect();
      const vh = window.innerHeight;
      /*
       * Starts as the heading's top crosses 80% down the viewport (already
       * legible, not still buried near the bottom edge) and finishes by
       * 30% down (still comfortably on screen, not up near the very top
       * about to leave) — the whole fill happens while the sentence is in
       * the readable part of the viewport, which is the entire point.
       */
      const from = vh * 0.8;
      const to = vh * 0.3;
      const p = Math.min(1, Math.max(0, (from - r.top) / (from - to)));

      const total = chars.length;
      for (let i = 0; i < total; i++) {
        // Each character has its own small window inside the progress, so
        // they light in sequence rather than all together.
        const start = (i / total) * 0.75;
        const local = Math.min(1, Math.max(0, (p - start) / 0.25));
        chars[i].style.opacity = String(0.1 + local * 0.9);
      }
    };

    const loop = () => {
      update();
      raf = requestAnimationFrame(loop);
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !running) {
          running = true;
          raf = requestAnimationFrame(loop);
        } else if (!entry.isIntersecting && running) {
          running = false;
          cancelAnimationFrame(raf);
        }
      },
      { rootMargin: "100% 0px 100% 0px" },
    );

    io.observe(section);
    update();

    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    // Tall section, content pinned toward the top rather than centred, so
    // the heading sits high in the viewport on arrival and there is a long
    // stretch of scroll left afterward — that stretch is what makes the
    // character fill visible as motion instead of something already mostly
    // finished by the time it is readable.
    <section
      ref={sectionRef}
      id="about"
      className="px-6 pb-[45vh] pt-24 md:px-10 md:pb-[60vh] md:pt-32"
    >
      {/*
        Slide-and-fade entrance, the same motion as the Difference cards:
        50px rise, 0.7s, the site's shared ease curve, triggered once the
        block is well past the edge of the viewport. Everything inside —
        including the per-character fill, which keeps running on its own
        scroll-linked loop — rides in together on this.
      */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-15% 0px -15% 0px" }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      >
        <p className="label-xs mb-8">{about.eyebrow}</p>

        <h2
          ref={headingRef}
          className="display max-w-[18ch] text-[clamp(2rem,6.2vw,5.5rem)]"
        >
          {about.statement.split(" ").map((word, wi) => (
            // nowrap per word, so a word never splits across lines while
            // its own characters are still filling.
            <span
              key={`${word}-${wi}`}
              className="inline-block whitespace-nowrap"
            >
              {word.split("").map((ch, ci) => (
                <span
                  key={ci}
                  data-char
                  className="inline-block"
                  style={{ opacity: 0.1 }}
                >
                  {ch}
                </span>
              ))}
              {/* real space between words, outside the filled characters */}
              <span className="inline-block">&nbsp;</span>
            </span>
          ))}
        </h2>

        <p className="mt-12 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
          {about.body}
        </p>
      </motion.div>
    </section>
  );
}
