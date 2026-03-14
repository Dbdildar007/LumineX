import { useState, useEffect } from "react";
import { G, APP_LOGO, APP_LOGO2 } from "../data/theme";
import { ALL_VIDEOS } from "../data/videos";

const HERO_ITEMS = ALL_VIDEOS.filter(v => v.badge==="4K"||v.badge==="HOT").slice(0,5);

export default function HeroBanner({ onCta }) {
  const [idx, setIdx] = useState(0);
  const item = HERO_ITEMS[idx];

  useEffect(() => {
    const t = setInterval(() => setIdx(i => (i+1) % HERO_ITEMS.length), 5000);
    return () => clearInterval(t);
  }, []);

  return (
    <div style={{
      position:"relative", borderRadius:16, overflow:"hidden",
      marginBottom:28, height:300, background:G.bg3,
      boxShadow:`0 0 60px ${G.accent}22`,
    }}>
      <img src={item.thumb} alt={item.title} key={item.id} style={{
        position:"absolute", inset:0, width:"100%", height:"100%",
        objectFit:"cover", opacity:.45,
        animation:"fadeIn .6s ease",
      }}/>
      <div style={{
        position:"absolute", inset:0,
        background:`linear-gradient(135deg,rgba(8,8,15,.95) 0%,rgba(8,8,15,.5) 60%,transparent 100%)`,
      }}/>
      <div style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column",
        justifyContent:"center", padding:"28px 32px" }}>
        <div style={{ fontSize:11, fontWeight:700, color:G.accent, letterSpacing:2,
          textTransform:"uppercase", marginBottom:8 }}>🔥 Featured</div>
        <h2 style={{ fontSize:24, fontWeight:900, lineHeight:1.3, marginBottom:8,
          maxWidth:480, color:G.text }}>{item.title}</h2>
        <div style={{ fontSize:12, color:G.muted, marginBottom:18 }}>
          {item.channel} &nbsp;·&nbsp; {item.views} views &nbsp;·&nbsp; ⭐ {item.rating}
        </div>
        <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
          <button onClick={onCta} style={{
            padding:"10px 24px", borderRadius:999,
            background:`linear-gradient(135deg,${G.accent},${G.accent2})`,
            border:"none", color:"white", fontFamily:"inherit",
            fontSize:13, fontWeight:700, cursor:"pointer",
            boxShadow:`0 0 20px ${G.accent}55`,
          }}>▶ Watch Now</button>
          <button style={{
            padding:"10px 24px", borderRadius:999, fontFamily:"inherit",
            border:`1px solid ${G.border}`, background:"rgba(255,255,255,.08)",
            color:G.text, fontSize:13, fontWeight:600, cursor:"pointer",
          }}>+ Add to List</button>
        </div>
      </div>
      {/* Dots */}
      <div style={{ position:"absolute", bottom:14, right:18, display:"flex", gap:6 }}>
        {HERO_ITEMS.map((_,i)=>(
          <div key={i} onClick={()=>setIdx(i)} style={{
            width:i===idx?20:6, height:6, borderRadius:99,
            background:i===idx?G.accent:"rgba(255,255,255,.3)",
            cursor:"pointer", transition:"all .3s",
          }}/>
        ))}
      </div>
    </div>
  );
}
