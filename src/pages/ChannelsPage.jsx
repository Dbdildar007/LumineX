import { useState, useEffect } from "react";
import { G } from "../data/theme";
import { useApp } from "../context/AppContext";
import { profileHelpers } from "../lib/supabase";
import { useFollow, useIsMobile } from "../hooks";
import { Avatar, VerifiedBadge, SectionHeader, Spinner, fmtNum } from "../components/ui";

const MOCK_CHANNELS = [
  { id:"ch1", username:"naturelens",       display_name:"NatureLens",        is_verified:true,  followers_count:284000, bio:"4K nature & wildlife",   avatar_url:null },
  { id:"ch2", username:"urbanfilms",       display_name:"UrbanFilms",        is_verified:true,  followers_count:156000, bio:"City vibes & street art", avatar_url:null },
  { id:"ch3", username:"wildcapture",      display_name:"WildCapture",       is_verified:false, followers_count:92000,  bio:"Extreme sports & stunts", avatar_url:null },
  { id:"ch4", username:"skylens",          display_name:"SkyLens",           is_verified:true,  followers_count:341000, bio:"Aerial & drone footage",  avatar_url:null },
  { id:"ch5", username:"beatlab",          display_name:"BeatLab",           is_verified:true,  followers_count:218000, bio:"Music production & EDM",  avatar_url:null },
  { id:"ch6", username:"oceanvault",       display_name:"OceanVault",        is_verified:false, followers_count:67000,  bio:"Deep sea exploration",    avatar_url:null },
  { id:"ch7", username:"fitlife",          display_name:"FitLife",           is_verified:true,  followers_count:189000, bio:"Workouts & nutrition",    avatar_url:null },
  { id:"ch8", username:"autovault",        display_name:"AutoVault",         is_verified:true,  followers_count:423000, bio:"Cars, reviews & joyrides",avatar_url:null },
  { id:"ch9", username:"techden",          display_name:"TechDen",           is_verified:false, followers_count:134000, bio:"Tech reviews & setups",   avatar_url:null },
  { id:"ch10",username:"foodvault",        display_name:"FoodVault",         is_verified:true,  followers_count:256000, bio:"Street food & recipes",   avatar_url:null },
  { id:"ch11",username:"blenderfoundation",display_name:"Blender Foundation",is_verified:true,  followers_count:891000, bio:"Open source animation",   avatar_url:null },
  { id:"ch12",username:"cosmostv",         display_name:"CosmosTV",          is_verified:true,  followers_count:312000, bio:"Space & astronomy",       avatar_url:null },
];

const COLORS = ["#c084fc","#818cf8","#f472b6","#34d399","#fbbf24","#f87171","#60a5fa","#fb923c","#a3e635","#e879f9","#2dd4bf","#facc15"];

export default function ChannelsPage() {
  const [channels, setChannels] = useState(MOCK_CHANNELS);
  const isMobile = useIsMobile();

  return (
    <div>
      <SectionHeader title="📺 Top Channels"/>
      <div style={{
        display: "grid",
        gridTemplateColumns: isMobile ? "repeat(2,1fr)" : "repeat(auto-fill,minmax(180px,1fr))",
        gap: isMobile ? 10 : 14,
      }}>
        {channels.map((ch, i) => <ChannelCard key={ch.id} channel={ch} colorIdx={i}/>)}
      </div>
    </div>
  );
}

function ChannelCard({ channel, colorIdx }) {
  const { setTab } = useApp();
  const color = COLORS[colorIdx % COLORS.length];
  const { following, toggle, loading } = useFollow(channel.id, false);

  return (
    <div style={{
      background: G.card, border: `1px solid ${G.border}`,
      borderRadius: 16, padding: "20px 14px", textAlign: "center",
      transition: "all .25s",
    }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = color + "77"; e.currentTarget.style.transform = "translateY(-3px)"; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = G.border; e.currentTarget.style.transform = "none"; }}
    >
      <div style={{ position:"relative", display:"inline-block", marginBottom:12 }}>
        <div style={{ width:64, height:64, borderRadius:"50%", background:`linear-gradient(135deg,${color},${color}88)`,
          display:"flex", alignItems:"center", justifyContent:"center", fontSize:26, fontWeight:900, color:"white" }}>
          {channel.display_name[0]}
        </div>
        {channel.is_verified && (
          <div style={{ position:"absolute", bottom:0, right:0, background:"#3b82f6", borderRadius:"50%",
            width:20, height:20, display:"flex", alignItems:"center", justifyContent:"center", fontSize:11,
            border:`2px solid ${G.card}` }}>✓</div>
        )}
      </div>
      <div style={{ fontSize:13, fontWeight:700, marginBottom:3, display:"flex", alignItems:"center", justifyContent:"center", gap:5 }}>
        {channel.display_name}
        {channel.is_verified && <VerifiedBadge size={12}/>}
      </div>
      <div style={{ fontSize:10, color:G.muted, marginBottom:8 }}>{fmtNum(channel.followers_count)} followers</div>
      <div style={{ fontSize:11, color:G.muted, marginBottom:12, lineHeight:1.4 }}>{channel.bio}</div>
      <button onClick={toggle} disabled={loading} style={{
        width:"100%", padding:"8px", borderRadius:10, fontFamily:"inherit",
        fontSize:12, fontWeight:700, cursor:"pointer", transition:"all .2s",
        border: `1px solid ${color}`,
        background: following ? color : "transparent",
        color: following ? "white" : color,
        opacity: loading ? 0.6 : 1,
      }}>{following ? "✓ Following" : "+ Follow"}</button>
    </div>
  );
}
