import { createContext, useContext, useState, useCallback, useRef } from "react";
import useLocalStorage from "../hooks/useLocalStorage";

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [tab,       setTab]       = useState("home");
  const [player,    setPlayer]    = useState(null);
  const [catFilter, setCatFilter] = useState(null);
  const [search,    setSearch]    = useState(false);
  const [toast,     setToast]     = useState("");
  const [authPage,  setAuthPage]  = useState(null);
  const [loadMore,  setLoadMore]  = useState(12);
  const [filter,    setFilter]    = useState("all");
  const [ageOk,     setAgeOk]     = useState(() => !!localStorage.getItem("novatube_age"));
  const [authUser,  setAuthUser]  = useState(() => {
    try { return JSON.parse(localStorage.getItem("novatube_user")) || null; }
    catch { return null; }
  });

  const [favs,      setFavs]      = useLocalStorage("novatube_favs", []);
  const [history,   setHistory]   = useLocalStorage("novatube_history", []);
  const [following, setFollowing] = useLocalStorage("novatube_following", []);

  const toastTimer = useRef(null);

  const showToast = useCallback((msg) => {
    setToast(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(""), 2600);
  }, []);

  const toggleFav = useCallback((id) => {
    setFavs(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);
  }, [setFavs]);

  const toggleFollow = useCallback((ch) => {
    setFollowing(p => p.includes(ch) ? p.filter(x => x !== ch) : [...p, ch]);
  }, [setFollowing]);

  const playVideo = useCallback((v) => {
    setPlayer(v);
    setHistory(p => [v.id, ...p.filter(x => x !== v.id)].slice(0, 50));
  }, [setHistory]);

  const login = useCallback((user) => {
    setAuthUser(user);
    localStorage.setItem("novatube_user", JSON.stringify(user));
  }, []);

  const logout = useCallback(() => {
    setAuthUser(null);
    localStorage.removeItem("novatube_user");
    showToast("👋 Logged out");
  }, [showToast]);

  return (
    <AppContext.Provider value={{
      tab, setTab, player, setPlayer, catFilter, setCatFilter,
      search, setSearch, toast, showToast, authPage, setAuthPage,
      loadMore, setLoadMore, filter, setFilter, ageOk, setAgeOk,
      authUser, login, logout, favs, toggleFav, history, setHistory,
      following, toggleFollow, playVideo,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
