import { G } from "../../data/theme";

export default function SectionHeader({ title, onViewAll }) {
  return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:14 }}>
      <div style={{ fontSize:20, fontWeight:800, letterSpacing:.3 }}>{title}</div>
      {onViewAll && (
        <div onClick={onViewAll} style={{ fontSize:12, color:G.accent, cursor:"pointer", fontWeight:600 }}>
          View All →
        </div>
      )}
    </div>
  );
}
