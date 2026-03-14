import { useState, useEffect, useCallback, useRef } from "react";
import { supabase, likeHelpers, followHelpers, cacheGet, cacheSet } from "../lib/supabase";
import { useApp } from "../context/AppContext";

export function useIsMobile() {
  const [m, setM] = useState(() => window.innerWidth < 768);
  useEffect(() => {
    const h = () => setM(window.innerWidth < 768);
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);
  return m;
}

export function useIsTablet() {
  const [t, setT] = useState(() => window.innerWidth < 1024);
  useEffect(() => {
    const h = () => setT(window.innerWidth < 1024);
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);
  return t;
}

export function useLocalStorage(key, init) {
  const [val, setVal] = useState(() => {
    try { return JSON.parse(localStorage.getItem(key)) ?? init; }
    catch { return init; }
  });
  const set = useCallback(v => {
    setVal(v);
    localStorage.setItem(key, JSON.stringify(v));
  }, [key]);
  return [val, set];
}

export function useVideoLike(videoId, initialLiked, initialCount) {
  const { session, setAuthModal } = useApp();
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount || 0);

  useEffect(() => { setLiked(initialLiked); }, [initialLiked]);
  useEffect(() => { setCount(initialCount || 0); }, [initialCount]);

  const toggle = useCallback(async () => {
    if (!session) { setAuthModal("login"); return; }
    const next = !liked;
    setLiked(next);
    setCount(c => next ? c + 1 : c - 1);
    try {
      await likeHelpers.toggle(session.user.id, videoId, liked);
    } catch {
      setLiked(liked);
      setCount(c => next ? c - 1 : c + 1);
    }
  }, [session, liked, videoId, setAuthModal]);

  return { liked, count, toggle };
}

export function useFollow(targetUserId, initialFollowing) {
  const { session, profile, setAuthModal, showToast } = useApp();
  const [following, setFollowing] = useState(initialFollowing);
  const [loading,   setLoading]   = useState(false);

  useEffect(() => { setFollowing(initialFollowing); }, [initialFollowing]);

  const toggle = useCallback(async () => {
    if (!session) { setAuthModal("login"); return; }
    if (session.user.id === targetUserId) return;
    setLoading(true);
    const next = !following;
    setFollowing(next);
    try {
      if (next) await followHelpers.follow(session.user.id, targetUserId);
      else      await followHelpers.unfollow(session.user.id, targetUserId);
      showToast(next ? "Following!" : "Unfollowed", "success");
    } catch {
      setFollowing(following);
      showToast("Something went wrong", "error");
    } finally { setLoading(false); }
  }, [session, following, targetUserId, setAuthModal, showToast]);

  return { following, toggle, loading, isOwn: session?.user?.id === targetUserId };
}

export function useInfiniteScroll(callback, hasMore) {
  const ref = useRef(null);
  useEffect(() => {
    if (!ref.current || !hasMore) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) callback(); }, { threshold: 0.1 });
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, [callback, hasMore]);
  return ref;
}

export function useDebounce(value, delay) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

export function useVideoData(videoId) {
  const [video,   setVideo]   = useState(() => cacheGet(`video:${videoId}`));
  const [loading, setLoading] = useState(!video);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    if (!videoId) return;
    const cached = cacheGet(`video:${videoId}`);
    if (cached) { setVideo(cached); setLoading(false); return; }
    setLoading(true);
    supabase.from("videos")
      .select("*, profiles(id,username,display_name,avatar_url,is_verified,followers_count)")
      .eq("id", videoId).single()
      .then(({ data, error }) => {
        if (error) setError(error);
        else { cacheSet(`video:${videoId}`, data); setVideo(data); }
        setLoading(false);
      });
  }, [videoId]);

  return { video, loading, error };
}
