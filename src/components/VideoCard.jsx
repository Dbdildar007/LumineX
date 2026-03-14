import { useState, useRef, useEffect, useCallback } from "react";
import { G } from "../data/theme";
import { useApp } from "../context/AppContext";
import { useIsMobile, useVideoLike } from "../hooks";
import { Avatar, VipBadge, VerifiedBadge, fmtNum, timeAgo } from "./ui";

export default function VideoCard({ video, cardWidth, compact }) {
  const { playVideo, session, setAuthModal } = useApp();
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

  const { liked, count: likeCount, toggle: toggleLike } = useVideoLike(
    video.id, false, video.likes_count
  );

  function play() {
    const v = vRef.current; if (!v) return;
    v.muted = true; v.volume = 0; v.currentTime = 0;
    v.play().then(() => setActive(true)).catch(() => {});
  }

  function stop() {
    const v = vRef.current; if (!v) return;
    v.pause(); v.currentTime = 0;
    setActive(false); setProg(0);
  }

  function handleEnter() {
    if (isMobile) return;
    setHov(true);
    timerRef.current = setTimeout(play, 350);
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
    tickRef.current = setInterval(() => setLpProg(Math.min((Date.now()-t0)/6,100)), 16);
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
    const fn = () => v.duration && setProg((v.currentTime/v.duration)*100);
    v.addEventListener("timeupdate", fn);
    return () => v.removeEventListener("timeupdate", fn);
  }, []);

  useEffect(() => () => {
    clearTimeout(timerRef.current);
    clearTimeout(lpRef.current);
    clearInterval(tickRef.current);
  }, []);

  const profile = video.profiles || { username: video.channel || "Unknown" };
  const isVip = video.is_vip;

  return (
    <div
      onClick={() => !lpOn && playVideo(video)}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchMove={handleTouchEnd}
      style={{
        background: hov ? G.cardH : G.card,
        borderRadius: 14, overflow:"hidden", cursor:"pointer",
        border:`1px solid ${hov ? G.accent+"44" : G.border}`,
        transform: hov ? "translateY(-5px) scale(1.015)" : "none",
        transition:"all .3s ease",
        boxShadow: hov ? `0 20px 50px rgba(0,0,0,.6),0 0 40px ${G.accent}12` : "0 2px 12px rgba(0,0,0,.3)",
        width: cardWidth || "100%",
        flexShrink: cardWidth ? 0 : undefined,
        scrollSnapAlign: cardWidth ? "start" : undefined,
        position:"relative",
      }}
    >
      {/* Media */}
      <div style={{ position:"relative", aspectRatio:"16/9", overflow:"hidden", background:"#111" }}>
        {/* Thumbnail */}
        {!active && (
          <img
            src={video.thumbnail_url || `https://picsum.photos/640/360?random=${video.id?.charCodeAt?.(0)||1}`}
            alt={video.title}
            loading="lazy"
            style={{
              position:"absolute", inset:0, width:"100%", height:"100%",
              objectFit:"cover",
              transform: hov ? "scale(1.05)" : "scale(1)",
              transition:"transform .5s ease", zIndex:1,
            }}
          />
        )}

        {/* VIP blur overlay */}
        {isVip && !active && (
          <div style={{
            position:"absolute", inset:0, zIndex:2,
            background:"rgba(0,0,0,.45)",
            backdropFilter:"blur(2px)",
            display:"flex", alignItems:"center", justifyContent:"center",
          }}>
            <div style={{
              background:"linear-gradient(135deg,#fbbf2433,#f9731633)",
              border:"1px solid #fbbf2466", borderRadius:12,
              padding:"8px 18px", textAlign:"center",
            }}>
              <div style={{ fontSize:22, marginBottom:2 }}>👑</div>
              <div style={{ fontSize:11, fontWeight:800, color:"#fbbf24", letterSpacing:1 }}>VIP ONLY</div>
            </div>
          </div>
        )}

        {/* Video element */}
        {hov && (
          <video
            ref={vRef} src={video.video_url} muted playsInline loop
            onCanPlay={e => { e.target.muted=true; e.target.volume=0; e.target.play().then(()=>setActive(true)).catch(()=>{}); }}
            style={{
              position:"absolute", inset:0, width:"100%", height:"100%",
              objectFit:"cover", zIndex:2, opacity:active?1:0, transition:"opacity .4s",
            }}
          />
        )}

        {/* Gradient overlay */}
        <div style={{
          position:"absolute", inset:0, zIndex:3, pointerEvents:"none",
          background:"linear-gradient(to top,rgba(0,0,0,.7) 0%,transparent 50%)",
          opacity: hov ? 1 : 0, transition:"opacity .3s",
        }}/>

        {/* Play icon */}
        {hov && !active && (
          <div style={{
            position:"absolute", inset:0, zIndex:4, pointerEvents:"none",
            display:"flex", alignItems:"center", justifyContent:"center",
          }}>
            <div style={{
              width:52, height:52, borderRadius:"50%",
              background:`${G.accent}cc`,
              display:"flex", alignItems:"center", justifyContent:"center",
              fontSize:20, color:"white",
              boxShadow:`0 0 0 8px ${G.accent}33`,
              animation:"pulseRing 1.5s infinite",
            }}>▶</div>
          </div>
        )}

        {/* Long-press ring (mobile) */}
        {isMobile && lpOn && (
          <div style={{
            position:"absolute", inset:0, zIndex:10, background:"rgba(0,0,0,.5)",
            display:"flex", alignItems:"center", justifyContent:"center",
          }}>
            <svg width={76} height={76} style={{transform:"rotate(-90deg)"}}>
              <circle cx={38} cy={38} r={32} fill="none" stroke="rgba(255,255,255,.2)" strokeWidth={4}/>
              <circle cx={38} cy={38} r={32} fill="none" stroke={G.accent} strokeWidth={4}
                strokeLinecap="round" strokeDasharray={`${lpProg*2.01} 201`}/>
            </svg>
            <span style={{position:"absolute",fontSize:24}}>▶</span>
          </div>
        )}

        {/* Mobile stop */}
        {isMobile && active && (
          <button onClick={e=>{e.stopPropagation();stop();setHov(false);}} style={{
            position:"absolute", top:8, right:8, zIndex:12,
            background:"rgba(0,0,0,.8)", border:"none", borderRadius:"50%",
            width:32, height:32, color:"white", fontSize:14, cursor:"pointer",
            display:"flex", alignItems:"center", justifyContent:"center",
          }}>⏹</button>
        )}

        {active && (
          <div style={{ position:"absolute", bottom:10, left:8, zIndex:6,
            background:"rgba(0,0,0,.8)", borderRadius:4,
            padding:"2px 6px", fontSize:9, color:"#aaa", fontWeight:700 }}>🔇</div>
        )}

        {/* Badges */}
        <div style={{ position:"absolute", top:8, left:8, display:"flex", gap:4, zIndex:5 }}>
          {isVip && <VipBadge small/>}
        </div>

        {/* Duration */}
        <div style={{ position:"absolute", bottom:8, right:8, zIndex:5,
          background:"rgba(0,0,0,.85)", color:"white",
          fontSize:11, fontWeight:700, padding:"2px 6px", borderRadius:4 }}>
          {video.duration || ""}
        </div>

        {/* Fav button */}
        {!compact && (
          <button onClick={e=>{e.stopPropagation();toggleLike();}} style={{
            position:"absolute", top:8, right:8, zIndex:5,
            background:"rgba(0,0,0,.7)", border:"none", borderRadius:"50%",
            width:30, height:30, cursor:"pointer", fontSize:14,
            display:"flex", alignItems:"center", justifyContent:"center",
            opacity: hov || liked ? 1 : 0, transition:"opacity .2s",
          }}>{liked?"❤️":"🤍"}</button>
        )}

        {/* Progress bar */}
        <div style={{ position:"absolute", bottom:0, left:0, right:0, height:3, background:"rgba(255,255,255,.1)", zIndex:6, opacity:active?1:0 }}>
          <div style={{ height:"100%", background:`linear-gradient(90deg,${G.accent},${G.accent2})`, width:`${prog}%`, transition:"width .12s linear" }}/>
        </div>
      </div>

      {/* Card body */}
      {!compact && (
        <div style={{ padding:"10px 12px 12px" }}>
          <div style={{ display:"flex", gap:9, alignItems:"flex-start" }}>
            <Avatar profile={profile} size={32}/>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{
                fontSize:13, fontWeight:600, color:G.text, lineHeight:1.4, marginBottom:4,
                display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical", overflow:"hidden",
              }}>{video.title}</div>
              <div style={{ display:"flex", alignItems:"center", gap:4, fontSize:11, color:G.muted }}>
                <span style={{ color:G.accent, fontWeight:600 }}>
                  {profile.display_name || profile.username}
                </span>
                {profile.is_verified && <VerifiedBadge size={11}/>}
              </div>
              <div style={{ fontSize:10, color:G.muted, marginTop:2 }}>
                {fmtNum(video.views || 0)} views · {timeAgo(video.created_at)}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
