import { useSyncExternalStore } from "react";
import { FLOWERS, FISH, flower, type FlowerId } from "./data";
import {validModelPaint,type PaintModelId} from "./models";
export type Plot = { seed: FlowerId | null; age: number; watered: boolean };
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
  colors?: Record<string,string>;
  name: string;
  price: number;
  image?: string;
  parts?: SculpturePart[];
};
export type Bouquet = { id: string; flowers: FlowerId[]; price: number };
export type GameState = {
  version: 1;
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
  upgrades: { farmLevel: number; energyLevel: number };
  decorations: number;
  restAt: number;
  order: { flower: FlowerId; fulfilled: boolean };
  stats: { harvested: number; fish: number; earned: number };
  started: boolean;
  position: { x: number; z: number; yaw: number };
};
export const SAVE_KEY = "flower-valley-save-v1" + (typeof location!=="undefined" && import.meta.env.DEV && new URLSearchParams(location.search).has("qa") ? "-qa" : "");
export const initialState = (): GameState => ({
  version: 1,
  day: 1,
  time: 480,
  weather: "sunny",
  money: 500,
  energy: 100,
  maxEnergy: 100,
  inventory: {},
  farm: Array.from({ length: 12 }, () => ({
    seed: null,
    age: 0,
    watered: false,
  })),
  bouquets: [],
  artworks: [],
  upgrades: { farmLevel: 0, energyLevel: 0 },
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
    v?.version === 1 &&
    finite(v.day, 1, 1e7) &&
    finite(v.time, 360, 1440) &&
    ["sunny", "rain"].includes(v.weather) &&
    finite(v.money, 0, 1e12) &&
    finite(v.maxEnergy, 100, 160) &&
    finite(v.energy, 0, v.maxEnergy) &&
    typeof v.started === "boolean" &&
    finite(v.upgrades?.farmLevel, 0, 1) &&
    finite(v.upgrades?.energyLevel, 0, 3) &&
    v.maxEnergy === 100 + v.upgrades.energyLevel * 20 &&
    Array.isArray(v.farm) &&
    v.farm.length === 12 + v.upgrades.farmLevel * 8 &&
    v.farm.every(
      (p: any) =>
        (p.seed === null || validId(p.seed)) &&
        finite(p.age, 0, 100) &&
        typeof p.watered === "boolean",
    ) &&
    v.inventory &&
    typeof v.inventory === "object" &&
    !Array.isArray(v.inventory) &&
    Object.entries(v.inventory).every(
      ([k, n]) =>
        (validId(k) ||
          (k.startsWith("seed:") && validId(k.slice(5))) ||
          FISH.some((f) => f.id === k)) &&
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
        b.price ===
          Math.round(
            b.flowers.reduce(
              (s: number, id: string) => s + flower(id).sell,
              0,
            ) * 1.25,
          ),
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
          (a.kind === "sculpture" && validParts(a.parts)) || (a.kind === "model" && validModelPaint(a) && (!a.image || (a.image.startsWith("data:image/png;base64,") && a.image.length<400000)))),
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
    p.watered = s.weather === "rain";
    return ok(`ปลูก${f.name}แล้ว อย่าลืมรดน้ำทุกวัน`);
  }
  if (a.type === "water") {
    const p = s.farm[a.index ?? -1];
    if (!p?.seed) return fail("แปลงนี้ยังว่าง");
    if (p.watered) return fail("วันนี้ดินชุ่มน้ำแล้ว");
    if (!energy(3)) return fail("พลังงานไม่พอ");
    p.watered = true;
    return ok("รดน้ำแล้ว ดอกไม้จะเติบโตในวันถัดไป");
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
      fish = FISH.find((f) => f.id === a.id);
    if ((!f && !fish) || !a.id || !(s.inventory[a.id] > 0))
      return fail("ไม่มีสินค้านี้ในกระเป๋า");
    add(a.id, -1);
    const value = f?.sell ?? fish!.price;
    earn(value);
    return ok(`ขายแล้ว +${value} เหรียญ`);
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
    if (!energy(1)) return fail("เหนื่อยแล้ว");
    return ok("");
  }
  if (a.type === "cast") {
    if (!energy(10)) return fail("ต้องใช้พลังงาน 10 หน่วย");
    return ok("หย่อนเบ็ดแล้ว รอปลากินเหยื่อ…");
  }
  if (a.type === "catch") {
    const roll = rng(),
      f = FISH[roll < 0.65 ? 0 : roll < 0.93 ? 1 : 2];
    add(f.id, 1);
    s.stats.fish++;
    return ok(`จับ${f.name}ได้!`);
  }
  if (a.type === "upgradeEnergy") {
    if (s.upgrades.energyLevel >= 3) return fail("อัปเกรดพลังงานเต็มแล้ว");
    const cost = 300 * (s.upgrades.energyLevel + 1);
    if (!spend(cost)) return fail("เงินไม่พอ");
    s.upgrades.energyLevel++;
    s.maxEnergy += 20;
    s.energy += 20;
    return ok("พลังงานสูงสุดเพิ่มขึ้น 20");
  }
  if (a.type === "upgradeFarm") {
    if (s.upgrades.farmLevel >= 1) return fail("ขยายแปลงสูงสุดแล้ว");
    if (!spend(400)) return fail("ต้องใช้ 400 เหรียญ");
    s.upgrades.farmLevel = 1;
    s.farm.push(
      ...Array.from({ length: 8 }, () => ({
        seed: null,
        age: 0,
        watered: false,
      })),
    );
    return ok("เพิ่มแปลงปลูก 8 แปลงแล้ว");
  }
  if (a.type === "decorate") {
    if (s.decorations >= 6) return fail("ของตกแต่งครบแล้ว");
    if (!spend(100)) return fail("ต้องใช้ 100 เหรียญ");
    s.decorations++;
    return ok("เพิ่มกระถางดอกไม้ที่ทางเข้าบ้านแล้ว");
  }
  if (a.type === "art") {
    if (s.artworks.length >= 24) return fail("สตูดิโอเต็มแล้ว ขายผลงานก่อน");
    if (!a.art || !a.art.name.trim() || a.art.name.length > 80)
      return fail("ตั้งชื่อผลงานไม่เกิน 80 ตัวอักษร");
    if (
      a.art.kind === "painting" &&
      (!a.art.image?.startsWith("data:image/png;base64,") ||
        a.art.image.length > 400000)
    )
      return fail("ภาพไม่ถูกต้อง");
    if (a.art.kind === "sculpture" && !validParts(a.art.parts))
      return fail("เพิ่มรูปทรง 1–16 ชิ้นในขอบเขตที่กำหนด");
    if(a.art.kind==="model" && (!validModelPaint(a.art) || (a.art.image && (!a.art.image.startsWith("data:image/png;base64,")||a.art.image.length>=400000)))) return fail("เลือกโมเดลและระบายสีก่อนบันทึก");
    if (!["painting", "sculpture", "model"].includes(a.art.kind))
      return fail("รูปแบบผลงานไม่ถูกต้อง");
    if (!energy(15)) return fail("ต้องใช้พลังงาน 15 หน่วย");
    s.artworks.push({
      ...a.art,
      id: crypto.randomUUID(),
      price:
        a.art.kind === "painting"
          ? 100
          : a.art.kind === "model" ? 140 : 80 + Math.min(16, a.art.parts!.length) * 15,
    });
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
  s.time = 360;
  s.energy = rested ? s.maxEnergy : Math.floor(s.maxEnergy * .6);
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
let loadMessage = "";
function load(): GameState {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
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
export function dispatch(a: Action) {
  const r = transition(state, a);
  if (r.ok) {
    state = r.state;
    listeners.forEach((fn) => fn());
    if (a.type !== "tick" && a.type !== "run") save();
  }
  return r;
}
export function updatePosition(x: number, z: number, yaw: number) {
  state.position = { x, z, yaw };
}
export const getLoadMessage = () => loadMessage;
