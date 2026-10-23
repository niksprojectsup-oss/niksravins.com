"use client";

import { useEffect, useState } from "react";

const SHOW_AFTER_PX = 400;

export function BackToTopButton({ label }: { label: string }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function updateVisibility() {
      setVisible(window.scrollY > SHOW_AFTER_PX);
    }

    updateVisibility();
    window.addEventListener("scroll", updateVisibility, { passive: true });
    return () => window.removeEventListener("scroll", updateVisibility);
  }, []);

  return (
    <a
      href="#top"
      aria-label={label}
      tabIndex={visible ? 0 : -1}
      aria-hidden={!visible}
      className={`fixed right-5 bottom-5 z-40 inline-flex h-11 w-11 items-center justify-center rounded-full border border-border-subtle bg-canvas/90 text-lg leading-none text-ink no-underline shadow-sm backdrop-blur-sm transition-opacity duration-200 hover:border-ink focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-accent md:right-6 md:bottom-6 ${
        visible ? "opacity-100" : "pointer-events-none opacity-0"
      }`}
      onClick={(event) => {
        event.preventDefault();
        const prefersReducedMotion = window.matchMedia(
          "(prefers-reduced-motion: reduce)",
        ).matches;
        window.scrollTo({
          top: 0,
          behavior: prefersReducedMotion ? "auto" : "smooth",
        });
      }}
    >
      ↑
    </a>
  );
}
