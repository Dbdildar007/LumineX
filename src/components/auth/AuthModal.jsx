import { useState, useRef, useEffect } from "react";
import { G } from "../../data/theme";
import { useApp } from "../../context/AppContext";
import { authHelpers, profileHelpers, supabase } from "../../lib/supabase";
import { Logo, AppIcon, Input, Btn, Spinner } from "../ui";
import { AVATARS } from "../../data/theme";

export default function AuthModal() {
  const { authModal, setAuthModal, showToast, loadProfile } = useApp();
  if (!authModal) return null;

  const onClose = () => setAuthModal(null);

  return (
    <div onClick={e=>e.target===e.currentTarget&&onClose()} style={{
      position:"fixed", inset:0, zIndex:9500,
      background:"rgba(0,0,0,.85)", backdropFilter:"blur(16px)",
      display:"flex", alignItems:"center", justifyContent:"center",
      padding:16, overflowY:"auto", animation:"fadeIn .2s",
    }}>
      <div style={{
        width:"100%", maxWidth:440, background:G.bg2,
        border:`1px solid ${G.border}`, borderRadius:24,
        padding:"32px 28px", position:"relative",
        boxShadow:"0 40px 80px rgba(0,0,0,.7)",
        animation:"scaleIn .25s cubic-bezier(0.34,1.2,0.64,1)",
      }}>
        {/* Bg glow */}
        <div style={{ position:"absolute", inset:0, borderRadius:24, overflow:"hidden", pointerEvents:"none" }}>
          <div style={{ position:"absolute", top:-40, left:-40, width:200, height:200, borderRadius:"50%", background:`${G.accent}0d`, filter:"blur(40px)" }}/>
          <div style={{ position:"absolute", bottom:-40, right:-40, width:200, height:200, borderRadius:"50%", background:`${G.accent2}0d`, filter:"blur(40px)" }}/>
        </div>

        <button onClick={onClose} style={{
          position:"absolute", top:14, right:14, background:G.bg3, border:`1px solid ${G.border}`,
          borderRadius:"50%", width:32, height:32, color:G.muted, fontSize:16, cursor:"pointer",
          display:"flex", alignItems:"center", justifyContent:"center",
        }}>✕</button>

        <div style={{ textAlign:"center", marginBottom:28 }}>
          <div style={{ display:"flex", justifyContent:"center", marginBottom:12 }}><AppIcon size={40}/></div>
          <Logo size={22}/>
        </div>

        {authModal==="login"  && <LoginForm  onSwitch={setAuthModal} onClose={onClose}/>}
        {authModal==="signup" && <SignupForm onSwitch={setAuthModal} onClose={onClose}/>}
        {authModal==="forgot" && <ForgotForm onSwitch={setAuthModal}/>}
      </div>
    </div>
  );
}

// ── Login ─────────────────────────────────────────────────────────────────────
function LoginForm({ onSwitch, onClose }) {
  const { showToast } = useApp();
  const [email,   setEmail]   = useState("");
  const [pass,    setPass]    = useState("");
  const [errors,  setErrors]  = useState({});
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    const e = {};
    if (!email.trim()) e.email="Email required";
    else if (!/\S+@\S+\.\S+/.test(email)) e.email="Invalid email";
    if (!pass) e.pass="Password required";
    setErrors(e); if (Object.keys(e).length) return;
    setLoading(true);
    try {
      await authHelpers.signIn({ email, password: pass });
      showToast("Welcome back! 🎉", "success");
      onClose();
    } catch (err) {
      showToast(err.message || "Sign in failed", "error");
    } finally { setLoading(false); }
  };

  return (
    <>
      <h2 style={{fontSize:22,fontWeight:800,marginBottom:4,fontFamily:"'Syne',sans-serif"}}>Welcome back 👋</h2>
      <p style={{fontSize:13,color:G.muted,marginBottom:24}}>Sign in to continue watching</p>

      <Input label="Email" type="email" icon="📧" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com" error={errors.email}/>
      <Input label="Password" type="password" icon="🔒" value={pass} onChange={e=>setPass(e.target.value)} placeholder="Your password" error={errors.pass}
        onKeyDown={e=>e.key==="Enter"&&submit()}/>

      <div style={{display:"flex",justifyContent:"flex-end",marginBottom:20,marginTop:-8}}>
        <span onClick={()=>onSwitch("forgot")} style={{fontSize:12,color:G.accent,cursor:"pointer",fontWeight:600}}>Forgot password?</span>
      </div>

      <Btn onClick={submit} loading={loading} fullWidth size="lg">Sign In →</Btn>

      <SocialDivider/>
      <SocialBtns/>

      <div style={{textAlign:"center",marginTop:20,fontSize:13,color:G.muted}}>
        No account? <span onClick={()=>onSwitch("signup")} style={{color:G.accent,cursor:"pointer",fontWeight:700}}>Create one free</span>
      </div>
    </>
  );
}

// ── Signup ────────────────────────────────────────────────────────────────────
function SignupForm({ onSwitch, onClose }) {
  const { showToast } = useApp();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ name:"", username:"", email:"", pass:"", confirm:"", dob:"", agree:false, avatarId:"a1" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [usernameAvail, setUsernameAvail] = useState(null); // null | true | false | "checking"
  const usernameTimer = useRef(null);

  const set = k => v => setForm(p => ({...p,[k]: typeof v === "object" && v.target ? (v.target.type==="checkbox"?v.target.checked:v.target.value) : v}));

  const checkUsername = val => {
    if (!val || val.length < 3) { setUsernameAvail(null); return; }
    setUsernameAvail("checking");
    clearTimeout(usernameTimer.current);
    usernameTimer.current = setTimeout(async () => {
      const taken = await profileHelpers.checkUsername(val.toLowerCase());
      setUsernameAvail(!taken);
    }, 500);
  };

  const nextStep = () => {
    const e = {};
    if (!form.name.trim()||form.name.length<2) e.name="At least 2 characters";
    if (!form.username||form.username.length<3) e.username="At least 3 characters";
    else if (!/^[a-z0-9_]+$/.test(form.username)) e.username="Only a-z, 0-9, underscore";
    else if (usernameAvail===false) e.username="Username is taken";
    if (!form.email||!/\S+@\S+\.\S+/.test(form.email)) e.email="Valid email required";
    setErrors(e); if (!Object.keys(e).length) setStep(2);
  };

  const submit = async () => {
    const e = {};
    if (!form.pass||form.pass.length<8) e.pass="At least 8 characters";
    else if (!/[A-Z]/.test(form.pass)) e.pass="Include an uppercase letter";
    else if (!/[0-9]/.test(form.pass)) e.pass="Include a number";
    if (form.pass!==form.confirm) e.confirm="Passwords don't match";
    if (!form.dob) e.dob="Date of birth required";
    else { const age=(Date.now()-new Date(form.dob))/(365.25*24*3600000); if(age<18) e.dob="Must be 18+"; }
    if (!form.agree) e.agree="You must agree to continue";
    setErrors(e); if (Object.keys(e).length) return;
    setLoading(true);
    try {
      await authHelpers.signUp({ email:form.email, password:form.pass, username:form.username.toLowerCase(), displayName:form.name });
      // Save avatar preference
      localStorage.setItem("luminex_avatar_pref", form.avatarId);
      showToast("Account created! Welcome to LumineX 🎉", "success");
      onClose();
    } catch (err) {
      showToast(err.message||"Sign up failed", "error");
    } finally { setLoading(false); }
  };

  const strength = (() => {
    let s=0;
    if (form.pass.length>=8) s++;
    if (/[A-Z]/.test(form.pass)) s++;
    if (/[0-9]/.test(form.pass)) s++;
    if (/[^A-Za-z0-9]/.test(form.pass)) s++;
    return s;
  })();

  return (
    <>
      <h2 style={{fontSize:22,fontWeight:800,marginBottom:4,fontFamily:"'Syne',sans-serif"}}>Create account 🚀</h2>
      <p style={{fontSize:13,color:G.muted,marginBottom:20}}>Step {step} of 2</p>

      {/* Step bar */}
      <div style={{display:"flex",gap:6,marginBottom:24}}>
        {[1,2].map(s=><div key={s} style={{flex:1,height:3,borderRadius:99,background:step>=s?`linear-gradient(90deg,${G.accent},${G.accent2})`:G.border,transition:"background .3s"}}/>)}
      </div>

      {step===1 && (
        <>
          <Input label="Full Name" icon="👤" value={form.name} onChange={set("name")} placeholder="Your name" error={errors.name}/>
          <div style={{marginBottom:16}}>
            <Input label="Username" icon="@" value={form.username}
              onChange={e=>{ set("username")(e); checkUsername(e.target.value); }}
              placeholder="unique_username" error={errors.username}
              hint={!errors.username&&form.username.length>=3?undefined:undefined}
              right={
                form.username.length>=3 ? (
                  usernameAvail==="checking" ? <Spinner size={14}/> :
                  usernameAvail===true  ? <span style={{color:G.green,fontSize:13}}>✓</span> :
                  usernameAvail===false ? <span style={{color:G.red,fontSize:13}}>✗</span> : null
                ) : null
              }
            />
            {form.username.length>=3 && usernameAvail!=="checking" && (
              <div style={{fontSize:11,marginTop:-10,marginBottom:8,color:usernameAvail?G.green:G.red}}>
                {usernameAvail?"✓ Username available":"✗ Username is taken"}
              </div>
            )}
          </div>
          <Input label="Email" type="email" icon="📧" value={form.email} onChange={set("email")} placeholder="you@example.com" error={errors.email}/>
          <SocialDivider label="or sign up with"/>
          <SocialBtns/>
          <Btn onClick={nextStep} fullWidth size="lg" style={{marginTop:16}}>Continue →</Btn>
        </>
      )}

      {step===2 && (
        <>
          {/* Avatar picker */}
          <div style={{marginBottom:20}}>
            <div style={{fontSize:11,fontWeight:700,color:G.muted,textTransform:"uppercase",letterSpacing:.5,marginBottom:10}}>Choose Avatar</div>
            <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
              {AVATARS.map(av=>(
                <div key={av.id} onClick={()=>set("avatarId")(av.id)} style={{
                  width:44,height:44,borderRadius:"50%",background:av.bg,
                  display:"flex",alignItems:"center",justifyContent:"center",
                  fontSize:22,cursor:"pointer",
                  border:`2px solid ${form.avatarId===av.id?G.accent:"transparent"}`,
                  transform:form.avatarId===av.id?"scale(1.15)":"scale(1)",
                  transition:"all .2s",
                }} title={av.label}>{av.emoji}</div>
              ))}
            </div>
          </div>

          <Input label="Password" type="password" icon="🔒" value={form.pass} onChange={set("pass")} placeholder="Min 8 chars" error={errors.pass}/>
          {form.pass && (
            <div style={{marginTop:-10,marginBottom:14}}>
              <div style={{display:"flex",gap:3,marginBottom:4}}>
                {[1,2,3,4].map(i=><div key={i} style={{flex:1,height:3,borderRadius:99,background:i<=strength?["#ef4444","#f59e0b","#3b82f6",G.green][strength-1]:G.border,transition:"background .3s"}}/>)}
              </div>
              <span style={{fontSize:10,color:["#ef4444","#f59e0b","#3b82f6",G.green][strength-1],fontWeight:600}}>{["","Weak","Fair","Good","Strong"][strength]}</span>
            </div>
          )}
          <Input label="Confirm Password" type="password" icon="🔒" value={form.confirm} onChange={set("confirm")} placeholder="Repeat password" error={errors.confirm}/>
          <Input label="Date of Birth" type="date" icon="🎂" value={form.dob} onChange={set("dob")} error={errors.dob} hint="You must be 18+ to use this platform"/>

          <label style={{display:"flex",gap:10,alignItems:"flex-start",cursor:"pointer",marginBottom:errors.agree?4:20}}>
            <input type="checkbox" checked={form.agree} onChange={set("agree")} style={{accentColor:G.accent,width:16,height:16,marginTop:2,flexShrink:0}}/>
            <span style={{fontSize:12,color:G.muted,lineHeight:1.6}}>
              I agree to the <span style={{color:G.accent}}>Terms of Service</span> and <span style={{color:G.accent}}>Privacy Policy</span>. I confirm I am 18+.
            </span>
          </label>
          {errors.agree && <div style={{fontSize:11,color:G.red,marginBottom:14}}>⚠ {errors.agree}</div>}

          <div style={{display:"flex",gap:8}}>
            <Btn onClick={()=>setStep(1)} variant="secondary" style={{flex:1}}>← Back</Btn>
            <Btn onClick={submit} loading={loading} style={{flex:2}}>Create Account 🎉</Btn>
          </div>
        </>
      )}

      <div style={{textAlign:"center",marginTop:20,fontSize:13,color:G.muted}}>
        Have an account? <span onClick={()=>onSwitch("login")} style={{color:G.accent,cursor:"pointer",fontWeight:700}}>Sign in</span>
      </div>
    </>
  );
}

// ── Forgot password ───────────────────────────────────────────────────────────
function ForgotForm({ onSwitch }) {
  const { showToast } = useApp();
  const [step,    setStep]    = useState(1);
  const [email,   setEmail]   = useState("");
  const [otp,     setOtp]     = useState(["","","","","",""]);
  const [pass,    setPass]    = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");
  const [timer,   setTimer]   = useState(60);
  const refs = [useRef(),useRef(),useRef(),useRef(),useRef(),useRef()];

  useEffect(()=>{
    if (step!==2) return;
    const t = setInterval(()=>setTimer(x=>x>0?x-1:0),1000);
    return ()=>clearInterval(t);
  },[step]);

  const sendCode = async () => {
    if (!email||!/\S+@\S+\.\S+/.test(email)) { setError("Enter a valid email"); return; }
    setError(""); setLoading(true);
    try {
      await authHelpers.resetPassword(email);
      setStep(2); setTimer(60);
      showToast("Code sent to your email!", "success");
    } catch(e) { setError(e.message); }
    finally { setLoading(false); }
  };

  const verifyOtp = () => {
    if (otp.join("").length<6) { setError("Enter all 6 digits"); return; }
    setError(""); setStep(3);
  };

  const resetPass = async () => {
    if (pass.length<8) { setError("At least 8 characters"); return; }
    if (pass!==confirm) { setError("Passwords don't match"); return; }
    setError(""); setLoading(true);
    try {
      await supabase.auth.updateUser({ password: pass });
      setStep(4);
    } catch(e) { setError(e.message); }
    finally { setLoading(false); }
  };

  const handleOtp = (i,val)=>{
    const v=val.replace(/\D/,"").slice(-1);
    const next=[...otp]; next[i]=v; setOtp(next);
    if(v&&i<5) refs[i+1].current?.focus();
  };

  const titles = ["","Reset Password","Check Email","New Password","Done! 🎉"];
  const subs   = ["","Enter your email for reset link",`6-digit code sent to ${email}`,"Choose a new password","Password updated successfully!"];

  return (
    <>
      <h2 style={{fontSize:22,fontWeight:800,marginBottom:4,fontFamily:"'Syne',sans-serif"}}>{titles[step]}</h2>
      <p style={{fontSize:13,color:G.muted,marginBottom:24}}>{subs[step]}</p>

      {step===1 && (
        <>
          <Input label="Email" type="email" icon="📧" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com" error={error}/>
          <Btn onClick={sendCode} loading={loading} fullWidth size="lg">Send Reset Code →</Btn>
        </>
      )}

      {step===2 && (
        <>
          <div style={{display:"flex",gap:8,justifyContent:"center",marginBottom:20}}>
            {otp.map((v,i)=>(
              <input key={i} ref={refs[i]} type="text" inputMode="numeric" maxLength={1} value={v}
                onChange={e=>handleOtp(i,e.target.value)}
                onKeyDown={e=>{if(e.key==="Backspace"&&!v&&i>0)refs[i-1].current?.focus();}}
                style={{width:44,height:52,textAlign:"center",fontSize:20,fontWeight:800,background:G.bg3,border:`2px solid ${v?G.accent:G.border}`,borderRadius:10,color:G.text,outline:"none",fontFamily:"inherit",transition:"border-color .2s"}}/>
            ))}
          </div>
          {error && <div style={{fontSize:12,color:G.red,textAlign:"center",marginBottom:14}}>⚠ {error}</div>}
          <Btn onClick={verifyOtp} fullWidth size="lg">Verify Code</Btn>
          <div style={{textAlign:"center",marginTop:14,fontSize:12,color:G.muted}}>
            {timer>0?<span>Resend in <strong style={{color:G.accent}}>{timer}s</strong></span>:<span onClick={sendCode} style={{color:G.accent,cursor:"pointer",fontWeight:700}}>Resend code</span>}
          </div>
        </>
      )}

      {step===3 && (
        <>
          <Input label="New Password" type="password" icon="🔒" value={pass} onChange={e=>setPass(e.target.value)} placeholder="Min 8 characters"/>
          <Input label="Confirm" type="password" icon="🔒" value={confirm} onChange={e=>setConfirm(e.target.value)} placeholder="Repeat password"/>
          {error && <div style={{fontSize:12,color:G.red,marginBottom:14}}>⚠ {error}</div>}
          <Btn onClick={resetPass} loading={loading} fullWidth size="lg">Reset Password →</Btn>
        </>
      )}

      {step===4 && (
        <div style={{textAlign:"center"}}>
          <div style={{fontSize:64,marginBottom:16}}>✅</div>
          <Btn onClick={()=>onSwitch("login")} fullWidth size="lg">Go to Sign In →</Btn>
        </div>
      )}

      {step<4 && (
        <div style={{textAlign:"center",marginTop:20,fontSize:13,color:G.muted}}>
          <span onClick={()=>onSwitch("login")} style={{color:G.accent,cursor:"pointer",fontWeight:600}}>← Back to Sign In</span>
        </div>
      )}
    </>
  );
}

function SocialDivider({label="or continue with"}) {
  return (
    <div style={{display:"flex",alignItems:"center",gap:10,margin:"16px 0"}}>
      <div style={{flex:1,height:1,background:G.border}}/>
      <span style={{fontSize:11,color:G.muted}}>{label}</span>
      <div style={{flex:1,height:1,background:G.border}}/>
    </div>
  );
}

function SocialBtns() {
  const { showToast } = useApp();
  return (
    <div style={{display:"flex",gap:8}}>
      {[["G","Google","#4285F4"],["𝕏","Twitter","#111"],["f","Facebook","#1877F2"]].map(([icon,name,color])=>(
        <button key={name} onClick={()=>showToast(`${name} login coming soon!`,"info")} style={{
          flex:1,padding:"10px 8px",borderRadius:10,border:`1px solid ${G.border}`,
          background:G.bg3,color:G.text,fontFamily:"inherit",fontSize:13,fontWeight:600,
          cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:7,transition:"all .2s",
        }}
          onMouseEnter={e=>{e.currentTarget.style.borderColor=color;e.currentTarget.style.background=color+"18";}}
          onMouseLeave={e=>{e.currentTarget.style.borderColor=G.border;e.currentTarget.style.background=G.bg3;}}
        ><span style={{color,fontWeight:900,fontSize:15}}>{icon}</span>{name}</button>
      ))}
    </div>
  );
}
