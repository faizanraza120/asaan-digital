import {
  siAirtable,
  siCaldotcom,
  siClaude,
  siElevenlabs,
  siFigma,
  siGithub,
  siGoogle,
  siHubspot,
  siModal,
  siN8n,
  siNextdotjs,
  siSupabase,
  siVercel,
} from "simple-icons";
import { tools } from "@/lib/site";
import { assetPath } from "@/lib/asset-path";

/**
 * The trust band, lifted from thewebta.com: a mono label over a row that
 * slides forever, masked to transparent at both edges so items arrive and
 * leave rather than popping.
 *
 * Two differences from the reference. It carries tools we genuinely use
 * instead of client logos, because we have no clients to name yet and a
 * borrowed logo wall is the exact thing this site is selling against. And
 * the band is sized to the row it contains, roughly half the height of
 * webta's, so it reads as a rule between the hero and the page rather than
 * as a section in its own right.
 *
 * Marks are inlined from simple-icons at build time, monochrome so they sit
 * inside the palette rather than dragging eight brand colours into it.
 * Hovering one swaps that mark for its name and links out to it. The row
 * pauses while the pointer is over it, because a link sliding past at 29px a
 * second is a link nobody can click.
 */

/** Only the marks actually used, so nothing else is pulled into the build. */
const MARKS: Record<string, { path: string }> = {
  nextdotjs: siNextdotjs,
  claude: siClaude,
  n8n: siN8n,
  hubspot: siHubspot,
  modal: siModal,
  supabase: siSupabase,
  figma: siFigma,
  elevenlabs: siElevenlabs,
  github: siGithub,
  google: siGoogle,
  vercel: siVercel,
  caldotcom: siCaldotcom,
  airtable: siAirtable,
};

function ToolItem({
  tool,
  duplicate,
}: {
  tool: (typeof tools)[number];
  duplicate: boolean;
}) {
  const mark = tool.icon ? MARKS[tool.icon] : null;
  const hasArt = Boolean(mark || tool.src);

  return (
    <a
      href={tool.url}
      target="_blank"
      rel="noopener noreferrer"
      // The mark carries no text, so the link takes its name from here.
      aria-label={tool.name}
      // Duplicates exist to make the loop seamless. They are scenery, so
      // they are hidden from assistive tech and skipped by the tab key.
      aria-hidden={duplicate}
      tabIndex={duplicate ? -1 : undefined}
      // Fixed slot: the name is wider than the mark, and without a fixed
      // width every hover would shove the whole row sideways.
      className="group relative flex h-6 w-[120px] shrink-0 items-center justify-center"
    >
      {hasArt ? (
        <>
          {mark ? (
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              className="h-5 w-5 fill-muted-foreground transition duration-300 ease-out group-hover:-translate-y-1 group-hover:opacity-0"
            >
              <path d={mark.path} />
            </svg>
          ) : (
            /*
             * Local file, drawn as a mask over a solid colour rather than as
             * an <img>. That forces every downloaded brand mark to the same
             * monochrome as the inlined ones, so the row stays one material
             * instead of eighteen brand palettes, and contain sizing handles
             * square icons and wide wordmarks with one box.
             */
            <span
              aria-hidden="true"
              style={{
                maskImage: `url(${assetPath(tool.src || "")})`,
                WebkitMaskImage: `url(${assetPath(tool.src || "")})`,
              }}
              className="h-5 w-[74px] bg-muted-foreground transition duration-300 ease-out [mask-position:center] [mask-repeat:no-repeat] [mask-size:contain] group-hover:-translate-y-1 group-hover:opacity-0"
            />
          )}
          <span
            aria-hidden="true"
            className="absolute translate-y-1 text-center text-sm leading-tight text-primary opacity-0 transition duration-300 ease-out group-hover:translate-y-0 group-hover:opacity-100"
          >
            {tool.name}
          </span>
        </>
      ) : (
        // No mark anywhere, so the name is the mark.
        <span className="text-base text-muted-foreground transition-colors duration-300 group-hover:text-primary">
          {tool.name}
        </span>
      )}
    </a>
  );
}

export function TrustStrip() {
  // Three copies so the loop point is off screen even on an ultrawide, and
  // the keyframe travels exactly one copy width.
  const copies = [0, 1, 2];

  return (
    <section aria-label="Tools we build with" className="flex w-full flex-col items-center pt-10">
      {/* Sits in the plain gap above the banded row, not inside it — the
          band below is the slider's own material, this label is page
          background. */}
      <p className="label-xs mb-6 tracking-[0.14em]">
        Trusted names we&rsquo;re familiar with
      </p>

      <div
        className="relative flex w-full overflow-hidden border-y border-line bg-card/40 py-5"
        style={{
          maskImage:
            "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
          WebkitMaskImage:
            "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
        }}
      >
        <div
          className="flex w-max items-center gap-10 whitespace-nowrap px-8 hover:[animation-play-state:paused]"
          // Duration tracks the row width so the speed stays constant at
          // roughly 35px a second however many tools are in the list.
          style={{ animation: "marquee-scroll 90s linear infinite" }}
        >
          {copies.map((copy) =>
            tools.map((tool) => (
              <ToolItem
                key={`${copy}-${tool.name}`}
                tool={tool}
                duplicate={copy > 0}
              />
            )),
          )}
        </div>
      </div>
    </section>
  );
}
