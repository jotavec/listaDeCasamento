"use client";

import { useState } from "react";
import { Monogram } from "./Monogram";

const navigation = [
  { href: "#historia", label: "Nossa história" },
  { href: "#detalhes", label: "O grande dia" },
  { href: "#presentes", label: "Presentes" },
];

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="nav-wrap">
      <a className="monogram" href="#inicio" aria-label="Voltar ao início" onClick={closeMenu}>
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
        <a className="nav-rsvp" href="#presenca" onClick={closeMenu}>
          Confirmar presença
        </a>
      </nav>
    </header>
  );
}
