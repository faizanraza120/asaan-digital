"use client";

import { useEffect, useState } from "react";
import { nav, site } from "@/lib/site";

/**
 * Footer, combining the Lovable build's structure with one detail lifted
 * from trionn.com: contact and menu columns, then a giant wordmark bleeding
 * across the full width at the bottom, the way Lovable's SiteFooter did it,
 * with Trionn's live local-time readout added next to the copyright line —
 * a small, cheap, genuinely nice touch that costs nothing more than a
 * once-a-minute interval.
 *
 * Trionn's actual footer is a full-screen, canvas-driven, scroll-pinned
 * set piece (particle field, pluckable wordmark strings, the works). That
 * does not fit here: it is heavy, and this site's whole premise is speed
 * for a home service business, so a lean footer is not a compromise, it is
 * the point. What is taken from Trionn is the two details that travel
 * well on their own — the live local time, and the giant wordmark reusing
 * the same invert-ready white mark as the header.
 */
export function SiteFooter() {
  const [time, setTime] = useState<string | null>(null);

  useEffect(() => {
    const update = () =>
      setTime(
        new Intl.DateTimeFormat("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }).format(new Date()),
      );
    update();
    const id = setInterval(update, 30_000);
    return () => clearInterval(id);
  }, []);

  return (
    <footer id="contact" className="border-t border-line px-6 pb-8 pt-16 md:px-10">
      <div className="grid gap-10 md:grid-cols-4">
        <div className="md:col-span-2">
          <p className="label-xs mb-4">Start a conversation</p>
          <a
            href={`mailto:${site.email}`}
            className="display block text-2xl transition-colors hover:text-primary md:text-4xl"
          >
            {site.email}
          </a>
          <p className="mt-3 max-w-xs text-sm text-muted-foreground">
            {site.serviceAreas}. Strategy, design and technology in one focused team.
          </p>
        </div>

        <div>
          <p className="label-xs mb-4">Menu</p>
          <ul className="space-y-1 text-sm">
            {nav.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  className="transition-colors hover:text-primary"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="label-xs mb-4">Work with us</p>
          <a
            href={site.bookingUrl}
            className="text-sm transition-colors hover:text-primary"
          >
            {site.bookingLabel} &rarr;
          </a>
        </div>
      </div>

      {/*
        The giant bleed mark. Just "Asaan" — the full "Asaan Digital" ran
        wide enough at this scale that it stopped reading as a wordmark and
        started reading as a texture, which is the opposite of the point.
        Set in the same Lastborn Demo face as the header, filled with the
        scanline utility above rather than a flat colour.

        The wrapper clips height on purpose (the letters are far taller
        than a normal line at this size), but the clip amount was wrong in
        the previous pass: it was sized to fit inside the small existing
        gap before the copyright row, on the assumption that growing it
        would push into space that did not exist. That assumption was
        wrong — the copyright row is a normal block sibling, not
        absolutely positioned, so a taller wrapper here simply pushes it
        further down the page rather than colliding with it. The footer
        being taller is a fair trade for the letters actually reading as
        "Asaan" instead of five mostly-cropped strokes. ~74vw is the
        letterforms' measured height (Range.getBoundingClientRect on the
        text node) at this font-size, so 70vw shows nearly all of it —
        only the last sliver bleeds off, which is the point of a bleed
        wordmark rather than an oversight.
      */}
      <div className="mt-8 h-[70vw] overflow-hidden sm:h-[65vw]">
        <div
          aria-hidden="true"
          className="scanline-text select-none whitespace-nowrap font-[family-name:var(--font-logo)] text-[75vw] leading-none tracking-[0.02em] opacity-40"
        >
          {site.shortName}
        </div>
      </div>

      <div className="mt-8 flex flex-wrap items-center justify-between gap-2 border-t border-line pt-6">
        <p className="label-xs">
          &copy; {new Date().getFullYear()} {site.name}
        </p>
        {/* suppressHydrationWarning: the clock is only ever correct on the
            client, so the server render and first client render disagree
            on purpose for the one frame before the effect above runs. */}
        <p className="label-xs" suppressHydrationWarning>
          {time ? `Local time ${time}` : site.tagline}
        </p>
      </div>
    </footer>
  );
}
