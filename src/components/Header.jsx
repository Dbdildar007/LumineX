import { G, APP_LOGO, APP_LOGO2 } from "../data/theme";
import { useApp } from "../context/AppContext";
import useIsMobile from "../hooks/useIsMobile";

export default function Header() {
  const { setSearch, showToast, authUser, logout, setAuthPage, setTab, setCatFilter } = useApp();
  const isMobile = useIsMobile();

  return (
    <header style={{
      background: "rgba(8,8,15,.97)", backdropFilter: "blur(22px)",
      borderBottom: `1px solid ${G.border}`,
      position: "sticky", top: 0, zIndex: 1000, padding: "0 16px",
    }}>
      <div style={{ maxWidth:1600, margin:"0 auto", display:"flex", alignItems:"center", gap:12, height:58 }}>

        {/* Logo */}
        <div onClick={()=>{setTab("home");setCatFilter(null);}} style={{
          fontSize:26, fontWeight:900, letterSpacing:3, flexShrink:0,
          cursor:"pointer", fontFamily:"Georgia,serif",
        }}>
          <span style={{ background:`linear-gradient(135deg,${G.accent},${G.accent2})`,
            WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>{APP_LOGO}</span>
          <span style={{ color:"#a78bfa" }}>{APP_LOGO2}</span>
        </div>

        {/* Search bar */}
        <div style={{ flex:1, maxWidth:520, position:"relative" }}>
          <input readOnly onClick={()=>setSearch(true)} placeholder="Search videos, channels, tags…"
            style={{
              width:"100%", background:G.bg3, border:`1px solid ${G.border}`,
              borderRadius:999, color:G.text, fontFamily:"inherit",
              fontSize:13, padding:"9px 44px 9px 18px", outline:"none", cursor:"pointer",
            }}
          />
          <span onClick={()=>setSearch(true)} style={{
            position:"absolute", right:14, top:"50%", transform:"translateY(-50%)",
            color:G.muted, fontSize:16, cursor:"pointer",
          }}>🔍</span>
        </div>

        {/* Actions */}
        <div style={{ display:"flex", alignItems:"center", gap:8, marginLeft:"auto" }}>
          <HBtn onClick={()=>showToast("🔔 No new notifications")}>
            🔔
            <span style={{
              position:"absolute", top:-2, right:-2,
              background:G.accent, color:"white", fontSize:9, fontWeight:700,
              minWidth:16, height:16, borderRadius:99,
              display:"flex", alignItems:"center", justifyContent:"center",
              border:`2px solid ${G.bg}`,
            }}>3</span>
          </HBtn>

          {!isMobile && (
            <HBtn onClick={()=>{setTab("favorites");setCatFilter(null);}}>❤️</HBtn>
          )}

          {!isMobile && (
            <button onClick={()=>showToast("📤 Upload coming soon!")} style={{
              display:"flex", alignItems:"center", gap:6,
              background:`linear-gradient(135deg,${G.accent},${G.accent2})`,
              border:"none", borderRadius:999, color:"white",
              fontFamily:"inherit", fontSize:13, fontWeight:600,
              padding:"8px 18px", cursor:"pointer", transition:"all .2s",
            }}
              onMouseEnter={e=>{e.currentTarget.style.transform="scale(1.05)";}}
              onMouseLeave={e=>{e.currentTarget.style.transform="scale(1)";}}
            >📤 Upload</button>
          )}

          {authUser ? (
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <div style={{
                width:34, height:34, borderRadius:"50%",
                background:`linear-gradient(135deg,${G.accent},${G.accent2})`,
                display:"flex", alignItems:"center", justifyContent:"center",
                fontSize:15, fontWeight:700, color:"white", cursor:"pointer",
                border:`2px solid ${G.accent}44`,
              }} title={authUser.name}>
                {authUser.name[0].toUpperCase()}
              </div>
              {!isMobile && (
                <span style={{fontSize:13,color:G.muted,maxWidth:90,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                  {authUser.name}
                </span>
              )}
              <button onClick={logout} style={{
                background:"transparent", border:`1px solid ${G.border}`,
                borderRadius:999, color:G.muted, fontFamily:"inherit",
                fontSize:12, fontWeight:600, padding:"6px 12px", cursor:"pointer",
              }}>Logout</button>
            </div>
          ) : (
            <div style={{display:"flex",gap:8}}>
              <button onClick={()=>setAuthPage("login")} style={{
                background:"transparent", border:`1px solid ${G.accent}`,
                borderRadius:999, color:G.accent, fontFamily:"inherit",
                fontSize:13, fontWeight:600, padding:"7px 16px", cursor:"pointer", transition:"all .2s",
              }}
                onMouseEnter={e=>{e.currentTarget.style.background=G.accent;e.currentTarget.style.color="white";}}
                onMouseLeave={e=>{e.currentTarget.style.background="transparent";e.currentTarget.style.color=G.accent;}}
              >Login</button>
              {!isMobile && (
                <button onClick={()=>setAuthPage("signup")} style={{
                  background:`linear-gradient(135deg,${G.accent},${G.accent2})`,
                  border:"none", borderRadius:999, color:"white", fontFamily:"inherit",
                  fontSize:13, fontWeight:600, padding:"7px 16px", cursor:"pointer", transition:"all .2s",
                }}
                  onMouseEnter={e=>{e.currentTarget.style.transform="scale(1.04)";}}
                  onMouseLeave={e=>{e.currentTarget.style.transform="scale(1)";}}
                >Sign Up</button>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

function HBtn({ onClick, children }) {
  return (
    <button onClick={onClick} style={{
      width:38, height:38, borderRadius:"50%", border:"none",
      background:G.bg3, color:G.muted, cursor:"pointer",
      display:"flex", alignItems:"center", justifyContent:"center",
      fontSize:17, position:"relative", transition:"all .2s",
    }}
      onMouseEnter={e=>{e.currentTarget.style.background=G.bg2;e.currentTarget.style.color=G.text;}}
      onMouseLeave={e=>{e.currentTarget.style.background=G.bg3;e.currentTarget.style.color=G.muted;}}
    >{children}</button>
  );
}
