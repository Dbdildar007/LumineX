import { useState, useMemo } from "react";
import { G } from "../data/theme";
import { AppIcon, Logo } from "../components/ui";

export default function AgeGate({ onEnter }) {
  const [leaving,  setLeaving]  = useState(false);
  const [hovEnter, setHovEnter] = useState(false);
  const [hovLeave, setHovLeave] = useState(false);

  const particles = useMemo(() =>
    Array.from({ length: 20 }, (_, i) => ({
      id: i, x: Math.random()*100, y: Math.random()*100,
      size: Math.random()*3+1, delay: Math.random()*4,
      dur: Math.random()*5+4, opacity: Math.random()*.4+.1,
      color: i%3===0 ? G.accent : i%3===1 ? G.accent2 : G.accent3,
    })), []
  );

  const leave = () => {
    setLeaving(true);
    setTimeout(() => { window.location.href = "https://www.google.com"; }, 700);
  };

  return (
    <div style={{
      position:"fixed", inset:0, background:G.bg, overflow:"hidden",
      display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
      fontFamily:"'DM Sans',sans-serif",
      opacity: leaving ? 0 : 1, transform: leaving ? "scale(1.04)" : "scale(1)",
      transition:"opacity .7s ease, transform .7s ease",
    }}>
      <style>{`
        @keyframes ageOrbit1 { from{transform:rotate(0deg) translateX(110px) rotate(0deg)} to{transform:rotate(360deg) translateX(110px) rotate(-360deg)} }
        @keyframes ageOrbit2 { from{transform:rotate(180deg) translateX(80px) rotate(-180deg)} to{transform:rotate(540deg) translateX(80px) rotate(-540deg)} }
        @keyframes ageFloat  { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-14px)} }
        @keyframes ageGlow   { 0%,100%{box-shadow:0 0 30px ${G.accent}44} 50%{box-shadow:0 0 60px ${G.accent}88,0 0 80px ${G.accent3}44} }
        @keyframes twinkle   { 0%,100%{opacity:var(--op);transform:scale(1)} 50%{opacity:calc(var(--op)*.2);transform:scale(.6)} }
        @keyframes shimmerLogo { 0%{background-position:-200% center} 100%{background-position:200% center} }
      `}</style>

      {/* Bg gradient */}
      <div style={{ position:"absolute",inset:0,pointerEvents:"none",
        background:`radial-gradient(ellipse 60% 50% at 25% 35%,${G.accent}14 0%,transparent 65%),radial-gradient(ellipse 50% 60% at 75% 65%,${G.accent2}10 0%,transparent 65%)` }}/>
      {/* Grid */}
      <div style={{ position:"absolute",inset:0,pointerEvents:"none",
        backgroundImage:`linear-gradient(${G.border}33 1px,transparent 1px),linear-gradient(90deg,${G.border}33 1px,transparent 1px)`,
        backgroundSize:"60px 60px",opacity:.4 }}/>
      {/* Scan line */}
      <div style={{ position:"absolute",left:0,right:0,height:2,background:`linear-gradient(90deg,transparent,${G.accent}44,transparent)`,
        animation:"scanLine 5s linear infinite",pointerEvents:"none",zIndex:1 }}/>
      {/* Particles */}
      {particles.map(p=>(
        <div key={p.id} style={{ position:"absolute",left:`${p.x}%`,top:`${p.y}%`,width:p.size,height:p.size,borderRadius:"50%",
          background:p.color,"--op":p.opacity,opacity:p.opacity,
          animation:`twinkle ${p.dur}s ${p.delay}s ease-in-out infinite`,pointerEvents:"none" }}/>
      ))}

      {/* Orbital rings */}
      <div style={{ position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",width:320,height:320,pointerEvents:"none",zIndex:0 }}>
        {[{size:0,dur:20,orbitDur:8,orbitKf:"ageOrbit1",color:G.accent,dotSize:8},
          {size:40,dur:14,orbitDur:5,orbitKf:"ageOrbit2",color:G.accent2,dotSize:6}].map((ring,i)=>(
          <div key={i} style={{ position:"absolute",inset:ring.size,borderRadius:"50%",border:`1px solid ${ring.color}22`,animation:`spin ${ring.dur}s linear infinite ${i===1?"reverse":""}` }}>
            <div style={{ position:"absolute",top:"50%",left:"50%",animation:`${ring.orbitKf} ${ring.orbitDur}s linear infinite` }}>
              <div style={{ width:ring.dotSize,height:ring.dotSize,borderRadius:"50%",background:ring.color,boxShadow:`0 0 10px ${ring.color}`,transform:"translate(-50%,-50%)" }}/>
            </div>
          </div>
        ))}
      </div>

      {/* Card */}
      <div style={{
        position:"relative",zIndex:2,
        background:"rgba(8,8,15,.88)",backdropFilter:"blur(32px)",
        border:`1px solid ${G.accent}28`,borderRadius:28,
        padding:"40px 36px",maxWidth:460,width:"calc(100% - 32px)",
        textAlign:"center",
        boxShadow:`0 0 0 1px ${G.border},0 40px 80px rgba(0,0,0,.6)`,
        animation:"fadeUp .7s cubic-bezier(0.34,1.26,0.64,1)",
      }}>
        {/* Icon */}
        <div style={{ marginBottom:16,animation:"ageFloat 4s ease-in-out infinite, ageGlow 3s ease-in-out infinite",display:"inline-block" }}>
          <AppIcon size={64}/>
        </div>

        {/* Age badge */}
        <div style={{ display:"inline-flex",alignItems:"center",justifyContent:"center",
          width:52,height:52,borderRadius:"50%",
          background:`linear-gradient(135deg,${G.accent},${G.accent3})`,
          fontSize:16,fontWeight:900,color:"white",marginBottom:16,
          boxShadow:`0 0 0 8px ${G.accent}18,0 0 40px ${G.accent}44` }}>18+</div>

        {/* Logo */}
        <div style={{ marginBottom:6,animation:"ageFadeUp .6s .1s both" }}>
          <Logo size={28}/>
        </div>

        <h2 style={{ fontSize:18,fontWeight:800,color:G.text,marginBottom:10,fontFamily:"'Syne',sans-serif",animation:"ageFadeUp .6s .15s both" }}>
          Age Verification Required
        </h2>
        <div style={{ width:40,height:3,margin:"0 auto 14px",background:`linear-gradient(90deg,${G.accent},${G.accent2})`,borderRadius:99 }}/>
        <p style={{ fontSize:13,color:G.muted,lineHeight:1.8,marginBottom:24 }}>
          This website contains <strong style={{color:G.text}}>adult content</strong>.<br/>
          By entering you confirm you are <strong style={{color:G.accent}}>18 years or older</strong> and agree to our <span style={{color:G.accent,cursor:"pointer"}}>Terms of Service</span>.
        </p>

        <div style={{ display:"flex",flexDirection:"column",gap:10 }}>
          <button onMouseEnter={()=>setHovEnter(true)} onMouseLeave={()=>setHovEnter(false)} onClick={onEnter} style={{
            width:"100%",padding:"14px",borderRadius:14,border:"none",
            background:`linear-gradient(135deg,${G.accent},${G.accent2})`,
            color:"white",fontFamily:"inherit",fontSize:15,fontWeight:800,cursor:"pointer",
            transform:hovEnter?"scale(1.02) translateY(-2px)":"scale(1)",
            boxShadow:hovEnter?`0 12px 40px ${G.accent}66,0 0 0 3px ${G.accent}33`:`0 0 30px ${G.accent}44`,
            transition:"all .25s cubic-bezier(0.34,1.56,0.64,1)",
          }}>✓ I am 18+ — Enter Now</button>
          <button onMouseEnter={()=>setHovLeave(true)} onMouseLeave={()=>setHovLeave(false)} onClick={leave} style={{
            width:"100%",padding:"13px",borderRadius:14,
            border:`1px solid ${hovLeave?"#f8717166":G.border}`,
            background:hovLeave?"rgba(248,113,113,.08)":"rgba(255,255,255,.04)",
            color:hovLeave?"#f87171":G.muted,
            fontFamily:"inherit",fontSize:14,fontWeight:600,cursor:"pointer",transition:"all .2s",
          }}>✕ I am under 18 — Leave</button>
        </div>

        <div style={{ marginTop:16,fontSize:11,color:G.muted,lineHeight:1.6 }}>
          🔒 We do not store personal data during verification.
        </div>
      </div>
    </div>
  );
}
