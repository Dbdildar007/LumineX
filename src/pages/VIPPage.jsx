import { useState } from "react";
import { G } from "../data/theme";
import { useApp } from "../context/AppContext";

const PLANS = [
  { id:"monthly", label:"Monthly", price:"$9.99", period:"/month", badge:null, savings:null },
  { id:"yearly",  label:"Yearly",  price:"$79.99",period:"/year", badge:"Most Popular", savings:"Save 33%" },
  { id:"lifetime",label:"Lifetime",price:"$199",  period:"once",  badge:"Best Value",  savings:"Forever" },
];

const FEATURES = [
  "✅ Unlimited HD & 4K streaming",
  "✅ No ads, ever",
  "✅ Download videos offline",
  "✅ Early access to new content",
  "✅ Exclusive VIP-only channels",
  "✅ Priority customer support",
  "✅ Multiple device streams",
  "✅ Advanced parental controls",
];

export default function VIPPage() {
  const { showToast } = useApp();
  const [selected, setSelected] = useState("yearly");

  return (
    <div style={{ maxWidth:800, margin:"0 auto" }}>
      {/* Hero */}
      <div style={{ textAlign:"center", marginBottom:40 }}>
        <div style={{ fontSize:56, marginBottom:12 }}>💎</div>
        <h1 style={{ fontSize:32, fontWeight:900, marginBottom:10,
          background:`linear-gradient(135deg,${G.accent},${G.gold})`,
          WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>
          Go VIP Today
        </h1>
        <p style={{ color:G.muted, fontSize:15, maxWidth:480, margin:"0 auto" }}>
          Unlock the full NovaTube experience. No ads, HD streams, offline downloads and much more.
        </p>
      </div>

      {/* Plans */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))", gap:16, marginBottom:36 }}>
        {PLANS.map(plan=>(
          <div key={plan.id} onClick={()=>setSelected(plan.id)} style={{
            background: selected===plan.id?G.bg3:G.card,
            border:`2px solid ${selected===plan.id?G.accent:G.border}`,
            borderRadius:18, padding:"24px 20px", cursor:"pointer",
            transition:"all .25s", position:"relative", textAlign:"center",
            boxShadow: selected===plan.id?`0 0 40px ${G.accent}33`:"none",
            transform: selected===plan.id?"translateY(-4px)":"none",
          }}>
            {plan.badge && (
              <div style={{ position:"absolute", top:-12, left:"50%", transform:"translateX(-50%)",
                background:`linear-gradient(135deg,${G.accent},${G.accent2})`,
                color:"white", fontSize:11, fontWeight:800, padding:"4px 14px",
                borderRadius:999, whiteSpace:"nowrap" }}>{plan.badge}</div>
            )}
            <div style={{ fontSize:15, fontWeight:700, color:G.muted, marginBottom:8 }}>{plan.label}</div>
            <div style={{ fontSize:36, fontWeight:900, color:G.text, marginBottom:4 }}>{plan.price}</div>
            <div style={{ fontSize:12, color:G.muted, marginBottom:plan.savings?8:0 }}>{plan.period}</div>
            {plan.savings && (
              <div style={{ background:G.gold+"22", color:G.gold, fontSize:11, fontWeight:700,
                padding:"3px 10px", borderRadius:999, display:"inline-block" }}>{plan.savings}</div>
            )}
          </div>
        ))}
      </div>

      {/* Features */}
      <div style={{ background:G.bg3, border:`1px solid ${G.border}`, borderRadius:16, padding:"24px 28px", marginBottom:28 }}>
        <div style={{ fontSize:16, fontWeight:700, marginBottom:16 }}>Everything included:</div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))", gap:10 }}>
          {FEATURES.map(f=>(
            <div key={f} style={{ fontSize:13, color:G.muted }}>{f}</div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div style={{ textAlign:"center" }}>
        <button onClick={()=>showToast("💎 VIP subscription coming soon!")} style={{
          padding:"16px 48px", borderRadius:999,
          background:`linear-gradient(135deg,${G.accent},${G.gold})`,
          border:"none", color:"white", fontFamily:"inherit",
          fontSize:16, fontWeight:800, cursor:"pointer",
          boxShadow:`0 0 40px ${G.accent}55`, transition:"all .2s",
        }}
          onMouseEnter={e=>{ e.currentTarget.style.transform="scale(1.04) translateY(-2px)"; }}
          onMouseLeave={e=>{ e.currentTarget.style.transform="none"; }}
        >
          Get {PLANS.find(p=>p.id===selected)?.label} VIP — {PLANS.find(p=>p.id===selected)?.price}
        </button>
        <div style={{ marginTop:12, fontSize:12, color:G.muted }}>
          Cancel anytime · Secure payment · Instant access
        </div>
      </div>
    </div>
  );
}
