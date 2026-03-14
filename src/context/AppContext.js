import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { supabase, authHelpers, profileHelpers } from "../lib/supabase";

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [session,    setSession]    = useState(null);
  const [profile,    setProfile]    = useState(null);
  const [authReady,  setAuthReady]  = useState(false);
  const [player,     setPlayer]     = useState(null);
  const [search,     setSearch]     = useState(false);
  const [toast,      setToast]      = useState(null);
  const [tab,        setTab]        = useState("home");
  const [authModal,  setAuthModal]  = useState(null);
  const [vipModal,   setVipModal]   = useState(false);
  const [uploadModal,setUploadModal]= useState(false);
  const toastTimer = useRef(null);

  // ── Auth init ────────────────────────────────────────────────────────────────
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) loadProfile(session.user.id);
      else setAuthReady(true);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setSession(session);
      if (session) loadProfile(session.user.id);
      else { setProfile(null); setAuthReady(true); }
    });
    return () => subscription.unsubscribe();
  }, []);

  const loadProfile = async (id) => {
    try {
      const p = await profileHelpers.getById(id);
      setProfile(p);
    } catch (e) {
      console.error("Profile load error:", e);
    } finally {
      setAuthReady(true);
    }
  };

  // ── Toast ────────────────────────────────────────────────────────────────────
  const showToast = useCallback((msg, type = "info") => {
    clearTimeout(toastTimer.current);
    setToast({ msg, type });
    toastTimer.current = setTimeout(() => setToast(null), 2800);
  }, []);

  // ── Play video ───────────────────────────────────────────────────────────────
  const playVideo = useCallback((video) => {
    if (video.is_vip && !profile?.is_vip) {
      setVipModal(true);
      return;
    }
    setPlayer(video);
  }, [profile]);

  // ── Auth helpers ─────────────────────────────────────────────────────────────
  const signOut = useCallback(async () => {
    await authHelpers.signOut();
    setSession(null);
    setProfile(null);
    showToast("Signed out successfully", "success");
  }, [showToast]);

  const refreshProfile = useCallback(() => {
    if (session?.user?.id) loadProfile(session.user.id);
  }, [session]);

  return (
    <AppContext.Provider value={{
      session, profile, authReady, player, setPlayer,
      search, setSearch, toast, showToast, tab, setTab,
      authModal, setAuthModal, vipModal, setVipModal,
      uploadModal, setUploadModal,
      playVideo, signOut, refreshProfile, loadProfile,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
