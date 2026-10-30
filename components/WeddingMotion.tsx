"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useLayoutEffect, useRef, type ComponentProps, type ReactNode } from "react";

const NavigationContext = createContext<((href: string) => void) | null>(null);

export function WeddingMotion({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const root = useRef<HTMLDivElement>(null);
  const pending = useRef<{ pathname: string; finish: () => void } | null>(null);
  const active = useRef<ViewTransition | null>(null);

  useLayoutEffect(() => {
    if (pending.current?.pathname === pathname) pending.current.finish();
  }, [pathname]);

  const navigate = useCallback((href: string) => {
    const target = new URL(href, window.location.href);
    if (target.pathname === window.location.pathname
      || window.matchMedia("(prefers-reduced-motion: reduce)").matches
      || !document.startViewTransition) {
      router.push(href);
      return;
    }

    active.current?.skipTransition();
    pending.current?.finish();
    document.documentElement.dataset.weddingTransition = "true";
    const transition = document.startViewTransition(() => new Promise<void>((resolve) => {
      // A slow or failed route must never leave an unresponsive snapshot on screen.
      const timeout = window.setTimeout(() => { transition.skipTransition(); finish(); }, 1500);
      function finish() {
        window.clearTimeout(timeout);
        if (pending.current?.finish === finish) pending.current = null;
        resolve();
      }
      pending.current = { pathname: target.pathname, finish };
      router.push(href);
    }));
    active.current = transition;
    void transition.ready.catch(() => { /* Navigation still completes if snapshots are unavailable. */ });
    void transition.finished.catch(() => {}).finally(() => {
      if (active.current === transition) {
        active.current = null;
        delete document.documentElement.dataset.weddingTransition;
      }
    });
  }, [router]);

  useEffect(() => () => {
    active.current?.skipTransition();
    pending.current?.finish();
    delete document.documentElement.dataset.weddingTransition;
  }, []);

  useEffect(() => {
    const container = root.current;
    if (!container || !window.IntersectionObserver) return;
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const seen = new WeakSet<Element>();
    const animations = new Set<Animation>();
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(({ target, isIntersecting }) => {
        if (!isIntersecting) return;
        observer.unobserve(target);
        if (preference.matches || !target.animate) return;
        const animation = target.animate([
          { opacity: 0, translate: "0 24px" },
          { opacity: 1, translate: "0 0" },
        ], { duration: 650, delay: Number((target as HTMLElement).dataset.revealDelay ?? 0), easing: "cubic-bezier(.22,1,.36,1)", fill: "backwards" });
        animations.add(animation);
        void animation.finished.catch(() => {}).finally(() => animations.delete(animation));
      });
    }, { threshold: 0, rootMargin: "0px 0px -32px 0px" });
    function register(scope: Element) {
      const elements = [...scope.querySelectorAll("[data-reveal]")];
      if (scope.matches("[data-reveal]")) elements.unshift(scope);
      elements.forEach((element) => {
        if (seen.has(element)) return;
        seen.add(element);
        observer.observe(element);
      });
    }
    // Includes gift cards streamed by the server after the first page render.
    const mutations = new MutationObserver((records) => {
      records.forEach((record) => record.addedNodes.forEach((node) => {
        if (node instanceof Element) register(node);
      }));
    });
    mutations.observe(container, { childList: true, subtree: true });
    const stopMotion = () => {
      if (!preference.matches) return;
      animations.forEach((animation) => animation.cancel());
      active.current?.skipTransition();
    };
    preference.addEventListener("change", stopMotion);
    register(container);
    return () => {
      observer.disconnect();
      mutations.disconnect();
      animations.forEach((animation) => animation.cancel());
      preference.removeEventListener("change", stopMotion);
    };
  }, [pathname]);

  return <NavigationContext.Provider value={navigate}><div ref={root} className="wedding-experience">{children}</div></NavigationContext.Provider>;
}

export function WeddingLink({ href, onNavigate, ...props }: ComponentProps<typeof Link>) {
  const navigate = useContext(NavigationContext);
  return <Link {...props} href={href} onNavigate={(event) => {
    if (!navigate || typeof href !== "string" || onNavigate) {
      onNavigate?.(event);
      return;
    }
    event.preventDefault();
    navigate(href);
  }} />;
}
