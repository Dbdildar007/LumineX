import { useState, useEffect, useCallback, useMemo } from "react";
import { G, CATEGORIES, DEMO_VIDEOS } from "../data/theme";
import { useApp } from "../context/AppContext";
import { videoHelpers } from "../lib/supabase";
import { useIsMobile, useInfiniteScroll } from "../hooks";
import VideoCard from "../components/VideoCard";
import { SectionHeader, HScroll, FilterChip, Skeleton, EmptyState } from "../components/ui";

const FILTERS = [
  { label: "All",      value: "all"      },
  { label: "🔥 Hot",  value: "hot"      },
  { label: "✨ New",  value: "new"      },
  { label: "4K",       value: "4k"       },
  { label: "👑 VIP",  value: "vip"      },
  { label: "Free",     value: "free"     },
];

function VideoGrid({ videos, loading, cols }) {
  const isMobile = useIsMobile();
  const columns = cols || (isMobile ? 2 : "repeat(auto-fill,minmax(260px,1fr))");
  if (loading) return (
    <div style={{ display:"grid", gridTemplateColumns: isMobile?"repeat(2,1fr)":"repeat(auto-fill,minmax(260px,1fr))", gap:isMobile?8:14 }}>
      {Array(6).fill(0).map((_,i) => (
        <div key={i}>
          <Skeleton width="100%" height={0} style={{ aspectRatio:"16/9", marginBottom:8 }}/>
          <Skeleton width="60%" height={12} style={{ marginBottom:6 }}/>
          <Skeleton width="40%" height={10}/>
        </div>
      ))}
    </div>
  );
  return (
    <div style={{ display:"grid", gridTemplateColumns: isMobile?"repeat(2,1fr)":"repeat(auto-fill,minmax(260px,1fr))", gap:isMobile?8:14 }}>
      {videos.map(v => <VideoCard key={v.id} video={v}/>)}
    </div>
  );
}

function HeroBanner() {
  const { playVideo } = useApp();
  const isMobile = useIsMobile();
  const [idx, setIdx] = useState(0);
  const heroes = useMemo(() => DEMO_VIDEOS.filter(v => v.is_vip || v.likes_count > 50000).slice(0,5), []);
  const item = heroes[idx];

  useEffect(() => {
    const t = setInterval(() => setIdx(i => (i+1) % heroes.length), 5000);
    return () => clearInterval(t);
  }, [heroes.length]);

  if (!item) return null;

  return (
    <div style={{
      position: "relative", borderRadius: isMobile?0:20,
      overflow: "hidden", marginBottom: 24,
      height: isMobile ? 220 : 320,
      background: G.bg3,
      marginLeft: isMobile ? -12 : 0,
      marginRight: isMobile ? -12 : 0,
    }}>
      <img key={item.id} src={item.thumbnail_url} alt={item.title}
        style={{ position:"absolute",inset:0,width:"100%",height:"100%",objectFit:"cover",opacity:.45,animation:"fadeIn .6s ease" }}/>
      <div style={{ position:"absolute",inset:0,background:"linear-gradient(135deg,rgba(3,3,8,.95) 0%,rgba(3,3,8,.5) 60%,transparent 100%)" }}/>
      <div style={{ position:"absolute",inset:0,display:"flex",flexDirection:"column",justifyContent:"center",padding:isMobile?"16px":"32px" }}>
        <div style={{ fontSize:11,fontWeight:700,color:G.accent,letterSpacing:2,textTransform:"uppercase",marginBottom:8 }}>🔥 Featured</div>
        <h2 style={{ fontSize:isMobile?18:26,fontWeight:900,lineHeight:1.3,marginBottom:8,maxWidth:480,fontFamily:"'Syne',sans-serif" }}>{item.title}</h2>
        <div style={{ fontSize:12,color:G.muted,marginBottom:16 }}>{item.channel} · {fmtNum(item.views||0)} views</div>
        <div style={{ display:"flex",gap:10 }}>
          <button onClick={()=>playVideo(item)} style={{
            padding:isMobile?"9px 20px":"11px 28px",borderRadius:999,
            background:`linear-gradient(135deg,${G.accent},${G.accent2})`,
            border:"none",color:"white",fontFamily:"inherit",fontSize:13,fontWeight:700,cursor:"pointer",
          }}>▶ Watch Now</button>
        </div>
      </div>
      <div style={{ position:"absolute",bottom:14,right:16,display:"flex",gap:6 }}>
        {heroes.map((_,i)=>(
          <div key={i} onClick={()=>setIdx(i)} style={{ width:i===idx?24:6,height:6,borderRadius:99,background:i===idx?G.accent:"rgba(255,255,255,.3)",cursor:"pointer",transition:"all .3s" }}/>
        ))}
      </div>
    </div>
  );
}

function fmtNum(n) {
  if (n>=1e6) return (n/1e6).toFixed(1)+"M";
  if (n>=1e3) return (n/1e3).toFixed(1)+"K";
  return String(n||0);
}

export default function HomePage({ tab }) {
  const { playVideo } = useApp();
  const isMobile = useIsMobile();
  const [videos,   setVideos]   = useState([]);
  const [trending, setTrending] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [filter,   setFilter]   = useState("all");
  const [page,     setPage]     = useState(0);
  const [hasMore,  setHasMore]  = useState(true);
  const [catFilter,setCatFilter]= useState(null);
  const LIMIT = 12;

  const loadVideos = useCallback(async (reset = false) => {
    setLoading(true);
    try {
      const nextPage = reset ? 0 : page;
      const data = await videoHelpers.getFeed({ page: nextPage, limit: LIMIT }).catch(() => DEMO_VIDEOS.slice(nextPage*LIMIT, (nextPage+1)*LIMIT));
      const filtered = (data || DEMO_VIDEOS).filter(v => {
        if (tab === "trending") return (v.views||0) > 1000000 || (v.likes_count||0) > 30000;
        if (tab === "new") return true;
        if (tab === "saved") return false;
        return true;
      });
      if (reset) setVideos(filtered);
      else setVideos(p => [...p, ...filtered]);
      setHasMore(filtered.length === LIMIT);
      if (!reset) setPage(p => p+1);
    } catch (e) {
      if (reset) setVideos(DEMO_VIDEOS);
    } finally { setLoading(false); }
  }, [tab, page]);

  useEffect(() => {
    setPage(0); setHasMore(true);
    loadVideos(true);
    if (tab === "home") {
      videoHelpers.getTrending({ limit: 8 }).then(setTrending).catch(() => setTrending(DEMO_VIDEOS.slice(0,8)));
    }
  }, [tab]);

  const loadMore = useCallback(() => {
    if (!loading && hasMore) loadVideos(false);
  }, [loading, hasMore, loadVideos]);

  const sentinelRef = useInfiniteScroll(loadMore, hasMore && !loading);

  const displayed = useMemo(() => {
    let v = videos;
    if (filter === "hot")  v = v.filter(x => (x.likes_count||0)>20000 || x.badge==="HOT");
    if (filter === "new")  v = v.filter(x => new Date(x.created_at) > new Date(Date.now()-7*86400000));
    if (filter === "4k")   v = v.filter(x => (x.tags||[]).includes("4k") || x.badge==="4K");
    if (filter === "vip")  v = v.filter(x => x.is_vip);
    if (filter === "free") v = v.filter(x => !x.is_vip);
    if (catFilter) v = v.filter(x => x.category === catFilter);
    return v;
  }, [videos, filter, catFilter]);

  return (
    <div>
      {/* Hero */}
      {tab === "home" && !catFilter && <HeroBanner/>}

      {/* Category filter strip */}
      {catFilter && (
        <div style={{ display:"flex",alignItems:"center",gap:12,marginBottom:20,padding:"12px 16px",background:G.bg3,borderRadius:12,border:`1px solid ${G.border}` }}>
          <span style={{fontSize:14,fontWeight:700}}>📂 {catFilter}</span>
          <button onClick={()=>setCatFilter(null)} style={{ marginLeft:"auto",background:G.accent,border:"none",borderRadius:999,color:"white",padding:"4px 12px",fontSize:12,cursor:"pointer",fontFamily:"inherit",fontWeight:600 }}>Clear ✕</button>
        </div>
      )}

      {/* Trending row */}
      {tab === "home" && !catFilter && trending.length > 0 && (
        <div style={{ marginBottom:28 }}>
          <SectionHeader title="🔥 Trending Now"/>
          <HScroll>
            {trending.map(v=><VideoCard key={v.id} video={v} cardWidth={isMobile?200:260}/>)}
          </HScroll>
        </div>
      )}

      {/* Filter chips */}
      <div style={{ display:"flex",gap:8,overflowX:"auto",scrollbarWidth:"none",marginBottom:20,paddingBottom:2 }}>
        {FILTERS.map(f=>(
          <FilterChip key={f.value} label={f.label} active={filter===f.value} onClick={()=>setFilter(f.value)}/>
        ))}
      </div>

      {/* Main header */}
      <SectionHeader title={
        tab==="trending"?"🔥 Trending Videos":
        tab==="new"?"✨ New Releases":
        tab==="saved"?"❤️ Saved Videos":
        catFilter?`📂 ${catFilter}`:
        "🎬 All Videos"
      }/>

      {/* Grid */}
      {!loading && displayed.length === 0 ? (
        <EmptyState emoji={tab==="saved"?"💔":"🔍"} title={tab==="saved"?"No saved videos":"No videos found"} subtitle={tab==="saved"?"Like a video to save it here":"Try a different filter"}/>
      ) : (
        <>
          <VideoGrid videos={displayed} loading={loading && videos.length===0}/>
          {/* Infinite scroll sentinel */}
          <div ref={sentinelRef} style={{ height:40 }}/>
          {loading && videos.length > 0 && (
            <div style={{ display:"flex",justifyContent:"center",padding:20 }}>
              <div style={{ display:"flex",gap:8 }}>
                {[0,1,2].map(i=><div key={i} style={{ width:8,height:8,borderRadius:"50%",background:G.accent,animation:`pulse 1.2s ${i*.2}s infinite` }}/>)}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
