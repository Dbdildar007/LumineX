import { useState, useEffect, useCallback } from "react";
import { G, AVATARS } from "../../data/theme";
import { useApp } from "../../context/AppContext";
import { profileHelpers, followHelpers, videoHelpers, vipHelpers, supabase } from "../../lib/supabase";
import { useFollow, useIsMobile } from "../../hooks";
import { Avatar, VerifiedBadge, VipBadge, Spinner, Btn, Input, Modal, fmtNum, timeAgo } from "../ui";
import VideoCard from "../VideoCard";

export default function ProfilePage({ userId }) {
  const { session, profile: myProfile, refreshProfile, showToast, setAuthModal } = useApp();
  const isMobile = useIsMobile();
  const [profile,    setProfile]    = useState(null);
  const [videos,     setVideos]     = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [activeTab,  setActiveTab]  = useState("videos");
  const [followers,  setFollowers]  = useState([]);
  const [following,  setFollowing]  = useState([]);
  const [initFollow, setInitFollow] = useState(false);
  const [editOpen,   setEditOpen]   = useState(false);
  const [showFollow, setShowFollow] = useState(null); // "followers"|"following"|null

  const isOwn = session?.user?.id === userId;
  const { following: isFollowing, toggle: toggleFollow, loading: followLoading } = useFollow(userId, initFollow);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [p, v] = await Promise.all([
        profileHelpers.getById(userId),
        videoHelpers.getFeed({ userId, limit: 24 }),
      ]);
      setProfile(p);
      setVideos(v || []);
      if (session && !isOwn) {
        const f = await followHelpers.isFollowing(session.user.id, userId);
        setInitFollow(f);
      }
    } catch (e) {
      console.error(e);
    } finally { setLoading(false); }
  }, [userId, session, isOwn]);

  useEffect(() => { load(); }, [load]);

  const loadFollowers = async () => {
    const [f, ing] = await Promise.all([
      followHelpers.getFollowers(userId),
      followHelpers.getFollowing(userId),
    ]);
    setFollowers(f||[]); setFollowing(ing||[]);
  };

  useEffect(() => { loadFollowers(); }, [userId]);

  if (loading) return (
    <div style={{display:"flex",justifyContent:"center",padding:80}}><Spinner size={36}/></div>
  );
  if (!profile) return (
    <div style={{textAlign:"center",padding:80,color:G.muted}}>
      <div style={{fontSize:48,marginBottom:12}}>👤</div>
      <div style={{fontSize:18,fontWeight:700}}>User not found</div>
    </div>
  );

  const tabs = [
    {id:"videos",   icon:"🎬", label:"Videos",  count:profile.videos_count||0},
    {id:"liked",    icon:"❤️", label:"Liked"},
    ...(isOwn?[{id:"saved",icon:"🔖",label:"Saved"}]:[]),
  ];

  return (
    <div style={{maxWidth:940,margin:"0 auto",padding:isMobile?"0 0 80px":"20px 0 40px"}}>

      {/* ── Profile header ── */}
      <div style={{
        background:`linear-gradient(135deg,${G.bg2},${G.bg3})`,
        borderRadius:isMobile?0:20, padding:isMobile?"20px 16px":"32px 36px",
        marginBottom:24, position:"relative", overflow:"hidden",
        border:`1px solid ${G.border}`,
      }}>
        {/* Bg blur */}
        <div style={{position:"absolute",inset:0,overflow:"hidden",pointerEvents:"none"}}>
          <div style={{position:"absolute",top:-60,left:-60,width:300,height:300,borderRadius:"50%",background:`${G.accent}08`,filter:"blur(60px)"}}/>
          <div style={{position:"absolute",bottom:-40,right:-40,width:200,height:200,borderRadius:"50%",background:`${G.accent2}08`,filter:"blur(50px)"}}/>
        </div>

        <div style={{position:"relative",display:"flex",gap:isMobile?16:28,alignItems:"flex-start",flexWrap:isMobile?"wrap":"nowrap"}}>
          {/* Avatar */}
          <div style={{position:"relative",flexShrink:0}}>
            <div style={{
              width:isMobile?80:110,height:isMobile?80:110,borderRadius:"50%",
              padding:3,background:`linear-gradient(135deg,${G.accent},${G.accent2},${G.accent3})`,
            }}>
              <Avatar profile={profile} size={isMobile?74:104}/>
            </div>
            {profile.is_vip && (
              <div style={{position:"absolute",bottom:4,right:4,background:"linear-gradient(135deg,#fbbf24,#f97316)",borderRadius:"50%",width:24,height:24,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13}}>👑</div>
            )}
          </div>

          {/* Info */}
          <div style={{flex:1,minWidth:0}}>
            <div style={{display:"flex",alignItems:"center",gap:10,flexWrap:"wrap",marginBottom:6}}>
              <h1 style={{fontSize:isMobile?20:26,fontWeight:900,fontFamily:"'Syne',sans-serif",margin:0}}>
                {profile.display_name||profile.username}
              </h1>
              {profile.is_verified && <VerifiedBadge size={18}/>}
              {profile.is_vip && <VipBadge/>}
            </div>
            <div style={{fontSize:13,color:G.muted,marginBottom:12}}>@{profile.username}</div>

            {profile.bio && (
              <p style={{fontSize:14,color:G.text,lineHeight:1.6,marginBottom:16,maxWidth:460}}>{profile.bio}</p>
            )}

            {/* Stats */}
            <div style={{display:"flex",gap:24,marginBottom:16,flexWrap:"wrap"}}>
              {[
                {label:"Videos",   val:profile.videos_count||0},
                {label:"Followers",val:profile.followers_count||0,onClick:()=>{setShowFollow("followers");}},
                {label:"Following",val:profile.following_count||0,onClick:()=>{setShowFollow("following");}},
              ].map(stat=>(
                <div key={stat.label} onClick={stat.onClick} style={{cursor:stat.onClick?"pointer":"default"}}>
                  <div style={{fontSize:isMobile?18:22,fontWeight:800,fontFamily:"'Syne',sans-serif"}}>{fmtNum(stat.val)}</div>
                  <div style={{fontSize:11,color:G.muted,textTransform:"uppercase",letterSpacing:.5}}>{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div style={{display:"flex",gap:9,flexWrap:"wrap"}}>
              {isOwn ? (
                <>
                  <Btn onClick={()=>setEditOpen(true)} variant="secondary" size="sm">✏️ Edit Profile</Btn>
                  {!profile.is_vip && (
                    <Btn onClick={()=>{vipHelpers.upgradeToVip(userId).then(()=>{showToast("🎉 You're now VIP!","success");refreshProfile();}).catch(e=>showToast(e.message,"error"));}} variant="ghost" size="sm">👑 Get VIP</Btn>
                  )}
                </>
              ) : (
                <>
                  <Btn onClick={toggleFollow} loading={followLoading} variant={isFollowing?"secondary":"primary"} size="sm">
                    {isFollowing?"✓ Following":"+ Follow"}
                  </Btn>
                  <Btn variant="secondary" size="sm">💬 Message</Btn>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div style={{display:"flex",gap:0,borderBottom:`1px solid ${G.border}`,marginBottom:20}}>
        {tabs.map(t=>(
          <button key={t.id} onClick={()=>setActiveTab(t.id)} style={{
            flex:1,background:"none",border:"none",cursor:"pointer",fontFamily:"inherit",
            padding:"12px 8px",fontSize:13,fontWeight:700,
            color:activeTab===t.id?G.accent:G.muted,
            borderBottom:`2px solid ${activeTab===t.id?G.accent:"transparent"}`,
            transition:"all .2s",display:"flex",alignItems:"center",justifyContent:"center",gap:6,
          }}>
            <span>{t.icon}</span>
            <span style={{display:isMobile?"none":"inline"}}>{t.label}</span>
            {t.count!==undefined&&<span style={{fontSize:10,background:G.bg3,padding:"1px 6px",borderRadius:99}}>{t.count}</span>}
          </button>
        ))}
      </div>

      {/* ── Video grid ── */}
      {activeTab==="videos" && (
        videos.length===0 ? (
          <div style={{textAlign:"center",padding:"60px 20px",color:G.muted}}>
            <div style={{fontSize:48,marginBottom:12}}>🎬</div>
            <div style={{fontSize:15,fontWeight:700,marginBottom:6}}>{isOwn?"Upload your first video":"No videos yet"}</div>
          </div>
        ) : (
          <div style={{display:"grid",gridTemplateColumns:isMobile?"repeat(2,1fr)":"repeat(3,1fr)",gap:isMobile?8:14}}>
            {videos.map(v=>(
              <VideoCard key={v.id} video={v} compact={isMobile}/>
            ))}
          </div>
        )
      )}

      {/* Edit modal */}
      {editOpen && <EditProfileModal profile={profile} onClose={()=>setEditOpen(false)} onSave={p=>{setProfile(p);setEditOpen(false);refreshProfile();}}/>}

      {/* Followers/Following modal */}
      {showFollow && (
        <Modal onClose={()=>setShowFollow(null)} maxWidth={400}>
          <h3 style={{fontSize:18,fontWeight:800,marginBottom:16,fontFamily:"'Syne',sans-serif"}}>
            {showFollow==="followers"?"Followers":"Following"}
          </h3>
          <FollowList users={showFollow==="followers"?followers:following}/>
        </Modal>
      )}
    </div>
  );
}

// ── Edit Profile Modal ────────────────────────────────────────────────────────
function EditProfileModal({ profile, onClose, onSave }) {
  const { session, showToast } = useApp();
  const [form, setForm] = useState({
    display_name: profile.display_name||"",
    username: profile.username||"",
    bio: profile.bio||"",
    avatarId: "",
  });
  const [loading,    setLoading]    = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPrev, setAvatarPrev] = useState(profile.avatar_url);
  const [usernameOk, setUsernameOk] = useState(true);
  const uTimer = useRef(null);

  const checkUser = val => {
    if (val===profile.username) { setUsernameOk(true); return; }
    clearTimeout(uTimer.current);
    uTimer.current = setTimeout(async()=>{
      const taken = await profileHelpers.checkUsername(val.toLowerCase());
      setUsernameOk(!taken);
    },500);
  };

  const pickAvatar = av => {
    setAvatarFile(null);
    setAvatarPrev(null);
    setForm(p=>({...p,avatarId:av.id}));
  };

  const pickFile = e => {
    const f = e.target.files[0]; if(!f) return;
    setAvatarFile(f);
    setAvatarPrev(URL.createObjectURL(f));
    setForm(p=>({...p,avatarId:""}));
  };

  const save = async () => {
    if (!usernameOk) return;
    setLoading(true);
    try {
      let updates = { display_name:form.display_name, bio:form.bio, username:form.username.toLowerCase() };
      if (avatarFile) {
        const url = await profileHelpers.uploadAvatar(session.user.id, avatarFile);
        updates.avatar_url = url;
      }
      const updated = await profileHelpers.update(session.user.id, updates);
      onSave(updated);
      showToast("Profile updated!", "success");
    } catch(e) { showToast(e.message,"error"); }
    finally { setLoading(false); }
  };

  return (
    <Modal onClose={onClose}>
      <h3 style={{fontSize:18,fontWeight:800,marginBottom:20,fontFamily:"'Syne',sans-serif"}}>Edit Profile</h3>

      {/* Avatar section */}
      <div style={{textAlign:"center",marginBottom:20}}>
        <div style={{position:"relative",display:"inline-block",marginBottom:12}}>
          {avatarPrev ? (
            <img src={avatarPrev} style={{width:80,height:80,borderRadius:"50%",objectFit:"cover",border:`3px solid ${G.accent}`}}/>
          ) : form.avatarId ? (
            <div style={{width:80,height:80,borderRadius:"50%",background:AVATARS.find(a=>a.id===form.avatarId)?.bg||G.bg3,display:"flex",alignItems:"center",justifyContent:"center",fontSize:36,border:`3px solid ${G.accent}`}}>
              {AVATARS.find(a=>a.id===form.avatarId)?.emoji||"?"}
            </div>
          ) : (
            <Avatar profile={profile} size={80}/>
          )}
        </div>
        <div style={{display:"flex",gap:8,justifyContent:"center",flexWrap:"wrap",marginBottom:10}}>
          {AVATARS.slice(0,8).map(av=>(
            <div key={av.id} onClick={()=>pickAvatar(av)} style={{
              width:36,height:36,borderRadius:"50%",background:av.bg,
              display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,cursor:"pointer",
              border:`2px solid ${form.avatarId===av.id?G.accent:"transparent"}`,
              transform:form.avatarId===av.id?"scale(1.15)":"scale(1)",transition:"all .2s",
            }}>{av.emoji}</div>
          ))}
        </div>
        <label style={{fontSize:12,color:G.accent,cursor:"pointer",fontWeight:600}}>
          📷 Upload Photo
          <input type="file" accept="image/*" onChange={pickFile} style={{display:"none"}}/>
        </label>
      </div>

      <Input label="Display Name" icon="👤" value={form.display_name} onChange={e=>setForm(p=>({...p,display_name:e.target.value}))} placeholder="Your name"/>
      <div>
        <Input label="Username" icon="@" value={form.username}
          onChange={e=>{setForm(p=>({...p,username:e.target.value}));checkUser(e.target.value);}}
          placeholder="username" error={!usernameOk?"Username taken":undefined}/>
        {form.username!==profile.username && usernameOk && <div style={{fontSize:11,color:G.green,marginTop:-12,marginBottom:12}}>✓ Available</div>}
      </div>
      <div style={{marginBottom:20}}>
        <label style={{display:"block",fontSize:11,fontWeight:700,color:G.muted,marginBottom:6,textTransform:"uppercase",letterSpacing:.5}}>Bio</label>
        <textarea value={form.bio} onChange={e=>setForm(p=>({...p,bio:e.target.value}))}
          placeholder="Tell people about yourself…" rows={3}
          style={{width:"100%",background:G.bg3,border:`1.5px solid ${G.border}`,borderRadius:10,color:G.text,fontFamily:"inherit",fontSize:14,padding:"10px 12px",outline:"none",resize:"none"}}/>
      </div>

      <div style={{display:"flex",gap:8}}>
        <Btn onClick={onClose} variant="secondary" style={{flex:1}}>Cancel</Btn>
        <Btn onClick={save} loading={loading} style={{flex:2}}>Save Changes</Btn>
      </div>
    </Modal>
  );
}

function FollowList({ users }) {
  const { setTab } = useApp();
  if (!users?.length) return <div style={{textAlign:"center",color:G.muted,padding:32}}>None yet</div>;
  return (
    <div style={{maxHeight:360,overflowY:"auto"}}>
      {users.map(u=>(
        <div key={u.id} onClick={()=>setTab(`profile:${u.id}`)} style={{
          display:"flex",alignItems:"center",gap:12,padding:"10px 0",
          borderBottom:`1px solid ${G.border}`,cursor:"pointer",transition:"opacity .2s",
        }}
          onMouseEnter={e=>e.currentTarget.style.opacity=".7"}
          onMouseLeave={e=>e.currentTarget.style.opacity="1"}
        >
          <Avatar profile={u} size={40}/>
          <div>
            <div style={{fontSize:14,fontWeight:700,display:"flex",alignItems:"center",gap:6}}>
              {u.display_name||u.username} {u.is_verified&&<VerifiedBadge size={13}/>}
            </div>
            <div style={{fontSize:11,color:G.muted}}>@{u.username}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
