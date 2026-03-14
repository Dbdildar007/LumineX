import { useMemo } from "react";
import { useApp } from "../context/AppContext";
import { ALL_VIDEOS } from "../data/videos";
import { G } from "../data/theme";
import VideoCard from "../components/VideoCard";
import HScroll from "../components/ui/HScroll";
import SectionHeader from "../components/ui/SectionHeader";
import FilterChip from "../components/ui/FilterChip";
import HeroBanner from "../components/HeroBanner";

const FILTERS = ["all","4K","HOT","NEW","HD","VIP"];

export default function HomePage() {
  const { filter, setFilter, catFilter, setCatFilter, tab, favs, history, playVideo, toggleFav, showToast, loadMore, setLoadMore } = useApp();

  const videos = useMemo(() => {
    let v = ALL_VIDEOS;
    if (filter !== "all") v = v.filter(x => x.badge===filter || x.tags.includes(filter.toLowerCase()));
    if (catFilter) v = v.filter(x => x.category===catFilter);
    if (tab==="favorites") v = v.filter(x => favs.includes(x.id));
    if (tab==="history")   v = v.filter(x => history.includes(x.id));
    return v;
  }, [filter, catFilter, tab, favs, history]);

  const trending = useMemo(() => ALL_VIDEOS.filter(v=>v.badge==="HOT"||v.badge==="4K").slice(0,8), []);
  const shown = videos.slice(0, loadMore);

  return (
    <div>
      {tab==="home" && !catFilter && <HeroBanner onCta={()=>window.scrollBy({top:400,behavior:"smooth"})}/>}

      {catFilter && (
        <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:16, padding:"12px 16px", background:G.bg3, borderRadius:12, border:`1px solid ${G.border}` }}>
          <span style={{ fontSize:14, fontWeight:700 }}>📂 {catFilter}</span>
          <button onClick={()=>setCatFilter(null)} style={{ marginLeft:"auto", background:G.accent, border:"none", borderRadius:999, color:"white", padding:"4px 12px", fontSize:12, cursor:"pointer", fontFamily:"inherit", fontWeight:600 }}>Clear ✕</button>
        </div>
      )}

      {/* Trending row */}
      {tab==="home" && !catFilter && (
        <div style={{ marginBottom:28 }}>
          <SectionHeader title="🔥 Trending Now"/>
          <HScroll>
            {trending.map(v=>(
              <VideoCard key={v.id} video={v} cardWidth={260}
                onClick={playVideo} onToggleFav={toggleFav} isFav={favs.includes(v.id)}/>
            ))}
          </HScroll>
        </div>
      )}

      {/* Filter chips */}
      {(tab==="home"||tab==="trending"||tab==="new") && (
        <div style={{ display:"flex", gap:8, overflowX:"auto", scrollbarWidth:"none", marginBottom:20 }}>
          {FILTERS.map(f=>(
            <FilterChip key={f} label={f} active={filter===f} onClick={()=>setFilter(f)}/>
          ))}
        </div>
      )}

      {/* Title */}
      <SectionHeader
        title={
          tab==="favorites"?"❤️ Saved Videos":
          tab==="history"?"🕐 Watch History":
          tab==="trending"?"🔥 Trending":
          tab==="new"?"✨ New Releases":
          catFilter?`📂 ${catFilter}`:
          "🎬 All Videos"
        }
      />

      {/* Empty state */}
      {shown.length===0 && (
        <div style={{ textAlign:"center", padding:"60px 20px", color:G.muted }}>
          <div style={{ fontSize:48, marginBottom:12 }}>
            {tab==="favorites"?"💔":tab==="history"?"📭":"🔍"}
          </div>
          <div style={{ fontSize:16, fontWeight:600, marginBottom:6 }}>
            {tab==="favorites"?"No saved videos yet":tab==="history"?"No watch history yet":"No videos found"}
          </div>
          <div style={{ fontSize:13 }}>
            {tab==="favorites"?"Heart a video to save it here":tab==="history"?"Watch something to see it here":"Try a different filter"}
          </div>
        </div>
      )}

      {/* Video grid */}
      <div style={{
        display:"grid",
        gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))",
        gap:16, marginBottom:28,
      }}>
        {shown.map(v=>(
          <VideoCard key={v.id} video={v}
            onClick={playVideo} onToggleFav={toggleFav} isFav={favs.includes(v.id)}/>
        ))}
      </div>

      {/* Load more */}
      {loadMore < videos.length && (
        <div style={{ textAlign:"center", marginBottom:24 }}>
          <button onClick={()=>setLoadMore(n=>n+12)} style={{
            padding:"12px 36px", borderRadius:999,
            background:`linear-gradient(135deg,${G.accent},${G.accent2})`,
            border:"none", color:"white", fontFamily:"inherit",
            fontSize:14, fontWeight:700, cursor:"pointer",
            boxShadow:`0 0 24px ${G.accent}44`,
          }}>Load More</button>
        </div>
      )}
    </div>
  );
}
