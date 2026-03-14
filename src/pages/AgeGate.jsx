import { useState, useMemo } from "react";
import { G, APP_LOGO, APP_LOGO2 } from "../data/theme";

export default function AgeGate({ onEnter }) {
  const [leaving,    setLeaving]    = useState(false);
  const [hoverEnter, setHoverEnter] = useState(false);
  const [hoverLeave, setHoverLeave] = useState(false);

  const particles = useMemo(() =>
    Array.from({ length: 22 }, (_, i) => ({
      id: i, x: Math.random()*100, y: Math.random()*100,
      size: Math.random()*3+1, delay: Math.random()*4,
      dur: Math.random()*6+5, opacity: Math.random()*0.4+0.1,
    })), []
  );

  const handleLeave = () => {
    setLeaving(true);
    setTimeout(() => { window.location.href = "https://www.google.com"; }, 800);
  };

  return (
    <div style={{
      position:"fixed", inset:0, fontFamily:"'Outfit',sans-serif",
      background:G.bg, overflow:"hidden",
      display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
      opacity: leaving?0:1, transform: leaving?"scale(1.04)":"scale(1)",
      transition:"opacity .8s ease, transform .8s ease",
    }}>
      {/* Bg blobs */}
      <div style={{ position:"absolute", inset:0, pointerEvents:"none",
        background:`radial-gradient(ellipse 60% 50% at 20% 30%,${G.accent}18 0%,transparent 70%),radial-gradient(ellipse 50% 60% at 80% 70%,${G.accent3}15 0%,transparent 65%)`,
        animation:"agePulse 6s ease-in-out infinite" }}/>
      {/* Grid */}
      <div style={{ position:"absolute", inset:0, pointerEvents:"none",
        backgroundImage:`linear-gradient(${G.border}33 1px,transparent 1px),linear-gradient(90deg,${G.border}33 1px,transparent 1px)`,
        backgroundSize:"60px 60px", opacity:0.4 }}/>
      {/* Scan line */}
      <div style={{ position:"absolute", left:0, right:0, height:2,
        background:`linear-gradient(90deg,transparent,${G.accent}44,transparent)`,
        animation:"scanLine 5s linear infinite", pointerEvents:"none", zIndex:1 }}/>
      {/* Particles */}
      {particles.map(p=>(
        <div key={p.id} style={{
          position:"absolute", left:`${p.x}%`, top:`${p.y}%`,
          width:p.size, height:p.size, borderRadius:"50%",
          background: p.id%3===0?G.accent:p.id%3===1?G.accent3:"#fff",
          "--op":p.opacity, opacity:p.opacity,
          animation:`starTwinkle ${p.dur}s ${p.delay}s ease-in-out infinite`,
          pointerEvents:"none",
        }}/>
      ))}

      {/* Orbital rings */}
      <div style={{ position:"absolute", top:"50%", left:"50%", transform:"translate(-50%,-50%)", width:320, height:320, pointerEvents:"none", zIndex:0 }}>
        {[{size:0,dur:20,orbitDur:8,dotColor:G.accent,dotSize:8},{size:30,dur:14,orbitDur:5,dotColor:G.accent3,dotSize:6,reverse:true},{size:60,dur:10,orbitDur:6,dotColor:G.accent2,dotSize:5,reverse:false}].map((ring,i)=>(
          <div key={i} style={{ position:"absolute", inset:ring.size, borderRadius:"50%",
            border:`1px solid ${ring.dotColor}22`, animation:`ageSpin ${ring.dur}s linear infinite ${ring.reverse?"reverse":""}` }}>
            <div style={{ position:"absolute", top:"50%", left:"50%",
              animation:`ageOrbit ${ring.orbitDur}s linear infinite` }}>
              <div style={{ width:ring.dotSize, height:ring.dotSize, borderRadius:"50%",
                background:ring.dotColor, boxShadow:`0 0 12px ${ring.dotColor}`,
                transform:"translate(-50%,-50%)" }}/>
            </div>
          </div>
        ))}
      </div>

      {/* Card */}
      <div style={{
        position:"relative", zIndex:2,
        background:"rgba(12,12,22,0.85)", backdropFilter:"blur(28px)",
        border:`1px solid ${G.accent}33`, borderRadius:28,
        padding:"48px 44px 44px", maxWidth:480, width:"100%", margin:"0 20px",
        textAlign:"center", animation:"ageFadeUp .7s cubic-bezier(0.34,1.26,0.64,1) both, borderGlow 3s ease-in-out infinite",
        boxShadow:`0 0 0 1px ${G.border}, 0 40px 80px rgba(0,0,0,.6)`,
      }}>
        {/* 18+ badge */}
        <div style={{
          display:"inline-flex", alignItems:"center", justifyContent:"center",
          width:72, height:72, borderRadius:"50%",
          background:`linear-gradient(135deg,${G.accent},${G.accent2})`,
          fontSize:28, fontWeight:900, color:"white", marginBottom:20,
          boxShadow:`0 0 0 8px ${G.accent}18, 0 0 40px ${G.accent}44`,
          animation:"ageFloat 5s ease-in-out infinite, ageGlow 3s ease-in-out infinite",
        }}>18+</div>

        {/* Logo */}
        <div style={{ fontSize:46, fontWeight:900, letterSpacing:4, fontFamily:"Georgia,serif", marginBottom:6, animation:"ageFadeUp .6s .1s both" }}>
          <span style={{
            background:`linear-gradient(90deg,${G.accent},${G.accent2},${G.accent},${G.accent2})`,
            backgroundSize:"300% auto", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent",
            animation:"logoShimmer 4s linear infinite",
          }}>{APP_LOGO}</span>
          <span style={{ color:"#c4b5fd" }}>{APP_LOGO2}</span>
        </div>

        <div style={{ fontSize:20, fontWeight:800, color:G.text, marginBottom:12, animation:"ageFadeUp .6s .2s both" }}>
          Age Verification Required
        </div>
        <div style={{ width:48, height:3, margin:"0 auto 16px", background:`linear-gradient(90deg,${G.accent},${G.accent2})`, borderRadius:99, animation:"ageFadeUp .6s .25s both" }}/>
        <div style={{ fontSize:13.5, color:G.muted, lineHeight:1.8, marginBottom:28, animation:"ageFadeUp .6s .3s both" }}>
          This website contains <strong style={{color:G.text}}>adult content</strong>.<br/>
          By entering, you confirm you are <strong style={{color:G.accent}}>18 years or older</strong> and agree to our{" "}
          <span style={{color:G.accent,cursor:"pointer",textDecoration:"underline"}}>Terms of Service</span>.
        </div>

        {/* Buttons */}
        <div style={{ display:"flex", flexDirection:"column", gap:12, animation:"ageFadeUp .6s .4s both" }}>
          <button onMouseEnter={()=>setHoverEnter(true)} onMouseLeave={()=>setHoverEnter(false)} onClick={onEnter} style={{
            width:"100%", padding:"15px", borderRadius:14, border:"none",
            background:`linear-gradient(135deg,${G.accent},${G.accent2})`,
            color:"white", fontFamily:"inherit", fontSize:16, fontWeight:800, cursor:"pointer",
            transform: hoverEnter?"scale(1.03) translateY(-2px)":"scale(1)",
            boxShadow: hoverEnter?`0 12px 40px ${G.accent}66,0 0 0 3px ${G.accent}33`:`0 0 30px ${G.accent}44`,
            transition:"all .25s cubic-bezier(0.34,1.56,0.64,1)",
          }}>✓ &nbsp;I am 18+ — Enter Now</button>

          <button onMouseEnter={()=>setHoverLeave(true)} onMouseLeave={()=>setHoverLeave(false)} onClick={handleLeave} style={{
            width:"100%", padding:"14px", borderRadius:14,
            border:`1px solid ${hoverLeave?"#ef444466":G.border}`,
            background: hoverLeave?"rgba(239,68,68,0.08)":"rgba(255,255,255,0.04)",
            color: hoverLeave?"#ef4444":G.muted,
            fontFamily:"inherit", fontSize:14, fontWeight:600, cursor:"pointer",
            transition:"all .25s ease", transform: hoverLeave?"translateY(-1px)":"none",
          }}>✕ &nbsp;I am under 18 — Leave</button>
        </div>

        <div style={{ marginTop:20, fontSize:11, color:G.muted, lineHeight:1.6, animation:"ageFadeUp .6s .5s both" }}>
          🔒 We do not store your personal data during age verification.<br/>
          <span style={{color:G.accent,cursor:"pointer"}}>Privacy Policy</span>
        </div>
      </div>

      <style>{`
        @keyframes ageOrbit { from{transform:rotate(0deg) translateX(110px) rotate(0deg)} to{transform:rotate(360deg) translateX(110px) rotate(-360deg)} }
        @keyframes agePulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.06)} }
        @keyframes ageSpin  { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
      `}</style>
    </div>
  );
}
