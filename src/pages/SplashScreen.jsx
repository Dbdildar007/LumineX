import { useState, useEffect } from "react";
import { G } from "../data/theme";
import { AppIcon, Logo } from "../components/ui";

export default function SplashScreen({ onDone }) {
  const [phase, setPhase] = useState(0);
  // phase 0 = entering, 1 = hold, 2 = exit

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 800);
    const t2 = setTimeout(() => setPhase(2), 2200);
    const t3 = setTimeout(() => onDone(), 2800);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [onDone]);

  const particles = Array.from({ length: 18 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 3 + 1,
    delay: Math.random() * 1.5,
    dur: Math.random() * 4 + 3,
    color: i % 3 === 0 ? G.accent : i % 3 === 1 ? G.accent2 : G.accent3,
  }));

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 99999,
      background: G.bg,
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      fontFamily: "'Syne', sans-serif",
      opacity: phase === 2 ? 0 : 1,
      transform: phase === 2 ? "scale(1.06)" : "scale(1)",
      transition: "opacity .6s ease, transform .6s ease",
    }}>
      <style>{`
        @keyframes splashRingPulse {
          0%   { transform: scale(0.4); opacity: 0.8; }
          100% { transform: scale(2.2); opacity: 0; }
        }
        @keyframes splashIconIn {
          0%   { opacity: 0; transform: scale(0.5) rotate(-15deg); }
          60%  { transform: scale(1.1) rotate(3deg); }
          100% { opacity: 1; transform: scale(1) rotate(0deg); }
        }
        @keyframes splashTextIn {
          0%   { opacity: 0; letter-spacing: 14px; }
          100% { opacity: 1; letter-spacing: 1px; }
        }
        @keyframes splashTagIn {
          0%   { opacity: 0; transform: translateY(12px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes floatParticle {
          0%, 100% { transform: translateY(0px) scale(1); opacity: var(--op); }
          50%       { transform: translateY(-20px) scale(1.3); opacity: calc(var(--op) * 0.4); }
        }
        @keyframes gradientRotate {
          0%   { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes dotsFlow {
          0%, 100% { opacity: 0.3; transform: scale(0.8); }
          50%       { opacity: 1;   transform: scale(1.2); }
        }
      `}</style>

      {/* Background mesh */}
      <div style={{
        position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none",
      }}>
        <div style={{
          position: "absolute", top: "20%", left: "10%",
          width: 500, height: 500, borderRadius: "50%",
          background: `radial-gradient(circle, ${G.accent}18 0%, transparent 70%)`,
          animation: "gradientRotate 12s linear infinite",
        }}/>
        <div style={{
          position: "absolute", bottom: "10%", right: "5%",
          width: 400, height: 400, borderRadius: "50%",
          background: `radial-gradient(circle, ${G.accent2}14 0%, transparent 70%)`,
          animation: "gradientRotate 16s linear infinite reverse",
        }}/>
        <div style={{
          position: "absolute", top: "50%", left: "50%",
          transform: "translate(-50%,-50%)",
          width: 700, height: 700, borderRadius: "50%",
          background: `radial-gradient(circle, ${G.accent3}08 0%, transparent 65%)`,
        }}/>
      </div>

      {/* Grid overlay */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        backgroundImage: `linear-gradient(${G.border}22 1px, transparent 1px), linear-gradient(90deg, ${G.border}22 1px, transparent 1px)`,
        backgroundSize: "60px 60px", opacity: 0.35,
      }}/>

      {/* Floating particles */}
      {particles.map(p => (
        <div key={p.id} style={{
          position: "absolute",
          left: `${p.x}%`, top: `${p.y}%`,
          width: p.size, height: p.size,
          borderRadius: "50%", background: p.color,
          "--op": 0.4,
          animation: `floatParticle ${p.dur}s ${p.delay}s ease-in-out infinite`,
          pointerEvents: "none",
        }}/>
      ))}

      {/* Pulsing rings behind icon */}
      <div style={{ position: "relative", zIndex: 2, marginBottom: 28 }}>
        {[1, 2, 3].map(i => (
          <div key={i} style={{
            position: "absolute",
            top: "50%", left: "50%",
            transform: "translate(-50%,-50%)",
            width: 80, height: 80,
            borderRadius: "50%",
            border: `2px solid ${G.accent}`,
            opacity: 0,
            animation: `splashRingPulse 2.4s ${i * 0.6}s ease-out infinite`,
            pointerEvents: "none",
          }}/>
        ))}

        {/* Main icon */}
        <div style={{
          animation: "splashIconIn .9s cubic-bezier(0.34,1.26,0.64,1) both",
          filter: `drop-shadow(0 0 30px ${G.accent}88)`,
        }}>
          <AppIcon size={80}/>
        </div>
      </div>

      {/* App name */}
      <div style={{
        animation: "splashTextIn .8s .5s ease both",
        marginBottom: 10,
      }}>
        <Logo size={32}/>
      </div>

      {/* Tagline */}
      <div style={{
        fontSize: 13, color: G.muted, letterSpacing: 2,
        textTransform: "uppercase", fontFamily: "'DM Sans', sans-serif",
        animation: "splashTagIn .6s .9s ease both",
        marginBottom: 48,
      }}>
        Stream Your World
      </div>

      {/* Loading dots */}
      <div style={{
        display: "flex", gap: 8, alignItems: "center",
        animation: "splashTagIn .4s 1.1s ease both",
      }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{
            width: 7, height: 7, borderRadius: "50%",
            background: `linear-gradient(135deg,${G.accent},${G.accent2})`,
            animation: `dotsFlow 1.2s ${i * 0.18}s ease-in-out infinite`,
          }}/>
        ))}
      </div>

      {/* Version */}
      <div style={{
        position: "absolute", bottom: 24,
        fontSize: 11, color: G.muted + "88", letterSpacing: 1,
        animation: "splashTagIn .4s 1.3s ease both",
      }}>v1.0.0 · LumineX</div>
    </div>
  );
}
