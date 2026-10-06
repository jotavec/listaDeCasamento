import { getImageProps } from "next/image";

export function HeroSection() {
  const { props: desktop } = getImageProps({ src: "/heroDesktop.png", width: 1672, height: 941, alt: "", sizes: "100vw", loading: "eager", fetchPriority: "high" });
  const { props: mobile } = getImageProps({ src: "/heroMobile.png", width: 941, height: 1672, alt: "", sizes: "100vw" });
  return (
    <section className="hero" id="inicio">
      <picture>
        <source media="(max-width: 760px)" srcSet={mobile.srcSet} sizes="100vw" />
        {/* Art direction uses the optimized sources produced by Next Image. */}
        <img {...desktop} className="hero-art" alt="" />
      </picture>
      <div className="hero-shade" aria-hidden="true" />
      <div className="hero-content">
        <p className="eyebrow">Nosso para sempre começa aqui</p>
        <h1>
          <span>Jéssica</span>
          <span className="nameSeparator">&amp;</span>
          <span>João Vítor</span>
        </h1>
        <div className="gold-line" aria-hidden="true" />
      </div>
      <div className="hero-bottom">
        <p className="date">26 · 03 · 2027</p>
        <p className="place">Goiânia · Goiás</p>
        <a className="scroll" href="#historia" aria-label="Continuar para nossa história">
          <span aria-hidden="true">⌄</span>
        </a>
      </div>
    </section>
  );
}
