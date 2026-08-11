export function HeroSection() {
  return (
    <section className="hero" id="inicio">
      <div className="hero-shade" aria-hidden="true" />
      <div className="hero-content">
        <p className="eyebrow">Nosso para sempre começa aqui</p>
        <h1>
          <span>Lista de</span>
          <span>Casamento</span>
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
