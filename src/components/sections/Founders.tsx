import Image from "next/image";
import { Reveal } from "@/components/site/Reveal";
import { Reactive } from "@/components/ui/Reactive";
import { founders } from "@/lib/site";
import { assetPath } from "@/lib/asset-path";

/**
 * Who you deal with, ported from apps/studio-site's "Two people, no
 * handover" section, section 8 in the build order (section 7, objections,
 * is being skipped for now).
 *
 * Real portraits now live in public/team, so this renders exactly what the
 * source did: a grayscale portrait that turns to colour on hover, with a
 * gradient wash at the base so the name reads over the bottom of the photo.
 */
export function Founders() {
  return (
    <section
      id="founders"
      className="px-6 py-24 md:px-10 md:py-36"
    >
      <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-end lg:gap-16">
        <div>
          <p className="label-xs mb-5">The people behind the work</p>
          <h2 className="display text-[clamp(1.9rem,3.6vw,3.4rem)]">
            Small team <span className="text-primary">close to the work</span>
          </h2>
          <p className="mt-6 max-w-md text-base leading-relaxed text-muted-foreground sm:text-lg">
            You get direct access to the people shaping the strategy, making
            the work and helping it move forward.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {founders.map((f, i) => (
            <Reveal key={f.name} delay={i * 0.1}>
              <Reactive as="div" className="sheen group">
                <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl border border-line">
                  <Image
                    src={assetPath(f.photo)}
                    alt={f.name}
                    fill
                    sizes="(max-width: 1024px) 45vw, 22vw"
                    className="object-cover object-top grayscale transition-all duration-700 group-hover:scale-[1.03] group-hover:grayscale-0"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
                </div>
                <p className="display mt-3 text-xl sm:text-2xl">{f.name}</p>
                <p className="label-xs mt-1">{f.role}</p>
                <p className="mt-1 text-sm text-muted-foreground">{f.line}</p>
              </Reactive>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
