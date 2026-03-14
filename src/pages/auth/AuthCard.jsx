import { G } from "../../data/theme";

export default function AuthCard({ children, title, subtitle }) {
  const emoji = title==="Welcome Back" ? "👋" : title==="Create Account" ? "🚀" : "🔑";
  return (
    <div style={{
      width:"100%", maxWidth:440,
      background:"rgba(12,12,22,0.88)", backdropFilter:"blur(28px)",
      border:`1px solid ${G.accent}28`, borderRadius:24,
      padding:"40px 36px 36px",
      boxShadow:`0 0 0 1px ${G.border}, 0 40px 80px rgba(0,0,0,.6)`,
      animation:"slideUp .5s cubic-bezier(0.34,1.2,0.64,1) both",
    }}>
      <div style={{ textAlign:"center", marginBottom:32 }}>
        <div style={{ fontSize:36, marginBottom:12 }}>{emoji}</div>
        <h2 style={{ fontSize:26, fontWeight:900, color:G.text, marginBottom:8, letterSpacing:.5 }}>{title}</h2>
        <p style={{ fontSize:14, color:G.muted, lineHeight:1.6 }}>{subtitle}</p>
      </div>
      {children}
    </div>
  );
}
