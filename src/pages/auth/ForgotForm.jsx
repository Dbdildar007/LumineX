import { useState, useEffect, useRef } from "react";
import { G } from "../../data/theme";
import AuthCard from "./AuthCard";
import AuthInput from "./AuthInput";

export default function ForgotForm({ onNavigate }) {
  const [step,    setStep]    = useState(1);
  const [email,   setEmail]   = useState("");
  const [otp,     setOtp]     = useState(["","","","","",""]);
  const [pass,    setPass]    = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");
  const [timer,   setTimer]   = useState(60);
  const otpRefs = [useRef(),useRef(),useRef(),useRef(),useRef(),useRef()];

  useEffect(() => {
    if (step !== 2) return;
    const t = setInterval(() => setTimer(x => x > 0 ? x-1 : 0), 1000);
    return () => clearInterval(t);
  }, [step]);

  const sendOtp = () => {
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) { setError("Enter a valid email address"); return; }
    setError(""); setLoading(true);
    setTimeout(() => { setLoading(false); setStep(2); setTimer(60); }, 1300);
  };

  const verifyOtp = () => {
    if (otp.join("").length < 6) { setError("Enter all 6 digits"); return; }
    setError(""); setLoading(true);
    setTimeout(() => { setLoading(false); setStep(3); }, 1000);
  };

  const resetPass = () => {
    if (pass.length < 8) { setError("Password must be at least 8 characters"); return; }
    if (pass !== confirm) { setError("Passwords do not match"); return; }
    setError(""); setLoading(true);
    setTimeout(() => { setLoading(false); setStep(4); }, 1200);
  };

  const handleOtpChange = (i, val) => {
    const v = val.replace(/\D/,"").slice(-1);
    const next = [...otp]; next[i] = v; setOtp(next);
    if (v && i < 5) otpRefs[i+1].current?.focus();
  };

  const handleOtpKey = (i, e) => {
    if (e.key==="Backspace" && !otp[i] && i>0) otpRefs[i-1].current?.focus();
  };

  const BtnPrimary = ({ onClick, disabled, children }) => (
    <button onClick={onClick} disabled={disabled||loading} style={{
      width:"100%", padding:"14px", borderRadius:14, border:"none",
      background: (disabled||loading)?G.bg3:`linear-gradient(135deg,${G.accent},${G.accent2})`,
      color:"white", fontFamily:"inherit", fontSize:15, fontWeight:800,
      cursor:(disabled||loading)?"not-allowed":"pointer",
      display:"flex", alignItems:"center", justifyContent:"center", gap:10,
      boxShadow:(disabled||loading)?"none":`0 0 30px ${G.accent}44`, transition:"all .2s",
    }}>
      {loading ? (
        <><div style={{width:18,height:18,borderRadius:"50%",border:"2px solid white",borderTopColor:"transparent",animation:"spin .7s linear infinite"}}/> Please wait...</>
      ) : children}
    </button>
  );

  const titles = ["","Reset Password","Check Your Email","New Password","All Done! 🎉"];
  const subtitles = [
    "",
    "Enter your email and we'll send you a verification code",
    `We sent a 6-digit code to ${email}`,
    "Choose a strong new password",
    "Your password has been reset successfully",
  ];

  return (
    <AuthCard title={titles[step]} subtitle={subtitles[step]}>
      {step===1 && (
        <>
          <AuthInput label="Email Address" type="email" icon="📧" value={email}
            onChange={e=>setEmail(e.target.value)} placeholder="you@example.com"
            error={error} hint="We'll send a verification code to this email"/>
          <BtnPrimary onClick={sendOtp}>Send Reset Code →</BtnPrimary>
        </>
      )}

      {step===2 && (
        <>
          <div style={{ display:"flex", gap:10, justifyContent:"center", marginBottom:24 }}>
            {otp.map((v,i)=>(
              <input key={i} ref={otpRefs[i]} type="text" inputMode="numeric" maxLength={1} value={v}
                onChange={e=>handleOtpChange(i,e.target.value)}
                onKeyDown={e=>handleOtpKey(i,e)}
                style={{
                  width:48, height:56, textAlign:"center", fontSize:22, fontWeight:800,
                  background:G.bg3, border:`2px solid ${v?G.accent:G.border}`,
                  borderRadius:12, color:G.text, fontFamily:"inherit", outline:"none",
                  transition:"border-color .2s, box-shadow .2s",
                  boxShadow:v?`0 0 0 3px ${G.accent}22`:"none",
                }}
              />
            ))}
          </div>
          {error && <div style={{ fontSize:12,color:"#ef4444",textAlign:"center",marginBottom:16 }}>⚠ {error}</div>}
          <BtnPrimary onClick={verifyOtp}>Verify Code</BtnPrimary>
          <div style={{ textAlign:"center", marginTop:16, fontSize:13, color:G.muted }}>
            {timer > 0
              ? <span>Resend code in <strong style={{color:G.accent}}>{timer}s</strong></span>
              : <span onClick={()=>{setLoading(true);setTimeout(()=>{setLoading(false);setTimer(60);},1000);}} style={{color:G.accent,cursor:"pointer",fontWeight:700}}>Resend code</span>
            }
          </div>
        </>
      )}

      {step===3 && (
        <>
          <AuthInput label="New Password" type="password" icon="🔒" value={pass} onChange={e=>setPass(e.target.value)} placeholder="Min 8 characters"/>
          <AuthInput label="Confirm Password" type="password" icon="🔒" value={confirm} onChange={e=>setConfirm(e.target.value)} placeholder="Repeat new password"/>
          {error && <div style={{ fontSize:12,color:"#ef4444",marginBottom:16 }}>⚠ {error}</div>}
          <BtnPrimary onClick={resetPass}>Reset Password →</BtnPrimary>
        </>
      )}

      {step===4 && (
        <div style={{ textAlign:"center" }}>
          <div style={{ fontSize:72, marginBottom:16 }}>✅</div>
          <p style={{ color:G.muted, fontSize:14, marginBottom:28, lineHeight:1.7 }}>
            Your password has been reset. You can now sign in with your new password.
          </p>
          <button onClick={()=>onNavigate("login")} style={{
            width:"100%", padding:"14px", borderRadius:14, border:"none",
            background:`linear-gradient(135deg,${G.accent},${G.accent2})`,
            color:"white", fontFamily:"inherit", fontSize:15, fontWeight:800, cursor:"pointer",
            boxShadow:`0 0 30px ${G.accent}44`,
          }}>Go to Sign In →</button>
        </div>
      )}

      {step < 4 && (
        <div style={{ textAlign:"center", marginTop:20, fontSize:13, color:G.muted }}>
          <span onClick={()=>onNavigate("login")} style={{color:G.accent,cursor:"pointer",fontWeight:600}}>← Back to Sign In</span>
        </div>
      )}
    </AuthCard>
  );
}
