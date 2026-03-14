import { G } from "../data/theme";
import { useApp } from "../context/AppContext";
import { useApp as useAppCtx } from "../context/AppContext";

const TABS = [
  {id:"home",      label:"🏠 Home"},
  {id:"trending",  label:"🔥 Trending"},
  {id:"new",       label:"✨ New"},
  {id:"categories",label:"🏷 Categories"},
  {id:"channels",  label:"📺 Channels"},
  {id:"favorites", label:"❤️ Saved"},
  {id:"history",   label:"🕐 History"},
  {id:"vip",       label:"💎 VIP"},
];

export default function NavTabs() {
  const { tab, setTab, setCatFilter } = useApp();
  return (
    <nav style={{
      background: G.bg2, borderBottom: `1px solid ${G.border}`,
      overflowX: "auto", scrollbarWidth: "none",
      position: "sticky", top: 58, zIndex: 999,
    }}>
      <div style={{
        maxWidth: 1600, margin: "0 auto", display: "flex",
        padding: "0 16px", gap: 4, minWidth: "max-content",
      }}>
        {TABS.map(t => (
          <div key={t.id} onClick={() => { setTab(t.id); setCatFilter(null); }} style={{
            padding: "10px 16px", fontSize: 12, fontWeight: 700,
            color: tab === t.id ? G.accent : G.muted,
            borderBottom: `2px solid ${tab === t.id ? G.accent : "transparent"}`,
            cursor: "pointer", whiteSpace: "nowrap",
            textTransform: "uppercase", letterSpacing: .5,
            transition: "color .2s, border-color .2s",
          }}>{t.label}</div>
        ))}
      </div>
    </nav>
  );
}
