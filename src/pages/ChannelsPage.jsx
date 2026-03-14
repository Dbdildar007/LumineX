import { CHANNELS } from "../data/videos";
import { useApp } from "../context/AppContext";
import { G } from "../data/theme";
import SectionHeader from "../components/ui/SectionHeader";

const COLORS = ["#ef4444","#3b82f6","#10b981","#f59e0b","#8b5cf6","#ec4899","#06b6d4","#f97316","#84cc16","#a855f7","#64748b","#0ea5e9"];

export default function ChannelsPage() {
  const { following, toggleFollow, showToast } = useApp();
  return (
    <div>
      <SectionHeader title="📺 Top Channels"/>
      <div style={{
        display:"grid",
        gridTemplateColumns:"repeat(auto-fill,minmax(165px,1fr))",
        gap:12,
      }}>
        {CHANNELS.map((ch,i)=>(
          <CreatorCard key={ch} channel={ch} index={i}
            isFollowing={following.includes(ch)}
            onToggle={()=>{ toggleFollow(ch); showToast(following.includes(ch)?"Unfollowed "+ch:"✓ Following "+ch); }}
          />
        ))}
      </div>
    </div>
  );
}

function CreatorCard({ channel, index, isFollowing, onToggle }) {
  const color = COLORS[index % COLORS.length];
  return (
    <div style={{ background:G.card, border:`1px solid ${G.border}`, borderRadius:14, padding:"18px 12px", textAlign:"center", transition:"all .25s" }}
      onMouseEnter={e=>{ e.currentTarget.style.borderColor=color+"88"; e.currentTarget.style.transform="translateY(-3px)"; }}
      onMouseLeave={e=>{ e.currentTarget.style.borderColor=G.border; e.currentTarget.style.transform="none"; }}
    >
      <div style={{ width:60, height:60, borderRadius:"50%", margin:"0 auto 10px",
        background:`linear-gradient(135deg,${color},${color}88)`,
        display:"flex", alignItems:"center", justifyContent:"center",
        fontSize:22, fontWeight:900, color:"white", position:"relative" }}>
        {channel[0]}
        <div style={{ position:"absolute", bottom:0, right:0, background:"#2563eb",
          borderRadius:"50%", width:18, height:18, display:"flex", alignItems:"center",
          justifyContent:"center", fontSize:10, border:`2px solid ${G.card}` }}>✓</div>
      </div>
      <div style={{ fontSize:13, fontWeight:700, marginBottom:3 }}>{channel}</div>
      <div style={{ fontSize:10, color:G.muted, marginBottom:8 }}>
        {Math.floor((channel.charCodeAt(0)*37+channel.length*131)%900+100)}K followers
      </div>
      <button onClick={onToggle} style={{
        width:"100%", padding:"7px", borderRadius:8, fontFamily:"inherit",
        fontSize:12, fontWeight:700, cursor:"pointer",
        border:`1px solid ${color}`,
        background: isFollowing?color:"transparent",
        color: isFollowing?"white":color, transition:"all .2s",
      }}>{isFollowing?"✓ Following":"+ Follow"}</button>
    </div>
  );
}
