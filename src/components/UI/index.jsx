import { useState, useRef } from "react";
import { G, APP_LOGO, APP_LOGO2 } from "../../data/theme";

// ── Logo ──────────────────────────────────────────────────────────────────────
export function Logo({ size = 24, onClick }) {
  return (
    <div onClick={onClick} style={{
      fontSize: size, fontWeight: 800, letterSpacing: 1,
      cursor: onClick ? "pointer" : "default",
      fontFamily: "'Syne', sans-serif", display: "flex", alignItems: "center", gap: 2,
    }}>
      <span style={{
        background: "linear-gradient(135deg,#c084fc,#818cf8,#f472b6)",
        WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
      }}>{APP_LOGO}</span>
      <span style={{ color: G.text }}>{APP_LOGO2}</span>
    </div>
  );
}

// ── App Icon SVG ──────────────────────────────────────────────────────────────
export function AppIcon({ size = 40 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <defs>
        <linearGradient id="ig1" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#c084fc"/>
          <stop offset="50%" stopColor="#818cf8"/>
          <stop offset="100%" stopColor="#f472b6"/>
        </linearGradient>
      </defs>
      <rect width="40" height="40" rx="12" fill="url(#ig1)"/>
      <polygon points="16,12 30,20 16,28" fill="white" opacity="0.95"/>
      <circle cx="13" cy="27" r="3" fill="white" opacity="0.8"/>
      <line x1="13" y1="24" x2="13" y2="12" stroke="white" strokeWidth="2" opacity="0.8"/>
    </svg>
  );
}

// ── Toast ─────────────────────────────────────────────────────────────────────
export function Toast({ toast }) {
  if (!toast) return null;
  const colors = { success: G.green, error: G.red, info: G.accent, warning: G.gold };
  const icons  = { success: "✓", error: "✕", info: "💡", warning: "⚠" };
  const c = colors[toast.type] || G.accent;
  return (
    <div style={{
      position: "fixed", bottom: 80, left: "50%", zIndex: 99999,
      transform: "translateX(-50%)",
      background: "rgba(8,8,15,0.97)", backdropFilter: "blur(20px)",
      border: `1px solid ${c}44`, borderRadius: 12,
      padding: "11px 20px",
      color: G.text, fontSize: 13, fontWeight: 600,
      display: "flex", alignItems: "center", gap: 10,
      whiteSpace: "nowrap", maxWidth: "90vw",
      boxShadow: `0 8px 40px rgba(0,0,0,.7), 0 0 0 1px ${c}22`,
      animation: "toastIn .3s cubic-bezier(0.34,1.56,0.64,1)",
      pointerEvents: "none",
    }}>
      <span style={{ color: c, fontSize: 15 }}>{icons[toast.type] || "•"}</span>
      {toast.msg}
    </div>
  );
}

// ── Button ────────────────────────────────────────────────────────────────────
export function Btn({ children, onClick, variant = "primary", size = "md", disabled, loading, fullWidth, style: s }) {
  const sizes = { sm:"6px 12px;font-size:12px", md:"10px 20px;font-size:14px", lg:"13px 28px;font-size:15px" };
  const [pad, fs] = sizes[size].split(";font-size:");
  const variants = {
    primary: { background:`linear-gradient(135deg,${G.accent},${G.accent2})`, border:"none", color:"white", boxShadow:`0 0 24px ${G.accent}33` },
    secondary: { background:G.bg3, border:`1px solid ${G.border}`, color:G.text },
    ghost: { background:"none", border:`1px solid ${G.accent}44`, color:G.accent },
    danger: { background:G.red+"22", border:`1px solid ${G.red}44`, color:G.red },
  };
  return (
    <button onClick={onClick} disabled={disabled || loading} style={{
      ...variants[variant],
      padding: pad, fontSize: fs.replace("px","") + "px",
      borderRadius: 10, cursor: disabled || loading ? "not-allowed" : "pointer",
      fontFamily: "inherit", fontWeight: 600, transition: "all .2s",
      display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 7,
      width: fullWidth ? "100%" : "auto",
      opacity: disabled ? 0.5 : 1,
      ...s,
    }}
      onMouseEnter={e => { if (!disabled) e.currentTarget.style.transform = "translateY(-1px) scale(1.02)"; }}
      onMouseLeave={e => { e.currentTarget.style.transform = "none"; }}
    >
      {loading ? <Spinner size={14} /> : children}
    </button>
  );
}

// ── Spinner ───────────────────────────────────────────────────────────────────
export function Spinner({ size = 20, color }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      border: `2px solid ${color || G.accent}33`,
      borderTopColor: color || G.accent,
      animation: "spin .7s linear infinite", flexShrink: 0,
    }}/>
  );
}

// ── Avatar ────────────────────────────────────────────────────────────────────
export function Avatar({ profile, size = 36, onClick }) {
  const [err, setErr] = useState(false);
  const initials = (profile?.display_name || profile?.username || "?")[0].toUpperCase();
  const bg = getAvatarBg(profile?.username || "");

  if (profile?.avatar_url && !err) {
    return (
      <img src={profile.avatar_url} alt={initials} onError={() => setErr(true)}
        onClick={onClick}
        style={{
          width: size, height: size, borderRadius: "50%",
          objectFit: "cover", flexShrink: 0, cursor: onClick ? "pointer" : "default",
          border: `2px solid ${G.border}`,
        }}
      />
    );
  }
  return (
    <div onClick={onClick} style={{
      width: size, height: size, borderRadius: "50%",
      background: bg, display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size * 0.38, fontWeight: 800, color: "white",
      cursor: onClick ? "pointer" : "default", flexShrink: 0,
      userSelect: "none", border: `2px solid ${G.border}`,
    }}>
      {initials}
    </div>
  );
}

function getAvatarBg(username) {
  const bgs = ["linear-gradient(135deg,#c084fc,#818cf8)","linear-gradient(135deg,#f472b6,#c084fc)","linear-gradient(135deg,#34d399,#06b6d4)","linear-gradient(135deg,#fbbf24,#f97316)","linear-gradient(135deg,#818cf8,#3b82f6)"];
  let h = 0;
  for (let i = 0; i < username.length; i++) h = (h * 31 + username.charCodeAt(i)) & 0xffffffff;
  return bgs[Math.abs(h) % bgs.length];
}

// ── Skeleton ──────────────────────────────────────────────────────────────────
export function Skeleton({ width = "100%", height = 16, radius = 8, style: s }) {
  return <div className="skeleton" style={{ width, height, borderRadius: radius, ...s }}/>;
}

// ── Section header ────────────────────────────────────────────────────────────
export function SectionHeader({ title, action, actionLabel }) {
  return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16 }}>
      <h2 style={{ fontSize:18, fontWeight:800, fontFamily:"'Syne',sans-serif", letterSpacing:.3 }}>{title}</h2>
      {action && (
        <span onClick={action} style={{ fontSize:12, color:G.accent, cursor:"pointer", fontWeight:600 }}>
          {actionLabel || "View all"} →
        </span>
      )}
    </div>
  );
}

// ── HScroll ───────────────────────────────────────────────────────────────────
export function HScroll({ children }) {
  const ref = useRef(null);
  const scroll = d => ref.current?.scrollBy({ left: d * 280, behavior: "smooth" });
  return (
    <div style={{ position: "relative" }}>
      <button onClick={() => scroll(-1)} style={arrowSt("left")}>‹</button>
      <div ref={ref} style={{ display:"flex", gap:12, overflowX:"auto", scrollbarWidth:"none", paddingBottom:4, scrollSnapType:"x mandatory" }}>
        {children}
      </div>
      <button onClick={() => scroll(1)} style={arrowSt("right")}>›</button>
    </div>
  );
}
const arrowSt = side => ({
  position:"absolute", [side]:-14, top:"38%", transform:"translateY(-50%)",
  width:32, height:32, borderRadius:"50%", background:"rgba(8,8,15,.95)",
  border:`1px solid ${G.border}`, color:"white", fontSize:18, cursor:"pointer",
  display:"flex", alignItems:"center", justifyContent:"center", zIndex:5, transition:"all .2s",
});

// ── FilterChip ────────────────────────────────────────────────────────────────
export function FilterChip({ label, active, onClick, icon }) {
  return (
    <div onClick={onClick} style={{
      padding: "6px 14px", borderRadius: 999, fontSize: 12, fontWeight: 600,
      cursor: "pointer", whiteSpace: "nowrap", transition: "all .2s",
      border: `1px solid ${active ? G.accent : G.border}`,
      background: active ? `${G.accent}22` : G.bg3,
      color: active ? G.accent : G.muted,
      display: "flex", alignItems: "center", gap: 5,
    }}>
      {icon && <span>{icon}</span>}{label}
    </div>
  );
}

// ── Modal shell ───────────────────────────────────────────────────────────────
export function Modal({ onClose, children, maxWidth = 480, noPad }) {
  return (
    <div onClick={e => e.target === e.currentTarget && onClose()} style={{
      position: "fixed", inset: 0, zIndex: 9000,
      background: "rgba(0,0,0,.8)", backdropFilter: "blur(12px)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "16px", overflowY: "auto",
      animation: "fadeIn .2s ease",
    }}>
      <div style={{
        width: "100%", maxWidth,
        background: G.bg2, border: `1px solid ${G.border}`,
        borderRadius: 20, position: "relative",
        padding: noPad ? 0 : "28px 28px",
        boxShadow: `0 0 0 1px ${G.border}, 0 40px 80px rgba(0,0,0,.7)`,
        animation: "scaleIn .25s cubic-bezier(0.34,1.2,0.64,1)",
      }}>
        <button onClick={onClose} style={{
          position: "absolute", top: 14, right: 14,
          background: G.bg3, border: `1px solid ${G.border}`,
          borderRadius: "50%", width: 32, height: 32, color: G.muted,
          fontSize: 16, cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>✕</button>
        {children}
      </div>
    </div>
  );
}

// ── Empty state ───────────────────────────────────────────────────────────────
export function EmptyState({ emoji = "📭", title, subtitle }) {
  return (
    <div style={{ textAlign:"center", padding:"60px 20px", color:G.muted, animation:"fadeUp .4s ease" }}>
      <div style={{ fontSize:52, marginBottom:12 }}>{emoji}</div>
      <div style={{ fontSize:16, fontWeight:700, color:G.text, marginBottom:6 }}>{title}</div>
      {subtitle && <div style={{ fontSize:13 }}>{subtitle}</div>}
    </div>
  );
}

// ── VIP Badge ─────────────────────────────────────────────────────────────────
export function VipBadge({ small }) {
  return (
    <span style={{
      background: "linear-gradient(135deg,#fbbf24,#f97316)",
      color: "#000", fontSize: small ? 8 : 10, fontWeight: 900,
      padding: small ? "1px 5px" : "2px 7px", borderRadius: 4,
      letterSpacing: .5, textTransform: "uppercase",
    }}>VIP</span>
  );
}

// ── Verified badge ────────────────────────────────────────────────────────────
export function VerifiedBadge({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="8" fill="#3b82f6"/>
      <path d="M4.5 8L7 10.5L11.5 6" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

// ── Input ─────────────────────────────────────────────────────────────────────
export function Input({ label, type="text", value, onChange, placeholder, icon, error, hint, autoFocus, onKeyDown, readOnly, right }) {
  const [focused, setFocused] = useState(false);
  const [show,    setShow]    = useState(false);
  const isPass = type === "password";
  return (
    <div style={{ marginBottom: 16 }}>
      {label && <label style={{ display:"block", fontSize:11, fontWeight:700, color:G.muted, marginBottom:6, textTransform:"uppercase", letterSpacing:.5 }}>{label}</label>}
      <div style={{ position:"relative" }}>
        {icon && <span style={{ position:"absolute", left:13, top:"50%", transform:"translateY(-50%)", fontSize:16, pointerEvents:"none", zIndex:1 }}>{icon}</span>}
        <input
          type={isPass && !show ? "password" : "text"}
          value={value} onChange={onChange} placeholder={placeholder}
          autoFocus={autoFocus} onKeyDown={onKeyDown} readOnly={readOnly}
          onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
          style={{
            width:"100%", background:G.bg3,
            border: `1.5px solid ${error ? G.red : focused ? G.accent : G.border}`,
            borderRadius:10, color:G.text, fontFamily:"inherit",
            fontSize:14, padding: `11px ${(isPass||right)?40:14}px 11px ${icon?40:14}px`,
            outline:"none", transition:"border-color .2s, box-shadow .2s",
            boxShadow: focused ? `0 0 0 3px ${error?G.red:G.accent}1a` : "none",
          }}
        />
        {isPass && (
          <button type="button" onClick={() => setShow(s=>!s)} style={{
            position:"absolute", right:12, top:"50%", transform:"translateY(-50%)",
            background:"none", border:"none", cursor:"pointer", color:G.muted, fontSize:15, padding:4,
          }}>{show?"🙈":"👁"}</button>
        )}
        {right && !isPass && <div style={{ position:"absolute", right:10, top:"50%", transform:"translateY(-50%)" }}>{right}</div>}
      </div>
      {error && <div style={{ fontSize:11, color:G.red, marginTop:4 }}>⚠ {error}</div>}
      {hint && !error && <div style={{ fontSize:11, color:G.muted, marginTop:4 }}>{hint}</div>}
    </div>
  );
}

// ── Format numbers ────────────────────────────────────────────────────────────
export function fmtNum(n) {
  if (!n) return "0";
  if (n >= 1_000_000) return (n/1_000_000).toFixed(1) + "M";
  if (n >= 1_000)     return (n/1_000).toFixed(1) + "K";
  return String(n);
}

export function fmtTime(s) {
  const m = Math.floor((s||0) / 60);
  const sec = Math.floor((s||0) % 60);
  return `${m}:${String(sec).padStart(2,"0")}`;
}

export function timeAgo(ts) {
  const s = Math.floor((Date.now() - new Date(ts)) / 1000);
  if (s < 60)    return "just now";
  if (s < 3600)  return `${Math.floor(s/60)}m ago`;
  if (s < 86400) return `${Math.floor(s/3600)}h ago`;
  if (s < 604800)return `${Math.floor(s/86400)}d ago`;
  return new Date(ts).toLocaleDateString();
}
