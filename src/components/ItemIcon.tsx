import { FLOWERS, itemName } from "../game/data";

export function ItemIcon({
  id,
  size = 36,
  label,
}: {
  id: string;
  size?: number;
  label?: string;
}) {
  const grilled = id.startsWith("grilled:");
  const baseId = grilled ? id.slice(8) : id;
  const seed = id.startsWith("seed:");
  const flowerIndex = FLOWERS.findIndex(
    (f) => f.id === (seed ? id.slice(5) : id),
  );
  const other = ["carp", "goldfish", "rare", "bouquet", "watering-can"].indexOf(
    baseId,
  );
  const index = flowerIndex >= 0 ? flowerIndex : other;
  if (id === "fertilizer") return <span className="item-icon" role="img" aria-label="ปุ๋ยเร่งโต" style={{width:size,height:size,display:"inline-grid",placeItems:"center",color:"#788653"}}><svg width="85%" height="85%" viewBox="0 0 24 24" shapeRendering="crispEdges"><path fill="#ad8154" d="M8 2h8v4h2v4h2v12H4V10h2V6h2z"/><path fill="#d4b485" d="M6 10h12v10H6z"/><path fill="#557747" d="M11 11h2v8h-2zM7 11h4v4H9v-2H7zM13 10h4v3h-2v2h-2z"/></svg></span>;
  if (index < 0) return null;
  const sheet =
    flowerIndex >= 0 ? (seed ? "seeds" : "flowers") : "fish-and-tools";
  const name =
    label ??
    { bouquet: "ช่อดอกไม้", "watering-can": "บัวรดน้ำ" }[id] ??
    itemName(id);
  return (
    <span
      className="item-icon"
      role="img"
      aria-label={name}
      style={{
        width: size,
        height: size,
        filter: grilled ? "sepia(.8) saturate(1.8) brightness(.8)" : undefined,
        backgroundImage: `url(/icons/pixelart/${sheet}.png)`,
        backgroundPosition: `${(index % 3) * 50}% ${Math.floor(index / 3) * 100}%`,
      }}
    />
  );
}
