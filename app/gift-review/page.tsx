// Preview only. Excluded from the production Git tree.
export const metadata={robots:{index:false,follow:false}};
export default async function Review({searchParams}:{searchParams:Promise<{width?:string}>}) {
 const params=await searchParams;
 const width=[320,390,768,1440].includes(Number(params.width))?Number(params.width):390;
 return <main style={{padding:20,background:'#e6ebf1',minHeight:'100vh',fontFamily:'sans-serif'}}><form method="get" style={{display:'flex',gap:12,marginBottom:16,alignItems:'center'}}><strong>Prévia · lista de presentes</strong><label>Largura <select name="width" defaultValue={String(width)}>{[320,390,768,1440].map(w=><option key={w}>{w}</option>)}</select></label><button>Aplicar</button></form><iframe title="Prévia responsiva" src="/gift-fixture" style={{display:'block',width,height:844,border:0,margin:'0 auto',background:'white'}}/></main>;
}
