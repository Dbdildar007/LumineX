import { useState } from "react";
import { G } from "../../data/theme";
import AuthCard from "./AuthCard";
import AuthInput from "./AuthInput";
import SocialBtns from "./SocialBtns";

export default function SignupForm({ onNavigate, onSuccess }) {
  const [form, setForm]     = useState({ name:"", email:"", pass:"", confirm:"", dob:"", agree:false });
  const [errors, setErrors] = useState({});
  const [loading, setLoading]= useState(false);
  const [step,    setStep]   = useState(1);

  const set = k => e => setForm(p => ({ ...p, [k]: e.target.type==="checkbox" ? e.target.checked : e.target.value }));

  const validateStep1 = () => {
    const e = {};
    if (!form.name.trim() || form.name.trim().length < 2) e.name = "Name must be at least 2 characters";
    if (!form.email.trim()) e.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Enter a valid email address";
    return e;
  };

  const validateStep2 = () => {
    const e = {};
    if (!form.pass) e.pass = "Password is required";
    else if (form.pass.length < 8) e.pass = "Must be at least 8 characters";
    else if (!/[A-Z]/.test(form.pass)) e.pass = "Must include an uppercase letter";
    else if (!/[0-9]/.test(form.pass)) e.pass = "Must include a number";
    if (form.pass !== form.confirm) e.confirm = "Passwords do not match";
    if (!form.dob) e.dob = "Date of birth is required";
    else {
      const age = (new Date() - new Date(form.dob)) / (365.25*24*60*60*1000);
      if (age < 18) e.dob = "You must be 18 or older to register";
    }
    if (!form.agree) e.agree = "You must agree to the Terms of Service";
    return e;
  };

  const nextStep = () => { const e = validateStep1(); setErrors(e); if (!Object.keys(e).length) setStep(2); };
  const submit   = () => {
    const e = validateStep2(); setErrors(e);
    if (Object.keys(e).length) return;
    setLoading(true);
    setTimeout(() => { setLoading(false); onSuccess({ name:form.name, email:form.email }); }, 1400);
  };

  const strength = (() => {
    if (!form.pass) return 0;
    let s = 0;
    if (form.pass.length >= 8) s++;
    if (/[A-Z]/.test(form.pass)) s++;
    if (/[0-9]/.test(form.pass)) s++;
    if (/[^A-Za-z0-9]/.test(form.pass)) s++;
    return s;
  })();
  const strLabels = ["","Weak","Fair","Good","Strong"];
  const strColors = ["","#ef4444","#f59e0b","#3b82f6",G.green];

  return (
    <AuthCard title="Create Account" subtitle={step===1?"Step 1 of 2 — Tell us about yourself":"Step 2 of 2 — Secure your account"}>
      {/* Step bar */}
      <div style={{ display:"flex", gap:8, marginBottom:28 }}>
        {[1,2].map(s=>(
          <div key={s} style={{
            flex:1, height:4, borderRadius:99,
            background: step>=s ? `linear-gradient(90deg,${G.accent},${G.accent2})` : G.border,
            transition:"background .3s",
          }}/>
        ))}
      </div>

      {step===1 && (
        <>
          <AuthInput label="Full Name" icon="👤" value={form.name} onChange={set("name")} placeholder="Your full name" error={errors.name}/>
          <AuthInput label="Email Address" type="email" icon="📧" value={form.email} onChange={set("email")} placeholder="you@example.com" error={errors.email}/>
          <SocialBtns label="sign up"/>
          <button onClick={nextStep} style={{
            width:"100%", marginTop:8, padding:"14px", borderRadius:14, border:"none",
            background:`linear-gradient(135deg,${G.accent},${G.accent2})`,
            color:"white", fontFamily:"inherit", fontSize:15, fontWeight:800, cursor:"pointer",
            boxShadow:`0 0 30px ${G.accent}44`, transition:"all .2s",
          }}
            onMouseEnter={e=>e.currentTarget.style.transform="translateY(-2px)"}
            onMouseLeave={e=>e.currentTarget.style.transform="none"}
          >Continue →</button>
        </>
      )}

      {step===2 && (
        <>
          <AuthInput label="Password" type="password" icon="🔒" value={form.pass} onChange={set("pass")} placeholder="Min 8 chars, 1 uppercase, 1 number" error={errors.pass}/>
          {form.pass && (
            <div style={{ marginTop:-12, marginBottom:16 }}>
              <div style={{ display:"flex", gap:4, marginBottom:4 }}>
                {[1,2,3,4].map(i=>(
                  <div key={i} style={{ flex:1, height:3, borderRadius:99, background:i<=strength?strColors[strength]:G.border, transition:"background .3s" }}/>
                ))}
              </div>
              <span style={{ fontSize:11, color:strColors[strength], fontWeight:600 }}>{strLabels[strength]}</span>
            </div>
          )}
          <AuthInput label="Confirm Password" type="password" icon="🔒" value={form.confirm} onChange={set("confirm")} placeholder="Repeat your password" error={errors.confirm}/>
          <AuthInput label="Date of Birth" type="date" icon="🎂" value={form.dob} onChange={set("dob")} error={errors.dob} hint="You must be 18+ to use this platform"/>

          <label style={{ display:"flex", alignItems:"flex-start", gap:10, cursor:"pointer", marginBottom:20 }}>
            <input type="checkbox" checked={form.agree} onChange={set("agree")} style={{ accentColor:G.accent, width:16, height:16, marginTop:2, flexShrink:0 }}/>
            <span style={{ fontSize:12, color:G.muted, lineHeight:1.6 }}>
              I agree to the <span style={{color:G.accent}}>Terms of Service</span> and{" "}
              <span style={{color:G.accent}}>Privacy Policy</span>. I confirm I am 18 years or older.
            </span>
          </label>
          {errors.agree && <div style={{ fontSize:11, color:"#ef4444", marginBottom:12, marginTop:-14 }}>⚠ {errors.agree}</div>}

          <div style={{ display:"flex", gap:10 }}>
            <button onClick={()=>setStep(1)} style={{
              flex:1, padding:"13px", borderRadius:14, border:`1px solid ${G.border}`,
              background:G.bg3, color:G.muted, fontFamily:"inherit", fontSize:14, fontWeight:600, cursor:"pointer",
            }}>← Back</button>
            <button onClick={submit} disabled={loading} style={{
              flex:2, padding:"13px", borderRadius:14, border:"none",
              background: loading?G.bg3:`linear-gradient(135deg,${G.accent},${G.accent2})`,
              color:"white", fontFamily:"inherit", fontSize:14, fontWeight:800,
              cursor:loading?"not-allowed":"pointer",
              display:"flex", alignItems:"center", justifyContent:"center", gap:8,
              boxShadow:loading?"none":`0 0 30px ${G.accent}44`, transition:"all .2s",
            }}>
              {loading?<><div style={{width:16,height:16,borderRadius:"50%",border:"2px solid white",borderTopColor:"transparent",animation:"spin .7s linear infinite"}}/> Creating...</>:"Create Account 🎉"}
            </button>
          </div>
        </>
      )}

      <div style={{ textAlign:"center", marginTop:20, fontSize:13, color:G.muted }}>
        Already have an account?{" "}
        <span onClick={()=>onNavigate("login")} style={{color:G.accent,cursor:"pointer",fontWeight:700}}>Sign in</span>
      </div>
    </AuthCard>
  );
}
