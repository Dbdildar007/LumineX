import { useState, useRef } from "react";
import { G } from "../../data/theme";
import PBtn from "./PBtn";

export default function ControlsBar({
  playing, muted, vol, prog, curTime, dur, speed, isFS, isMobile,
  showCtrl, fmt, vRef,
  togglePlay, seekBy, seekTo, toggleFS, setSpeedTo,
  onMute, onVolume,
}) {
  const [speedMenu, setSpeedMenu] = useState(false);
  const seekBarRef = useRef(null);

  const handleSeekClick = e => {
    const rect = seekBarRef.current?.getBoundingClientRect(); if (!rect) return;
    const pct = Math.max(0, Math.min(1, (e.clientX-rect.left)/rect.width));
    const v = vRef.current; if (v&&v.duration) v.currentTime=pct*v.duration;
  };

  return (
    <div onClick={e=>e.stopPropagation()} style={{
      position:"absolute", bottom:0, left:0, right:0,
      background:"linear-gradient(transparent,rgba(0,0,0,.95))",
      padding: isFS?"60px 20px 18px":(isMobile?"40px 12px 12px":"50px 16px 14px"),
      opacity: showCtrl ? 1 : 0,
      transform: showCtrl ? "translateY(0)" : "translateY(8px)",
      transition:"opacity .35s ease, transform .35s ease",
      pointerEvents: showCtrl ? "auto" : "none",
      zIndex:30,
    }}>
      {/* Seekbar */}
      <div ref={seekBarRef} onClick={handleSeekClick} style={{
        height:5, background:"rgba(255,255,255,.25)", borderRadius:5,
        marginBottom:12, cursor:"pointer", position:"relative",
      }}>
        <div style={{
          height:"100%", background:`linear-gradient(90deg,${G.accent},${G.accent2})`,
          width:`${prog}%`, borderRadius:5, transition:"width .1s linear",
        }}/>
        <div style={{
          position:"absolute", top:"50%", left:`${prog}%`,
          transform:"translate(-50%,-50%)",
          width:14, height:14, borderRadius:"50%", background:"white",
          boxShadow:`0 0 8px ${G.accent}`, transition:"left .1s linear",
        }}/>
      </div>

      {/* Buttons row */}
      <div style={{ display:"flex", alignItems:"center", gap: isFS?10:6 }}>
        <PBtn onClick={togglePlay}>{playing?"⏸":"▶"}</PBtn>

        <PBtn onClick={()=>seekBy(-10)}>
          <span style={{display:"flex",flexDirection:"column",alignItems:"center",lineHeight:1}}>
            <span style={{fontSize:13}}>⟲</span><span style={{fontSize:9}}>10</span>
          </span>
        </PBtn>

        <PBtn onClick={()=>seekBy(10)}>
          <span style={{display:"flex",flexDirection:"column",alignItems:"center",lineHeight:1}}>
            <span style={{fontSize:13}}>⟳</span><span style={{fontSize:9}}>10</span>
          </span>
        </PBtn>

        <PBtn onClick={onMute}>{muted?"🔇":"🔊"}</PBtn>

        {(!isMobile||isFS) && (
          <input type="range" min={0} max={1} step={0.05} value={muted?0:vol}
            onChange={e=>onVolume(+e.target.value)}
            style={{ width:isFS?90:70, accentColor:G.accent, cursor:"pointer" }}
          />
        )}

        <span style={{ fontSize:11, color:"rgba(255,255,255,.65)", whiteSpace:"nowrap" }}>
          {fmt(curTime)} / {fmt(dur)}
        </span>

        <div style={{ marginLeft:"auto", display:"flex", gap:6, alignItems:"center", position:"relative" }}>
          {/* Speed picker */}
          <div style={{position:"relative"}}>
            <button onClick={()=>setSpeedMenu(s=>!s)} style={{
              fontSize:11, background:"rgba(255,255,255,.18)",
              padding:"4px 10px", borderRadius:6, cursor:"pointer",
              color:"white", border:"none", fontFamily:"inherit", fontWeight:700,
            }}>{speed}×</button>
            {speedMenu && (
              <div style={{
                position:"absolute", bottom:"110%", right:0,
                background:G.bg2, border:`1px solid ${G.border}`,
                borderRadius:10, overflow:"hidden", zIndex:50, minWidth:80,
                boxShadow:"0 8px 30px rgba(0,0,0,.8)",
              }}>
                {[0.5,0.75,1,1.25,1.5,2].map(s=>(
                  <div key={s} onClick={()=>{setSpeedTo(s);setSpeedMenu(false);}} style={{
                    padding:"9px 16px", cursor:"pointer", fontSize:12,
                    color:speed===s?G.accent:G.text,
                    background:speed===s?G.bg3:"transparent",
                    fontWeight:speed===s?700:400,
                  }}>{s}×</div>
                ))}
              </div>
            )}
          </div>

          {/* Fullscreen */}
          <PBtn onClick={toggleFS} title="F">⛶</PBtn>
        </div>
      </div>
    </div>
  );
}
