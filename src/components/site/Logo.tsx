import Link from "next/link";
import { site } from "@/lib/site";
import { Mark } from "./Mark";

/**
 * The wordmark: the angular mark plus "Asaan Digital" set in Lastborn Demo
 * (--font-logo, wired up in layout.tsx via next/font/local from the
 * supplied file). One shared component so the header always uses the same
 * mark — the footer's giant bleed treatment is text-only by design (an
 * icon at that scale would look like a stray shape, not a mark), so it
 * sets its own type directly rather than reusing this component.
 *
 * Lastborn Demo is an all-caps display face with very tight counters — set
 * at a small size with no letter-spacing, the letters run into each other
 * and the wordmark reads as a solid block rather than a word. The tracking
 * and size below exist specifically to give it room; do not tighten this
 * back up without checking it against the actual glyphs, not just the
 * general "labels are wide-tracked" convention used elsewhere on the site.
 *
 * Always plain white (`text-foreground`, never the violet accent — the
 * logo is identity, not a thing that responds to the visitor) so it works
 * correctly inside NavBar's `mix-blend-mode: difference`: difference
 * blending only produces a clean, predictable invert for pure white or
 * pure black source colour. Anything tinted would composite into an
 * unpredictable third colour against whatever is underneath it. The mark
 * uses `fill="currentColor"` for the same reason — one colour value, set
 * once, covers both the icon and the text.
 */
export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link
      href="/"
      aria-label={`${site.name} home`}
      className={`inline-flex items-center gap-2.5 text-foreground ${className}`}
    >
      {/*
        Sized to match the text's own cap-height, not guessed — measured
        directly (mark rendered at 24px against the wordmark's 34px ink
        height at the same base size) and scaled up by that ratio. Below
        this the mark reads as a small decoration bolted onto a bigger
        word instead of an equal partner to it.
      */}
      <Mark className="h-[1.15em] w-[1.15em] shrink-0" />
      <span className="font-[family-name:var(--font-logo)] text-[1.15em] leading-none tracking-[0.05em]">
        {site.name}
      </span>
    </Link>
  );
}
