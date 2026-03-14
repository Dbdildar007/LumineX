import { useEffect, useState } from "react";
import { AppProvider, useApp } from "./context/AppContext";
import { ALL_VIDEOS } from "./data/videos";
import { G } from "./data/theme";

import AgeGate      from "./pages/AgeGate";
import AuthPages    from "./pages/auth/AuthPages";
import Header       from "./components/Header";
import NavTabs      from "./components/NavTabs";
import HomePage     from "./pages/HomePage";
import CategoriesPage from "./pages/CategoriesPage";
import ChannelsPage from "./pages/ChannelsPage";
import VIPPage      from "./pages/VIPPage";
import PlayerModal  from "./components/player/PlayerModal";
import SearchModal  from "./components/SearchModal";
import Toast        from "./components/ui/Toast";

function AppInner() {
  const {
    tab, player, setPlayer, search, setSearch, toast,
    ageOk, setAgeOk, authPage, setAuthPage, login,
    showToast, favs, toggleFav, playVideo,
  } = useApp();

  const [showBack, setShowBack] = useState(false);

  useEffect(() => {
    const h = () => setShowBack(window.scrollY > 500);
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);

  // Age gate
  if (!ageOk) return (
    <AgeGate onEnter={() => { localStorage.setItem("novatube_age","1"); setAgeOk(true); }} />
  );

  // Auth pages
  if (authPage) return (
    <AuthPages
      page={authPage}
      onNavigate={setAuthPage}
      onSuccess={user => { login(user); setAuthPage(null); showToast("✓ Welcome, " + user.name + "!"); }}
      onClose={() => setAuthPage(null)}
    />
  );

  return (
    <div style={{ background:G.bg, color:G.text, fontFamily:"'Outfit',sans-serif", minHeight:"100vh" }}>
      <Header />
      <NavTabs />

      {/* Main content */}
      <main style={{ maxWidth:1600, margin:"0 auto", padding:"20px 16px 80px" }}>
        {tab === "vip"        && <VIPPage />}
        {tab === "categories" && <CategoriesPage />}
        {tab === "channels"   && <ChannelsPage />}
        {!["vip","categories","channels"].includes(tab) && <HomePage />}
      </main>

      {/* Player modal */}
      {player && (
        <PlayerModal
          video={player}
          related={ALL_VIDEOS.filter(v => v.id !== player.id).slice(0, 12)}
          onClose={() => setPlayer(null)}
          onPlayRelated={playVideo}
          onToggleFav={toggleFav}
          isFav={favs.includes(player.id)}
          onToast={showToast}
        />
      )}

      {/* Search modal */}
      {search && <SearchModal onClose={() => setSearch(false)} onPlay={playVideo} />}

      {/* Toast */}
      <Toast msg={toast} />

      {/* Back to top */}
      {showBack && (
        <button onClick={() => window.scrollTo({ top:0, behavior:"smooth" })} style={{
          position:"fixed", bottom:28, right:16,
          width:42, height:42, borderRadius:"50%",
          background:`linear-gradient(135deg,${G.accent},${G.accent2})`,
          border:"none", color:"white", fontSize:20, cursor:"pointer",
          display:"flex", alignItems:"center", justifyContent:"center",
          boxShadow:`0 0 24px ${G.accent}66`, zIndex:500,
          animation:"float 3s ease-in-out infinite",
        }}>↑</button>
      )}
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppInner />
    </AppProvider>
  );
}
