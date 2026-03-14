import { G } from "../../data/theme";

export default function ABtn({ onClick, children, active, color }) {
  return (
    <button onClick={onClick} style={{
      display:"flex", alignItems:"center", gap:6, padding:"8px 14px",
      borderRadius:8, border:`1px solid ${active ? color : G.border}`,
      background: active ? color+"22" : G.bg3,
      color: active ? color : G.text,
      fontSize:13, fontWeight:600, cursor:"pointer",
      fontFamily:"inherit", transition:"all .2s",
    }}>{children}</button>
  );
}
