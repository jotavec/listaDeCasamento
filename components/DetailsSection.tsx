export function DetailsSection() {
  return (
    <section className="details" id="detalhes">
      <p className="section-kicker">Reserve esta data</p>
      <h2>O grande dia</h2>
      <div className="detail-grid">
        <article>
          <span className="detail-icon" aria-hidden="true">♢</span>
          <h3>Nossa celebração</h3>
          <p>
            <strong>Sexta-feira, 26 de março</strong>
            <br />
            Prepare o coração para comemorar conosco. Horário e local serão revelados em breve.
          </p>
          <button type="button" disabled>Mais detalhes em breve</button>
        </article>
      </div>
      <p className="dress-note">
        <span aria-hidden="true">✦</span> Traje sugerido: passeio completo <span aria-hidden="true">✦</span>
      </p>
    </section>
  );
}
