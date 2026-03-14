import { useState, useMemo, useEffect } from "react";
import { G } from "../data/theme";
import { ALL_VIDEOS } from "../data/videos";

export default function SearchModal({ onClose, onPlay }) {
  const [q, setQ] = useState("");

  const results = useMemo(() =>
    q.trim().length > 1
      ? ALL_VIDEOS.filter(v =>
          v.title.toLowerCase().includes(q.toLowerCase()) ||
          v.channel.toLowerCase().includes(q.toLowerCase()) ||
          v.tags.some(t => t.includes(q.toLowerCase()))
        )
      : [],
    [q]
  );

  useEffect(() => {
    const h = e => e.key === "Escape" && onClose();
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);

  return (
    <div onClick={e=>e.target===e.currentTarget&&onClose()} style={{
      position:"fixed", inset:0, zIndex:9998,
      background:"rgba(0,0,0,.88)", backdropFilter:"blur(14px)",
      padding:"80px 16px 16px", animation:"fadeIn .2s",
    }}>
      <div style={{ maxWidth:680, margin:"0 auto" }}>
        <input autoFocus value={q} onChange={e=>setQ(e.target.value)}
          placeholder="Search videos, channels, tags…"
          style={{
            width:"100%", background:G.bg2, border:`2px solid ${G.accent}`,
            borderRadius:14, color:G.text, fontFamily:"inherit",
            fontSize:18, padding:"16px 20px", outline:"none",
            marginBottom:12, boxSizing:"border-box",
          }}
        />
        {results.length > 0 && (
          <div style={{ background:G.bg2, border:`1px solid ${G.border}`, borderRadius:12, overflow:"hidden" }}>
            {results.slice(0,7).map(v=>(
              <div key={v.id} onClick={()=>{onPlay(v);onClose();}} style={{
                padding:"12px 16px", cursor:"pointer",
                display:"flex", alignItems:"center", gap:12,
                borderBottom:`1px solid ${G.border}`, transition:"background .15s",
              }}
                onMouseEnter={e=>e.currentTarget.style.background=G.bg3}
                onMouseLeave={e=>e.currentTarget.style.background="transparent"}
              >
                <img src={v.thumb} alt={v.title} style={{ width:70, aspectRatio:"16/9", objectFit:"cover", borderRadius:6 }}/>
                <div>
                  <div style={{ fontSize:14, fontWeight:600, marginBottom:2 }}>{v.title}</div>
                  <div style={{ fontSize:11, color:G.muted }}>{v.channel} • {v.views} views</div>
                </div>
              </div>
            ))}
          </div>
        )}
        {q.trim().length>1 && results.length===0 && (
          <div style={{ textAlign:"center", color:G.muted, padding:32, fontSize:14 }}>
            No results for "{q}"
          </div>
        )}
      </div>
    </div>
  );
}
