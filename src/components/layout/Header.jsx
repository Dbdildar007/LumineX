import { useState } from "react";
import { G } from "../../data/theme";
import { useApp } from "../../context/AppContext";
import { useIsMobile } from "../../hooks";
import { Logo, Avatar, AppIcon } from "../ui";

export default function Header() {
  const { session, profile, setSearch, setAuthModal, setUploadModal, signOut, setTab } = useApp();
  const isMobile = useIsMobile();
  const [menuOpen, setMenuOpen] = useState(false);
  const [navOpen,  setNavOpen]  = useState(false);

  return (
    <>
      <header style={{
        position: "sticky", top: 0, zIndex: 1000,
        background: "rgba(3,3,8,.97)", backdropFilter: "blur(24px)",
        borderBottom: `1px solid ${G.border}`,
        padding: isMobile ? "0 12px" : "0 20px",
      }}>
        <div style={{
          maxWidth: 1400, margin: "0 auto",
          display: "flex", alignItems: "center",
          height: isMobile ? 52 : 60, gap: isMobile ? 10 : 14,
        }}>
          {/* Mobile hamburger */}
          {isMobile && (
            <button onClick={() => setNavOpen(v => !v)} style={{
              background: "none", border: "none", cursor: "pointer",
              display: "flex", flexDirection: "column", gap: 4, padding: 4,
            }}>
              {[0,1,2].map(i => (
                <span key={i} style={{ width:20, height:2, background:G.text, borderRadius:2, display:"block",
                  transform: navOpen ? (i===0?"rotate(45deg) translate(4px,4px)":i===2?"rotate(-45deg) translate(4px,-4px)":"scaleX(0)") : "none",
                  transition:"all .25s ease",
                }}/>
              ))}
            </button>
          )}

          {/* Logo */}
          <div style={{ display:"flex", alignItems:"center", gap:8, cursor:"pointer" }}
            onClick={() => { setTab("home"); }}>
            <AppIcon size={isMobile?28:32}/>
            {!isMobile && <Logo size={20}/>}
          </div>

          {/* Search bar */}
          <div style={{ flex:1, maxWidth:500, position:"relative" }}
            onClick={() => setSearch(true)}>
            <div style={{
              background: G.bg3, border: `1px solid ${G.border}`,
              borderRadius: 999, padding: "8px 16px 8px 38px",
              fontSize: 13, color: G.muted, cursor: "pointer",
              display: "flex", alignItems: "center",
              transition: "border-color .2s",
            }}
              onMouseEnter={e => e.currentTarget.style.borderColor = G.accent + "66"}
              onMouseLeave={e => e.currentTarget.style.borderColor = G.border}
            >
              <span style={{ position:"absolute", left:12, fontSize:15 }}>🔍</span>
              <span style={{ fontSize:13 }}>Search videos, users…</span>
            </div>
          </div>

          {/* Actions */}
          <div style={{ display:"flex", alignItems:"center", gap:8, marginLeft:"auto" }}>
            {/* Upload button */}
            {session && (
              <button onClick={() => setUploadModal(true)} style={{
                background: `linear-gradient(135deg,${G.accent},${G.accent2})`,
                border: "none", borderRadius: 999, color: "white",
                fontFamily: "inherit", fontSize: 12, fontWeight: 700,
                padding: isMobile ? "7px 12px" : "8px 18px",
                cursor: "pointer", transition: "all .2s",
                display: "flex", alignItems: "center", gap: 5,
              }}
                onMouseEnter={e => e.currentTarget.style.transform = "scale(1.04)"}
                onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
              >
                {isMobile ? "+" : "📤 Upload"}
              </button>
            )}

            {/* Auth / Profile */}
            {session && profile ? (
              <div style={{ position:"relative" }}>
                <div onClick={() => setMenuOpen(v => !v)} style={{ cursor:"pointer" }}>
                  <Avatar profile={profile} size={isMobile?32:36}/>
                </div>
                {menuOpen && (
                  <>
                    <div onClick={() => setMenuOpen(false)} style={{ position:"fixed", inset:0, zIndex:99 }}/>
                    <div style={{
                      position:"absolute", top:"calc(100% + 8px)", right:0,
                      background: G.bg2, border: `1px solid ${G.border}`,
                      borderRadius:14, minWidth:180, zIndex:100,
                      boxShadow:"0 20px 60px rgba(0,0,0,.7)",
                      animation:"fadeDown .2s ease", overflow:"hidden",
                    }}>
                      <div style={{ padding:"14px 16px", borderBottom:`1px solid ${G.border}` }}>
                        <div style={{ fontSize:14, fontWeight:700 }}>{profile.display_name}</div>
                        <div style={{ fontSize:11, color:G.muted }}>@{profile.username}</div>
                      </div>
                      {[
                        { icon:"👤", label:"My Profile",    action:() => { setTab(`profile:${profile.id}`); setMenuOpen(false); } },
                        { icon:"❤️", label:"Saved",         action:() => { setTab("saved"); setMenuOpen(false); } },
                        { icon:"⚙️", label:"Settings",      action:() => { setTab("settings"); setMenuOpen(false); } },
                        { icon:"💎", label:"VIP Plans",     action:() => { setTab("vip"); setMenuOpen(false); } },
                      ].map(item => (
                        <div key={item.label} onClick={item.action} style={{
                          padding:"11px 16px", display:"flex", alignItems:"center", gap:10,
                          cursor:"pointer", fontSize:13, fontWeight:500, transition:"background .15s",
                        }}
                          onMouseEnter={e => e.currentTarget.style.background = G.bg3}
                          onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                        >
                          <span>{item.icon}</span>{item.label}
                        </div>
                      ))}
                      <div style={{ borderTop:`1px solid ${G.border}` }}>
                        <div onClick={() => { signOut(); setMenuOpen(false); }} style={{
                          padding:"11px 16px", display:"flex", alignItems:"center", gap:10,
                          cursor:"pointer", fontSize:13, color:G.red, transition:"background .15s",
                        }}
                          onMouseEnter={e => e.currentTarget.style.background = G.red+"11"}
                          onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                        >
                          <span>🚪</span>Sign out
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div style={{ display:"flex", gap:7 }}>
                <button onClick={() => setAuthModal("login")} style={{
                  background:"none", border:`1px solid ${G.accent}`,
                  borderRadius:999, color:G.accent, fontFamily:"inherit",
                  fontSize:13, fontWeight:600, padding:"7px 14px", cursor:"pointer", transition:"all .2s",
                }}
                  onMouseEnter={e => { e.currentTarget.style.background = G.accent; e.currentTarget.style.color = "white"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "none"; e.currentTarget.style.color = G.accent; }}
                >Login</button>
                {!isMobile && (
                  <button onClick={() => setAuthModal("signup")} style={{
                    background:`linear-gradient(135deg,${G.accent},${G.accent2})`,
                    border:"none", borderRadius:999, color:"white",
                    fontFamily:"inherit", fontSize:13, fontWeight:600,
                    padding:"7px 14px", cursor:"pointer",
                  }}>Sign Up</button>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Mobile nav drawer */}
      {isMobile && (
        <>
          {navOpen && <div onClick={() => setNavOpen(false)} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.6)", zIndex:999 }}/>}
          <div style={{
            position:"fixed", top:0, left: navOpen ? 0 : "-100%", width:260, height:"100%",
            background:G.bg2, zIndex:1000, transition:"left .3s ease",
            borderRight:`1px solid ${G.border}`, overflowY:"auto", padding:"60px 12px 20px",
          }}>
            <NavItems onClick={() => setNavOpen(false)}/>
          </div>
        </>
      )}
    </>
  );
}

function NavItems({ onClick }) {
  const { setTab, tab } = useApp();
  const items = [
    {id:"home",       icon:"🏠", label:"Home"},
    {id:"trending",   icon:"🔥", label:"Trending"},
    {id:"new",        icon:"✨", label:"New"},
    {id:"categories", icon:"🏷", label:"Categories"},
    {id:"channels",   icon:"📺", label:"Channels"},
    {id:"saved",      icon:"❤️", label:"Saved"},
    {id:"history",    icon:"🕐", label:"History"},
    {id:"vip",        icon:"💎", label:"VIP"},
  ];
  return (
    <div>
      {items.map(item => (
        <div key={item.id} onClick={() => { setTab(item.id); onClick?.(); }} style={{
          display:"flex", alignItems:"center", gap:12, padding:"10px 12px",
          borderRadius:10, cursor:"pointer", fontSize:14, fontWeight:500,
          color: tab===item.id ? G.accent : G.muted,
          background: tab===item.id ? G.bg3 : "transparent",
          marginBottom:2, transition:"all .2s",
        }}>
          <span style={{fontSize:18}}>{item.icon}</span>{item.label}
        </div>
      ))}
    </div>
  );
}
