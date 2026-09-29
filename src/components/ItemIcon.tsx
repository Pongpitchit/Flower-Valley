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
  const extra: Record<string,[string,number]> = {
    "food:bread":["food",0],"food:soup":["food",1],"food:omurice":["food",2],
    fertilizer:["garden-expansion",0],"fertilizer:good":["garden-expansion",1],"fertilizer:premium":["garden-expansion",2],cosmos:["garden-expansion",3],hydrangea:["garden-expansion",4],
    trout:["lake-expansion",0],perch:["lake-expansion",1],catfish:["lake-expansion",2],"tin-can":["lake-expansion",3],"old-boot":["lake-expansion",4],
    "seed:cosmos":["seeds-and-rods",0],"seed:hydrangea":["seeds-and-rods",1],"rod:0":["seeds-and-rods",2],"rod:1":["seeds-and-rods",3],"rod:2":["seeds-and-rods",4],
  };
  const frame = extra[grilled ? baseId : id];
  if(index<0 && !frame)return null;
  const sheet = frame?.[0] ?? (flowerIndex>=0 ? (seed ? "seeds" : "flowers") : "fish-and-tools");
  const spriteIndex=frame?.[1] ?? index;
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
        backgroundPosition: `${(spriteIndex % 3) * 50}% ${Math.floor(spriteIndex / 3) * 100}%`,
      }}
    />
  );
}
