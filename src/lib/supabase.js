import { createClient } from "@supabase/supabase-js";

// ── Replace with your actual Supabase project URL and anon key ───────────────
const SUPABASE_URL  = process.env.REACT_APP_SUPABASE_URL  || "https://your-project.supabase.co";
const SUPABASE_ANON = process.env.REACT_APP_SUPABASE_ANON || "your-anon-key";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON, {
  auth: { persistSession: true, autoRefreshToken: true },
});

// ─────────────────────────────────────────────────────────────────────────────
// SUPABASE SCHEMA (run in SQL editor)
// ─────────────────────────────────────────────────────────────────────────────
/*
-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- PROFILES table
create table public.profiles (
  id            uuid references auth.users on delete cascade primary key,
  username      text unique not null,
  display_name  text,
  avatar_url    text,
  bio           text default '',
  is_vip        boolean default false,
  is_verified   boolean default false,
  followers_count int default 0,
  following_count int default 0,
  videos_count    int default 0,
  created_at    timestamptz default now()
);
alter table public.profiles enable row level security;
create policy "Public profiles" on public.profiles for select using (true);
create policy "Own profile update" on public.profiles for update using (auth.uid() = id);

-- VIDEOS table
create table public.videos (
  id            uuid default uuid_generate_v4() primary key,
  user_id       uuid references public.profiles(id) on delete cascade,
  title         text not null,
  description   text default '',
  video_url     text not null,
  thumbnail_url text,
  category      text default 'General',
  tags          text[] default '{}',
  is_vip        boolean default false,
  views         int default 0,
  likes_count   int default 0,
  comments_count int default 0,
  duration      text default '0:00',
  caption_url   text,
  created_at    timestamptz default now()
);
alter table public.videos enable row level security;
create policy "Public videos" on public.videos for select using (true);
create policy "Own videos insert" on public.videos for insert with check (auth.uid() = user_id);
create policy "Own videos update" on public.videos for update using (auth.uid() = user_id);
create policy "Own videos delete" on public.videos for delete using (auth.uid() = user_id);

-- FOLLOWS table
create table public.follows (
  id            uuid default uuid_generate_v4() primary key,
  follower_id   uuid references public.profiles(id) on delete cascade,
  following_id  uuid references public.profiles(id) on delete cascade,
  created_at    timestamptz default now(),
  unique(follower_id, following_id)
);
alter table public.follows enable row level security;
create policy "Public follows" on public.follows for select using (true);
create policy "Own follows" on public.follows for insert with check (auth.uid() = follower_id);
create policy "Own follows delete" on public.follows for delete using (auth.uid() = follower_id);

-- VIDEO LIKES table
create table public.video_likes (
  id       uuid default uuid_generate_v4() primary key,
  user_id  uuid references public.profiles(id) on delete cascade,
  video_id uuid references public.videos(id) on delete cascade,
  created_at timestamptz default now(),
  unique(user_id, video_id)
);
alter table public.video_likes enable row level security;
create policy "Public likes read" on public.video_likes for select using (true);
create policy "Own likes" on public.video_likes for insert with check (auth.uid() = user_id);
create policy "Own likes delete" on public.video_likes for delete using (auth.uid() = user_id);

-- COMMENTS table (supports nested via parent_id)
create table public.comments (
  id         uuid default uuid_generate_v4() primary key,
  video_id   uuid references public.videos(id) on delete cascade,
  user_id    uuid references public.profiles(id) on delete cascade,
  parent_id  uuid references public.comments(id) on delete cascade,
  body       text not null,
  likes_count int default 0,
  created_at timestamptz default now()
);
alter table public.comments enable row level security;
create policy "Public comments" on public.comments for select using (true);
create policy "Auth comment insert" on public.comments for insert with check (auth.uid() = user_id);
create policy "Own comment delete" on public.comments for delete using (auth.uid() = user_id);

-- COMMENT LIKES
create table public.comment_likes (
  id         uuid default uuid_generate_v4() primary key,
  user_id    uuid references public.profiles(id) on delete cascade,
  comment_id uuid references public.comments(id) on delete cascade,
  created_at timestamptz default now(),
  unique(user_id, comment_id)
);
alter table public.comment_likes enable row level security;
create policy "Public comment likes" on public.comment_likes for select using (true);
create policy "Own comment likes" on public.comment_likes for insert with check (auth.uid() = user_id);
create policy "Own comment likes delete" on public.comment_likes for delete using (auth.uid() = user_id);

-- SAVED VIDEOS
create table public.saved_videos (
  id       uuid default uuid_generate_v4() primary key,
  user_id  uuid references public.profiles(id) on delete cascade,
  video_id uuid references public.videos(id) on delete cascade,
  created_at timestamptz default now(),
  unique(user_id, video_id)
);
alter table public.saved_videos enable row level security;
create policy "Own saved" on public.saved_videos for select using (auth.uid() = user_id);
create policy "Own saved insert" on public.saved_videos for insert with check (auth.uid() = user_id);
create policy "Own saved delete" on public.saved_videos for delete using (auth.uid() = user_id);

-- Storage buckets (create in Supabase dashboard)
-- "videos"     -> public bucket for video files
-- "thumbnails" -> public bucket for thumbnail images
-- "avatars"    -> public bucket for profile avatars

-- Triggers to auto-update counts
create or replace function update_video_count() returns trigger as $$
begin
  if TG_OP = 'INSERT' then
    update public.profiles set videos_count = videos_count + 1 where id = NEW.user_id;
  elsif TG_OP = 'DELETE' then
    update public.profiles set videos_count = videos_count - 1 where id = OLD.user_id;
  end if;
  return null;
end;
$$ language plpgsql security definer;
create trigger on_video_change after insert or delete on public.videos
  for each row execute function update_video_count();

create or replace function update_follow_counts() returns trigger as $$
begin
  if TG_OP = 'INSERT' then
    update public.profiles set following_count = following_count + 1 where id = NEW.follower_id;
    update public.profiles set followers_count = followers_count + 1 where id = NEW.following_id;
  elsif TG_OP = 'DELETE' then
    update public.profiles set following_count = following_count - 1 where id = OLD.follower_id;
    update public.profiles set followers_count = followers_count - 1 where id = OLD.following_id;
  end if;
  return null;
end;
$$ language plpgsql security definer;
create trigger on_follow_change after insert or delete on public.follows
  for each row execute function update_follow_counts();

create or replace function update_video_likes_count() returns trigger as $$
begin
  if TG_OP = 'INSERT' then
    update public.videos set likes_count = likes_count + 1 where id = NEW.video_id;
  elsif TG_OP = 'DELETE' then
    update public.videos set likes_count = likes_count - 1 where id = OLD.video_id;
  end if;
  return null;
end;
$$ language plpgsql security definer;
create trigger on_video_like_change after insert or delete on public.video_likes
  for each row execute function update_video_likes_count();

create or replace function update_comment_likes_count() returns trigger as $$
begin
  if TG_OP = 'INSERT' then
    update public.comments set likes_count = likes_count + 1 where id = NEW.comment_id;
  elsif TG_OP = 'DELETE' then
    update public.comments set likes_count = likes_count - 1 where id = OLD.comment_id;
  end if;
  return null;
end;
$$ language plpgsql security definer;
create trigger on_comment_like_change after insert or delete on public.comment_likes
  for each row execute function update_comment_likes_count();

create or replace function update_comments_count() returns trigger as $$
begin
  if TG_OP = 'INSERT' and NEW.parent_id is null then
    update public.videos set comments_count = comments_count + 1 where id = NEW.video_id;
  elsif TG_OP = 'DELETE' and OLD.parent_id is null then
    update public.videos set comments_count = comments_count - 1 where id = OLD.video_id;
  end if;
  return null;
end;
$$ language plpgsql security definer;
create trigger on_comment_change after insert or delete on public.comments
  for each row execute function update_comments_count();
*/

// ── Cache helpers ─────────────────────────────────────────────────────────────
const CACHE = new Map();
const CACHE_TTL = 60_000; // 1 minute

export function cacheGet(key) {
  const entry = CACHE.get(key);
  if (!entry) return null;
  if (Date.now() - entry.ts > CACHE_TTL) { CACHE.delete(key); return null; }
  return entry.data;
}
export function cacheSet(key, data) {
  CACHE.set(key, { data, ts: Date.now() });
  return data;
}
export function cacheInvalidate(pattern) {
  for (const key of CACHE.keys()) {
    if (key.includes(pattern)) CACHE.delete(key);
  }
}

// ── Auth helpers ──────────────────────────────────────────────────────────────
export const authHelpers = {
  async signUp({ email, password, username, displayName }) {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
    await supabase.from("profiles").insert({
      id: data.user.id, username, display_name: displayName || username,
    });
    return data;
  },

  async signIn({ email, password }) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  },

  async signOut() {
    CACHE.clear();
    return supabase.auth.signOut();
  },

  async resetPassword(email) {
    return supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + "/reset-password",
    });
  },

  async getSession() {
    const { data } = await supabase.auth.getSession();
    return data.session;
  },
};

// ── Profile helpers ───────────────────────────────────────────────────────────
export const profileHelpers = {
  async getById(id) {
    const cached = cacheGet(`profile:${id}`);
    if (cached) return cached;
    const { data, error } = await supabase
      .from("profiles").select("*").eq("id", id).single();
    if (error) throw error;
    return cacheSet(`profile:${id}`, data);
  },

  async getByUsername(username) {
    const cached = cacheGet(`profile:username:${username}`);
    if (cached) return cached;
    const { data, error } = await supabase
      .from("profiles").select("*").eq("username", username).single();
    if (error) throw error;
    return cacheSet(`profile:username:${username}`, data);
  },

  async checkUsername(username) {
    const { data } = await supabase
      .from("profiles").select("id").eq("username", username).maybeSingle();
    return !!data;
  },

  async update(id, updates) {
    const { data, error } = await supabase
      .from("profiles").update(updates).eq("id", id).select().single();
    if (error) throw error;
    cacheInvalidate(`profile:${id}`);
    return data;
  },

  async uploadAvatar(userId, file) {
    const ext = file.name.split(".").pop();
    const path = `${userId}/avatar.${ext}`;
    const { error } = await supabase.storage.from("avatars").upload(path, file, { upsert: true });
    if (error) throw error;
    const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(path);
    await profileHelpers.update(userId, { avatar_url: publicUrl });
    return publicUrl;
  },

  async searchUsers(query) {
    const { data, error } = await supabase
      .from("profiles")
      .select("id,username,display_name,avatar_url,is_verified,followers_count")
      .or(`username.ilike.%${query}%,display_name.ilike.%${query}%`)
      .limit(20);
    if (error) throw error;
    return data;
  },
};

// ── Follow helpers ────────────────────────────────────────────────────────────
export const followHelpers = {
  async isFollowing(followerId, followingId) {
    const cached = cacheGet(`follow:${followerId}:${followingId}`);
    if (cached !== null) return cached;
    const { data } = await supabase
      .from("follows")
      .select("id")
      .eq("follower_id", followerId)
      .eq("following_id", followingId)
      .maybeSingle();
    return cacheSet(`follow:${followerId}:${followingId}`, !!data);
  },

  async follow(followerId, followingId) {
    const { error } = await supabase.from("follows").insert({ follower_id: followerId, following_id: followingId });
    if (error) throw error;
    cacheInvalidate(`follow:${followerId}`);
    cacheInvalidate(`profile:${followerId}`);
    cacheInvalidate(`profile:${followingId}`);
  },

  async unfollow(followerId, followingId) {
    const { error } = await supabase.from("follows")
      .delete().eq("follower_id", followerId).eq("following_id", followingId);
    if (error) throw error;
    cacheInvalidate(`follow:${followerId}`);
    cacheInvalidate(`profile:${followerId}`);
    cacheInvalidate(`profile:${followingId}`);
  },

  async getFollowers(userId) {
    const { data, error } = await supabase
      .from("follows")
      .select("follower_id, profiles!follows_follower_id_fkey(id,username,display_name,avatar_url,is_verified)")
      .eq("following_id", userId);
    if (error) throw error;
    return data.map(d => d.profiles);
  },

  async getFollowing(userId) {
    const { data, error } = await supabase
      .from("follows")
      .select("following_id, profiles!follows_following_id_fkey(id,username,display_name,avatar_url,is_verified)")
      .eq("follower_id", userId);
    if (error) throw error;
    return data.map(d => d.profiles);
  },
};

// ── Video helpers ─────────────────────────────────────────────────────────────
export const videoHelpers = {
  async getFeed({ page = 0, limit = 12, category = null, userId = null } = {}) {
    const cacheKey = `feed:${page}:${limit}:${category}:${userId}`;
    const cached = cacheGet(cacheKey);
    if (cached) return cached;
    let query = supabase.from("videos")
      .select("*, profiles(id,username,display_name,avatar_url,is_verified)")
      .order("created_at", { ascending: false })
      .range(page * limit, (page + 1) * limit - 1);
    if (category) query = query.eq("category", category);
    if (userId) query = query.eq("user_id", userId);
    const { data, error } = await query;
    if (error) throw error;
    return cacheSet(cacheKey, data);
  },

  async getById(id) {
    const cached = cacheGet(`video:${id}`);
    if (cached) return cached;
    const { data, error } = await supabase.from("videos")
      .select("*, profiles(id,username,display_name,avatar_url,is_verified)")
      .eq("id", id).single();
    if (error) throw error;
    return cacheSet(`video:${id}`, data);
  },

  async getTrending({ limit = 12 } = {}) {
    const cached = cacheGet(`trending:${limit}`);
    if (cached) return cached;
    const { data, error } = await supabase.from("videos")
      .select("*, profiles(id,username,display_name,avatar_url,is_verified)")
      .order("views", { ascending: false }).limit(limit);
    if (error) throw error;
    return cacheSet(`trending:${limit}`, data);
  },

  async search(query) {
    const { data, error } = await supabase.from("videos")
      .select("*, profiles(id,username,display_name,avatar_url)")
      .or(`title.ilike.%${query}%,description.ilike.%${query}%,tags.cs.{${query}}`)
      .limit(20);
    if (error) throw error;
    return data;
  },

  async incrementViews(id) {
    await supabase.rpc("increment_views", { video_id: id }).catch(() => {
      supabase.from("videos").update({ views: supabase.rpc("views+1") }).eq("id", id);
    });
    cacheInvalidate(`video:${id}`);
  },

  async upload({ userId, file, thumbnail, title, description, category, tags, isVip }) {
    const videoPath = `${userId}/${Date.now()}_${file.name}`;
    const { error: uploadErr } = await supabase.storage.from("videos").upload(videoPath, file);
    if (uploadErr) throw uploadErr;
    const { data: { publicUrl: videoUrl } } = supabase.storage.from("videos").getPublicUrl(videoPath);
    let thumbnailUrl = null;
    if (thumbnail) {
      const thumbPath = `${userId}/${Date.now()}_thumb.jpg`;
      await supabase.storage.from("thumbnails").upload(thumbPath, thumbnail);
      const { data: { publicUrl } } = supabase.storage.from("thumbnails").getPublicUrl(thumbPath);
      thumbnailUrl = publicUrl;
    }
    const { data, error } = await supabase.from("videos").insert({
      user_id: userId, video_url: videoUrl, thumbnail_url: thumbnailUrl,
      title, description, category, tags, is_vip: isVip,
    }).select().single();
    if (error) throw error;
    cacheInvalidate("feed:");
    cacheInvalidate(`feed::12::${userId}`);
    return data;
  },

  async delete(videoId, userId) {
    const { error } = await supabase.from("videos").delete().eq("id", videoId).eq("user_id", userId);
    if (error) throw error;
    cacheInvalidate(`video:${videoId}`);
    cacheInvalidate("feed:");
  },
};

// ── Like helpers ──────────────────────────────────────────────────────────────
export const likeHelpers = {
  async isLiked(userId, videoId) {
    if (!userId) return false;
    const cached = cacheGet(`like:${userId}:${videoId}`);
    if (cached !== null) return cached;
    const { data } = await supabase.from("video_likes")
      .select("id").eq("user_id", userId).eq("video_id", videoId).maybeSingle();
    return cacheSet(`like:${userId}:${videoId}`, !!data);
  },

  async toggle(userId, videoId, currentlyLiked) {
    if (currentlyLiked) {
      await supabase.from("video_likes").delete().eq("user_id", userId).eq("video_id", videoId);
    } else {
      await supabase.from("video_likes").insert({ user_id: userId, video_id: videoId });
    }
    cacheInvalidate(`like:${userId}:${videoId}`);
    cacheInvalidate(`video:${videoId}`);
  },

  async isSaved(userId, videoId) {
    if (!userId) return false;
    const { data } = await supabase.from("saved_videos")
      .select("id").eq("user_id", userId).eq("video_id", videoId).maybeSingle();
    return !!data;
  },

  async toggleSave(userId, videoId, currentlySaved) {
    if (currentlySaved) {
      await supabase.from("saved_videos").delete().eq("user_id", userId).eq("video_id", videoId);
    } else {
      await supabase.from("saved_videos").insert({ user_id: userId, video_id: videoId });
    }
  },

  async getSaved(userId) {
    const { data, error } = await supabase.from("saved_videos")
      .select("videos(*, profiles(id,username,display_name,avatar_url))")
      .eq("user_id", userId).order("created_at", { ascending: false });
    if (error) throw error;
    return data.map(d => d.videos);
  },
};

// ── Comment helpers ───────────────────────────────────────────────────────────
export const commentHelpers = {
  async getForVideo(videoId) {
    const { data, error } = await supabase.from("comments")
      .select("*, profiles(id,username,display_name,avatar_url), replies:comments!parent_id(*, profiles(id,username,display_name,avatar_url), replies:comments!parent_id(*, profiles(id,username,display_name,avatar_url)))")
      .eq("video_id", videoId).is("parent_id", null)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data;
  },

  async add({ videoId, userId, body, parentId = null }) {
    const { data, error } = await supabase.from("comments")
      .insert({ video_id: videoId, user_id: userId, body, parent_id: parentId })
      .select("*, profiles(id,username,display_name,avatar_url)").single();
    if (error) throw error;
    return data;
  },

  async delete(commentId, userId) {
    const { error } = await supabase.from("comments").delete().eq("id", commentId).eq("user_id", userId);
    if (error) throw error;
  },

  async toggleLike(userId, commentId, currentlyLiked) {
    if (currentlyLiked) {
      await supabase.from("comment_likes").delete().eq("user_id", userId).eq("comment_id", commentId);
    } else {
      await supabase.from("comment_likes").insert({ user_id: userId, comment_id: commentId });
    }
  },

  async getLikedIds(userId, commentIds) {
    if (!userId || !commentIds.length) return [];
    const { data } = await supabase.from("comment_likes")
      .select("comment_id").eq("user_id", userId).in("comment_id", commentIds);
    return data ? data.map(d => d.comment_id) : [];
  },

  subscribeToVideo(videoId, callback) {
    return supabase.channel(`comments:${videoId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "comments", filter: `video_id=eq.${videoId}` }, callback)
      .subscribe();
  },
};

// ── VIP helpers ───────────────────────────────────────────────────────────────
export const vipHelpers = {
  async upgradeToVip(userId) {
    const { data, error } = await supabase.from("profiles")
      .update({ is_vip: true }).eq("id", userId).select().single();
    if (error) throw error;
    cacheInvalidate(`profile:${userId}`);
    return data;
  },
};
