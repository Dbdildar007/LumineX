import { useState } from "react";
import { G } from "../../data/theme";

export default function AuthInput({ label, type="text", value, onChange, placeholder, icon, error, hint }) {
  const [show,    setShow]    = useState(false);
  const [focused, setFocused] = useState(false);
  const isPass = type === "password";

  return (
    <div style={{ marginBottom:18 }}>
      <label style={{ display:"block", fontSize:12, fontWeight:700, color:G.muted, marginBottom:6, letterSpacing:.5, textTransform:"uppercase" }}>
        {label}
      </label>
      <div style={{ position:"relative" }}>
        {icon && (
          <span style={{ position:"absolute", left:14, top:"50%", transform:"translateY(-50%)", fontSize:16, pointerEvents:"none" }}>
            {icon}
          </span>
        )}
        <input
          type={isPass && !show ? "password" : "text"}
          value={value} onChange={onChange} placeholder={placeholder}
          onFocus={()=>setFocused(true)} onBlur={()=>setFocused(false)}
          style={{
            width:"100%", background:G.bg3,
            border:`1.5px solid ${error?"#ef4444":focused?G.accent:G.border}`,
            borderRadius:12, color:G.text, fontFamily:"inherit",
            fontSize:14, padding:`12px ${isPass?"44px":"14px"} 12px ${icon?"42px":"14px"}`,
            outline:"none", transition:"border-color .2s, box-shadow .2s",
            boxShadow: focused?`0 0 0 3px ${error?"#ef444422":G.accent+"22"}`:"none",
          }}
        />
        {isPass && (
          <button type="button" onClick={()=>setShow(s=>!s)} style={{
            position:"absolute", right:12, top:"50%", transform:"translateY(-50%)",
            background:"none", border:"none", cursor:"pointer", fontSize:16, color:G.muted, padding:4,
          }}>{show ? "🙈" : "👁"}</button>
        )}
      </div>
      {error && <div style={{ fontSize:11, color:"#ef4444", marginTop:4 }}>⚠ {error}</div>}
      {hint && !error && <div style={{ fontSize:11, color:G.muted, marginTop:4 }}>{hint}</div>}
    </div>
  );
}
