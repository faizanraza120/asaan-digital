"use client";

import { AnimatePresence, motion } from "motion/react";
import dynamic from "next/dynamic";
import { useState } from "react";
import { services } from "@/lib/site";

/*
 * Split out of the main bundle. The demo is only ever seen by someone who
 * opens the chatbots row, so it should not be part of what everyone else
 * downloads to read the page. The reserved box stops the row from jumping
 * as it arrives.
 */
const WhatsAppDemo = dynamic(
  () => import("@/components/demos/WhatsAppDemo").then((m) => m.WhatsAppDemo),
  { loading: () => <div className="h-[38rem]" /> },
);

/**
 * What we do, built as the Lovable services rows: hairline list, mono
 * number, oversized display title that turns accent when open, and Open or
 * Close held at the right edge. Opening a row reveals the summary on the
 * left and the detail as a hairline list on the right.
 *
 * This lives on the home page because there is no services route. Lovable
 * split the two, a short teaser list at home and the real rows on their own
 * page, and with six services and no page to send anyone to, the real rows
 * belong here. First row opens by default so the pattern is obvious without
 * anyone having to discover it.
 */
export function Services() {
  const [open, setOpen] = useState<string | null>(services[0].n);

  return (
    <section
      id="services"
      className="px-6 py-24 md:px-10 md:py-36"
    >
      <p className="label-xs mb-16">What we do</p>

      <ul className="border-t border-line">
        {services.map((service) => {
          const isOpen = open === service.n;
          return (
            <li key={service.n} className="border-b border-line">
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : service.n)}
                aria-expanded={isOpen}
                aria-controls={`service-${service.n}`}
                className="flex w-full flex-wrap items-baseline gap-x-8 gap-y-2 py-8 text-left"
              >
                <span className="label-xs w-10">{service.n}</span>
                <span
                  className={`display flex-1 text-[clamp(1.75rem,5vw,4rem)] transition-colors ${
                    isOpen ? "text-primary" : ""
                  }`}
                >
                  {service.title}
                </span>
                <span className="label-xs">{isOpen ? "Close" : "Open"}</span>
              </button>

              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    id={`service-${service.n}`}
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    className="overflow-hidden"
                  >
                    <div className="grid gap-8 pb-10 md:grid-cols-2 md:pl-18">
                      <p className="max-w-md text-lg text-muted-foreground">
                        {service.summary}
                      </p>
                      <ul className="space-y-2">
                        {service.detail.map((item) => (
                          <li
                            key={item}
                            className="border-b border-line pb-2 text-sm"
                          >
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {service.demo === "chat" && (
                      <div className="pb-12 md:pl-18">
                        <p className="label-xs mb-6">
                          An example conversation, not a live bot
                        </p>
                        <WhatsAppDemo />
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
