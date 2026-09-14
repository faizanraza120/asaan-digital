import { assetPath } from "@/lib/asset-path";

const projects = [
  {
    title: "NYC Social Club",
    type: "Agency website",
    description: "A bold digital home with separate journeys for brands and creators.",
    // Fresh capture of nycsocialclub.com; keep the full desktop composition.
    image: "/portfolio/portfolio-nyc-social-club-hd.jpg",
    width: 1348,
    height: 926,
  },
  {
    title: "SGK Realty",
    type: "Real estate experience",
    description: "An editorial property site with large imagery and a clear listings experience.",
    // Fresh capture of sgkrealty.com.
    image: "/portfolio/portfolio-sgk-realty-hd.jpg",
    width: 1355,
    height: 931,
  },
  {
    title: "ZARA·KA",
    type: "Fashion commerce",
    description: "An online store with clear categories, product discovery and checkout.",
    image: "/portfolio/portfolio-zara-ka.png",
    // Only the supplied thumbnail is available; never stretch it past its source width.
    width: 293,
    height: 185,
  },
];

export function Work() {
  return <section id="work" className="work-section px-6 py-24 md:px-10 md:py-36">
    <div className="work-heading"><p className="label-xs mb-5">Selected work</p><h2 className="display max-w-3xl text-[clamp(2.4rem,6vw,5.8rem)]">A few ways we make the <span className="text-primary">complex feel clear.</span></h2></div>
    <div className="work-grid">
      {projects.map((project, i) => (
        <article key={project.title} className={`work-card work-card-${i + 1}`}>
          <div className="work-image">
            <img
              src={assetPath(project.image)}
              alt={`${project.title} project preview`}
              width={project.width}
              height={project.height}
              style={{ maxWidth: project.width }}
              loading="lazy"
              decoding="async"
            />
          </div>
          <div className="work-meta">
            <div><p className="label-xs">{project.type}</p><h3>{project.title}</h3></div>
            <p>{project.description}</p>
          </div>
        </article>
      ))}
    </div>
    <p className="work-note">Documented portfolio examples shown as representative work. Ask us for the full reel.</p>
  </section>;
}
