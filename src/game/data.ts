export const FLOWERS = [
  {
    id: "daisy",
    name: "เดซี่",
    en: "Daisy",
    icon: "🌼",
    color: "#f8eee0",
    seed: 10,
    sell: 25,
    days: 2,
    description: "ดอกเล็กสีขาว ใจกลางสีทอง เติบโตง่าย เหมาะกับสวนแรกของคุณ",
  },
  {
    id: "tulip",
    name: "ทิวลิป",
    en: "Tulip",
    icon: "🌷",
    color: "#ec8195",
    seed: 15,
    sell: 30,
    days: 2,
    description:
      "กลีบดอกอ่อนโยนที่หุบรับยามเย็น เป็นสัญลักษณ์ของความรักที่อบอุ่น",
  },
  {
    id: "sunflower",
    name: "ทานตะวัน",
    en: "Sunflower",
    icon: "🌻",
    color: "#edbd39",
    seed: 25,
    sell: 50,
    days: 3,
    description: "ดอกสีทองสูงสง่า เติมแสงแดดให้สวนและช่อดอกไม้ของคุณ",
  },
  {
    id: "rose",
    name: "กุหลาบ",
    en: "Rose",
    icon: "🌹",
    color: "#ce465f",
    seed: 40,
    sell: 80,
    days: 4,
    description: "ดอกไม้กลีบซ้อนสีแดง ต้องการการดูแลสม่ำเสมอและรางวัลก็คุ้มค่า",
  },
  {
    id: "lavender",
    name: "ลาเวนเดอร์",
    en: "Lavender",
    icon: "🪻",
    color: "#a489d4",
    seed: 60,
    sell: 120,
    days: 5,
    description: "ช่อดอกสีม่วงที่พลิ้วไหวในสายลม เติบโตช้าแต่มีมูลค่าสูง",
  },
] as const;
export type FlowerId = (typeof FLOWERS)[number]["id"];
export const flower = (id: string) => FLOWERS.find((f) => f.id === id)!;
export const FISH = [
  { id: "carp", name: "ปลาคาร์ป", price: 40, icon: "🐟" },
  { id: "goldfish", name: "ปลาทอง", price: 60, icon: "🐠" },
  { id: "rare", name: "ปลาหายาก", price: 150, icon: "🐡" },
];
export const ZONES = [
  {
    id: "farm",
    name: "สวนดอกไม้",
    en: "THE FLOWER GARDEN",
    x: -10,
    z: 0,
    icon: "🌷",
  },
  {
    id: "seed",
    name: "ร้านเมล็ดของลิลลี่",
    en: "LILY’S SEED SHOP",
    x: -17,
    z: 15,
    icon: "🌱",
  },
  {
    id: "sell",
    name: "ร้านดอกไม้",
    en: "THE FLOWER MARKET",
    x: -8,
    z: 24,
    icon: "💐",
  },
  {
    id: "house",
    name: "บ้านของคุณ",
    en: "HOME, SWEET HOME",
    x: 13,
    z: 3,
    icon: "🏡",
  },
  {
    id: "lake",
    name: "ทะเลสาบกระจก",
    en: "MIRROR LAKE",
    x: 0,
    z: -20,
    icon: "🎣",
  },
  {
    id: "rest",
    name: "สวนพักใจ",
    en: "THE QUIET CORNER",
    x: 3,
    z: -10,
    icon: "🪑",
  },
  {
    id: "fish",
    name: "ร้านปลาของฟินน์",
    en: "FINN’S FISH STAND",
    x: 14,
    z: -16,
    icon: "🐟",
  },
  {
    id: "workshop",
    name: "สตูดิโอของโอลิเวอร์",
    en: "OLIVER’S ATELIER",
    x: 15,
    z: 24,
    icon: "🎨",
  },
];
export const plotPosition = (i: number) => ({
  x: -14 + (i % 4) * 2.5,
  z: -4 + Math.floor(i / 4) * 2.5,
});
export const itemName = (id: string) =>
  id.startsWith("seed:")
    ? `เมล็ด${flower(id.slice(5))?.name ?? id}`
    : (FLOWERS.find((f) => f.id === id)?.name ??
      FISH.find((f) => f.id === id)?.name ??
      id);
