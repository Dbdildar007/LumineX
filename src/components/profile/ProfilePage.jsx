import { useState, useEffect, useCallback, useRef } from "react";
import { C, Avatar, VerifiedBadge, VipBadge, Spinner, Btn, Input, Modal, fmtNum, timeAgo } from "../ui/index";
import { useApp } from "../../context/AppContext";
import { profileAPI, followAPI, videoAPI, vipAPI } from "../../lib/supabase";
import { useFollow, useIsMobile } from "../../hooks/index";
import { AVATARS } from "../../data/theme";
import VideoCard from "../VideoCard";

export default function ProfilePage({ userId, passedData }) {

  console.log("DEBUG: ProfilePage is rendering with userId:", userId, 'data', passedData);

  const { session, profile: myProfile, activeProfile, refreshProfile, showToast, setTab } = useApp();
  const isMobile = useIsMobile();
  const [profile, setProfile] = useState(passedData || null);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("videos");
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [initFollowing, setInitFollowing] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [showFollow, setShowFollow] = useState(null);


const isOwn = session?.user?.id === userId || 
              (myProfile && (myProfile.username === userId || myProfile.id === userId));

  const { following: isFollowing, toggle: toggleFollow, loading: followLoading } = useFollow(userId, initFollowing, profile, setProfile);



const load = useCallback(async () => {
  try {
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(userId);
    const p = isUUID ? await profileAPI.getById(userId) : await profileAPI.getByUsername(userId);

    if (p) {
      setProfile(p);
      const [v, followingStatus] = await Promise.all([
        videoAPI.getFeed({ userId: p.id, limit: 24 }),
        session && session.user.id !== p.id ? followAPI.isFollowing(session.user.id, p.id) : Promise.resolve(false)
      ]);
      setVideos(v || []);
      setInitFollowing(followingStatus);
    }
  } catch (e) {
    console.error("Load error:", e);
  } finally {
    setLoading(false); // Only stop loading once everything is set
  }
}, [userId, session]);

 
useEffect(() => {
  setLoading(true);
  setVideos([]);

  // 2. Immediate Sync Logic
  if (passedData) {
    setProfile(passedData);
  } else if (isOwn && myProfile) {
    // This handles opening "My Profile" instantly
    setProfile(myProfile);
  } else if (activeProfile && (activeProfile.username === userId || activeProfile.id === userId)) {
    setProfile(activeProfile);
  } else {
    setProfile(null);
  }

  load();
}, [userId, load, passedData, isOwn, myProfile, activeProfile]);

  useEffect(() => {
    followAPI.getFollowers(userId).then(setFollowers).catch(() => { });
    followAPI.getFollowing(userId).then(setFollowing).catch(() => { });
  }, [userId]);

  if (loading && !profile) return <div style={{ display: "flex", justifyContent: "center", padding: 80 }}><Spinner size={36} /></div>;
  if (!profile && !loading) return <div style={{ textAlign: "center", padding: 80, color: C.muted }}><div style={{ fontSize: 48, marginBottom: 12 }}>👤</div><div style={{ fontSize: 18, fontWeight: 700, color: C.text }}>User not found</div></div>;

  const tabs = [
    { id: "videos", icon: "🎬", label: "Videos", count: profile.videos_count || 0 },
    ...(isOwn ? [{ id: "saved", icon: "🔖", label: "Saved" }] : []),
  ];

  return (
    <div style={{ maxWidth: 940, position: "relative", margin: "0 auto", padding: isMobile ? "0 0 80px" : "20px 0 40px" }}>
      {/* Profile header */}
      <div style={{ background: `linear-gradient(135deg,${C.bg2},${C.bg3})`, borderRadius: isMobile ? 0 : 20, padding: isMobile ? "20px 16px" : "32px 36px", marginBottom: 24, position: "relative", overflow: "hidden", border: `1px solid ${C.border}` }}>
        <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
          <div style={{ position: "absolute", top: -60, left: -60, width: 300, height: 300, borderRadius: "50%", background: `${C.accent}08`, filter: "blur(60px)" }} />
          <div style={{ position: "absolute", bottom: -40, right: -40, width: 200, height: 200, borderRadius: "50%", background: `${C.accent2}08`, filter: "blur(50px)" }} />
        </div>
        <div style={{ position: "relative", display: "flex", gap: isMobile ? 16 : 28, alignItems: "flex-start", flexWrap: isMobile ? "wrap" : "nowrap" }}>
          {/* Avatar */}
          <div style={{ position: "relative", flexShrink: 0 }}>
            <div style={{ width: isMobile ? 80 : 110, height: isMobile ? 80 : 110, borderRadius: "50%", padding: 3, background: `linear-gradient(135deg,${C.accent},${C.accent2},${C.accent3})` }}>
              <Avatar profile={profile} size={isMobile ? 74 : 104} />
            </div>
            {profile.is_vip && <div style={{ position: "absolute", bottom: 4, right: 4, background: "linear-gradient(135deg,#fbbf24,#f97316)", borderRadius: "50%", width: 24, height: 24, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13 }}>👑</div>}
          </div>
          {/* Info */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 6 }}>
              <h1 style={{ fontSize: isMobile ? 20 : 26, fontWeight: 900, fontFamily: "'Syne',sans-serif", margin: 0, color: C.text }}>{profile.display_name || profile.username}</h1>
              {profile.is_verified && <VerifiedBadge size={18} />}
              {profile.is_vip && <VipBadge />}
            </div>
            <div style={{ fontSize: 13, color: C.muted, marginBottom: 12 }}>@{profile.username}</div>
            {profile.bio && <p style={{ fontSize: 14, color: C.textSub, lineHeight: 1.6, marginBottom: 16, maxWidth: 460 }}>{profile.bio}</p>}
            {/* Stats */}
            <div style={{ display: "flex", gap: 24, marginBottom: 16, flexWrap: "wrap" }}>
              {[
                { label: "Videos", val: profile.videos_count || 0 },
                { label: "Followers", val: profile.followers_count || 0, onClick: () => setShowFollow("followers") },
                { label: "Following", val: profile.following_count || 0, onClick: () => setShowFollow("following") },
              ].map(stat => (
                <div key={stat.label} onClick={stat.onClick} style={{ cursor: stat.onClick ? "pointer" : "default" }}>
                  <div style={{ fontSize: isMobile ? 18 : 22, fontWeight: 800, fontFamily: "'Syne',sans-serif", color: C.text }}>{fmtNum(stat.val)}</div>
                  <div style={{ fontSize: 11, color: C.muted, textTransform: "uppercase", letterSpacing: .5 }}>{stat.label}</div>
                </div>
              ))}
            </div>
            {/* Actions */}
            <div style={{ display: "flex", gap: 9, flexWrap: "wrap" }}>
              {isOwn ? (
                <>
                  <Btn onClick={() => setEditOpen(true)} variant="secondary" size="sm">✏️ Edit Profile</Btn>
                  {!profile.is_vip && <Btn onClick={() => { vipAPI.upgrade(userId).then(() => { showToast("🎉 You're now VIP!", "success"); refreshProfile(); }).catch(e => showToast(e.message, "error")); }} variant="ghost" size="sm">👑 Get VIP</Btn>}
                </>
              ) : (
                <>
                  <Btn onClick={toggleFollow} loading={followLoading} variant={isFollowing ? "secondary" : "primary"} size="sm">
                    {isFollowing ? "✓ Following" : "+ Follow"}
                  </Btn>
                  <Btn variant="secondary" size="sm">💬 Message</Btn>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 0, borderBottom: `1px solid ${C.border}`, marginBottom: 20 }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)} style={{ flex: 1, background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", padding: "12px 8px", fontSize: 13, fontWeight: 700, color: activeTab === t.id ? C.accent : C.muted, borderBottom: `2px solid ${activeTab === t.id ? C.accent : "transparent"}`, transition: "all .2s", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
            <span>{t.icon}</span>
            <span style={{ display: isMobile ? "none" : "inline" }}>{t.label}</span>
            {t.count !== undefined && <span style={{ fontSize: 10, background: C.bg3, padding: "1px 6px", borderRadius: 99 }}>{t.count}</span>}
          </button>
        ))}
      </div>

      {/* Videos grid */}
      {activeTab === "videos" && (
        videos.length === 0 ?
          <div style={{ textAlign: "center", padding: "60px 20px", color: C.muted }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🎬</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: C.text }}>{isOwn ? "Upload your first video" : "No videos yet"}</div>
          </div> :
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "repeat(2,1fr)" : "repeat(3,1fr)", gap: isMobile ? 8 : 14 }}>
            {videos.map(v => <VideoCard key={v.id} video={v} compact={isMobile} showViews={true} />)}
          </div>
      )}

      {editOpen && <EditModal profile={profile} onClose={() => setEditOpen(false)} onSave={p => { setProfile(p); setEditOpen(false); refreshProfile(); }} />}
      {showFollow && <Modal onClose={() => setShowFollow(null)} maxWidth={400}><h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 16, fontFamily: "'Syne',sans-serif", color: C.text }}>{showFollow === "followers" ? "Followers" : "Following"}</h3><FollowList users={showFollow === "followers" ? followers : following} /></Modal>}
    </div>
  );
}

function EditModal({ profile, onClose, onSave }) {
  const { session, showToast } = useApp();
  const [form, setForm] = useState({ display_name: profile.display_name || "", username: profile.username || "", bio: profile.bio || "", avatarId: "" });
  const [loading, setLoading] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPrev, setAvatarPrev] = useState(profile.avatar_url);
  const [usernameOk, setUsernameOk] = useState(true);
  const uTimer = useRef(null);

  const checkUser = val => {
    if (val === profile.username) { setUsernameOk(true); return; }
    clearTimeout(uTimer.current);
    uTimer.current = setTimeout(async () => { const taken = await profileAPI.checkUsername(val.toLowerCase()); setUsernameOk(!taken); }, 500);
  };

  const save = async () => {
    if (!usernameOk) return;
    setLoading(true);
    try {
      let updates = { display_name: form.display_name, bio: form.bio, username: form.username.toLowerCase() };
      if (avatarFile) { const url = await profileAPI.uploadAvatar(session.user.id, avatarFile); updates.avatar_url = url; }
      if (form.avatarId) { const av = AVATARS.find(a => a.id === form.avatarId); if (av) { updates.avatar_emoji = av.emoji; updates.avatar_bg = av.bg; updates.avatar_url = null; } }
      const updated = await profileAPI.update(session.user.id, updates);
      onSave(updated); showToast("Profile updated!", "success");
    } catch (e) { showToast(e.message, "error"); }
    finally { setLoading(false); }
  };

  return (
    <Modal onClose={onClose}>
      <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 20, fontFamily: "'Syne',sans-serif", color: C.text }}>Edit Profile</h3>
      {/* Avatar */}
      <div style={{ textAlign: "center", marginBottom: 20 }}>
        <div style={{ position: "relative", display: "inline-block", marginBottom: 12 }}>
          {avatarPrev && !form.avatarId ? <img src={avatarPrev} style={{ width: 80, height: 80, borderRadius: "50%", objectFit: "cover", border: `3px solid ${C.accent}` }} /> :
            form.avatarId ? <div style={{ width: 80, height: 80, borderRadius: "50%", background: AVATARS.find(a => a.id === form.avatarId)?.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36, border: `3px solid ${C.accent}` }}>{AVATARS.find(a => a.id === form.avatarId)?.emoji}</div> :
              <Avatar profile={profile} size={80} />}
        </div>
        <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap", marginBottom: 10 }}>
          {AVATARS.slice(0, 8).map(av => <div key={av.id} onClick={() => { setForm(p => ({ ...p, avatarId: av.id })); setAvatarFile(null); setAvatarPrev(null); }} title={av.label} style={{ width: 36, height: 36, borderRadius: "50%", background: av.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, cursor: "pointer", border: `2px solid ${form.avatarId === av.id ? C.accent : "transparent"}`, transform: form.avatarId === av.id ? "scale(1.15)" : "scale(1)", transition: "all .2s" }}>{av.emoji}</div>)}
        </div>
        <label style={{ fontSize: 12, color: C.accent, cursor: "pointer", fontWeight: 600 }}>
          📷 Upload Photo
          <input type="file" accept="image/*" onChange={e => { const f = e.target.files[0]; if (!f) return; setAvatarFile(f); setAvatarPrev(URL.createObjectURL(f)); setForm(p => ({ ...p, avatarId: "" })); }} style={{ display: "none" }} />
        </label>
      </div>
      <Input label="Display Name" icon="👤" value={form.display_name} onChange={e => setForm(p => ({ ...p, display_name: e.target.value }))} placeholder="Your name" />
      <Input label="Username" icon="@" value={form.username} onChange={e => { setForm(p => ({ ...p, username: e.target.value })); checkUser(e.target.value); }} placeholder="username" error={!usernameOk ? "Username taken" : undefined} />
      {form.username !== profile.username && usernameOk && <div style={{ fontSize: 11, color: C.green, marginTop: -12, marginBottom: 12 }}>✓ Available</div>}
      <div style={{ marginBottom: 20 }}>
        <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: C.muted, marginBottom: 6, textTransform: "uppercase", letterSpacing: .5 }}>Bio</label>
        <textarea value={form.bio} onChange={e => setForm(p => ({ ...p, bio: e.target.value }))} placeholder="Tell people about yourself…" rows={3} style={{ width: "100%", background: C.bg3, border: `1.5px solid ${C.border}`, borderRadius: 10, color: C.text, fontFamily: "inherit", fontSize: 14, padding: "10px 12px", outline: "none", resize: "none" }} />
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <Btn onClick={onClose} variant="secondary" style={{ flex: 1 }}>Cancel</Btn>
        <Btn onClick={save} loading={loading} style={{ flex: 2 }}>Save Changes</Btn>
      </div>
    </Modal>
  );
}

function FollowList({ users }) {
  const { setTab } = useApp();
  if (!users?.length) return <div style={{ textAlign: "center", color: C.muted, padding: 32 }}>None yet</div>;
  return (
    <div style={{ maxHeight: 360, overflowY: "auto" }}>
      {users.map(u => (
        <div key={u.id} onClick={() => setTab(`profile:${u.id}`)} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: `1px solid ${C.border}`, cursor: "pointer", transition: "opacity .2s" }}
          onMouseEnter={e => e.currentTarget.style.opacity = ".7"} onMouseLeave={e => e.currentTarget.style.opacity = "1"}>
          <Avatar profile={u} size={40} />
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, display: "flex", alignItems: "center", gap: 6, color: C.text }}>{u.display_name || u.username}{u.is_verified && <VerifiedBadge size={13} />}</div>
            <div style={{ fontSize: 11, color: C.muted }}>@{u.username}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
