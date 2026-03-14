import { useState } from "react";
import { CATEGORIES } from "../data/videos";
import { useApp } from "../context/AppContext";
import { G } from "../data/theme";
import SectionHeader from "../components/ui/SectionHeader";

export default function CategoriesPage() {
  const { setCatFilter, setTab } = useApp();
  return (
    <div>
      <SectionHeader title="🏷 All Categories"/>
      <div style={{
        display:"grid",
        gridTemplateColumns:"repeat(auto-fill,minmax(145px,1fr))",
        gap:12,
      }}>
        {CATEGORIES.map(c=>(
          <CatCard key={c.name} cat={c} onClick={()=>{ setCatFilter(c.name); setTab("home"); }}/>
        ))}
      </div>
    </div>
  );
}

function CatCard({ cat, onClick }) {
  const [hov, setHov] = useState(false);
  return (
    <div onClick={onClick} onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)} style={{
      background: hov?G.cardH:G.card,
      border:`1px solid ${hov?cat.color+"88":G.border}`,
      borderRadius:12, padding:"18px 10px", textAlign:"center",
      cursor:"pointer", transition:"all .25s",
      transform: hov?"translateY(-4px)":"none",
      boxShadow: hov?`0 12px 30px rgba(0,0,0,.5),0 0 20px ${cat.color}33`:"none",
    }}>
      <div style={{ fontSize:28, marginBottom:8 }}>{cat.icon}</div>
      <div style={{ fontSize:12, fontWeight:700, marginBottom:3 }}>{cat.name}</div>
      <div style={{ fontSize:10, color:G.muted }}>{cat.count}</div>
    </div>
  );
}
