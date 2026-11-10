export const FOODS = [
 {id:"food:bread",name:"ขนมปังอบ",energy:20,price:35},
 {id:"food:soup",name:"ซุปผัก",energy:30,price:50},
 {id:"food:omurice",name:"ข้าวห่อไข่",energy:40,price:65},
];
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
  { id: "rare", name: "ปลาคาร์ปโคอิหายาก", price: 150, icon: "🐡" },
  {id:"trout",name:"ปลาเทราต์",price:80,icon:"🐟"},
  {id:"perch",name:"ปลาเพิร์ช",price:30,icon:"🐟"},
  {id:"catfish",name:"ปลาดุก",price:55,icon:"🐟"},
];
// Saltwater catches come only from the sea pier.
export const SEA_FISH = [
  {id:"mackerel",name:"ปลาทู",price:45,icon:"🐟"},
  {id:"seabass",name:"ปลากะพง",price:70,icon:"🐟"},
  {id:"clownfish",name:"ปลาการ์ตูน",price:120,icon:"🐠"},
  {id:"tuna",name:"ปลาทูน่า",price:280,icon:"🐟"},
  {id:"jellyfish",name:"แมงกะพรุน",price:90,icon:"🪼"},
];
export const ALL_FISH = [...FISH, ...SEA_FISH];
export const FORAGE = [
  {id:"forage:mushroom",name:"เห็ดป่า",price:25,icon:"🍄"},
  {id:"forage:berry",name:"เบอร์รี่ป่า",price:20,icon:"🫐"},
  {id:"forage:herb",name:"สมุนไพรป่า",price:30,icon:"🌿"},
  {id:"forage:rare-mushroom",name:"เห็ดเรืองแสงหายาก",price:150,icon:"✨"},
];
export const FORAGE_ENERGY = 3;
export const FORAGE_MINUTES = 5;
// Every spot regrows each morning; positions are inside the Deep Woods west of Rowan's cart.
export const FORAGE_SPOTS = [
  {item:"forage:mushroom",x:-56,z:6},{item:"forage:mushroom",x:-70,z:24},{item:"forage:mushroom",x:-74,z:4},{item:"forage:mushroom",x:-57,z:31},
  {item:"forage:berry",x:-55,z:22},{item:"forage:berry",x:-68,z:-4},{item:"forage:berry",x:-77,z:17},{item:"forage:berry",x:-53,z:-3},
  {item:"forage:herb",x:-58.5,z:25},{item:"forage:herb",x:-72,z:12},{item:"forage:herb",x:-67,z:34},
  {item:"forage:rare-mushroom",x:-79,z:-8},
];
export const TRASH = [{id:"tin-can",name:"กระป๋องเก่า",price:3,icon:"🥫"},{id:"old-boot",name:"รองเท้าเก่า",price:5,icon:"🥾"}];
export const FERTILIZERS = [{id:"fertilizer",name:"ปุ๋ยพื้นฐาน",price:10,days:1},{id:"fertilizer:good",name:"ปุ๋ยชั้นดี",price:18,days:2},{id:"fertilizer:premium",name:"ปุ๋ยพรีเมียม",price:24,days:3}];
export const RODS = [{name:"เบ็ดไม้",price:0,rare:.04,trash:.10},{name:"เบ็ดชั้นดี",price:350,rare:.12,trash:.10},{name:"เบ็ดนักตกปลา",price:900,rare:.20,trash:.10}];
export function catchTable(level: number) {
  const rod = RODS[level];
  const common = [{id:"carp",weight:25},{id:"goldfish",weight:10},{id:"trout",weight:10},{id:"perch",weight:12},{id:"catfish",weight:9}];
  return [...TRASH.map(f => ({id:f.id,chance:rod.trash/2})),...common.map(f=>({id:f.id,chance:(1-rod.trash-rod.rare)*f.weight/66})),{id:"rare",chance:rod.rare}];
}
export function seaCatchTable(level: number) {
  const rod = RODS[level];
  const common = [{id:"mackerel",weight:30},{id:"seabass",weight:20},{id:"jellyfish",weight:12},{id:"clownfish",weight:10}];
  return [...TRASH.map(f => ({id:f.id,chance:rod.trash/2})),...common.map(f=>({id:f.id,chance:(1-rod.trash-rod.rare)*f.weight/72})),{id:"tuna",chance:rod.rare}];
}
export const CAST_MINUTES = 15;
export const GRILL_MINUTES = 10;
export const GRILL_ENERGY = 5;
const GRILL_ENERGY_BY_FISH: Record<string, number> = { rare: 40, trout: 35, goldfish: 30, catfish: 30, carp: 25, tuna: 45, clownfish: 30, seabass: 30, mackerel: 25, jellyfish: 20 };
export const GRILLED_FISH = [...FISH, ...SEA_FISH].map(f => ({ ...f, id: 'grilled:' + f.id, name: f.name + 'ย่าง', price: Math.round(f.price * 1.5), energy: GRILL_ENERGY_BY_FISH[f.id] ?? 20 }));
export const EDIBLES = [...FOODS, ...GRILLED_FISH];
export const ZONES = [
  {id:"beach",name:"ชายหาดสายลม",en:"BREEZY BEACH",x:55,z:-6,icon:"🏖️"},
  {id:"pier",name:"ท่าเรือตกปลาทะเล",en:"THE SEA PIER",x:68,z:-16,icon:"⚓"},
  {id:"woods",name:"ป่าลึก",en:"THE DEEP WOODS",x:-65,z:14,icon:"🍄"},
  {id:"lookout",name:"จุดชมวิวเนินฟ้า",en:"SKYHILL LOOKOUT",x:0,z:64,icon:"🔭"},
  {id:"food",name:"ครัวอุ่นใจของโนรา",en:"NORA’S KITCHEN",x:-10,z:33,icon:"🍲"},
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
export const SCENES = [
  {id:"village",name:"หมู่บ้านดอกไม้",en:"FLOWER VILLAGE",desc:"ตลาด ร้านค้า และสตูดิโอศิลปะ",x:0,z:28,yaw:0},
  {id:"garden",name:"สวนดอกไม้และบ้าน",en:"GARDEN & HOME",desc:"แปลงปลูก บ้าน และช่างธีโอ",x:-1,z:6,yaw:Math.PI/2},
  {id:"lake",name:"ทะเลสาบกระจก",en:"MIRROR LAKE",desc:"ตกปลาน้ำจืดและกองไฟ",x:0,z:-16,yaw:0},
  {id:"beach",name:"ชายหาดสายลม",en:"BREEZY BEACH",desc:"ท่าเรือตกปลาทะเล เรือ และประภาคาร",x:50,z:-16,yaw:-Math.PI/2},
  {id:"woods",name:"ป่าลึก",en:"THE DEEP WOODS",desc:"เก็บเห็ด เบอร์รี่ สมุนไพร งอกใหม่ทุกเช้า",x:-48,z:15,yaw:Math.PI/2},
  {id:"lookout",name:"จุดชมวิวเนินฟ้า",en:"SKYHILL LOOKOUT",desc:"มองเห็นทั้งหุบเขาจากยอดเนิน",x:0,z:62,yaw:0},
] as const;
export function sceneAt(x: number, z: number) {
  const id = x > 45.5 ? "beach" : x < -45.5 ? "woods" : z > 43.8 ? "lookout" : z < -12 ? "lake" : z > 12 ? "village" : "garden";
  return SCENES.find((s) => s.id === id)!;
}
export const plotPosition = (i: number) => ({
  x: -14 + (i % 4) * 2.5,
  z: -4 + Math.floor(i / 4) * 2.5,
});
export const itemName = (id: string) =>
  id.startsWith("rod:") ? (RODS[Number(id.slice(4))]?.name ?? id) : FERTILIZERS.some(f=>f.id===id) ? FERTILIZERS.find(f=>f.id===id)!.name : id.startsWith("seed:")
    ? `เมล็ด${flower(id.slice(5))?.name ?? id}`
    : (FLOWERS.find((f) => f.id === id)?.name ??
      [...FISH, ...SEA_FISH, ...GRILLED_FISH, ...TRASH, ...FOODS, ...FORAGE].find((f) => f.id === id)?.name ??
      id);
