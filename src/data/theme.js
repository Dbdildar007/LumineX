export const APP_NAME  = "LumineX";
export const APP_LOGO  = "Lumine";
export const APP_LOGO2 = "X";

export const G = {
  bg:     "#030308",
  bg2:    "#08080f",
  bg3:    "#0f0f1c",
  bg4:    "#161628",
  card:   "#0d0d1a",
  cardH:  "#141426",
  accent: "#c084fc",
  accent2:"#818cf8",
  accent3:"#f472b6",
  gold:   "#fbbf24",
  green:  "#34d399",
  red:    "#f87171",
  text:   "#f0f0f8",
  muted:  "#6b6b8a",
  border: "#1a1a2e",
};

export const CATEGORIES = [
  { icon:"🎬", name:"Cinematic",  count:"48.2K", color:"#ef4444" },
  { icon:"🌊", name:"Nature",     count:"32.1K", color:"#3b82f6" },
  { icon:"🏋️",name:"Fitness",   count:"21.8K", color:"#10b981" },
  { icon:"🍜", name:"Food",       count:"18.9K", color:"#f59e0b" },
  { icon:"🎵", name:"Music",      count:"29.4K", color:"#ec4899" },
  { icon:"✈️", name:"Travel",    count:"41.7K", color:"#06b6d4" },
  { icon:"🔬", name:"Science",    count:"12.6K", color:"#84cc16" },
  { icon:"🎮", name:"Gaming",     count:"55.2K", color:"#f97316" },
  { icon:"🏎️",name:"Autos",     count:"23.1K", color:"#64748b" },
  { icon:"🏄", name:"Sports",     count:"37.5K", color:"#0ea5e9" },
  { icon:"💡", name:"Tech",       count:"44.1K", color:"#a78bfa" },
  { icon:"🎨", name:"Art",        count:"16.3K", color:"#fb7185" },
];

export const DEMO_VIDEOS = [
  { id:"demo1", title:"Big Buck Bunny — Official 4K",         channel:"Blender Foundation", category:"Cinematic", views:"12.4M", likes_count:94200, is_vip:false, video_url:"https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",        thumbnail_url:"https://picsum.photos/640/360?random=1",  tags:["animation","4k"], duration:"9:56",  created_at: new Date(Date.now()-86400000*2).toISOString() },
  { id:"demo2", title:"Elephants Dream — Sci-Fi Short",        channel:"Blender Institute",  category:"Cinematic", views:"8.1M",  likes_count:61000, is_vip:false, video_url:"https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",       thumbnail_url:"https://picsum.photos/640/360?random=2",  tags:["scifi","short"], duration:"10:54", created_at: new Date(Date.now()-86400000*5).toISOString() },
  { id:"demo3", title:"For Bigger Blazes — Action Reel",       channel:"NovaCinema",         category:"Sports",    views:"4.2M",  likes_count:32100, is_vip:true,  video_url:"https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",      thumbnail_url:"https://picsum.photos/640/360?random=3",  tags:["action","vip"],  duration:"0:15",  created_at: new Date(Date.now()-86400000*1).toISOString() },
  { id:"demo4", title:"For Bigger Escapes — Epic Stunts",      channel:"UrbanFilms",         category:"Sports",    views:"3.7M",  likes_count:28400, is_vip:false, video_url:"https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",     thumbnail_url:"https://picsum.photos/640/360?random=4",  tags:["stunts","hd"],   duration:"0:15",  created_at: new Date(Date.now()-86400000*3).toISOString() },
  { id:"demo5", title:"For Bigger Fun — Lifestyle Comedy",     channel:"FunVault",           category:"Lifestyle", views:"5.9M",  likes_count:44700, is_vip:false, video_url:"https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",         thumbnail_url:"https://picsum.photos/640/360?random=5",  tags:["fun","comedy"],  duration:"0:15",  created_at: new Date(Date.now()-86400000*7).toISOString() },
  { id:"demo6", title:"For Bigger Joyrides — Supercar Edition",channel:"AutoVault",          category:"Autos",     views:"7.3M",  likes_count:58200, is_vip:true,  video_url:"https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",    thumbnail_url:"https://picsum.photos/640/360?random=6",  tags:["cars","speed"],  duration:"0:15",  created_at: new Date(Date.now()-86400000*4).toISOString() },
  { id:"demo7", title:"For Bigger Meltdowns — Drama Cuts",     channel:"DramaHub",           category:"Cinematic", views:"2.1M",  likes_count:16300, is_vip:false, video_url:"https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4",   thumbnail_url:"https://picsum.photos/640/360?random=7",  tags:["drama","film"],  duration:"0:15",  created_at: new Date(Date.now()-86400000*6).toISOString() },
  { id:"demo8", title:"Sintel — Award Winning Dragon Short",   channel:"Blender Foundation", category:"Cinematic", views:"21.8M", likes_count:187000, is_vip:true, video_url:"https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",               thumbnail_url:"https://picsum.photos/640/360?random=8",  tags:["fantasy","vip"], duration:"14:48", created_at: new Date(Date.now()-86400000*10).toISOString() },
  { id:"demo9", title:"Subaru Outback — Street & Dirt",        channel:"AutoVault",          category:"Autos",     views:"1.8M",  likes_count:14200, is_vip:false, video_url:"https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4", thumbnail_url:"https://picsum.photos/640/360?random=9",  tags:["suv","offroad"], duration:"0:15",  created_at: new Date(Date.now()-86400000*8).toISOString() },
  { id:"demo10",title:"Tears of Steel — Sci-Fi VFX Showcase",  channel:"Blender VFX",        category:"Science",   views:"9.4M",  likes_count:71200, is_vip:true,  video_url:"https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",         thumbnail_url:"https://picsum.photos/640/360?random=10", tags:["scifi","vfx"],   duration:"12:14", created_at: new Date(Date.now()-86400000*9).toISOString() },
  { id:"demo11",title:"Bullrun — Epic Road Trip",              channel:"RoadTrip TV",        category:"Travel",    views:"3.3M",  likes_count:25100, is_vip:false, video_url:"https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4",  thumbnail_url:"https://picsum.photos/640/360?random=11", tags:["travel","road"], duration:"0:15",  created_at: new Date(Date.now()-86400000*11).toISOString() },
  { id:"demo12",title:"What Car Can You Get for a Grand?",     channel:"AutoVault",          category:"Autos",     views:"4.8M",  likes_count:36900, is_vip:false, video_url:"https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WhatCarCanYouGetForAGrand.mp4", thumbnail_url:"https://picsum.photos/640/360?random=12", tags:["cars","review"], duration:"0:15",  created_at: new Date(Date.now()-86400000*12).toISOString() },
];

export const AVATARS = [
  { id:"a1",  emoji:"🦁", bg:"linear-gradient(135deg,#f97316,#fbbf24)", label:"Lion" },
  { id:"a2",  emoji:"🐺", bg:"linear-gradient(135deg,#6366f1,#8b5cf6)", label:"Wolf" },
  { id:"a3",  emoji:"🦊", bg:"linear-gradient(135deg,#ef4444,#f97316)", label:"Fox" },
  { id:"a4",  emoji:"🐉", bg:"linear-gradient(135deg,#10b981,#06b6d4)", label:"Dragon" },
  { id:"a5",  emoji:"🦅", bg:"linear-gradient(135deg,#3b82f6,#6366f1)", label:"Eagle" },
  { id:"a6",  emoji:"🐯", bg:"linear-gradient(135deg,#f59e0b,#ef4444)", label:"Tiger" },
  { id:"a7",  emoji:"🦄", bg:"linear-gradient(135deg,#ec4899,#a855f7)", label:"Unicorn" },
  { id:"a8",  emoji:"🐼", bg:"linear-gradient(135deg,#1e293b,#475569)", label:"Panda" },
  { id:"a9",  emoji:"🦋", bg:"linear-gradient(135deg,#c084fc,#818cf8)", label:"Butterfly" },
  { id:"a10", emoji:"🦈", bg:"linear-gradient(135deg,#0ea5e9,#2563eb)", label:"Shark" },
  { id:"a11", emoji:"🐸", bg:"linear-gradient(135deg,#84cc16,#16a34a)", label:"Frog" },
  { id:"a12", emoji:"🤖", bg:"linear-gradient(135deg,#64748b,#334155)", label:"Robot" },
];
