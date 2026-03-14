import { useState } from "react";
import { G } from "../../data/theme";

export default function PBtn({ onClick, children, title }) {
  const [hov, setHov] = useState(false);
  return (
    <button onClick={onClick} title={title}
      onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{
        background: hov ? `${G.accent}22` : "none",
        border: hov ? `1px solid ${G.accent}44` : "1px solid transparent",
        borderRadius:8, color: hov ? G.accent : "white",
        fontSize:18, cursor:"pointer", padding:"4px 8px",
        lineHeight:1, fontFamily:"inherit", transition:"all .15s",
        transform: hov ? "scale(1.15)" : "scale(1)",
        display:"flex", alignItems:"center", justifyContent:"center", minWidth:32,
      }}
    >{children}</button>
  );
}
