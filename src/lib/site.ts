/**
 * Every brand-mutable string on the site lives here, so swapping the name,
 * domain or booking link touches one file and no layout code.
 *
 * COPY RULE: no periods, commas, hyphens, en dashes or em dashes in visible
 * copy. Sentences are written short enough that they do not need them.
 * Question marks and apostrophes are fine.
 *
 * HONESTY RULE: nothing in here claims work that has not happened. There are
 * no client names, no testimonials and no counted-up stats, because the whole
 * funnel rests on being the people who do not do that. The objections below
 * are things owners actually say on calls, and they do the job a testimonial
 * section would have done.
 */

export const site = {
  name: "Asaan Digital",
  url: "https://asaandigital.online",
  /** The footer's giant bleed wordmark — one word reads better at that scale. */
  shortName: "Asaan",
  tagline: "Strategy · Design · Build · Grow",
  description:
    "Asaan Digital is a creative studio for websites, AI video, brand design, content and business automation.",
  /** ⚠ Cal handle still needs to exist before launch. */
  bookingUrl: "https://cal.com/asaan-digital/15min",
  bookingLabel: "Book a 15 min call",
  email: "razafaizan1230@gmail.com",
  serviceAreas: "Working with ambitious businesses worldwide",
  /** Label on the FAQ's answer bubble, rhyming with the chatbot demo above. */
  aiName: "Asaan AI",
} as const;

/**
 * In-page anchors, not routes — this is a single page. Previously pointed
 * at /work and /contact, neither of which exists, which would have 404'd
 * the moment anyone actually clicked the footer menu.
 */
export const nav = [
  { href: "#services", label: "Expertise" },
  { href: "#work", label: "Work" },
  { href: "#process", label: "Our approach" },
  { href: "#about", label: "The studio" },
] as const;

/** Hero chips. What a sceptical owner needs in four words each. */
export const chips = ["Strategy first", "Built to last", "Made for growth"] as const;

/**
 * The trust strip. Tools genuinely used, which is an honest version of the
 * logo wall every agency site runs. Not a client list and never labelled as
 * one.
 *
 * `icon` is a simple-icons slug, inlined at build time and shown monochrome.
 * `src` is a local file under public/logos for brands simple-icons does not
 * carry, masked to the same monochrome so it cannot drag its own colours in.
 * Anything with neither rides as a wordmark, which is the honest fallback:
 * drawing an approximation of someone else's logo is worse than typing their
 * name.
 *
 * Marks that simple-icons has dropped on trademark request (Codex, Lovable,
 * Bolt, Firecrawl) come from svgl.app, and Higgsfield's comes from its own
 * site, all stored locally so the page never calls out to a third party.
 */
export const tools = [
  { name: "Next.js", icon: "nextdotjs", src: null, url: "https://nextjs.org" },
  { name: "Claude", icon: "claude", src: null, url: "https://claude.com" },
  {
    name: "Codex",
    icon: null,
    src: "/logos/codex.svg",
    url: "https://openai.com/codex",
  },
  { name: "n8n", icon: "n8n", src: null, url: "https://n8n.io" },
  { name: "HubSpot", icon: "hubspot", src: null, url: "https://hubspot.com" },
  {
    name: "Lovable",
    icon: null,
    src: "/logos/lovable.svg",
    url: "https://lovable.dev",
  },
  { name: "Vercel", icon: "vercel", src: null, url: "https://vercel.com" },
  { name: "Modal", icon: "modal", src: null, url: "https://modal.com" },
  {
    name: "Higgsfield",
    icon: null,
    src: "/logos/higgsfield.svg",
    url: "https://higgsfield.ai",
  },
  { name: "Supabase", icon: "supabase", src: null, url: "https://supabase.com" },
  { name: "Figma", icon: "figma", src: null, url: "https://figma.com" },
  { name: "Bolt", icon: null, src: "/logos/bolt.svg", url: "https://bolt.new" },
  {
    name: "ElevenLabs",
    icon: "elevenlabs",
    src: null,
    url: "https://elevenlabs.io",
  },
  { name: "Airtable", icon: "airtable", src: null, url: "https://airtable.com" },
  {
    name: "Google Business Profile",
    icon: "google",
    src: null,
    url: "https://business.google.com",
  },
  { name: "Cal.com", icon: "caldotcom", src: null, url: "https://cal.com" },
  { name: "GitHub", icon: "github", src: null, url: "https://github.com" },
  {
    name: "Firecrawl",
    icon: null,
    src: "/logos/firecrawl.svg",
    url: "https://firecrawl.dev",
  },
] as const;

export const problem = {
  eyebrow: "The challenge",
  heading: "Good businesses deserve a clearer signal",
  body: "When your brand, content and customer journey feel disconnected, people feel the friction before they ever reach out.",
} as const;

/**
 * The about statement, set large and filled in character by character as it
 * scrolls. Kept to one sentence because the treatment only works on
 * something short enough to read while it is still filling.
 */
export const about = {
  eyebrow: "The studio",
  statement:
    "We bring strategy, design, technology and storytelling into one clear direction.",
  body: "Small enough to stay close to the work and broad enough to connect the pieces that make a business memorable and easier to choose.",
} as const;

/**
 * Six services on the landing page. There is no services route, so `detail`
 * is what the row reveals when it expands in place.
 *
 * `demo` names a proof that renders inside the opened row. A service that
 * can show itself working should, right where it is being described, rather
 * than in a separate section further down the page that a reader has to
 * connect back up for themselves.
 */
export const services = [
  {
    n: "01",
    title: "Websites",
      summary: "Clear digital homes that make your business easy to understand",
    demo: null,
    detail: [
      "A clear structure shaped around your audience",
      "Responsive experiences that feel considered on every screen",
      "Content and calls to action that make the next step obvious",
      "A flexible foundation your business can keep building on",
    ],
  },
  {
    n: "02",
    title: "Chatbots",
      summary: "Helpful conversations that move people towards action",
    demo: "chat",
    detail: [
      "Answers recurring questions in your brand voice",
      "Guides people towards the right next step",
      "Works across the places your customers already use",
      "Hands over to your team when a human is needed",
    ],
  },
  {
    n: "03",
    title: "Automations",
      summary: "Connected workflows that give your team time back",
    demo: null,
    detail: [
      "Connects the tools you already rely on",
      "Routes new enquiries to the right person",
      "Keeps follow ups moving with less manual work",
      "Designed around a useful outcome rather than novelty",
    ],
  },
  {
    n: "04",
    title: "Voice agents",
      summary: "Always-on customer support with a human handoff",
    demo: null,
    detail: [
      "Gives callers a calm, useful first response",
      "Captures the context your team needs",
      "Routes qualified conversations into your workflow",
      "Built with a clear human handoff",
    ],
  },
  {
    n: "05",
    title: "Brand design",
    summary: "Identity systems, campaigns and visual language",
    demo: null,
    detail: [
      "Logo and identity direction",
      "Campaign and social systems",
      "Presentation and launch assets",
      "A toolkit your team can keep using",
    ],
  },
  {
    n: "06",
    title: "AI video & content",
    summary: "Scroll-stopping stories, reels and product films",
    demo: null,
    detail: [
      "Reels, product films and social edits",
      "Motion graphics and visual storytelling",
      "AI assisted concepting and production",
      "Content shaped for the channel it lives on",
    ],
  },
] as const;

/** A clear creative process from first conversation to launch. */
export const process = [
  {
    n: "01",
    title: "Discover",
    body: "We learn what you do, who it is for and what needs to change",
    when: "Step 1",
  },
  {
    n: "02",
    title: "Shape",
    body: "We turn the direction into a focused creative and technical plan",
    when: "Step 2",
  },
  {
    n: "03",
    title: "Create",
    body: "Design, content and systems come together in a working experience",
    when: "Step 3",
  },
  {
    n: "04",
    title: "Grow",
    body: "We launch, learn and keep improving the parts that matter",
    when: "Step 4",
  },
] as const;

export const terms = [
  "A clear scope agreed up front",
  "Useful feedback built into the process",
  "Assets and systems you can keep using",
  "A long term partner when you need one",
] as const;

/** Honest checkable contrasts. No competitor is named. */
export const comparison = {
  them: [
    "Disconnected specialists and scattered decisions",
    "A polished surface with no clear system underneath",
    "Ideas handed off before they are understood",
    "More deliverables without a sharper direction",
    "Silence between milestones",
  ],
  us: [
    "One direction across brand, content and web",
    "Design that is grounded in the business",
    "Direct access to the people doing the work",
    "A focused scope with room for useful iteration",
    "Clear communication from start to launch",
  ],
} as const;

/** The value of a connected creative system. */
export const jobValue = {
  label: "What a clear system unlocks",
  value: "One direction",
  body: "When brand, content and customer experience point the same way, every future piece of work gets easier to make and easier to understand",
} as const;

/**
 * A compressed recap of the process timeline, ending on the ROI rather than
 * on go live. This deliberately repeats `process` above in shorter form,
 * because that section is about what happens and this one is about why it
 * is worth it, and the last row is the number that answers that.
 */
export const timelineRows = [
  {
    label: "Direction set",
    detail: "We align on the business, audience and opportunity",
    day: "Step 1",
  },
  {
    label: "Concept shaped",
    detail: "A focused creative route brings the opportunity to life",
    day: "Step 2",
  },
  {
    label: "Work launched",
    detail: "Your new experience is ready for people to use",
    day: "Step 3",
  },
  {
    label: "Momentum built",
    detail: "We learn from the response and improve what matters",
    day: "Ongoing",
  },
] as const;

/** A believable exchange, not a testimonial. Shows the update habit itself. */
export const updateThread = [
  { from: "us", text: "Hey the mockup is ready" },
  { from: "us", text: "Tell us if you want anything changed" },
  { from: "them", text: "Can we swap the header photo?" },
  { from: "us", text: "Done Anything else?" },
] as const;

/**
 * Objections we actually hear on calls, and NOT testimonials. We have no
 * clients yet so inventing praise would break the honesty the funnel runs on.
 * Answered objections convert better than praise anyway and this is true
 * today.
 */
export const objections = [
  {
    quote: "The last guy took my money and I never heard from him again",
    answer:
      "You see a mockup before you pay a full invoice and you talk to whoever builds it",
  },
  {
    quote: "I already have a website",
    answer:
      "Most people we call do and the question is whether it loads fast and lets someone book at nine at night",
  },
  {
    quote: "I don't have time for this",
    answer:
      "Fifteen minutes on the phone then about twenty minutes sending photos and your service list",
  },
  {
    quote: "What if I want to leave later?",
    answer:
      "You own the site and the domain so it goes with you and there is nothing to hold hostage",
  },
] as const;

export const founders = [
  {
    name: "Faizan Raza",
    role: "Founder",
    line: "Websites, systems and automation",
    photo: "/team/faizan-raza.jpg",
  },
  {
    name: "Zeeshan Raza",
    role: "Co Founder",
    line: "Strategy, content and client direction",
    photo: "/team/zeeshan-raza.jpg",
  },
] as const;

export const faqs = [
  {
    q: "Do I actually own it?",
    a: "Yes it is yours on your domain and it goes with you if you ever leave us",
  },
  {
    q: "What if I don't like what you build?",
    a: "You see a mockup before you pay anything and you get two rounds of changes on the real build",
  },
  {
    q: "I already have a website",
    a: "Most people we call do and the question is whether it loads fast and lets someone book at nine at night",
  },
  {
    q: "How much of my time does this take?",
    a: "The call plus about twenty minutes sending us photos and your service list and we write the rest",
  },
] as const;

/**
 * Chatbot demo script. Runs the full arc from problem to booked appointment,
 * because a two line exchange does not show the thing that matters, which is
 * that it closes without the owner touching the phone. Labelled a
 * demonstration on the page.
 */
export const chatScript = [
  { from: "them", text: "hi I want to refresh our brand" },
  { from: "us", text: "Great What are you hoping the new direction helps you do?" },
  { from: "them", text: "make our offer easier to understand" },
  { from: "us", text: "That is a strong place to start We can help with strategy design and web" },
  { from: "them", text: "can we talk through the options" },
  { from: "us", text: "Yes We have a short discovery call available this week" },
  { from: "them", text: "Thursday works" },
  { from: "us", text: "Perfect I will send a link and a few useful questions" },
] as const;
