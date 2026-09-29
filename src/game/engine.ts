import { HOME_STYLES } from "./home";
import { FARM_SIZES, FARM_COSTS, WATERING_COSTS, HOME_COSTS, ART_PRICES, rollArtDay, type ArtDay } from "./balance";
import { useSyncExternalStore } from "react";
import {
  FERTILIZERS, RODS, TRASH, catchTable,
  FLOWERS,
  FISH,
  GRILLED_FISH,
  GRILL_MINUTES,
  GRILL_ENERGY,
  flower,
  type FlowerId,
} from "./data";
import { validModelPaint, type PaintModelId } from "./models";
export type Plot = { seed: FlowerId | null; age: number; watered: boolean; fertilized?: boolean };
export type SculpturePart = {
  type: "box" | "sphere" | "cylinder" | "cone";
  x: number;
  y: number;
  z: number;
  rx: number;
  ry: number;
  rz: number;
  scale: number;
  color: string;
  material: "matte" | "metal" | "gloss";
};
export type Artwork = {
  id: string;
  kind: "painting" | "sculpture" | "model";
  modelId?: PaintModelId;
  colors?: Record<string, string>;
  name: string;
  price: number;
  image?: string;
  parts?: SculpturePart[];
};
export type Bouquet = { id: string; flowers: FlowerId[]; price: number };
export type GameState = {
  version: 4;
  artDay: ArtDay;
  day: number;
  time: number;
  weather: "sunny" | "rain";
  money: number;
  energy: number;
  maxEnergy: number;
  inventory: Record<string, number>;
  farm: Plot[];
  bouquets: Bouquet[];
  artworks: Artwork[];
  upgrades: { farmLevel: number; energyLevel: number; wateringLevel: number; rodLevel: number; homeLevel: number };
  home: { style: string; ownedStyles: string[]; garden: boolean; pond: boolean; fish: string[] };
  decorations: number;
  restAt: number;
  order: { flower: FlowerId; fulfilled: boolean };
  stats: { harvested: number; fish: number; earned: number };
  started: boolean;
  position: { x: number; z: number; yaw: number };
};
export const SAVE_KEY =
  "flower-valley-save-v1" +
  (typeof location !== "undefined" &&
  import.meta.env.DEV &&
  new URLSearchParams(location.search).has("qa")
    ? "-qa" + (new URLSearchParams(location.search).get("qa") ? "-" + new URLSearchParams(location.search).get("qa") : "")
    : "");
export const initialState = (rng = Math.random): GameState => ({
  version: 4,
  artDay: rollArtDay(rng),
  day: 1,
  time: 480,
  weather: "sunny",
  money: 500,
  energy: 100,
  maxEnergy: 100,
  inventory: {},
  farm: Array.from({ length: 3 }, () => ({
    seed: null,
    age: 0,
    watered: false,
  })),
  bouquets: [],
  artworks: [],
  upgrades: { farmLevel: 0, energyLevel: 0, wateringLevel: 0, rodLevel: 0, homeLevel: 0 },
  home: {style:"original",ownedStyles:["original"],garden:false,pond:false,fish:[]},
  decorations: 0,
  restAt: -999,
  order: { flower: "daisy", fulfilled: false },
  stats: { harvested: 0, fish: 0, earned: 0 },
  started: false,
  position: { x: 0, z: 20, yaw: 0 },
});
const validId = (v: unknown) => FLOWERS.some((f) => f.id === v);
const finite = (v: unknown, min: number, max: number) =>
  typeof v === "number" && Number.isFinite(v) && v >= min && v <= max;
export function validateSave(v: any): v is GameState {
  return (
    v?.version === 4 &&
    v.home && typeof v.home.garden === "boolean" && typeof v.home.pond === "boolean" &&
    HOME_STYLES.some(x=>x.id===v.home.style) && Array.isArray(v.home.ownedStyles) && v.home.ownedStyles.includes(v.home.style) && v.home.ownedStyles.every((id:string)=>HOME_STYLES.some(x=>x.id===id)) &&
    Array.isArray(v.home.fish) && v.home.fish.length<=6 && (v.home.pond || v.home.fish.length===0) && v.home.fish.every((id:string)=>FISH.some(f=>f.id===id)) &&
    ["calm", "inspired"].includes(v.artDay?.mood) &&
    v.artDay.limit === (v.artDay.mood === "inspired" ? 2 : 1) &&
    Number.isInteger(v.artDay.used) && finite(v.artDay.used, 0, v.artDay.limit) &&
    finite(v.day, 1, 1e7) &&
    finite(v.time, 360, 1440) &&
    ["sunny", "rain"].includes(v.weather) &&
    finite(v.money, 0, 1e12) &&
    finite(v.maxEnergy, 100, 200) &&
    finite(v.energy, 0, v.maxEnergy) &&
    typeof v.started === "boolean" &&
    Number.isInteger(v.upgrades?.farmLevel) && finite(v.upgrades?.farmLevel, 0, 5) &&
    Number.isInteger(v.upgrades?.wateringLevel) && finite(v.upgrades?.wateringLevel, 0, 2) &&
    Number.isInteger(v.upgrades?.rodLevel) && finite(v.upgrades.rodLevel,0,2) &&
    Number.isInteger(v.upgrades?.homeLevel) && finite(v.upgrades.homeLevel,0,3) &&
    finite(v.upgrades?.energyLevel, 0, 5) &&
    v.maxEnergy === 100 + v.upgrades.energyLevel * 20 &&
    Array.isArray(v.farm) &&
    v.farm.length === FARM_SIZES[v.upgrades.farmLevel as 0] &&
    v.farm.every(
      (p: any) =>
        (p.seed === null || validId(p.seed)) &&
        finite(p.age, 0, 100) &&
        typeof p.watered === "boolean" && (p.fertilized === undefined || typeof p.fertilized === "boolean"),
    ) &&
    v.inventory &&
    typeof v.inventory === "object" &&
    !Array.isArray(v.inventory) &&
    Object.entries(v.inventory).every(
      ([k, n]) =>
        (FERTILIZERS.some(f=>f.id===k) || validId(k) ||
          (k.startsWith("seed:") && validId(k.slice(5))) ||
          [...FISH, ...GRILLED_FISH, ...TRASH].some((f) => f.id === k)) &&
        finite(n, 0, 1e6) &&
        Number.isInteger(n),
    ) &&
    Array.isArray(v.bouquets) &&
    v.bouquets.length <= 100 &&
    v.bouquets.every(
      (b: any) =>
        typeof b.id === "string" &&
        Array.isArray(b.flowers) &&
        b.flowers.length === 3 &&
        b.flowers.every(validId) &&
        (b.price === Math.round(b.flowers.reduce((n: number, id: string) => n + ({daisy:25,tulip:30,sunflower:50,rose:80,lavender:120}[id] ?? 0), 0) * 1.25) || b.price ===
          Math.round(
            b.flowers.reduce(
              (s: number, id: string) => s + flower(id).sell,
              0,
            ) * 1.25,
          )),
    ) &&
    Array.isArray(v.artworks) &&
    v.artworks.length <= 24 &&
    v.artworks.every(
      (a: any) =>
        typeof a.id === "string" &&
        typeof a.name === "string" &&
        a.name.length <= 80 &&
        ["painting", "sculpture", "model"].includes(a.kind) &&
        finite(a.price, 0, 500) &&
        ((a.kind === "painting" &&
          typeof a.image === "string" &&
          a.image.startsWith("data:image/png;base64,") &&
          a.image.length < 400000) ||
          (a.kind === "sculpture" && validParts(a.parts)) ||
          (a.kind === "model" &&
            validModelPaint(a) &&
            (!a.image ||
              (a.image.startsWith("data:image/png;base64,") &&
                a.image.length < 400000)))),
    ) &&
    finite(v.decorations, 0, 6) &&
    finite(v.restAt, -999, 1e12) &&
    validId(v.order?.flower) &&
    typeof v.order.fulfilled === "boolean" &&
    ["harvested", "fish", "earned"].every((k) =>
      finite(v.stats?.[k], 0, 1e12),
    ) &&
    finite(v.position?.x, -44, 44) &&
    finite(v.position?.z, -44, 44) &&
    finite(v.position?.yaw, -1e6, 1e6)
  );
}
export function validParts(parts: any): parts is SculpturePart[] {
  return (
    Array.isArray(parts) &&
    parts.length > 0 &&
    parts.length <= 16 &&
    parts.every(
      (p) =>
        ["box", "sphere", "cylinder", "cone"].includes(p.type) &&
        ["x", "z"].every((k) => finite(p[k], -2, 2)) &&
        finite(p.y, 0, 4) &&
        ["rx", "ry", "rz"].every((k) => finite(p[k], 0, 360)) &&
        finite(p.scale, 0.2, 2) &&
        /^#[0-9a-f]{6}$/i.test(p.color) &&
        ["matte", "metal", "gloss"].includes(p.material),
    )
  );
}
export type Action = {
  type: string;
  id?: string;
  index?: number;
  flowers?: FlowerId[];
  art?: Omit<Artwork, "id" | "price">;
  amount?: number;
};
export type Result = { state: GameState; message: string; ok: boolean };
export const REST_MINUTES = 30;
export function transition(
  previous: GameState,
  a: Action,
  rng = Math.random,
): Result {
  const s = structuredClone(previous);
  const fail = (message: string) => ({ state: previous, message, ok: false });
  const ok = (message: string) => ({ state: s, message, ok: true });
  const spend = (n: number) => {
    if (s.money < n) return false;
    s.money -= n;
    return true;
  };
  const energy = (n: number) => {
    if (s.energy < n) return false;
    s.energy -= n;
    return true;
  };
  const add = (id: string, n: number) =>
    (s.inventory[id] = (s.inventory[id] || 0) + n);
  const earn = (n: number) => {
    s.money += n;
    s.stats.earned += n;
  };
  if (a.type === "start") {
    s.started = true;
    return ok("ยินดีต้อนรับสู่ Flower Valley");
  }
  if (a.type === "buy") {
    const f = FLOWERS.find((f) => f.id === a.id);
    if (!f) return fail("ไม่พบเมล็ดพันธุ์");
    if (!spend(f.seed)) return fail("เงินไม่พอ");
    add("seed:" + f.id, 1);
    return ok(`ได้รับเมล็ด${f.name} 1 เมล็ด`);
  }
  if (a.type === "plant") {
    const p = s.farm[a.index ?? -1],
      f = FLOWERS.find((f) => f.id === a.id);
    if (!p || p.seed || !f) return fail("เลือกแปลงว่างและเมล็ดพันธุ์");
    if (!(s.inventory["seed:" + f.id] > 0))
      return fail("ยังไม่มีเมล็ดนี้ แวะร้านของลิลลี่ก่อน");
    if (!energy(5)) return fail("พลังงานไม่พอ ลองนั่งพัก");
    add("seed:" + f.id, -1);
    p.seed = f.id;
    p.age = 0;
    p.fertilized = false;
    p.watered = s.weather === "rain";
    return ok(`ปลูก${f.name}แล้ว อย่าลืมรดน้ำทุกวัน`);
  }
  if (a.type === "water") {
    const index = a.index ?? -1, p = s.farm[index];
    if (!p?.seed) return fail("แปลงนี้ยังว่าง");
    const count = [1, 4, 8][s.upgrades.wateringLevel];
    const row = Math.floor(index / 4);
    const plots = s.farm.filter((p, i) => (s.upgrades.wateringLevel === 0 ? i === index : Math.floor(i / 4) >= row && Math.floor(i / 4) < row + count / 4) && p.seed && !p.watered && p.age < flower(p.seed).days);
    if (!plots.length) return fail("ไม่มีแปลงที่ต้องการน้ำในระยะนี้");
    if (!energy(3)) return fail("พลังงานไม่พอ");
    plots.forEach(p => p.watered = true);
    return ok(`รดน้ำ ${plots.length} แปลงแล้ว −3 พลังงาน`);
  }
  if (a.type === "buyFertilizer") {
    const fertilizer = FERTILIZERS.find(f=>f.id===(a.id ?? "fertilizer"));
    if (!fertilizer) return fail("ไม่พบปุ๋ยชนิดนี้");
    if (!spend(fertilizer.price)) return fail("เงินไม่พอ");
    add(fertilizer.id, 1);
    return ok(`ได้รับ${fertilizer.name} เร่งโต ${fertilizer.days} วัน`);
  }
  if (a.type === "fertilize") {
    const p = s.farm[a.index ?? -1];
    if (!p?.seed || p.fertilized || p.age >= flower(p.seed).days) return fail("ใส่ปุ๋ยได้ครั้งเดียวต่อการปลูก ก่อนโตเต็มที่");
    const fertilizer = FERTILIZERS.find(f=>f.id===(a.id ?? "fertilizer"));
    if (!fertilizer || !(s.inventory[fertilizer.id] > 0)) return fail("ซื้อปุ๋ยจากลิลลี่ก่อน");
    const growth = Math.min(fertilizer.days, flower(p.seed).days-p.age);
    add(fertilizer.id, -1); p.age += growth; p.fertilized = true;
    return ok(`ใส่${fertilizer.name}แล้ว เติบโตเพิ่ม ${growth} วัน`);
  }
  if (a.type === "upgradeWatering") {
    const cost = WATERING_COSTS[s.upgrades.wateringLevel];
    if (!cost) return fail("บัวรดน้ำระดับสูงสุดแล้ว");
    if (!spend(cost)) return fail("เงินไม่พอ");
    s.upgrades.wateringLevel++;
    return ok("บัวรดน้ำรดหลายแปลงในแถวเดียวกันได้แล้ว");
  }
  if (a.type === "harvest") {
    const p = s.farm[a.index ?? -1];
    if (!p?.seed || p.age < flower(p.seed).days)
      return fail("ดอกไม้ยังโตไม่เต็มที่");
    if (!energy(5)) return fail("พลังงานไม่พอ");
    const id = p.seed;
    add(id, 1);
    s.stats.harvested++;
    p.seed = null;
    p.age = 0;
    p.watered = false;
    return ok(`เก็บ${flower(id).name}เข้ากระเป๋าแล้ว`);
  }
  if (a.type === "sell") {
    const f = FLOWERS.find((f) => f.id === a.id),
      fish = [...FISH, ...GRILLED_FISH, ...TRASH].find((f) => f.id === a.id);
    if ((!f && !fish) || !a.id || !(s.inventory[a.id] > 0))
      return fail("ไม่มีสินค้านี้ในกระเป๋า");
    const count = a.amount ?? 1;
    if (!Number.isInteger(count) || count < 1 || count > s.inventory[a.id]) return fail("เลือกจำนวนที่มีในกระเป๋า");
    add(a.id, -count);
    const value = (f?.sell ?? fish!.price) * count;
    earn(value);
    return ok(`ขาย ${count} ชิ้น +${value} เหรียญ`);
  }
  if (a.type === "grill") {
    const fish = FISH.find((f) => f.id === a.id);
    if (!fish || !(s.inventory[fish.id] > 0))
      return fail("เลือกปลาสดที่มีในกระเป๋า");
    if (s.time + GRILL_MINUTES >= 1440)
      return fail("ดึกแล้ว ย่างไม่ทันก่อนเที่ยงคืน กลับไปนอนก่อนนะ");
    if (!energy(GRILL_ENERGY))
      return fail("ต้องใช้พลังงาน 5 หน่วยในการย่างปลา");
    add(fish.id, -1);
    add("grilled:" + fish.id, 1);
    s.time += GRILL_MINUTES;
    return ok(`ย่าง${fish.name}เสร็จแล้ว นำไปขายให้ฟินน์ได้ราคาสูงขึ้น 50%`);
  }
  if (a.type === "bouquet") {
    if (s.bouquets.length >= 100) return fail("ช่อดอกไม้เต็มแล้ว");
    if (a.flowers?.length !== 3 || !a.flowers.every(validId))
      return fail("เลือกดอกไม้ 3 ดอก");
    for (const id of a.flowers) {
      if (!(s.inventory[id] > 0)) return fail("ดอกไม้ไม่พอ");
      add(id, -1);
    }
    s.bouquets.push({
      id: crypto.randomUUID(),
      flowers: a.flowers,
      price: Math.round(
        a.flowers.reduce((n, id) => n + flower(id).sell, 0) * 1.25,
      ),
    });
    return ok("จัดช่อดอกไม้เรียบร้อย มูลค่าเพิ่มขึ้น 25%");
  }
  if (a.type === "sellBouquet" || a.type === "order") {
    const i = s.bouquets.findIndex((b) => b.id === a.id);
    if (i < 0) return fail("ไม่พบช่อดอกไม้");
    const b = s.bouquets[i];
    if (a.type === "order") {
      if (s.order.fulfilled) return fail("ส่งออร์เดอร์วันนี้แล้ว");
      if (!b.flowers.includes(s.order.flower))
        return fail(`ลูกค้าต้องการช่อที่มี${flower(s.order.flower).name}`);
      s.order.fulfilled = true;
    }
    const value = b.price + (a.type === "order" ? 50 : 0);
    s.bouquets.splice(i, 1);
    earn(value);
    return ok(`ขายช่อดอกไม้ +${value} เหรียญ`);
  }
  if (a.type === "rest") {
    const now = s.day * 1440 + s.time;
    if (s.energy >= s.maxEnergy) return fail("พลังงานเต็มแล้ว");
    const gained = Math.min(20, s.maxEnergy - s.energy);
    s.energy = Math.min(s.maxEnergy, s.energy + 20);
    s.restAt = now;
    s.time += REST_MINUTES;
    if (s.time >= 1440) {
      nextDay(s, rng, false);
      return ok("เผลอหลับจนเที่ยงคืน ตื่น 06:00 น. พร้อมพลังงาน 60%");
    }
    return ok(`นั่งพัก ${REST_MINUTES} นาที ฟื้นพลังงาน +${gained}`);
  }
  if (a.type === "sleep") {
    if (s.time < 1200)
      return fail("นอนได้ตั้งแต่ 20:00 น. ระหว่างนี้นั่งพักเพิ่มพลังได้");
    nextDay(s, rng);
    return ok("อรุณสวัสดิ์! เริ่มต้นวันใหม่แล้ว");
  }
  if (a.type === "tick") {
    s.time += a.amount ?? 2;
    if (s.time >= 1440) {
      nextDay(s, rng, false);
      return ok("เที่ยงคืนแล้ว หลับด้วยความเหนื่อยล้า ตื่นพร้อมพลังงาน 60%");
    }
    return ok("");
  }
  if (a.type === "run") {
    return ok("");
  }
  if (a.type === "cast") {
    if (!energy(10)) return fail("ต้องใช้พลังงาน 10 หน่วย");
    return ok("หย่อนเบ็ดแล้ว รอปลากินเหยื่อ…");
  }
  if (a.type === "catch") {
    let roll = rng();
    const table = catchTable(s.upgrades.rodLevel);
    let id = table[table.length-1].id;
    for (const entry of table) { roll -= entry.chance; if (roll < 0) { id=entry.id; break; } }
    const item=[...FISH,...TRASH].find(f=>f.id===id)!;
    add(id,1);
    if(FISH.some(f=>f.id===id)) s.stats.fish++;
    return ok(TRASH.some(f=>f.id===id) ? `ตกได้${item.name} นำไปขายให้โรวันได้` : `จับ${item.name}ได้!`);
  }
  if (a.type === "upgradeRod") {
    const rod=RODS[s.upgrades.rodLevel+1];
    if(!rod) return fail("เบ็ดระดับสูงสุดแล้ว");
    if(!spend(rod.price)) return fail("เงินไม่พอ");
    s.upgrades.rodLevel++;
    return ok(`ได้รับ${rod.name} โอกาสปลาหายาก ${Math.round(rod.rare*100)}%`);
  }
  if (a.type === "homeStyle") {
    const style=HOME_STYLES.find(x=>x.id===a.id);
    if(!style) return fail("ไม่พบรูปแบบบ้าน");
    if(!s.home.ownedStyles.includes(style.id)) {
      if(!spend(style.price)) return fail("เงินไม่พอ");
      s.home.ownedStyles.push(style.id);
    }
    s.home.style=style.id;
    return ok("เปลี่ยนสีหลังคาและผนังแล้ว");
  }
  if(a.type === "homeGarden" || a.type === "homePond") {
    const key=a.type === "homeGarden" ? "garden" : "pond";
    if(s.home[key]) return fail("ติดตั้งแล้ว");
    if(!spend(key === "garden" ? 650 : 850)) return fail("เงินไม่พอ");
    s.home[key]=true;
    return ok(key === "garden" ? "จัดสวนดอกไม้หลังบ้านแล้ว ไม่ต้องรดน้ำ" : "สร้างบ่อปลาแล้ว เลือกปลามาเลี้ยงได้");
  }
  if(a.type === "pondAdd" || a.type === "pondRemove") {
    if(!s.home.pond || !FISH.some(f=>f.id===a.id)) return fail("ต้องมีบ่อและเลือกปลาสด");
    const id=a.id!;
    if(a.type === "pondAdd") {
      if(s.home.fish.length>=6 || !(s.inventory[id]>0)) return fail("บ่อเต็มหรือไม่มีปลาในกระเป๋า");
      s.inventory[id]--; s.home.fish.push(id);
    } else {
      const index=s.home.fish.indexOf(id);
      if(index<0) return fail("ไม่มีปลาชนิดนี้ในบ่อ");
      s.home.fish.splice(index,1); add(id,1);
    }
    return ok(a.type === "pondAdd" ? "ปล่อยปลาลงบ่อแล้ว" : "นำปลากลับเข้ากระเป๋าแล้ว");
  }
  if (a.type === "upgradeHome") {
    const cost=HOME_COSTS[s.upgrades.homeLevel];
    if(!cost) return fail("ตกแต่งบ้านครบแล้ว");
    if(!spend(cost)) return fail("เงินไม่พอ");
    s.upgrades.homeLevel++;
    return ok("ติดตั้งของแต่งบ้านแล้ว ทางเข้ายังเดินได้สะดวก");
  }
  if (a.type === "upgradeEnergy") {
    if (s.upgrades.energyLevel >= 5) return fail("อัปเกรดพลังงานเต็มแล้ว");
    const cost = 300 * (s.upgrades.energyLevel + 1);
    if (!spend(cost)) return fail("เงินไม่พอ");
    s.upgrades.energyLevel++;
    s.maxEnergy += 20;
    s.energy += 20;
    return ok("พลังงานสูงสุดเพิ่มขึ้น 20");
  }
  if (a.type === "upgradeFarm") {
    const cost = FARM_COSTS[s.upgrades.farmLevel];
    if (!cost) return fail("ขยายแปลงสูงสุดแล้ว");
    if (!spend(cost)) return fail(`ต้องใช้ ${cost} เหรียญ`);
    s.upgrades.farmLevel++;
    const extra = FARM_SIZES[s.upgrades.farmLevel] - s.farm.length;
    s.farm.push(...Array.from({ length: extra }, () => ({ seed: null, age: 0, watered: false })));
    return ok(`เพิ่มแปลงปลูก ${extra} แปลงแล้ว`);
  }
  if (a.type === "decorate") {
    if (s.decorations >= 6) return fail("ครบ 6 กระถางแล้ว — ฝั่งละ 3 ใบ");
    if (!spend(100)) return fail("ต้องใช้ 100 เหรียญ");
    s.decorations++;
    return ok(`เพิ่มกระถางบนสนามหน้าบ้านแล้ว (${s.decorations}/6)`);
  }
  if (a.type === "art") {
    if (s.artDay.used >= s.artDay.limit) return fail("วันนี้สร้างงานครบแล้ว พักหาแรงบันดาลใจแล้วกลับมาพรุ่งนี้");
    if (s.artworks.length >= 24) return fail("สตูดิโอเต็มแล้ว ขายผลงานก่อน");
    if (!a.art || !a.art.name.trim() || a.art.name.length > 80)
      return fail("ตั้งชื่อผลงานไม่เกิน 80 ตัวอักษร");
    if (
      a.art.kind === "painting" &&
      (!a.art.image?.startsWith("data:image/png;base64,") ||
        a.art.image.length >= 400000)
    )
      return fail("ภาพไม่ถูกต้อง");
    if (a.art.kind === "sculpture" && !validParts(a.art.parts))
      return fail("เพิ่มรูปทรง 1–16 ชิ้นในขอบเขตที่กำหนด");
    if (
      a.art.kind === "model" &&
      (!validModelPaint(a.art) ||
        (a.art.image &&
          (!a.art.image.startsWith("data:image/png;base64,") ||
            a.art.image.length >= 400000)))
    )
      return fail("เลือกโมเดลและระบายสีก่อนบันทึก");
    if (!["painting", "sculpture", "model"].includes(a.art.kind))
      return fail("รูปแบบผลงานไม่ถูกต้อง");
    if (a.art.kind === "painting") s.energy = Math.max(0, s.energy - 15);
    else if (!energy(15)) return fail("ต้องใช้พลังงาน 15 หน่วย");
    s.artworks.push({
      ...a.art,
      id: crypto.randomUUID(),
      price: ART_PRICES[a.art.kind],
    });
    s.artDay.used++;
    return ok("บันทึกผลงานในสตูดิโอแล้ว");
  }
  if (a.type === "sellArt") {
    const i = s.artworks.findIndex((x) => x.id === a.id);
    if (i < 0) return fail("ไม่พบผลงาน");
    const price = s.artworks[i].price;
    earn(price);
    s.artworks.splice(i, 1);
    return ok(`ขายงานศิลปะ +${price} เหรียญ`);
  }
  return fail("ไม่พบกิจกรรม");
}
function nextDay(s: GameState, rng: () => number, rested = true) {
  s.day++;
  s.artDay = rollArtDay(rng);
  s.time = 360;
  s.energy = rested ? s.maxEnergy : Math.floor(s.maxEnergy * 0.6);
  s.weather = rng() < 0.3 ? "rain" : "sunny";
  s.farm.forEach((p) => {
    if (p.seed) {
      if (p.watered) p.age = Math.min(flower(p.seed).days, p.age + 1);
      p.watered = s.weather === "rain";
    }
  });
  s.order = {
    flower: FLOWERS[(s.day - 1) % FLOWERS.length].id,
    fulfilled: false,
  };
  s.position = { x: 13, z: 2, yaw: -Math.PI / 2 };
}
// Preserve existing farms, inventory, artwork and historical sale values.
export function migrateSave(value: any): unknown {
  if (value?.version === 1) {
    if (![12,20].includes(value.farm?.length) || value.farm.length !== 12 + value.upgrades?.farmLevel * 8) return null;
    value={...value,version:2,artDay:{mood:"calm",limit:1,used:0},upgrades:{...value.upgrades,farmLevel:value.farm.length===20?5:3,wateringLevel:0}};
  }
  if (value?.version === 2) value={...value,version:3,upgrades:{...value.upgrades,rodLevel:0,homeLevel:0}};
  if(value?.version === 3) return {...value,version:4,home:{style:"original",ownedStyles:["original"],garden:false,pond:false,fish:[]}};
  return value;
}
let loadMessage = "";
function load(): GameState {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (raw) {
      const parsed = migrateSave(JSON.parse(raw));
      if (validateSave(parsed)) return parsed;
      loadMessage = "ไฟล์บันทึกไม่สมบูรณ์ เริ่มเกมใหม่โดยเก็บข้อมูลเดิมไว้";
    }
  } catch {
    loadMessage = "อ่านข้อมูลบันทึกไม่ได้";
  }
  return initialState();
}
let state = typeof localStorage === "undefined" ? initialState() : load();
const listeners = new Set<() => void>();
export const getState = () => state;
export const subscribe = (fn: () => void) => {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
};
export const useGame = () => useSyncExternalStore(subscribe, getState);
export function save() {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(state));
    return true;
  } catch {
    return false;
  }
}
const activityListeners = new Set<(a: Action, r: Result) => void>();
export function onActivity(fn: (a: Action, r: Result) => void) { activityListeners.add(fn); return () => {activityListeners.delete(fn);}; }
export function dispatch(a: Action) {
  const r = transition(state, a);
  if (r.ok) {
    state = r.state;
    listeners.forEach((fn) => fn());
    if (!["tick", "run", "start"].includes(a.type)) activityListeners.forEach(fn => fn(a,r));
    if (a.type !== "tick" && a.type !== "run") save();
  }
  return r;
}
export function updatePosition(x: number, z: number, yaw: number) {
  state.position = { x, z, yaw };
}
export const getLoadMessage = () => loadMessage;

// Deliberately available only for isolated development saves, never normal play.
export function setQAState(next: GameState) {
  if (!import.meta.env.DEV || typeof location === 'undefined' || !new URLSearchParams(location.search).has('qa') || !validateSave(next)) return false;
  state = structuredClone(next);
  listeners.forEach(fn=>fn());
  save();
  return true;
}
