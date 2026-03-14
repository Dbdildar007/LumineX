import { G } from "../../data/theme";

export default function Toast({ msg }) {
  if (!msg) return null;
  return (
    <div style={{
      position: "fixed", bottom: 90, left: "50%",
      transform: "translateX(-50%)",
      background: "rgba(18,18,30,0.97)", backdropFilter: "blur(20px)",
      border: `1px solid ${G.border}`, borderRadius: 12, padding: "10px 22px",
      color: G.text, fontSize: 13, fontWeight: 600, zIndex: 99999,
      display: "flex", alignItems: "center", gap: 8, whiteSpace: "nowrap",
      boxShadow: "0 8px 40px rgba(0,0,0,0.7)",
      animation: "toastPop .3s cubic-bezier(0.34,1.56,0.64,1)",
      pointerEvents: "none",
    }}>{msg}</div>
  );
}
