import { useRef } from "react";
import { G } from "../../data/theme";

const arrowStyle = (side) => ({
  position: "absolute", [side]: -16, top: "40%", transform: "translateY(-50%)",
  width: 36, height: 36, borderRadius: "50%",
  background: "rgba(20,20,32,.95)", border: `1px solid ${G.border}`,
  color: "white", fontSize: 18, cursor: "pointer", zIndex: 10,
  display: "flex", alignItems: "center", justifyContent: "center",
  transition: "all .2s",
});

export default function HScroll({ children }) {
  const ref = useRef(null);
  const scroll = (d) => ref.current?.scrollBy({ left: d * 300, behavior: "smooth" });
  return (
    <div style={{ position: "relative" }}>
      <button onClick={() => scroll(-1)} style={arrowStyle("left")}>‹</button>
      <div ref={ref} style={{
        display: "flex", gap: 12, overflowX: "auto",
        scrollSnapType: "x mandatory", scrollbarWidth: "none", paddingBottom: 4,
      }}>{children}</div>
      <button onClick={() => scroll(1)} style={arrowStyle("right")}>›</button>
    </div>
  );
}
