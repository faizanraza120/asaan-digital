"use client";

import { useState } from "react";
import { Logo } from "./Logo";

export function NavBar() {
  const [open, setOpen] = useState(false);
  const links = [["#services", "Expertise"], ["#work", "Work"], ["#process", "Our approach"], ["#about", "The studio"]];

  return (
    <header className="agency-nav">
      <Logo className="agency-logo" />
      <nav aria-label="Main navigation" className={open ? "nav-links is-open" : "nav-links"}>
        {links.map(([href, label]) => <a key={href} href={href} onClick={() => setOpen(false)}>{label}</a>)}
      </nav>
      <a className="nav-contact" href="#contact">Let’s talk <span>↗</span></a>
      <button className="menu-toggle" aria-expanded={open} aria-label={open ? "Close navigation" : "Open navigation"} onClick={() => setOpen(!open)}>{open ? "Close" : "Menu"}</button>
    </header>
  );
}
