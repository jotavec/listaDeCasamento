import styles from "../modulePlaceholder.module.css";

export default function Page() {
  return (
    <main className={styles.page}>
      <p>PRESENTES</p>
      <h1>Lista de presentes</h1>
      <span>Aqui vamos cadastrar os presentes disponíveis no site, valor, imagem e status.</span>

      <div className={styles.empty}>
        <strong>Módulo pronto para construção</strong>
        <small>
          Vamos montar esta área mantendo o mesmo padrão visual do dashboard.
        </small>
      </div>
    </main>
  );
}
