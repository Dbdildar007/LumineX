import { useState, useEffect, useMemo } from "react";
import { AppProvider, useApp } from "./context/AppContext";
import { useIsMobile } from "./hooks";
import { Toast } from "./components/ui";
import Header         from "./components/layout/Header";
import NavTabs        from "./components/layout/NavTabs";
import PlayerModal    from "./components/player/PlayerModal";
import AuthModal      from "./components/auth/AuthModal";
import SearchModal    from "./components/SearchModal";
import VipModal       from "./components/VipModal";
import UploadModal    from "./components/upload/UploadModal";
import ProfilePage    from "./components/profile/ProfilePage";
import SplashScreen   from "./pages/SplashScreen";
import AgeGate        from "./pages/AgeGate";
import HomePage       from "./pages/HomePage";
import CategoriesPage from "./pages/CategoriesPage";
import ChannelsPage   from "./pages/ChannelsPage";
import VIPPage        from "./pages/VIPPage";

// ── Inner App (inside AppProvider) ───────────────────────────────────────────
function AppInner() {
  const {
    tab, setTab, player, setPlayer,
    toast, showToast, authReady,
    ageOk, setAgeOk,          // we'll manage these locally
  } = useApp();

  const isMobile = useIsMobile();
  const [splash,  setSplash]  = useState(() => !sessionStorage.getItem("lx_splash"));
  const [ageOkL,  setAgeOkL]  = useState(() => !!localStorage.getItem("lx_age"));
  const [showBack,setShowBack]= useState(false);

  useEffect(() => {
    const h = () => setShowBack(window.scrollY > 400);
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);

  // Parse tab for special routes
  const profileUserId = tab.startsWith("profile:") ? tab.slice(8) : null;
  const catFilter     = tab.startsWith("cat:") ? tab.slice(4) : null;

  const mainTabs = ["home","trending","new","saved","history","categories","channels","vip"];
  const isMainTab = mainTabs.includes(tab) || !!catFilter;

  // Splash screen — shown once per session
  if (splash) {
    return <SplashScreen onDone={() => { setSplash(false); sessionStorage.setItem("lx_splash","1"); }}/>;
  }

  // Age gate
  if (!ageOkL) {
    return <AgeGate onEnter={() => { localStorage.setItem("lx_age","1"); setAgeOkL(true); }}/>;
  }

  return (
    <div style={{ background:"#030308", color:"#f0f0f8", fontFamily:"'DM Sans',sans-serif", minHeight:"100vh" }}>

      <Header/>
      <NavTabs/>

      {/* Main content */}
      <main style={{
        maxWidth: 1400, margin: "0 auto",
        padding: isMobile ? "12px 12px 80px" : "24px 24px 40px",
      }}>
        {/* Profile page */}
        {profileUserId && <ProfilePage userId={profileUserId}/>}

        {/* Category filter */}
        {catFilter && <HomePage tab="home"/>}

        {/* Standard tabs */}
        {!profileUserId && !catFilter && (
          <>
            {(tab==="home"||tab==="trending"||tab==="new"||tab==="saved"||tab==="history") && <HomePage tab={tab}/>}
            {tab==="categories" && <CategoriesPage/>}
            {tab==="channels"   && <ChannelsPage/>}
            {tab==="vip"        && <VIPPage/>}
          </>
        )}
      </main>

      {/* Modals */}
      {player && (
        <PlayerModal
          video={player}
          onClose={() => setPlayer(null)}
        />
      )}
      <AuthModal/>
      <SearchModal/>
      <VipModal/>
      <UploadModal/>

      {/* Toast */}
      <Toast toast={toast}/>

      {/* Back to top */}
      {showBack && (
        <button onClick={() => window.scrollTo({top:0,behavior:"smooth"})} style={{
          position:"fixed", bottom: isMobile ? 70 : 28, right: 16,
          width:42, height:42, borderRadius:"50%",
          background:`linear-gradient(135deg,#c084fc,#818cf8)`,
          border:"none", color:"white", fontSize:18, cursor:"pointer",
          display:"flex", alignItems:"center", justifyContent:"center",
          boxShadow:"0 0 24px rgba(192,132,252,.5)", zIndex:500,
          animation:"float 3s ease-in-out infinite",
        }}>↑</button>
      )}
    </div>
  );
}

// ── Root App ─────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <AppProvider>
      <AppInner/>
    </AppProvider>
  );
}
