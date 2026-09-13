"use client";

import Link from "next/link";
import { useRef, type ReactNode, type Ref } from "react";

/**
 * Pulls an element toward the pointer while it is over it, springs back on
 * leave. Strength is a fraction of the distance from centre, so a bigger
 * button pulls further without any per-element tuning.
 */
function useMagnet(strength: number) {
  const ref = useRef<HTMLElement | null>(null);

  const onMove = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - (rect.left + rect.width / 2);
    const y = e.clientY - (rect.top + rect.height / 2);
    el.style.transform = `translate(${x * strength}px, ${y * strength}px)`;
  };

  const onLeave = () => {
    const el = ref.current;
    if (el) el.style.transform = "translate(0px, 0px)";
  };

  return { ref, onMove, onLeave };
}

type Props = {
  children: ReactNode;
  className?: string;
  strength?: number;
};

export function MagneticLink({
  href,
  children,
  className = "",
  strength = 0.28,
}: Props & { href: string }) {
  const { ref, onMove, onLeave } = useMagnet(strength);
  return (
    <Link
      href={href}
      ref={ref as Ref<HTMLAnchorElement>}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className={`inline-block transition-transform duration-300 ease-out ${className}`}
    >
      {children}
    </Link>
  );
}

export function MagneticButton({
  children,
  className = "",
  strength = 0.28,
  onClick,
  type = "button",
}: Props & { onClick?: () => void; type?: "button" | "submit" }) {
  const { ref, onMove, onLeave } = useMagnet(strength);
  return (
    <button
      type={type}
      ref={ref as Ref<HTMLButtonElement>}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      onClick={onClick}
      className={`inline-block transition-transform duration-300 ease-out ${className}`}
    >
      {children}
    </button>
  );
}
