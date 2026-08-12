import styles from "../modulePlaceholder.module.css";

export default function Page() {
  return (
    <main className={styles.page}>
      <p>RELATÓRIOS</p>
      <h1>Relatórios do casamento</h1>
      <span>Aqui ficarão os relatórios de convidados, presentes e financeiro.</span>

      <div className={styles.empty}>
        <strong>Módulo pronto para construção</strong>
        <small>
          Vamos montar esta área mantendo o mesmo padrão visual do dashboard.
        </small>
      </div>
    </main>
  );
}
