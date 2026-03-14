import { useState } from "react";
import { G } from "../../data/theme";
import AuthCard from "./AuthCard";
import AuthInput from "./AuthInput";
import SocialBtns from "./SocialBtns";

export default function LoginForm({ onNavigate, onSuccess }) {
  const [email,   setEmail]   = useState("");
  const [pass,    setPass]    = useState("");
  const [errors,  setErrors]  = useState({});
  const [loading, setLoading] = useState(false);
  const [remember,setRemember]= useState(false);

  const validate = () => {
    const e = {};
    if (!email.trim()) e.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = "Enter a valid email address";
    if (!pass) e.pass = "Password is required";
    else if (pass.length < 6) e.pass = "Password must be at least 6 characters";
    return e;
  };

  const submit = () => {
    const e = validate(); setErrors(e);
    if (Object.keys(e).length) return;
    setLoading(true);
    setTimeout(() => { setLoading(false); onSuccess({ name: email.split("@")[0], email }); }, 1200);
  };

  return (
    <AuthCard title="Welcome Back" subtitle="Sign in to access your account and continue watching">
      <AuthInput label="Email Address" type="email" icon="📧" value={email}
        onChange={e=>setEmail(e.target.value)} placeholder="you@example.com" error={errors.email} />
      <AuthInput label="Password" type="password" icon="🔒" value={pass}
        onChange={e=>setPass(e.target.value)} placeholder="Enter your password" error={errors.pass} />

      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:22, marginTop:-6 }}>
        <label style={{ display:"flex", alignItems:"center", gap:8, cursor:"pointer", fontSize:13, color:G.muted }}>
          <input type="checkbox" checked={remember} onChange={e=>setRemember(e.target.checked)}
            style={{ accentColor:G.accent, width:15, height:15 }}/>
          Remember me
        </label>
        <span onClick={()=>onNavigate("forgot")} style={{
          fontSize:13, color:G.accent, cursor:"pointer", fontWeight:600,
          textDecoration:"underline", textDecorationColor:"transparent",
        }}
          onMouseEnter={e=>e.target.style.textDecorationColor=G.accent}
          onMouseLeave={e=>e.target.style.textDecorationColor="transparent"}
        >Forgot password?</span>
      </div>

      <button onClick={submit} disabled={loading} style={{
        width:"100%", padding:"14px", borderRadius:14, border:"none",
        background: loading ? G.bg3 : `linear-gradient(135deg,${G.accent},${G.accent2})`,
        color:"white", fontFamily:"inherit", fontSize:15, fontWeight:800,
        cursor: loading?"not-allowed":"pointer",
        display:"flex", alignItems:"center", justifyContent:"center", gap:10,
        transition:"all .2s", boxShadow: loading?"none":`0 0 30px ${G.accent}44`,
      }}
        onMouseEnter={e=>{ if(!loading){e.currentTarget.style.transform="translateY(-2px)"; e.currentTarget.style.boxShadow=`0 12px 40px ${G.accent}55`;} }}
        onMouseLeave={e=>{ e.currentTarget.style.transform="none"; e.currentTarget.style.boxShadow=`0 0 30px ${G.accent}44`; }}
      >
        {loading ? (
          <><div style={{ width:18,height:18,borderRadius:"50%",border:"2px solid white",borderTopColor:"transparent",animation:"spin .7s linear infinite" }}/> Signing in...</>
        ) : "Sign In →"}
      </button>

      <SocialBtns label="continue" />

      <div style={{ textAlign:"center", marginTop:20, fontSize:13, color:G.muted }}>
        Don't have an account?{" "}
        <span onClick={()=>onNavigate("signup")} style={{ color:G.accent, cursor:"pointer", fontWeight:700 }}>Create one free</span>
      </div>
    </AuthCard>
  );
}
