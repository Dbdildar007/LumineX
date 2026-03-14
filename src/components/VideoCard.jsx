import { useState, useRef, useEffect, useCallback } from "react";
import { G, BADGE_COLORS } from "../data/theme";
import useIsMobile from "../hooks/useIsMobile";

export default function VideoCard({ video, onClick, onToggleFav, isFav, cardWidth }) {
  const isMobile = useIsMobile();
  const vRef     = useRef(null);
  const timerRef = useRef(null);
  const lpRef    = useRef(null);
  const tickRef  = useRef(null);

  const [active,  setActive]  = useState(false);
  const [hov,     setHov]     = useState(false);
  const [prog,    setProg]    = useState(0);
  const [lpProg,  setLpProg]  = useState(0);
  const [lpOn,    setLpOn]    = useState(false);

  function play() {
    const v = vRef.current; if (!v) return;
    v.muted = true; v.volume = 0;
    v.currentTime = 0;
    const p = v.play();
    if (p) p.then(() => setActive(true)).catch(() => {});
    else setActive(true);
  }

  function stop() {
    const v = vRef.current; if (!v) return;
    v.pause(); v.currentTime = 0;
    setActive(false); setProg(0);
  }

  function handleEnter() {
    if (isMobile) return;
    setHov(true);
    timerRef.current = setTimeout(play, 300);
  }

  function handleLeave() {
    if (isMobile) return;
    clearTimeout(timerRef.current);
    setHov(false); stop();
  }

  function handleTouchStart(e) {
    if (!isMobile) return;
    e.preventDefault();
    setLpOn(true); setLpProg(0);
    const t0 = Date.now();
    tickRef.current = setInterval(() => setLpProg(Math.min((Date.now() - t0) / 6, 100)), 16);
    lpRef.current = setTimeout(() => {
      clearInterval(tickRef.current);
      setLpOn(false); setHov(true); play();
    }, 600);
  }

  function handleTouchEnd() {
    if (!isMobile) return;
    clearTimeout(lpRef.current); clearInterval(tickRef.current);
    setLpOn(false); setLpProg(0);
    if (!active) setHov(false);
  }

  useEffect(() => {
    const v = vRef.current; if (!v) return;
    const fn = () => v.duration && setProg((v.currentTime / v.duration) * 100);
    v.addEventListener("timeupdate", fn);
    return () => v.removeEventListener("timeupdate", fn);
  }, []);

  useEffect(() => () => {
    clearTimeout(timerRef.current);
    clearTimeout(lpRef.current);
    clearInterval(tickRef.current);
  }, []);

  return (
    <div
      onClick={() => !lpOn && onClick(video)}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchMove={handleTouchEnd}
      style={{
        background: hov ? G.cardH : G.card,
        borderRadius: 14, overflow: "hidden", cursor: "pointer",
        border: `1px solid ${hov ? G.accent + "66" : G.border}`,
        transform: hov ? "translateY(-6px) scale(1.018)" : "none",
        transition: "all .3s ease",
        boxShadow: hov ? `0 24px 64px rgba(0,0,0,.6),0 0 50px ${G.accent}18` : "0 4px 20px rgba(0,0,0,.35)",
        width: cardWidth || "100%",
        flexShrink: cardWidth ? 0 : undefined,
        position: "relative",
      }}
    >
      {/* Media box */}
      <div style={{ position:"relative", aspectRatio:"16/9", overflow:"hidden", background:"#111" }}>

        {!active && (
          <img src={video.thumb} alt="" style={{
            position:"absolute", inset:0, width:"100%", height:"100%",
            objectFit:"cover", display:"block",
            transform: hov ? "scale(1.06)" : "scale(1)",
            transition: "transform .5s ease", zIndex: 1,
          }} />
        )}

        {hov && (
          <video
            ref={vRef}
            src={video.src}
            muted playsInline loop
            onCanPlay={e => { e.target.muted=true; e.target.volume=0; e.target.play().then(()=>setActive(true)).catch(()=>{}); }}
            style={{
              position:"absolute", inset:0, width:"100%", height:"100%",
              objectFit:"cover", zIndex:2,
              opacity: active ? 1 : 0, transition:"opacity .4s ease",
            }}
          />
        )}

        {/* Gradient overlay */}
        <div style={{ position:"absolute", inset:0, zIndex:3, pointerEvents:"none",
          background:"linear-gradient(to top,rgba(0,0,0,.7) 0%,transparent 50%)",
          opacity: hov ? 1 : 0, transition:"opacity .3s" }} />

        {/* Play icon */}
        {hov && !active && (
          <div style={{ position:"absolute", inset:0, zIndex:4, display:"flex",
            alignItems:"center", justifyContent:"center", pointerEvents:"none" }}>
            <div style={{
              width:56, height:56, borderRadius:"50%", background:`${G.accent}cc`,
              display:"flex", alignItems:"center", justifyContent:"center",
              fontSize:22, color:"white", boxShadow:`0 0 0 10px ${G.accent}33`,
              animation:"pulseRing 1.4s infinite",
            }}>▶</div>
          </div>
        )}

        {/* Mobile long-press ring */}
        {isMobile && lpOn && (
          <div style={{ position:"absolute", inset:0, zIndex:10,
            display:"flex", alignItems:"center", justifyContent:"center",
            background:"rgba(0,0,0,.55)", backdropFilter:"blur(2px)" }}>
            <svg width={80} height={80} style={{transform:"rotate(-90deg)"}}>
              <circle cx={40} cy={40} r={34} fill="none" stroke="rgba(255,255,255,.15)" strokeWidth={4}/>
              <circle cx={40} cy={40} r={34} fill="none" stroke={G.accent} strokeWidth={4}
                strokeLinecap="round" strokeDasharray={`${lpProg*2.138} 213.8`}/>
            </svg>
            <span style={{position:"absolute",fontSize:26}}>▶</span>
          </div>
        )}

        {/* Mobile stop */}
        {isMobile && active && (
          <button onClick={e=>{e.stopPropagation();stop();setHov(false);}} style={{
            position:"absolute", top:8, right:8, zIndex:12,
            background:"rgba(0,0,0,.8)", border:"none", borderRadius:"50%",
            width:34, height:34, color:"white", fontSize:15, cursor:"pointer",
            display:"flex", alignItems:"center", justifyContent:"center",
          }}>⏹</button>
        )}

        {active && (
          <div style={{ position:"absolute", bottom:10, left:8, zIndex:6,
            background:"rgba(0,0,0,.8)", borderRadius:4,
            padding:"2px 7px", fontSize:10, color:"#aaa", fontWeight:700 }}>🔇 MUTED</div>
        )}

        {/* Badge */}
        <div style={{ position:"absolute", top:8, left:8, display:"flex", gap:4, zIndex:5 }}>
          {video.badge && (
            <span style={{
              background: BADGE_COLORS[video.badge], color: video.badge==="VIP"?"#000":"white",
              fontSize:9, fontWeight:900, padding:"2px 8px", borderRadius:4,
              letterSpacing:.5, textTransform:"uppercase",
            }}>{video.badge}</span>
          )}
        </div>

        {/* Duration */}
        <div style={{ position:"absolute", bottom:8, right:8, zIndex:5,
          background:"rgba(0,0,0,.85)", color:"white",
          fontSize:11, fontWeight:700, padding:"2px 7px", borderRadius:5 }}>
          {video.duration}
        </div>

        {/* Fav button */}
        <button onClick={e=>{e.stopPropagation();onToggleFav(video.id);}} style={{
          position:"absolute", top:8, right:8, zIndex:5,
          background:"rgba(0,0,0,.72)", border:"none", borderRadius:"50%",
          width:32, height:32, cursor:"pointer", fontSize:16,
          display:"flex", alignItems:"center", justifyContent:"center",
          opacity: hov||isFav ? 1 : 0, transition:"opacity .2s, transform .2s",
          transform: isFav ? "scale(1.25)" : "scale(1)",
        }}>{isFav ? "❤️" : "🤍"}</button>

        {/* Progress bar */}
        <div style={{ position:"absolute", bottom:0, left:0, right:0, height:3,
          background:"rgba(255,255,255,.12)", zIndex:6,
          opacity: active ? 1 : 0, transition:"opacity .3s" }}>
          <div style={{
            height:"100%", background:`linear-gradient(90deg,${G.accent},${G.accent2})`,
            width:`${prog}%`, transition:"width .12s linear", borderRadius:"0 2px 2px 0",
          }}/>
        </div>
      </div>

      {/* Card body */}
      <div style={{ padding:"10px 12px 13px" }}>
        <div style={{ fontSize:13, fontWeight:600, color:G.text, lineHeight:1.4, marginBottom:6,
          display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical", overflow:"hidden" }}>
          {video.title}
        </div>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <span style={{ fontSize:11, color:G.accent, fontWeight:700 }}>{video.channel}</span>
          <div style={{ display:"flex", gap:8, fontSize:10, color:G.muted }}>
            <span>👁 {video.views}</span>
            <span>⭐ {video.rating}</span>
          </div>
        </div>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between",
          marginTop:8, paddingTop:8, borderTop:`1px solid ${G.border}`,
          fontSize:10, color:G.muted }}>
          <span>{video.age} ago</span>
          <div style={{ width:60, height:3, background:G.border, borderRadius:3, overflow:"hidden" }}>
            <div style={{ height:"100%", background:`linear-gradient(90deg,${G.gold},#f59e0b)`,
              width:`${(parseFloat(video.rating)/10)*100}%` }}/>
          </div>
        </div>
      </div>
    </div>
  );
}
