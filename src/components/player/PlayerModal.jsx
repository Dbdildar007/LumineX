import { useState, useEffect, useRef, useCallback } from "react";
import { G } from "../../data/theme";
import useIsMobile from "../../hooks/useIsMobile";
import PBtn from "./PBtn";
import ABtn from "./ABtn";
import ControlsBar from "./ControlsBar";

export default function PlayerModal({ video, related, onClose, onPlayRelated, onToggleFav, isFav, onToast }) {
  const wrapRef    = useRef(null);
  const vRef       = useRef(null);
  const lpSpeedRef = useRef(null);
  const touchX0    = useRef(null);
  const touchT0    = useRef(null);

  const [playing,   setPlaying]   = useState(false);
  const [muted,     setMuted]     = useState(false);
  const [vol,       setVol]       = useState(1);
  const [prog,      setProg]      = useState(0);
  const [curTime,   setCurTime]   = useState(0);
  const [dur,       setDur]       = useState(0);
  const [showCtrl,  setShowCtrl]  = useState(true);
  const [speed,     setSpeed]     = useState(1);
  const [liked,     setLiked]     = useState(false);
  const [is2x,      setIs2x]      = useState(false);
  const [seekFlash, setSeekFlash] = useState(null);
  const [isFS,      setIsFS]      = useState(false);
  const ctrlTimer = useRef(null);
  const isMobile  = useIsMobile();

  const fmt = s => `${Math.floor((s||0)/60)}:${String(Math.floor((s||0)%60)).padStart(2,"0")}`;

  // Auto-play on mount
  useEffect(() => {
    const v = vRef.current; if (!v) return;
    const tryPlay = () => v.play().then(()=>setPlaying(true)).catch(()=>{});
    if (v.readyState >= 2) tryPlay();
    else v.addEventListener("canplay", tryPlay, { once: true });
    const upd = () => {
      setCurTime(v.currentTime); setDur(v.duration||0);
      setProg(v.duration ? (v.currentTime/v.duration)*100 : 0);
    };
    v.addEventListener("timeupdate", upd);
    v.addEventListener("loadedmetadata", upd);
    return () => { v.removeEventListener("timeupdate",upd); v.removeEventListener("loadedmetadata",upd); };
  }, [video.src]);

  useEffect(() => { document.body.style.overflow="hidden"; return ()=>{ document.body.style.overflow=""; }; }, []);

  // Fullscreen change listener
  useEffect(() => {
    const onChange = () => setIsFS(!!(document.fullscreenElement||document.webkitFullscreenElement));
    document.addEventListener("fullscreenchange", onChange);
    document.addEventListener("webkitfullscreenchange", onChange);
    return () => { document.removeEventListener("fullscreenchange",onChange); document.removeEventListener("webkitfullscreenchange",onChange); };
  }, []);

  const revealCtrl = useCallback(() => {
    setShowCtrl(true);
    clearTimeout(ctrlTimer.current);
    ctrlTimer.current = setTimeout(() => setShowCtrl(false), 3000);
  }, []);

  const togglePlay = useCallback(() => {
    const v = vRef.current; if (!v) return;
    if (v.paused) { v.play().then(()=>setPlaying(true)).catch(()=>{}); revealCtrl(); }
    else { v.pause(); setPlaying(false); setShowCtrl(true); clearTimeout(ctrlTimer.current); }
  }, [revealCtrl]);

  const seekBy = useCallback((secs) => {
    const v = vRef.current; if (!v) return;
    v.currentTime = Math.max(0, Math.min(v.duration||0, v.currentTime+secs));
    setSeekFlash(secs>0?"fwd":"bwd");
    setTimeout(()=>setSeekFlash(null), 700);
    revealCtrl();
  }, [revealCtrl]);

  const enterFS = useCallback(() => {
    const el = wrapRef.current; if (!el) return;
    try { if (screen.orientation?.lock) screen.orientation.lock("landscape").catch(()=>{}); } catch(e) {}
    const req = el.requestFullscreen || el.webkitRequestFullscreen;
    if (req) req.call(el).catch(()=>{});
  }, []);

  const exitFS = useCallback(() => {
    try { if (screen.orientation?.unlock) screen.orientation.unlock(); } catch(e) {}
    const ex = document.exitFullscreen || document.webkitExitFullscreen;
    if (ex) ex.call(document).catch(()=>{});
  }, []);

  const toggleFS = useCallback(() => {
    if (isFS) exitFS(); else enterFS();
    revealCtrl();
  }, [isFS, enterFS, exitFS, revealCtrl]);

  // Keyboard shortcuts
  useEffect(() => {
    const h = e => {
      if (e.key==="Escape") { if(isFS) exitFS(); else onClose(); return; }
      if (e.key===" ") { e.preventDefault(); togglePlay(); }
      if (e.key==="ArrowRight") seekBy(10);
      if (e.key==="ArrowLeft") seekBy(-10);
      if (e.key==="f"||e.key==="F") toggleFS();
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  });

  const handleTouchStart = e => {
    touchX0.current = e.touches[0].clientX;
    touchT0.current = Date.now();
    lpSpeedRef.current = setTimeout(() => {
      const v = vRef.current; if (!v) return;
      v.playbackRate=2; setSpeed(2); setIs2x(true);
      setSeekFlash("2x"); setTimeout(()=>setSeekFlash(null),800);
    }, 600);
  };

  const handleTouchEnd = e => {
    clearTimeout(lpSpeedRef.current);
    if (is2x) { const v=vRef.current; if(v) v.playbackRate=1; setSpeed(1); setIs2x(false); return; }
    const elapsed = Date.now()-(touchT0.current||0);
    const dx = e.changedTouches[0].clientX-(touchX0.current||0);
    if (elapsed<500 && Math.abs(dx)<10) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.changedTouches[0].clientX-rect.left;
      const third = rect.width/3;
      if (x<third) seekBy(-10); else if (x>third*2) seekBy(10); else togglePlay();
    }
    revealCtrl();
  };

  const setSpeedTo = s => {
    const v = vRef.current; if (v) v.playbackRate=s;
    setSpeed(s);
  };

  const seekTo = (clientX) => {
    const bar = wrapRef.current?.querySelector("[data-seekbar]");
    if (!bar) return;
    const rect = bar.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1,(clientX-rect.left)/rect.width));
    const v = vRef.current; if (v&&v.duration) v.currentTime=pct*v.duration;
    revealCtrl();
  };

  const controlProps = {
    playing, muted, vol, prog, curTime, dur, speed, isFS, isMobile,
    showCtrl, fmt, vRef,
    togglePlay, seekBy, seekTo, toggleFS, setSpeedTo,
    onMute: () => { const v=vRef.current; if(!v) return; v.muted=!v.muted; setMuted(v.muted); },
    onVolume: n => { setVol(n); if(vRef.current){vRef.current.volume=n; vRef.current.muted=n===0; setMuted(n===0);} },
  };

  return (
    <div style={{ position:"fixed", inset:0, zIndex:9999, background:"rgba(0,0,0,.97)", overflowY:"auto", animation:"fadeIn .15s ease" }}>
      <div style={{ maxWidth:1200, margin:"0 auto", padding: isMobile?"8px 8px 90px":"16px 20px 40px" }}>

        {/* Close */}
        <div style={{ display:"flex", justifyContent:"flex-end", marginBottom:8 }}>
          <button onClick={onClose} style={{
            background:G.bg3, border:`1px solid ${G.border}`, borderRadius:"50%",
            width:38, height:38, color:G.text, fontSize:18, cursor:"pointer",
            display:"flex", alignItems:"center", justifyContent:"center",
          }}>✕</button>
        </div>

        <div style={{ display:"grid", gridTemplateColumns:isMobile?"1fr":"1fr 310px", gap:16 }}>
          {/* Player */}
          <div>
            <div ref={wrapRef}
              onMouseMove={revealCtrl}
              onMouseLeave={()=>{ if(playing){ clearTimeout(ctrlTimer.current); ctrlTimer.current=setTimeout(()=>setShowCtrl(false),500); }}}
              style={{
                position:"relative", background:"#000",
                borderRadius: isFS?"0":14, overflow:"hidden",
                aspectRatio: isFS?"unset":"16/9", width:"100%",
                height: isFS?"100vh":"auto",
                boxShadow:`0 0 80px ${G.accent}22`, userSelect:"none",
                ...(isFS?{position:"fixed",inset:0,zIndex:99999,borderRadius:0}:{}),
              }}
            >
              <video ref={vRef} src={video.src} playsInline
                onPlay={()=>setPlaying(true)} onPause={()=>setPlaying(false)}
                style={{ width:"100%", height:"100%", objectFit:"contain", display:"block" }}
                onClick={!isMobile?togglePlay:undefined}
                onTouchStart={isMobile?handleTouchStart:undefined}
                onTouchEnd={isMobile?handleTouchEnd:undefined}
                onTouchMove={isMobile?()=>clearTimeout(lpSpeedRef.current):undefined}
              />

              {/* Big play icon */}
              {!playing && (
                <div style={{ position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",pointerEvents:"none",zIndex:10 }}>
                  <div style={{ width:76,height:76,borderRadius:"50%",background:`${G.accent}cc`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:32,boxShadow:`0 0 60px ${G.accent}88` }}>▶</div>
                </div>
              )}

              {/* Seek flash */}
              {seekFlash && (
                <div style={{ position:"absolute",inset:0,pointerEvents:"none",zIndex:20,display:"flex",alignItems:"center",justifyContent:"center" }}>
                  {seekFlash==="bwd" && <div style={{ position:"absolute",left:0,top:0,bottom:0,width:"33%",background:"rgba(255,255,255,.1)",display:"flex",alignItems:"center",justifyContent:"center",animation:"fadeIn .1s" }}><span style={{fontSize:24,color:"white"}}>⏪</span><span style={{fontSize:12,color:"white",marginLeft:4}}>10s</span></div>}
                  {seekFlash==="fwd" && <div style={{ position:"absolute",right:0,top:0,bottom:0,width:"33%",background:"rgba(255,255,255,.1)",display:"flex",alignItems:"center",justifyContent:"center",animation:"fadeIn .1s" }}><span style={{fontSize:12,color:"white",marginRight:4}}>10s</span><span style={{fontSize:24,color:"white"}}>⏩</span></div>}
                  {seekFlash==="2x" && <div style={{ background:"rgba(0,0,0,.75)",border:`2px solid ${G.accent}`,borderRadius:12,padding:"12px 28px",fontSize:24,fontWeight:800,color:G.accent,letterSpacing:2 }}>2× SPEED</div>}
                </div>
              )}

              {/* 2x badge */}
              {is2x && <div style={{ position:"absolute",top:14,right:14,zIndex:25,background:G.accent,color:"white",fontWeight:800,fontSize:13,padding:"4px 14px",borderRadius:8 }}>2× SPEED</div>}

              {/* Mobile tap hints */}
              {isMobile && showCtrl && !is2x && (
                <div style={{ position:"absolute",inset:0,display:"flex",alignItems:"center",pointerEvents:"none",zIndex:8 }}>
                  <div style={{ flex:1,display:"flex",alignItems:"center",justifyContent:"center" }}>
                    <div style={{ background:"rgba(0,0,0,.5)",borderRadius:50,width:50,height:50,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center" }}>
                      <span style={{fontSize:16}}>⏪</span><span style={{fontSize:9,color:"rgba(255,255,255,.7)"}}>10s</span>
                    </div>
                  </div>
                  <div style={{flex:1}}/>
                  <div style={{ flex:1,display:"flex",alignItems:"center",justifyContent:"center" }}>
                    <div style={{ background:"rgba(0,0,0,.5)",borderRadius:50,width:50,height:50,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center" }}>
                      <span style={{fontSize:16}}>⏩</span><span style={{fontSize:9,color:"rgba(255,255,255,.7)"}}>10s</span>
                    </div>
                  </div>
                </div>
              )}

              <ControlsBar {...controlProps} />
            </div>

            {/* Video info */}
            <div style={{ marginTop:14 }}>
              <h2 style={{ fontSize:isMobile?16:20, fontWeight:800, lineHeight:1.35, marginBottom:8 }}>{video.title}</h2>
              <div style={{ display:"flex", gap:10, flexWrap:"wrap", fontSize:12, color:G.muted, marginBottom:12 }}>
                <span>👁 {video.views} views</span><span>•</span>
                <span>{video.age} ago</span><span>•</span>
                <span style={{color:G.accent,fontWeight:700}}>{video.channel}</span>
              </div>
              <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:12 }}>
                <ABtn active={liked} color={G.green} onClick={()=>{setLiked(l=>!l);onToast(liked?"Removed like":"👍 Liked!");}}>👍 {liked?"Liked":"Like"}</ABtn>
                <ABtn active={isFav} color={G.accent} onClick={()=>{onToggleFav(video.id);onToast(isFav?"Removed":"❤️ Saved!");}}>❤️ {isFav?"Saved":"Save"}</ABtn>
                <ABtn color={G.accent3} onClick={()=>onToast("🔗 Link copied!")}>🔗 Share</ABtn>
                <ABtn color={G.muted} onClick={()=>onToast("📥 Downloading!")}>📥 Download</ABtn>
              </div>
              <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                {video.tags.map(t=>(
                  <span key={t} style={{ padding:"4px 10px",background:G.bg3,border:`1px solid ${G.border}`,borderRadius:6,fontSize:11,color:G.muted,cursor:"pointer" }}>#{t}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Related */}
          <div style={{ display:"flex", flexDirection:"column", maxHeight:isMobile?"auto":"80vh", overflowY:"auto" }}>
            <div style={{ fontSize:13,fontWeight:700,paddingBottom:10,marginBottom:4,borderBottom:`1px solid ${G.border}` }}>Up Next</div>
            {related.map(v=>(
              <div key={v.id} onClick={()=>onPlayRelated(v)}
                onMouseEnter={e=>e.currentTarget.style.paddingLeft="6px"}
                onMouseLeave={e=>e.currentTarget.style.paddingLeft="0"}
                style={{ display:"flex",gap:10,padding:"10px 0",borderBottom:`1px solid ${G.border}`,cursor:"pointer",transition:"padding-left .2s" }}
              >
                <img src={v.thumb} alt={v.title} style={{ width:110,aspectRatio:"16/9",objectFit:"cover",borderRadius:8,flexShrink:0 }}/>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:12,fontWeight:600,lineHeight:1.4,marginBottom:3,display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical",overflow:"hidden" }}>{v.title}</div>
                  <div style={{ fontSize:10,color:G.accent,fontWeight:700,marginBottom:2 }}>{v.channel}</div>
                  <div style={{ fontSize:10,color:G.muted }}>{v.views} • {v.duration}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
