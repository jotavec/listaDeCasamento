// Preview branch only: responsive visual review, excluded from production.
export const metadata = { robots: { index: false, follow: false } };
export default async function Review({ searchParams }: { searchParams: Promise<{ width?: string; view?: string }> }) {
  const params = await searchParams;
  const width = [320, 390, 768, 1440].includes(Number(params.width)) ? Number(params.width) : 390;
  const view = params.view ?? "site";
  const paths: Record<string, string> = { site: "/casamento", login: "/login", recovery: "/recuperar-senha", guests: "/ui-fixture?view=guests", dashboard: "/ui-fixture?view=dashboard" };
  return <main style={{ padding: 20, background: "#e6ebf1", minHeight: "100vh", fontFamily: "sans-serif" }}>
    <form method="get" style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 16 }}>
      <strong>Revisão visual</strong>
      <label>Tela <select name="view" defaultValue={view}><option value="site">Casamento</option><option value="login">Login</option><option value="recovery">Recuperar senha</option><option value="guests">Convidados · exemplo</option><option value="dashboard">Painel · exemplo</option></select></label>
      <label>Largura <select name="width" defaultValue={String(width)}>{[320,390,768,1440].map(w => <option key={w}>{w}</option>)}</select></label>
      <button type="submit">Aplicar</button>
      <span>Prévia de layout; painel com dados fictícios.</span>
    </form>
    <iframe title="Prévia responsiva" src={paths[view] ?? paths.site} style={{ display:"block", width, height:844, border:0, margin:"0 auto", background:"white", boxShadow:"0 4px 24px #1b355022" }} />
  </main>;
}
