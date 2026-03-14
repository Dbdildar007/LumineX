import { G, APP_LOGO, APP_LOGO2 } from "../../data/theme";
import LoginForm  from "./LoginForm";
import SignupForm from "./SignupForm";
import ForgotForm from "./ForgotForm";

export default function AuthPages({ page, onNavigate, onSuccess, onClose }) {
  return (
    <div style={{
      position:"fixed", inset:0, zIndex:9998,
      background:G.bg, fontFamily:"'Outfit',sans-serif",
      overflowY:"auto", animation:"fadeIn .2s ease",
    }}>
      {/* Bg */}
      <div style={{ position:"fixed", inset:0, pointerEvents:"none", zIndex:0,
        background:`radial-gradient(ellipse 70% 50% at 20% 30%,${G.accent}12 0%,transparent 60%),radial-gradient(ellipse 50% 60% at 80% 70%,${G.accent3}10 0%,transparent 60%)` }}/>
      <div style={{ position:"fixed", inset:0, pointerEvents:"none", zIndex:0,
        backgroundImage:`linear-gradient(${G.border}22 1px,transparent 1px),linear-gradient(90deg,${G.border}22 1px,transparent 1px)`,
        backgroundSize:"60px 60px", opacity:0.4 }}/>

      {/* Close */}
      <button onClick={onClose} style={{
        position:"fixed", top:18, right:18, zIndex:10,
        background:G.bg3, border:`1px solid ${G.border}`, borderRadius:"50%",
        width:38, height:38, color:G.text, fontSize:18, cursor:"pointer",
        display:"flex", alignItems:"center", justifyContent:"center",
      }}>✕</button>

      {/* Logo */}
      <div onClick={onClose} style={{
        position:"fixed", top:18, left:24, zIndex:10, cursor:"pointer",
        fontSize:22, fontWeight:900, letterSpacing:3, fontFamily:"Georgia,serif",
      }}>
        <span style={{ background:`linear-gradient(135deg,${G.accent},${G.accent2})`, WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>{APP_LOGO}</span>
        <span style={{ color:"#a78bfa" }}>{APP_LOGO2}</span>
      </div>

      {/* Content */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"center",
        minHeight:"100vh", padding:"80px 16px 40px", position:"relative", zIndex:1 }}>
        {page==="login"  && <LoginForm  onNavigate={onNavigate} onSuccess={onSuccess}/>}
        {page==="signup" && <SignupForm onNavigate={onNavigate} onSuccess={onSuccess}/>}
        {page==="forgot" && <ForgotForm onNavigate={onNavigate}/>}
      </div>
    </div>
  );
}
