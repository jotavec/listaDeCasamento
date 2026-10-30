"use client";

import { useEffect, useState } from "react";
import { WeddingLink } from "./WeddingMotion";
import { Monogram } from "./Monogram";

const navigation = [
  { href: "#historia", label: "Nossa história" },
  { href: "#detalhes", label: "O grande dia" },
  { href: "#presentes", label: "Presentes" },
];

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const closeMenu = () => setMenuOpen(false);
  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 48);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  return (
    <header className={`nav-wrap${scrolled ? " is-scrolled" : ""}`}>
      <a className="monogram" href="/login" aria-label="Acessar administração" onClick={closeMenu}>
        <Monogram width={120} priority />
      </a>

      <button
        className="menu-button"
        type="button"
        onClick={() => setMenuOpen((open) => !open)}
        aria-expanded={menuOpen}
        aria-controls="site-navigation"
        aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
      >
        <span />
        <span />
      </button>

      <nav id="site-navigation" className={menuOpen ? "open" : ""}>
        {navigation.map((item) => (
          <a key={item.href} href={item.href} onClick={closeMenu}>
            {item.label}
          </a>
        ))}
        <WeddingLink className="nav-rsvp" href="/casamento/presenca" onClick={closeMenu}>
          Confirmar presença
        </WeddingLink>
      </nav>
    </header>
  );
}
