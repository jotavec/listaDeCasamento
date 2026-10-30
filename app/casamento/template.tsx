"use client";

import { useLayoutEffect, useRef, type ReactNode } from "react";

export default function WeddingTemplate({ children }: { children: ReactNode }) {
  const container = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    // Native route transitions own their animation. This fallback runs once on
    // direct visits and browser Back, without restarting after a native transition.
    if (document.documentElement.dataset.weddingTransition || preference.matches || !container.current?.animate) return;
    const animation = container.current.animate([{ opacity: 0 }, { opacity: 1 }], {
      duration: 380, easing: "cubic-bezier(.22,1,.36,1)",
    });
    const stop = () => { if (preference.matches) animation.cancel(); };
    preference.addEventListener("change", stop);
    return () => { animation.cancel(); preference.removeEventListener("change", stop); };
  }, []);
  return <div ref={container} className="wedding-page-enter">{children}</div>;
}
