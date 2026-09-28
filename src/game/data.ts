export const FLOWERS = [
  {
    id: "daisy",
    name: "เดซี่",
    en: "Daisy",
    icon: "🌼",
    color: "#f8eee0",
    seed: 10,
    sell: 35,
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
    sell: 50,
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
    sell: 85,
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
    sell: 135,
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
    sell: 210,
    days: 5,
    description: "ช่อดอกสีม่วงที่พลิ้วไหวในสายลม เติบโตช้าแต่มีมูลค่าสูง",
  },
  { id:"cosmos", name:"คอสมอส", en:"Cosmos", icon:"🌸", color:"#eb89b7", seed:20, sell:75, days:3, description:"กลีบสีชมพูโปร่งเบา โตไวและเพิ่มสีสันให้ช่อดอกไม้" },
  { id:"hydrangea", name:"ไฮเดรนเยีย", en:"Hydrangea", icon:"💠", color:"#7e9edc", seed:90, sell:320, days:6, description:"ช่อสีฟ้ากลมแน่น ใช้เวลาดูแลนาน แต่เหมาะกับปุ๋ยและช่อมูลค่าสูง" },
] as const;
export type FlowerId = (typeof FLOWERS)[number]["id"];
export const flower = (id: string) => FLOWERS.find((f) => f.id === id)!;
export const FISH = [
  { id: "carp", name: "ปลาคาร์ป", price: 40, icon: "🐟" },
  { id: "goldfish", name: "ปลาทอง", price: 60, icon: "🐠" },
  { id: "rare", name: "ปลาหายาก", price: 150, icon: "🐡" },
  {id:"trout",name:"ปลาเทราต์",price:80,icon:"🐟"},
  {id:"perch",name:"ปลาเพิร์ช",price:30,icon:"🐟"},
  {id:"catfish",name:"ปลาดุก",price:55,icon:"🐟"},
];
export const TRASH = [{id:"tin-can",name:"กระป๋องเก่า",price:3,icon:"🥫"},{id:"old-boot",name:"รองเท้าเก่า",price:5,icon:"🥾"}];
export const FERTILIZERS = [{id:"fertilizer",name:"ปุ๋ยพื้นฐาน",price:15,days:1},{id:"fertilizer:good",name:"ปุ๋ยชั้นดี",price:40,days:2},{id:"fertilizer:premium",name:"ปุ๋ยพรีเมียม",price:75,days:3}];
export const RODS = [{name:"เบ็ดไม้",price:0,rare:.04,trash:.30},{name:"เบ็ดชั้นดี",price:350,rare:.08,trash:.25},{name:"เบ็ดนักตกปลา",price:900,rare:.14,trash:.20}];
export function catchTable(level: number) {
  const rod = RODS[level];
  const common = [{id:"carp",weight:25},{id:"goldfish",weight:10},{id:"trout",weight:10},{id:"perch",weight:12},{id:"catfish",weight:9}];
  return [...TRASH.map(f => ({id:f.id,chance:rod.trash/2})),...common.map(f=>({id:f.id,chance:(1-rod.trash-rod.rare)*f.weight/66})),{id:"rare",chance:rod.rare}];
}
export const GRILL_MINUTES = 10;
export const GRILL_ENERGY = 5;
export const GRILLED_FISH = FISH.map(f => ({ ...f, id: 'grilled:' + f.id, name: f.name + 'ย่าง', price: Math.round(f.price * 1.5) }));
export const ZONES = [
  {id:"general",name:"ร้านของจิปาถะของโรวัน",en:"ROWAN’S FINDS",x:-22,z:22,icon:"🎒"},
  {id:'grill',name:'กองไฟย่างปลา',en:'THE CAMPFIRE',x:7,z:-12,icon:'🔥'},
  {id:'upgrades',name:'ธีโอ ช่างประจำหมู่บ้าน',en:'THEO THE BUILDER',x:7,z:8,icon:'🔨'},
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
    name: "มุมนั่งพักหน้ากองไฟ",
    en: "THE QUIET CORNER",
    x: 7,
    z: -9.4,
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
  id.startsWith("rod:") ? (RODS[Number(id.slice(4))]?.name ?? id) : FERTILIZERS.some(f=>f.id===id) ? FERTILIZERS.find(f=>f.id===id)!.name : id.startsWith("seed:")
    ? `เมล็ด${flower(id.slice(5))?.name ?? id}`
    : (FLOWERS.find((f) => f.id === id)?.name ??
      [...FISH, ...GRILLED_FISH, ...TRASH].find((f) => f.id === id)?.name ??
      id);
