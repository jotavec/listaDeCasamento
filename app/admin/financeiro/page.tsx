import styles from "../modulePlaceholder.module.css";

export default function Page() {
  return (
    <main className={styles.page}>
      <p>FINANCEIRO</p>
      <h1>Gestão financeira</h1>
      <span>Aqui vamos centralizar valores recebidos, presentes pagos e movimentações do casamento.</span>

      <div className={styles.empty}>
        <strong>Módulo pronto para construção</strong>
        <small>
          Vamos montar esta área mantendo o mesmo padrão visual do dashboard.
        </small>
      </div>
    </main>
  );
}
