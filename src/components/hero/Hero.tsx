"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { assetPath } from "@/lib/asset-path";

export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [0, 110]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.12]);

  return (
    <section ref={ref} className="agency-hero" id="home">
      <div className="hero-copy">
        <p className="eyebrow">Independent minds. Connected expertise.</p>
        <h1>Big ideas.<br /><span>Made Asaan.</span></h1>
        <div className="hero-description">
          <p>We design brands, build websites, create content<br className="desktop-break" /> and connect the systems that grow your business.</p>
          <a className="round-link" href="#services" aria-label="Explore our services">↓</a>
        </div>
      </div>
      <motion.div className="hero-art" style={reduced ? {} : { y, scale }}>
        <img src={assetPath("/portfolio/creative-studio.png")} width="1586" height="992" alt="Chrome play sculpture surrounded by architectural imagery, product advertising, design and video editing frames" fetchPriority="high" />
      </motion.div>
      <div className="hero-bottom">
        <a href="#work">Explore selected work <span>↘</span></a>
        <span>Strategy · Design · Build · Grow</span>
        <span className="hero-index">01 / 04</span>
      </div>
    </section>
  );
}
