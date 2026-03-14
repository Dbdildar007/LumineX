import { useState } from "react";
import { CATEGORIES, G } from "../data/theme";
import { useApp } from "../context/AppContext";
import { SectionHeader } from "../components/ui";
import { useIsMobile } from "../hooks";

export default function CategoriesPage() {
  const { setTab } = useApp();
  const isMobile = useIsMobile();

  return (
    <div>
      <SectionHeader title="🏷 All Categories"/>
      <div style={{
        display: "grid",
        gridTemplateColumns: isMobile ? "repeat(3,1fr)" : "repeat(auto-fill,minmax(140px,1fr))",
        gap: isMobile ? 8 : 12,
      }}>
        {CATEGORIES.map(cat => <CatCard key={cat.name} cat={cat} onClick={() => setTab(`cat:${cat.name}`)}/>)}
      </div>
    </div>
  );
}

function CatCard({ cat, onClick }) {
  const [hov, setHov] = useState(false);
  return (
    <div onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: hov ? G.cardH : G.card,
        border: `1px solid ${hov ? cat.color + "88" : G.border}`,
        borderRadius: 14, padding: "20px 12px", textAlign: "center",
        cursor: "pointer", transition: "all .25s",
        transform: hov ? "translateY(-4px)" : "none",
        boxShadow: hov ? `0 12px 28px rgba(0,0,0,.5), 0 0 20px ${cat.color}22` : "none",
      }}
    >
      <div style={{ fontSize: 32, marginBottom: 8 }}>{cat.icon}</div>
      <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 3 }}>{cat.name}</div>
      <div style={{ fontSize: 10, color: G.muted }}>{cat.count}</div>
    </div>
  );
}
