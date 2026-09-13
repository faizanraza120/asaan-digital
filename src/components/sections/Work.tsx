import { assetPath } from "@/lib/asset-path";

const projects = [
  { title: "NYC Social Club", type: "Agency website", description: "A bold digital home with separate journeys for brands and creators.", image: "/portfolio/portfolio-nyc-social-club.png" },
  { title: "SGK Realty", type: "Real estate experience", description: "An editorial property site with large imagery and a clear listings experience.", image: "/portfolio/portfolio-sgk-realty.png" },
  { title: "ZARA·KA", type: "Fashion commerce", description: "An online store with clear categories, product discovery and checkout.", image: "/portfolio/portfolio-zara-ka.png" },
];

export function Work() {
  return <section id="work" className="work-section px-6 py-24 md:px-10 md:py-36">
    <div className="work-heading"><p className="label-xs mb-5">Selected work</p><h2 className="display max-w-3xl text-[clamp(2.4rem,6vw,5.8rem)]">A few ways we make the <span className="text-primary">complex feel clear.</span></h2></div>
    <div className="work-grid">{projects.map((project, i) => <article key={project.title} className={`work-card work-card-${i + 1}`}><div className="work-image"><img src={assetPath(project.image)} alt={`${project.title} project preview`} loading="lazy" /></div><div className="work-meta"><div><p className="label-xs">{project.type}</p><h3>{project.title}</h3></div><p>{project.description}</p></div></article>)}</div>
    <p className="work-note">Documented portfolio examples shown as representative work. Ask us for the full reel.</p>
  </section>;
}
