import { G } from "../../data/theme";

const PROVIDERS = [
  ["G","Google","#4285F4"],
  ["f","Facebook","#1877F2"],
  ["X","Twitter/X","#000"],
];

export default function SocialBtns({ label }) {
  return (
    <div>
      <div style={{ display:"flex", alignItems:"center", gap:12, margin:"20px 0" }}>
        <div style={{ flex:1, height:1, background:G.border }}/>
        <span style={{ fontSize:12, color:G.muted, whiteSpace:"nowrap" }}>or {label} with</span>
        <div style={{ flex:1, height:1, background:G.border }}/>
      </div>
      <div style={{ display:"flex", gap:10 }}>
        {PROVIDERS.map(([icon,name,color])=>(
          <button key={name} style={{
            flex:1, padding:"11px 8px", borderRadius:12,
            border:`1px solid ${G.border}`, background:G.bg3,
            color:G.text, fontFamily:"inherit", fontSize:13, fontWeight:600,
            cursor:"pointer", display:"flex", alignItems:"center",
            justifyContent:"center", gap:8, transition:"all .2s",
          }}
            onMouseEnter={e=>{e.currentTarget.style.borderColor=color;e.currentTarget.style.background=color+"18";}}
            onMouseLeave={e=>{e.currentTarget.style.borderColor=G.border;e.currentTarget.style.background=G.bg3;}}
          >
            <span style={{ fontSize:16, fontWeight:900, color }}>{icon}</span>
            {name.split("/")[0]}
          </button>
        ))}
      </div>
    </div>
  );
}
