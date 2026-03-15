import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { C, SectionHeader, HScroll, FilterChip, Skeleton, EmptyState, fmtNum } from "../components/ui/index";
import { useApp } from "../context/AppContext";
import { videoAPI, followAPI } from "../lib/supabase";
import { useIsMobile, useInfiniteScroll } from "../hooks/index";
import VideoCard from "../components/VideoCard";
import { DEMO_VIDEOS, CATEGORIES } from "../data/theme";

// ── Animated Category Card (desktop hover) ────────────────────────────────────
function CategoryCard({ cat, onClick }) {
  const [hov, setHov] = useState(false);
  const [ripple, setRipple] = useState(false);
  const handleClick = () => { setRipple(true); setTimeout(() => setRipple(false), 600); onClick(); };
  return (
    <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)} onClick={handleClick}
      style={{
        background: hov ? cat.color + "18" : C.card,
        border: `1.5px solid ${hov ? cat.color + "88" : C.border}`,
        borderRadius: 16, padding: "18px 14px", textAlign: "center", cursor: "pointer",
        transition: "all .3s cubic-bezier(0.34,1.2,0.64,1)",
        transform: hov ? "translateY(-6px) scale(1.04)" : "none",
        boxShadow: hov ? `0 16px 40px rgba(0,0,0,.5), 0 0 30px ${cat.color}22` : `0 2px 8px rgba(0,0,0,.2)`,
        position: "relative", overflow: "hidden",
      }}>
      {/* Ripple */}
      {ripple && <div style={{ position: "absolute", inset: 0, background: cat.color + "22", animation: "fadeIn .3s ease", borderRadius: 16 }} />}
      {/* Glow background on hover */}
      {hov && <div style={{ position: "absolute", inset: 0, background: `radial-gradient(circle at 50% 40%,${cat.color}18 0%,transparent 70%)`, pointerEvents: "none" }} />}
      <div style={{ fontSize: 32, marginBottom: 10, transition: "transform .3s", transform: hov ? "scale(1.2) rotate(-5deg)" : "scale(1)", display: "inline-block", position: "relative", zIndex: 1 }}>{cat.icon}</div>
      <div style={{ fontSize: 13, fontWeight: 700, color: hov ? cat.color : C.text, marginBottom: 3, transition: "color .3s", position: "relative", zIndex: 1 }}>{cat.name}</div>
      <div style={{ fontSize: 10, color: C.muted, position: "relative", zIndex: 1 }}>{cat.count} videos</div>
      {/* Animated bottom line */}
      <div style={{ position: "absolute", bottom: 0, left: "50%", transform: `translateX(-50%) scaleX(${hov ? 1 : 0})`, width: "80%", height: 2, background: `linear-gradient(90deg,${cat.color},${cat.color}88)`, transition: "transform .3s ease", borderRadius: "99px 99px 0 0" }} />
    </div>
  );
}

// ── Mobile category row ───────────────────────────────────────────────────────
function MobileCategoryStrip({ onSelect }) {
  return (
    <div style={{ display: "flex", gap: 10, overflowX: "auto", scrollbarWidth: "none", paddingBottom: 4, marginBottom: 20 }}>
      {CATEGORIES.map(cat => (
        <div key={cat.name} onClick={() => onSelect(cat.name)} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5, flexShrink: 0, cursor: "pointer" }}>
          <div style={{ width: 52, height: 52, borderRadius: "50%", background: cat.color + "22", border: `1.5px solid ${cat.color}44`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, transition: "transform .2s" }}
            onTouchStart={e => e.currentTarget.style.transform = "scale(0.92)"} onTouchEnd={e => e.currentTarget.style.transform = "scale(1)"}>
            {cat.icon}
          </div>
          <span style={{ fontSize: 9, color: C.muted, fontWeight: 600, letterSpacing: .3 }}>{cat.name}</span>
        </div>
      ))}
    </div>
  );
}

// ── Hero banner ───────────────────────────────────────────────────────────────
function HeroBanner() {
  const { playVideo } = useApp();
  const isMobile = useIsMobile();
  const [idx, setIdx] = useState(0);
  const heroes = useMemo(() => DEMO_VIDEOS.filter(v => v.likes_count > 50000).slice(0, 5), []);
  const item = heroes[idx];
  useEffect(() => { const t = setInterval(() => setIdx(i => (i + 1) % heroes.length), 5000); return () => clearInterval(t); }, [heroes.length]);
  if (!item) return null;
  return (

    <div style={{ position: "relative", willChange: "contents", borderRadius: isMobile ? 0 : 20, overflow: "hidden", marginBottom: 24, height: isMobile ? 220 : 320, background: C.bg3, marginLeft: isMobile ? -12 : 0, marginRight: isMobile ? -12 : 0 }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `url(${item.thumbnail_url})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          opacity: 95,
          transition: "background-image 1s ease-in-out, opacity 0.5s ease" // This creates the smooth swap
        }}
      />
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg,rgba(3,3,8,.95) 0%,rgba(3,3,8,.5) 60%,transparent 100%)", transition: "all 0.5s ease" }} />
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", justifyContent: "center", padding: isMobile ? 16 : 32 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: C.accent, letterSpacing: 2, textTransform: "uppercase", marginBottom: 8 }}>🔥 Featured</div>
        <h2 style={{ fontSize: isMobile ? 18 : 26, fontWeight: 900, lineHeight: 1.3, marginBottom: 8, maxWidth: 480, fontFamily: "'Syne',sans-serif", color: C.text }}>{item.title}</h2>
        <div style={{ fontSize: 12, color: C.muted, marginBottom: 16 }}>{item.channel} · {fmtNum(item.views || 0)} views</div>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={() => playVideo(item)} style={{ padding: isMobile ? "9px 20px" : "11px 28px", borderRadius: 999, background: `linear-gradient(135deg,${C.accent},${C.accent2})`, border: "none", color: "white", fontFamily: "inherit", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>▶ Watch Now</button>
        </div>
      </div>
      <div style={{ position: "absolute", bottom: 14, right: 16, display: "flex", gap: 6 }}>
        {heroes.map((_, i) => <div key={i} onClick={() => setIdx(i)} style={{ width: i === idx ? 24 : 6, height: 6, borderRadius: 99, background: i === idx ? C.accent : "rgba(255,255,255,.3)", cursor: "pointer", transition: "all .3s" }} />)}
      </div>
    </div>
  );
}

// ── Video grid with skeleton ─────────────────────────────────────────────────
function VideoGrid({ videos, loading }) {
  const isMobile = useIsMobile();
  if (loading) return (
    <div style={{ display: "grid", gridTemplateColumns: isMobile ? "repeat(2,1fr)" : "repeat(auto-fill,minmax(260px,1fr))", gap: isMobile ? 8 : 14 }}>
      {Array(6).fill(0).map((_, i) => (
        <div key={i}>
          <Skeleton width="100%" height={0} style={{ aspectRatio: "16/9", marginBottom: 8, height: "unset" }} />
          <Skeleton width="60%" height={12} style={{ marginBottom: 6 }} /><Skeleton width="40%" height={10} />
        </div>
      ))}
    </div>
  );
  return (
    <div style={{ display: "grid", gridTemplateColumns: isMobile ? "repeat(2,1fr)" : "repeat(auto-fill,minmax(260px,1fr))", gap: isMobile ? 8 : 14 }}>
      {videos.map(v => <VideoCard key={v.id} video={v} />)}
    </div>
  );
}

const FILTERS = [
  { label: "All", value: "all" }, { label: "🔥 Hot", value: "hot" }, { label: "✨ New", value: "new" },
  { label: "👑 VIP", value: "vip" }, { label: "Free", value: "free" },
];

export default function HomePage({ tab }) {
  const { session, playVideo, setTab } = useApp();
  const isMobile = useIsMobile();
  const [videos, setVideos] = useState([]);
  const [trending, setTrending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [catFilter, setCatFilter] = useState(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const LIMIT = 12;

  useEffect(() => {
    // This scrolls the window to the top-left corner
    window.scrollTo({
      top: 0,
      behavior: "smooth" // Optional: Change to "instant" if you want it to snap immediately
    });
  }, [tab, catFilter, filter]);

  const loadVideos = useCallback(async (reset = false) => {
    setLoading(true);
    try {
      const nextPage = reset ? 0 : page;
      let followingIds = null;
      if (session?.user?.id && tab === "home") {
        followingIds = await followAPI.getFollowingIds(session.user.id).catch(() => null);
      }
      let data;
      if (tab === "trending") {
        data = await videoAPI.getTrending(LIMIT).catch(() => DEMO_VIDEOS.slice(0, LIMIT));
      } else {
        data = await videoAPI.getFeed({ page: nextPage, limit: LIMIT, followingIds: followingIds?.length ? followingIds : null }).catch(() => DEMO_VIDEOS.slice(nextPage * LIMIT, (nextPage + 1) * LIMIT));
      }
      const filtered = (data || DEMO_VIDEOS).filter(v => {
        if (catFilter) return v.category === catFilter;
        return true;
      });
      if (reset) setVideos(filtered);
      else setVideos(p => [...p, ...filtered]);
      setHasMore(filtered.length === LIMIT);
      if (!reset) setPage(p => p + 1);
    } catch { if (reset) setVideos(DEMO_VIDEOS); }
    finally { setLoading(false); }
  }, [tab, page, session, catFilter]);

  useEffect(() => {
    setPage(0); setHasMore(true); loadVideos(true);
    if (tab === "home") {
      videoAPI.getTrending(8).then(setTrending).catch(() => setTrending(DEMO_VIDEOS.slice(0, 8)));
    }
  }, [tab, catFilter]);

  const loadMore = useCallback(() => { if (!loading && hasMore) loadVideos(false); }, [loading, hasMore, loadVideos]);
  const sentinelRef = useInfiniteScroll(loadMore, hasMore && !loading);

  const displayed = useMemo(() => {
    let v = videos;
    if (filter === "hot") v = v.filter(x => (x.likes_count || 0) > 20000);
    if (filter === "new") v = v.filter(x => new Date(x.created_at) > new Date(Date.now() - 7 * 86400000));
    if (filter === "vip") v = v.filter(x => x.is_vip);
    if (filter === "free") v = v.filter(x => !x.is_vip);
    return v;
  }, [videos, filter]);

  return (
    <div>
      {tab === "home" && !catFilter && <HeroBanner />}

      {/* Category filter active */}
      {catFilter && (
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20, padding: "12px 16px", background: C.bg3, borderRadius: 12, border: `1px solid ${C.border}` }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: C.text }}>📂 {catFilter}</span>
          <button onClick={() => setCatFilter(null)} style={{ marginLeft: "auto", background: C.accent, border: "none", borderRadius: 999, color: "white", padding: "4px 12px", fontSize: 12, cursor: "pointer", fontFamily: "inherit", fontWeight: 600 }}>Clear ✕</button>
        </div>
      )}

      {/* Trending row */}
      {tab === "home" && !catFilter && trending.length > 0 && (
        <div style={{ marginBottom: 28 }}>
          <SectionHeader title="🔥 Trending Now" />
          <HScroll>{trending.map(v => <VideoCard key={v.id} video={v} cardWidth={isMobile ? 200 : 260} />)}</HScroll>
        </div>
      )}

      {/* Categories */}
      {tab === "home" && !catFilter && (
        <div style={{ marginBottom: 28 }}>
          <SectionHeader title="🏷 Browse Categories" action={() => setTab("categories")} actionLabel="All categories"/>
          {isMobile ? (
            <MobileCategoryStrip onSelect={setCatFilter} />
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(110px,1fr))", gap: 10 }}>
              {CATEGORIES.slice(0, 8).map(cat => <CategoryCard key={cat.name} cat={cat} onClick={() => setCatFilter(cat.name)} />)}
            </div>
          )}
        </div>
      )}

      {/* Filter chips */}
      <div style={{ display: "flex", gap: 8, overflowX: "auto", scrollbarWidth: "none", marginBottom: 20, paddingBottom: 2 }}>
        {FILTERS.map(f => <FilterChip key={f.value} label={f.label} active={filter === f.value} onClick={() => setFilter(f.value)} />)}
      </div>

      <SectionHeader title={tab === "trending" ? "🔥 Trending Videos" : tab === "new" ? "✨ New Releases" : tab === "saved" ? "❤️ Saved Videos" : catFilter ? `📂 ${catFilter}` : "🎬 All Videos"} />

      {!loading && displayed.length === 0 ? (
        <EmptyState emoji={tab === "saved" ? "💔" : "🔍"} title={tab === "saved" ? "No saved videos" : "No videos found"} subtitle={tab === "saved" ? "Like a video to save it here" : "Try a different filter"} />
      ) : (
        <>
          <VideoGrid videos={displayed} loading={loading && videos.length === 0} />
          <div ref={sentinelRef} style={{ height: 40 }} />
          {loading && videos.length > 0 && (
            <div style={{ display: "flex", justifyContent: "center", padding: 20 }}>
              <div style={{ display: "flex", gap: 8 }}>
                {[0, 1, 2].map(i => <div key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: C.accent, animation: `pulse 1.2s ${i * .2}s infinite` }} />)}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
