"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { faqs, site } from "@/lib/site";

const MS_PER_CHAR = 14;

/**
 * Before you ask, built on thewebta.com's FAQ mechanics: hairline rows
 * inside one bordered card, a thin gradient line sweeping across the top of
 * the card on a loop, opening a row grows a 3px accent bar down its left
 * edge while the question turns accent, and the answer grows open by height
 * and fades in rather than snapping into place. That grow-open is real
 * motion on the source (confirmed on the live site: the answer wrapper
 * animates `height: 0 → auto` with a matching opacity fade), which is what
 * was missing from the first pass here — it just conditionally rendered the
 * answer with no transition on it at all.
 *
 * One deliberate departure from the source, which was the actual point of
 * picking this design: the answer arrives as a labelled chat bubble instead
 * of plain paragraph text. That makes this section quietly rhyme with the
 * WhatsApp demo inside the Chatbots service row above it, so the FAQ reads
 * as a second, quieter instance of the same assistant rather than a
 * separate, generic accordion bolted onto the end of the page. No avatar
 * icon on the label though — just the name, no glyph standing in for a face
 * that does not exist.
 */
export function Faq() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    /*
      Asymmetric padding: this used to be the last section before the
      footer, so a big bottom margin made sense. TrustStrip sits right
      after it now and brings its own spacing, so a matching bottom pad
      here would just double up into a bigger gap than either section
      asked for on its own.
    */
    <section id="faq" className="px-6 pb-8 pt-24 md:px-10 md:pb-12 md:pt-36">
      <div className="mx-auto max-w-3xl">
        <p className="label-xs mb-5 text-center">Straight answers</p>
        <h2 className="display text-center text-[clamp(1.8rem,3.2vw,3rem)]">
          Before you ask
        </h2>

        <div className="relative mt-12 overflow-hidden rounded-xl border border-line bg-card/60 p-2 sm:p-4">
          {/* thin gradient line, sweeping across the top of the card forever */}
          <div className="absolute inset-x-0 top-0 h-px overflow-hidden">
            <div
              className="h-full w-1/3 bg-gradient-to-r from-transparent via-primary/50 to-transparent"
              style={{ animation: "faq-scan 5s linear infinite" }}
            />
          </div>

          <ul className="border-t border-line">
            {faqs.map((item, i) => {
              const isOpen = open === i;
              return (
                <li
                  key={item.q}
                  className={`relative border-b border-line transition-colors duration-300 ${
                    isOpen ? "bg-card/50" : "hover:bg-card/25"
                  }`}
                >
                  {/* the accent bar, growing down from the top on open */}
                  <span
                    aria-hidden="true"
                    className="absolute inset-y-0 left-0 w-[3px] origin-top rounded-full bg-primary transition-transform duration-300"
                    style={{ transform: isOpen ? "scaleY(1)" : "scaleY(0)" }}
                  />

                  <button
                    type="button"
                    onClick={() => setOpen(isOpen ? null : i)}
                    aria-expanded={isOpen}
                    aria-controls={`faq-${i}`}
                    className="group flex w-full items-center justify-between gap-6 px-4 py-6 text-left sm:py-7"
                  >
                    <span
                      className={`text-base transition-colors duration-200 sm:text-lg ${
                        isOpen ? "text-primary" : "group-hover:text-primary"
                      }`}
                    >
                      {item.q}
                    </span>
                    {/*
                      The source swaps the glyph itself (+ becomes −) rather
                      than just rotating a plus into a cross, and spring
                      rotates the whole badge to 45deg on open — a rotated
                      minus reading as a diagonal tick is the exact detail
                      that makes this look copied rather than approximated.
                    */}
                    <motion.span
                      animate={{ rotate: isOpen ? 45 : 0 }}
                      transition={{ type: "spring", stiffness: 260, damping: 18 }}
                      className={`label-xs shrink-0 font-bold ${
                        isOpen ? "text-primary" : "group-hover:text-primary"
                      }`}
                    >
                      {isOpen ? "[ − ]" : "[ + ]"}
                    </motion.span>
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        id={`faq-${i}`}
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                        className="overflow-hidden"
                      >
                        {/*
                          The content has its own animation on top of the
                          wrapper's height grow, which is the detail that
                          separates this from a plain accordion: it slides
                          in 16px from the left and scales up from 0.97
                          while the box is still opening. Measured off the
                          live source, whose closed state is exactly
                          `opacity: 0; transform: translateX(-16px)
                          scale(0.97)`.
                        */}
                        <motion.div
                          initial={{ opacity: 0, x: -16, scale: 0.97 }}
                          animate={{ opacity: 1, x: 0, scale: 1 }}
                          exit={{ opacity: 0, x: -16, scale: 0.97 }}
                          transition={{
                            duration: 0.45,
                            delay: 0.08,
                            ease: [0.16, 1, 0.3, 1],
                          }}
                          className="origin-left px-4 pb-6 sm:pb-7"
                        >
                          {/* Muted, matching the source exactly — the label
                              itself is not where the accent colour goes. */}
                          <p className="label-xs">{site.aiName}</p>
                          <TypedAnswer text={item.a} />
                        </motion.div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}

/**
 * The answer types itself out character by character, ported from
 * apps/studio-site's Faq.tsx (no caret — asked to be removed, so it is just
 * the text arriving). It mounts fresh every time a row
 * opens (AnimatePresence unmounts it on close), so it always retypes from
 * scratch rather than resuming — that repetition is what makes it read as
 * an animation instead of a one-time reveal nobody sees twice.
 *
 * The untyped remainder of the answer is rendered too, just invisible
 * (`opacity-0`, not removed), so the paragraph's real content — and
 * therefore its layout size — is the full answer from the very first frame.
 * Without that, the parent's height: 0 → auto animation would measure the
 * box while only a few characters existed, lock the height to that tiny
 * value once its own 0.4s transition finished, and the still-typing text
 * would spend the next couple of seconds overflowing a box that had
 * already stopped growing.
 */
function TypedAnswer({ text }: { text: string }) {
  const [shown, setShown] = useState(0);
  const reduced = useRef(false);

  useEffect(() => {
    reduced.current = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduced.current) {
      setShown(text.length);
      return;
    }
    setShown(0);
    let i = 0;
    const id = setInterval(() => {
      i++;
      setShown(i);
      if (i >= text.length) clearInterval(id);
    }, MS_PER_CHAR);
    return () => clearInterval(id);
  }, [text]);

  return (
    <p className="mt-2 max-w-xl rounded-xl rounded-tl-sm bg-background px-4 py-3 text-sm leading-relaxed text-foreground/85 sm:text-base">
      <span>{text.slice(0, shown)}</span>
      <span aria-hidden="true" className="opacity-0">
        {text.slice(shown)}
      </span>
    </p>
  );
}
