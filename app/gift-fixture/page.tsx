"use client";
// Preview only. In-memory fixtures; never uses production writes or bypasses admin authentication.
import { useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { GiftManager } from "@/components/admin/GiftManager";
import { GiftCatalog } from "@/components/GiftCatalog";
import { parsePrice, type Gift } from "@/lib/gifts/shared";

export default function Fixture() {
  const [gifts,setGifts]=useState<Gift[]>([]);
  const [photos,setPhotos]=useState<Record<string,string>>({});
  const [view,setView]=useState("admin");
  const [uploadInfo,setUploadInfo]=useState("");
  const imageUrl=(path:string)=>photos[path] ?? "/heroDesktop.png";
  return <><div style={{background:'#fff4c9',padding:12,fontSize:14,color:'#19344e',position:'relative',zIndex:101}}>Demonstração com dados fictícios. <button onClick={()=>setView(view==='admin'?'site':'admin')}>{view==='admin'?'Ver lista pública':'Voltar ao cadastro'}</button><p role="status">{uploadInfo}</p></div>{view==='admin'?<AdminShell email="preview@example.invalid"><GiftManager gifts={gifts} imageUrl={imageUrl} onSave={async form=>{
    const id=String(form.get('id')||crypto.randomUUID());
    const old=gifts.find(g=>g.id===id);
    const photo=form.get('photo');
    let image_path=old?.image_path ?? id;
    if(photo instanceof File){
      if(photo.size>2*1024*1024) return {ok:false,message:'Foto grande demais'};
      image_path=crypto.randomUUID();
      setPhotos(p=>({...p,[image_path]:URL.createObjectURL(photo)}));
      setUploadInfo(`Foto preparada: ${photo.type}, ${photo.size} bytes.`);
    }
    const gift={id,title:String(form.get('title')),price_cents:parsePrice(String(form.get('price')))!,image_path,updated_at:new Date().toISOString()};
    setGifts(prev=>old?prev.map(g=>g.id===id?gift:g):[gift,...prev]);
    return {ok:true,message:'Presente salvo na demonstração.'};
  }} onDelete={async id=>{setGifts(prev=>prev.filter(g=>g.id!==id));return {ok:true,message:'Presente removido da demonstração.'};}} /></AdminShell>:<main className="wedding-site"><GiftCatalog gifts={gifts} imageUrl={imageUrl}/></main>}</>;
}
