import { useState, useEffect, useRef, useCallback } from "react";
import { G } from "../../data/theme";
import { useApp } from "../../context/AppContext";
import { useIsMobile, useVideoLike } from "../../hooks";
import { videoHelpers, likeHelpers } from "../../lib/supabase";
import { Avatar, VipBadge, VerifiedBadge, fmtNum, fmtTime, timeAgo, Btn } from "../ui";
import CommentSection from "./CommentSection";
import ControlsBar from "./ControlsBar";

// ── Seek Flash Overlay ────────────────────────────────────────────────────────
function SeekFlash({ seekFlash, arcProg }) {
  if (!seekFlash) return null;
  const C = 188.5;
  const arc = Math.min((arcProg/100)*C, C);
  const Panel = ({ side, active, icon }) => (
    <div style={{
      position:"absolute", [side]:0, top:0, bottom:0, width:"32%",
      display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
      background: active ? `linear-gradient(to ${side==="left"?"right":"left"},rgba(255,255,255,.12),transparent)` : "transparent",
      transition:"background .15s", pointerEvents:"none",
    }}>
      {active && (
        <div style={{ position:"relative", width:68, height:68 }}>
          <svg width={68} height={68} style={{transform:`rotate(-90deg)${side==="right"?" scaleX(-1)":""}`}}>
            <circle cx={34} cy={34} r={28} fill="none" stroke="rgba(255,255,255,.18)" strokeWidth={4}/>
            <circle cx={34} cy={34} r={28} fill="none" stroke="white" strokeWidth={4}
              strokeLinecap="round" strokeDasharray={`${arc*(28/30)} ${C*(28/30)}`}
              style={{transition:"stroke-dasharray .25s ease"}}/>
          </svg>
          <div style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:1 }}>
            <span style={{fontSize:17,lineHeight:1}}>{icon}</span>
            <span style={{fontSize:9,fontWeight:800,color:"white",letterSpacing:.3}}>10s</span>
          </div>
        </div>
      )}
    </div>
  );
  return (
    <div style={{ position:"absolute", inset:0, pointerEvents:"none", zIndex:20, animation:"fadeIn .12s" }}>
      <Panel side="left"  active={seekFlash==="bwd"} icon="⏪"/>
      <Panel side="right" active={seekFlash==="fwd"} icon="⏩"/>
      {seekFlash==="2x" && (
        <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center" }}>
          <div style={{ background:"rgba(0,0,0,.82)", border:`2px solid ${G.accent}`, borderRadius:14, padding:"12px 28px", fontSize:22, fontWeight:900, color:G.accent, letterSpacing:3 }}>2× SPEED</div>
        </div>
      )}
    </div>
  );
}

// ── Main modal ────────────────────────────────────────────────────────────────
export default function PlayerModal({ video: initialVideo, onClose }) {
  const { session, profile, setAuthModal, showToast } = useApp();
  const isMobile = useIsMobile();
  const wrapRef    = useRef(null);
  const vRef       = useRef(null);
  const ctrlTimer  = useRef(null);
  const lpRef      = useRef(null);
  const touchX0    = useRef(null);
  const touchT0    = useRef(null);
  const flashTimer = useRef(null);

  const [video,      setVideo]      = useState(initialVideo);
  const [playing,    setPlaying]    = useState(false);
  const [muted,      setMuted]      = useState(false);
  const [vol,        setVol]        = useState(1);
  const [prog,       setProg]       = useState(0);
  const [curTime,    setCurTime]    = useState(0);
  const [dur,        setDur]        = useState(0);
  const [showCtrl,   setShowCtrl]   = useState(true);
  const [speed,      setSpeed]      = useState(1);
  const [is2x,       setIs2x]       = useState(false);
  const [seekFlash,  setSeekFlash]  = useState(null);
  const [arcProg,    setArcProg]    = useState(0);
  const [isFS,       setIsFS]       = useState(false);
  const [captionOn,  setCaptionOn]  = useState(false);
  const [saved,      setSaved]      = useState(false);

  const { liked, count: likeCount, toggle: toggleLike } = useVideoLike(
    video.id, false, video.likes_count
  );

  const fmt = s => fmtTime(s);

  // ── Init ────────────────────────────────────────────────────────────────────
  useEffect(() => {
    const v = vRef.current; if (!v) return;
    const tryPlay = () => v.play().then(()=>setPlaying(true)).catch(()=>{});
    if (v.readyState >= 2) tryPlay();
    else v.addEventListener("canplay", tryPlay, { once:true });
    const upd = () => { setCurTime(v.currentTime); setDur(v.duration||0); setProg(v.duration?(v.currentTime/v.duration)*100:0); };
    v.addEventListener("timeupdate", upd);
    v.addEventListener("loadedmetadata", upd);
    videoHelpers.incrementViews(video.id).catch(()=>{});
    return () => { v.removeEventListener("timeupdate",upd); v.removeEventListener("loadedmetadata",upd); clearTimeout(ctrlTimer.current); clearTimeout(flashTimer.current); };
  }, [video.id, video.video_url]);

  useEffect(() => { document.body.style.overflow="hidden"; return ()=>{ document.body.style.overflow=""; }; }, []);

  // Check if saved
  useEffect(() => {
    if (!session) return;
    likeHelpers.isSaved(session.user.id, video.id).then(setSaved);
  }, [session, video.id]);

  // FS listener
  useEffect(() => {
    const fn = () => setIsFS(!!(document.fullscreenElement||document.webkitFullscreenElement));
    document.addEventListener("fullscreenchange", fn);
    document.addEventListener("webkitfullscreenchange", fn);
    return () => { document.removeEventListener("fullscreenchange",fn); document.removeEventListener("webkitfullscreenchange",fn); };
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
    const pct = v.duration ? Math.min((Math.abs(secs)/v.duration)*100*6, 100) : 40;
    clearTimeout(flashTimer.current);
    setArcProg(0);
    setSeekFlash(secs>0?"fwd":"bwd");
    requestAnimationFrame(()=>requestAnimationFrame(()=>setArcProg(pct)));
    flashTimer.current = setTimeout(()=>{ setSeekFlash(null); setArcProg(0); }, 800);
    revealCtrl();
  }, [revealCtrl]);

  const enterFS = useCallback(() => {
    const el = wrapRef.current; if (!el) return;
    try { if (screen.orientation?.lock) screen.orientation.lock("landscape").catch(()=>{}); } catch(e){}
    const req = el.requestFullscreen || el.webkitRequestFullscreen;
    if (req) req.call(el).catch(()=>{});
  }, []);

  const exitFS = useCallback(() => {
    try { if (screen.orientation?.unlock) screen.orientation.unlock(); } catch(e){}
    const ex = document.exitFullscreen || document.webkitExitFullscreen;
    if (ex) ex.call(document).catch(()=>{});
  }, []);

  const toggleFS = useCallback(() => { if(isFS) exitFS(); else enterFS(); revealCtrl(); }, [isFS,enterFS,exitFS,revealCtrl]);

  // Keyboard
  useEffect(() => {
    const h = e => {
      if (e.key==="Escape")           { if(isFS) exitFS(); else onClose(); return; }
      if (e.key===" ")                { e.preventDefault(); togglePlay(); }
      if (e.key==="ArrowRight")       seekBy(10);
      if (e.key==="ArrowLeft")        seekBy(-10);
      if (e.key==="f"||e.key==="F")   toggleFS();
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  });

  // Mobile touch
  const handleTouchStart = e => {
    touchX0.current = e.touches[0].clientX;
    touchT0.current = Date.now();
    lpRef.current = setTimeout(()=>{
      const v = vRef.current; if (!v) return;
      v.playbackRate=2; setSpeed(2); setIs2x(true);
      clearTimeout(flashTimer.current); setSeekFlash("2x");
      flashTimer.current = setTimeout(()=>setSeekFlash(null),900);
    }, 600);
  };

  const handleTouchEnd = e => {
    clearTimeout(lpRef.current);
    if (is2x) { const v=vRef.current; if(v) v.playbackRate=1; setSpeed(1); setIs2x(false); return; }
    const elapsed = Date.now()-(touchT0.current||0);
    const dx = e.changedTouches[0].clientX-(touchX0.current||0);
    if (elapsed<500 && Math.abs(dx)<10) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.changedTouches[0].clientX-rect.left;
      const third = rect.width/3;
      if (x<third) seekBy(-10); else if(x>third*2) seekBy(10); else togglePlay();
    }
    revealCtrl();
  };

  const handleShare = async () => {
    const url = window.location.origin + "?v=" + video.id;
    if (navigator.share) {
      await navigator.share({ title: video.title, url }).catch(()=>{});
    } else {
      navigator.clipboard.writeText(url);
      showToast("Link copied!", "success");
    }
  };

  const handleDownload = () => {
    const a = document.createElement("a");
    a.href = video.video_url; a.download = video.title + ".mp4";
    a.target = "_blank"; a.click();
    showToast("Download started!", "success");
  };

  const handleSave = async () => {
    if (!session) { setAuthModal("login"); return; }
    const next = !saved;
    setSaved(next);
    await likeHelpers.toggleSave(session.user.id, video.id, saved);
    showToast(next ? "❤️ Saved!" : "Removed from saved", "success");
  };

  const controlProps = {
    playing, muted, vol, prog, curTime, dur, speed, isFS, isMobile,
    showCtrl, fmt, vRef, captionOn, setCaptionOn,
    togglePlay, seekBy,
    seekTo: clientX => {
      const bar = document.querySelector("[data-seekbar]");
      if (!bar) return;
      const rect = bar.getBoundingClientRect();
      const pct = Math.max(0, Math.min(1,(clientX-rect.left)/rect.width));
      const v = vRef.current; if (v&&v.duration) v.currentTime=pct*v.duration;
      revealCtrl();
    },
    toggleFS,
    setSpeedTo: s => { const v=vRef.current; if(v) v.playbackRate=s; setSpeed(s); },
    onMute:   ()=>{ const v=vRef.current; if(!v) return; v.muted=!v.muted; setMuted(v.muted); },
    onVolume: n=>{ setVol(n); if(vRef.current){vRef.current.volume=n; vRef.current.muted=n===0; setMuted(n===0);} },
  };

  const pf = video.profiles || {};

  return (
    <div style={{ position:"fixed", inset:0, zIndex:9999, background:"rgba(0,0,0,.97)", overflowY:"auto", animation:"fadeIn .15s" }}>
      <div style={{ maxWidth:1300, margin:"0 auto", padding: isMobile?"8px 8px 80px":"16px 24px 40px" }}>

        {/* Close */}
        <div style={{ display:"flex", justifyContent:"flex-end", marginBottom:8 }}>
          <button onClick={onClose} style={{ background:G.bg3, border:`1px solid ${G.border}`, borderRadius:"50%", width:36, height:36, color:G.text, fontSize:16, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>✕</button>
        </div>

        <div style={{ display:"grid", gridTemplateColumns:isMobile?"1fr":"1fr 320px", gap:20 }}>

          {/* LEFT */}
          <div>
            {/* Player */}
            <div ref={wrapRef}
              onMouseMove={revealCtrl}
              onMouseLeave={()=>{ if(playing){ clearTimeout(ctrlTimer.current); ctrlTimer.current=setTimeout(()=>setShowCtrl(false),600); } }}
              style={{
                position:"relative", background:"#000",
                borderRadius: isFS?"0":16, overflow:"hidden",
                aspectRatio: isFS?"unset":"16/9", width:"100%",
                boxShadow:`0 0 60px ${G.accent}18`, userSelect:"none",
                ...(isFS?{position:"fixed",inset:0,zIndex:99999,borderRadius:0}:{}),
              }}
            >
              <video ref={vRef} src={video.video_url} playsInline
                onPlay={()=>setPlaying(true)} onPause={()=>setPlaying(false)}
                style={{width:"100%",height:"100%",objectFit:"contain",display:"block"}}
                onClick={!isMobile?togglePlay:undefined}
                onTouchStart={isMobile?handleTouchStart:undefined}
                onTouchEnd={isMobile?handleTouchEnd:undefined}
                onTouchMove={isMobile?()=>clearTimeout(lpRef.current):undefined}
              >
                {captionOn && video.caption_url && <track src={video.caption_url} kind="subtitles" label="English" default/>}
              </video>

              {!playing && (
                <div style={{ position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",pointerEvents:"none",zIndex:10 }}>
                  <div style={{ width:76,height:76,borderRadius:"50%",background:`${G.accent}cc`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:32,boxShadow:`0 0 60px ${G.accent}88`,animation:"pulseRing 1.8s infinite" }}>▶</div>
                </div>
              )}

              <SeekFlash seekFlash={seekFlash} arcProg={arcProg}/>

              {is2x && <div style={{ position:"absolute",top:14,right:14,zIndex:25,background:G.accent,color:"white",fontWeight:800,fontSize:12,padding:"4px 12px",borderRadius:8 }}>2× SPEED</div>}

              {isMobile && showCtrl && !is2x && !seekFlash && (
                <div style={{ position:"absolute",inset:0,display:"flex",alignItems:"center",pointerEvents:"none",zIndex:8 }}>
                  {[{icon:"⏪",l:"10s"},{},{icon:"⏩",l:"10s"}].map((item,i)=>(
                    <div key={i} style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center"}}>
                      {item.icon && <div style={{background:"rgba(0,0,0,.45)",borderRadius:40,width:46,height:46,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",border:"1px solid rgba(255,255,255,.14)"}}>
                        <span style={{fontSize:14}}>{item.icon}</span>
                        <span style={{fontSize:8,color:"rgba(255,255,255,.7)",fontWeight:700}}>{item.l}</span>
                      </div>}
                    </div>
                  ))}
                </div>
              )}

              <ControlsBar {...controlProps}/>
            </div>

            {/* Video info */}
            <div style={{ marginTop:16 }}>
              <h1 style={{ fontSize:isMobile?16:20,fontWeight:800,lineHeight:1.35,marginBottom:10,fontFamily:"'Syne',sans-serif" }}>{video.title}</h1>

              {/* Channel info */}
              <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:14, flexWrap:"wrap" }}>
                <Avatar profile={pf} size={40}/>
                <div>
                  <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                    <span style={{ fontSize:14, fontWeight:700 }}>{pf.display_name||pf.username}</span>
                    {pf.is_verified && <VerifiedBadge/>}
                  </div>
                  <div style={{ fontSize:11, color:G.muted }}>{fmtNum(pf.followers_count||0)} followers</div>
                </div>
                <div style={{ marginLeft:"auto", display:"flex", gap:8 }}>
                  <span style={{ fontSize:11, color:G.muted }}>👁 {fmtNum(video.views||0)}</span>
                  <span style={{ fontSize:11, color:G.muted }}>· {timeAgo(video.created_at)}</span>
                </div>
              </div>

              {/* Action buttons */}
              <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:16 }}>
                <ActionBtn icon={liked?"❤️":"🤍"} label={fmtNum(likeCount)} active={liked} color={G.accent3} onClick={toggleLike}/>
                <ActionBtn icon={saved?"🔖":"🔖"} label={saved?"Saved":"Save"} active={saved} color={G.accent} onClick={handleSave}/>
                <ActionBtn icon="🔗" label="Share" color={G.accent2} onClick={handleShare}/>
                <ActionBtn icon="📥" label="Download" color={G.muted} onClick={handleDownload}/>
                {video.is_vip && <VipBadge/>}
              </div>

              {/* Tags */}
              {video.tags?.length > 0 && (
                <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:16 }}>
                  {video.tags.map(t=>(
                    <span key={t} style={{ padding:"4px 10px",background:G.bg3,border:`1px solid ${G.border}`,borderRadius:6,fontSize:11,color:G.muted }}>#{t}</span>
                  ))}
                </div>
              )}

              {/* Description */}
              {video.description && (
                <div style={{ fontSize:13,color:G.muted,lineHeight:1.7,marginBottom:20,
                  padding:"12px 14px",background:G.bg3,borderRadius:10,border:`1px solid ${G.border}` }}>
                  {video.description}
                </div>
              )}

              <CommentSection videoId={video.id}/>
            </div>
          </div>

          {/* RIGHT: related */}
          <div style={{ display:"flex",flexDirection:"column", maxHeight:isMobile?"auto":"80vh", overflowY:"auto" }}>
            <RelatedVideos currentId={video.id}/>
          </div>
        </div>
      </div>
    </div>
  );
}

function ActionBtn({ icon, label, active, color, onClick }) {
  const [hov, setHov] = useState(false);
  return (
    <button onClick={onClick}
      onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{
        display:"flex", alignItems:"center", gap:6, padding:"8px 14px",
        borderRadius:10, border:`1px solid ${active||hov?color:G.border}`,
        background: active||hov ? color+"1a" : G.bg3,
        color: active||hov ? color : G.text,
        fontSize:13, fontWeight:600, cursor:"pointer",
        fontFamily:"inherit", transition:"all .2s",
      }}>{icon} {label}</button>
  );
}

function RelatedVideos({ currentId }) {
  const { playVideo } = useApp();
  const [videos, setVideos] = useState(() => {
    const { DEMO_VIDEOS } = require("../../data/theme");
    return DEMO_VIDEOS.filter(v=>v.id!==currentId).slice(0,10);
  });
  const isMobile = useIsMobile();

  useEffect(()=>{
    videoHelpers.getFeed({limit:12}).then(data=>{
      if(data?.length) setVideos(data.filter(v=>v.id!==currentId).slice(0,10));
    }).catch(()=>{});
  },[currentId]);

  return (
    <>
      <div style={{ fontSize:13,fontWeight:700,paddingBottom:10,marginBottom:8,borderBottom:`1px solid ${G.border}` }}>Up Next</div>
      <div style={{ display:"grid", gridTemplateColumns:isMobile?"repeat(2,1fr)":"1fr", gap:10 }}>
        {videos.map(v=>(
          <div key={v.id} onClick={()=>playVideo(v)}
            onMouseEnter={e=>e.currentTarget.style.background=G.bg3}
            onMouseLeave={e=>e.currentTarget.style.background="transparent"}
            style={{ display:"flex",flexDirection:isMobile?"column":"row", gap:isMobile?0:10,
              padding:isMobile?"0":"8px 4px", borderRadius:10, cursor:"pointer", transition:"background .2s",
              borderBottom:isMobile?"none":`1px solid ${G.border}22` }}
          >
            <div style={{ position:"relative", flexShrink:0, width:isMobile?"100%":100, aspectRatio:"16/9" }}>
              <img src={v.thumbnail_url||`https://picsum.photos/640/360?random=${v.id?.charCodeAt?.(0)||1}`} alt={v.title}
                style={{ width:"100%",height:"100%",objectFit:"cover",borderRadius:isMobile?"10px 10px 0 0":8 }}/>
              {v.is_vip && <div style={{position:"absolute",top:4,left:4}}><VipBadge small/></div>}
            </div>
            {!isMobile && (
              <div style={{ flex:1,minWidth:0 }}>
                <div style={{fontSize:11,fontWeight:600,lineHeight:1.4,marginBottom:3,display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical",overflow:"hidden"}}>{v.title}</div>
                <div style={{fontSize:10,color:G.accent,fontWeight:600}}>{v.profiles?.display_name||v.channel}</div>
                <div style={{fontSize:9,color:G.muted}}>{fmtNum(v.views||0)} views</div>
              </div>
            )}
            {isMobile && (
              <div style={{padding:"6px 8px 8px"}}>
                <div style={{fontSize:11,fontWeight:600,lineHeight:1.4,display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical",overflow:"hidden"}}>{v.title}</div>
                <div style={{fontSize:10,color:G.muted,marginTop:2}}>{v.profiles?.display_name||v.channel}</div>
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  );
}
