import { G } from "../../data/theme";

export default function FilterChip({ label, active, onClick }) {
  return (
    <div onClick={onClick} style={{
      padding: "6px 14px", borderRadius: 999, fontSize: 12, fontWeight: 600,
      cursor: "pointer", border: `1px solid ${active ? G.accent : G.border}`,
      background: active ? G.accent : G.bg3, color: active ? "white" : G.muted,
      whiteSpace: "nowrap", transition: "all .2s",
    }}>
      {label === "all" ? "All" : label}
    </div>
  );
}
