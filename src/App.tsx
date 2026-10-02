import { HOME_STYLES } from "./game/home";
import { FARM_SIZES, FARM_COSTS, WATERING_COSTS, HOME_COSTS, moodName } from "./game/balance";
import { SaleRow } from "./components/SaleRow";
import { useEffect, useRef, useState } from "react";
import {
  ArrowUpRight,
  Backpack,
  BookOpen,
  ChevronRight,
  CloudRain,
  Coins,
  Compass,
  Flower2,
  Leaf,
  Map as MapIcon,
  Maximize2,
  Moon,
  Plus,
  Save,
  Settings,
  Shovel,
  Sun,
  Volume2,
  VolumeX,
  X,
  Zap,
} from "lucide-react";
import { World } from "./components/World";
import { Painting, Sculpture } from "./components/Workshop";
import { Fishing } from "./components/Fishing";
import { Grilling } from "./components/Grilling";
import { ItemIcon } from "./components/ItemIcon";
import { SleepTransition } from "./components/SleepTransition";
import {
  FOODS, FERTILIZERS, RODS, TRASH,
  FLOWERS,
  FISH,
  GRILLED_FISH, EDIBLES,
  flower,
  itemName,
  ZONES,
  type FlowerId,
} from "./game/data";
import {
  dispatch,
  onActivity,
  useGame,
  getState,
  save,
  getLoadMessage,
  REST_MINUTES,
  type Action,
  type Artwork,
} from "./game/engine";
import { bridge, type Target } from "./world/bridge";
import { setSound, setMusic, setVolume, chime } from "./game/audio";
const clock = (time: number) =>
  `${Math.floor(time / 60)
    .toString()
    .padStart(2, "0")}:${Math.floor(time % 60)
    .toString()
    .padStart(2, "0")}`;
type Modal = { kind: string; index?: number; name?: string };
export default function App() {
  const s = useGame(),
    [ready, setReady] = useState(false),
    [modal, setModal] = useState<Modal | null>(null),
    [target, setTarget] = useState<Target | null>(null),
    [zone, setZone] = useState("FLOWER VALLEY"),
    [toast, setToast] = useState(""),
    [sound, setSoundEnabled] = useState(false),
    [quality, setQuality] = useState(
      matchMedia("(pointer:coarse)").matches ? "low" : "high",
    ),
    [music, setMusicEnabled] = useState(true),
    [volume, setVolumeValue] = useState(0.5),
    [selectedSeed, setSelectedSeed] = useState<FlowerId>(() => { try { const id = localStorage.getItem("flower-valley-selected-seed"); return FLOWERS.find(f => f.id === id)?.id ?? "daisy"; } catch { return "daisy"; } }),
    [bouquet, setBouquet] = useState<FlowerId[]>([]),
    [mapPos, setMapPos] = useState(bridge.position),
    [savedAt, setSavedAt] = useState("บันทึกอัตโนมัติ"),
    [touch, setTouch] = useState(matchMedia("(pointer:coarse)").matches),
    [fullscreen, setFullscreen] = useState(false);
  const [night, setNight] = useState<Action | null>(null);
  const nightRef = useRef(false);
  const beginNight = (action: Action) => {
    if (nightRef.current) return;
    nightRef.current = true;
    bridge.paused = true;
    bridge.keys.clear();
    bridge.move = { x: 0, y: 0 };
    document.exitPointerLock?.();
    setNight(action);
  };
  const finishNight = (message: string) => {
    nightRef.current = false;
    sitReturn.current = null;
    bridge.sitting = false;
    setModal(null);
    setNight(null);
    notify(message);
  };
  const sitReturn = useRef<{ x: number; z: number; yaw: number } | null>(null);

  useEffect(() => { try {localStorage.setItem("flower-valley-selected-seed",selectedSeed);} catch { /* Preference is optional. */ } },[selectedSeed]);
  const modalRef = useRef(modal);
  modalRef.current = modal;
  const toastTimer = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );
  const notify = (message: string) => {
    if (!message) return;
    setToast(message);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(""), 4400);
  };
  const act = (a: Action) => {
    const r = dispatch(a);
    notify(r.message);

    return r.ok;
  };
  const close = () => {
    if (nightRef.current) return;
    setModal(null);
    if (sitReturn.current) {
      bridge.teleport = sitReturn.current;
      sitReturn.current = null;
    }
    bridge.sitting = false;
    bridge.keys.clear();
  };
  const open = (m: Modal) => {
    if (nightRef.current) return;
    document.exitPointerLock?.();
    bridge.keys.clear();
    bridge.move = { x: 0, y: 0 };
    setModal(m);
  };
  const interact = () => {
    const t = bridge.target;
    if (!t || nightRef.current || modalRef.current || !getState().started)
      return;
    if (t.kind === "rest") {
      sitReturn.current = { ...bridge.position };
      bridge.teleport = { x: 7, z: -9.4, yaw: 0 };
      bridge.sitting = true;
    }
    open({ kind: t.kind, index: t.index, name: t.name });
  };
  useEffect(() => {
    const stopSound = onActivity(a => chime(a.type));
    bridge.onReady = () => setReady(true);
    bridge.onError = notify;
    bridge.onTarget = setTarget;
    bridge.onZone = setZone;
    const scene: any = document.querySelector("[flower-world]");
    if (scene?.components?.["flower-world"]?.sky) setReady(true);
    if (getLoadMessage()) notify(getLoadMessage());
    return () => {
      stopSound();
      bridge.onReady = () => {};
      bridge.onTarget = () => {};
      bridge.onZone = () => {};
      clearTimeout(toastTimer.current);
    };
  }, []);
  useEffect(() => {
    bridge.paused = !!modal || !!night || !s.started;
    bridge.quality = quality;
    if (bridge.paused) {
      bridge.keys.clear();
      bridge.move = { x: 0, y: 0 };
      bridge.look = { x: 0, y: 0 };
    }
  }, [modal, night, s.started, quality]);
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (nightRef.current) return;
      if (
        (e.target as HTMLElement)?.matches("input,textarea,select") &&
        e.code !== "Escape"
      )
        return;
      if (
        [
          "KeyW",
          "KeyA",
          "KeyS",
          "KeyD",
          "Space",
          "ArrowUp",
          "ArrowDown",
        ].includes(e.code)
      )
        e.preventDefault();
      if (e.code === "Escape") {
        if (modalRef.current) close();
        else if (getState().started) open({ kind: "pause" });
        return;
      }
      if (e.code === "Space" && !e.repeat && getState().started) {
        const m=modalRef.current, t=bridge.target;
        const index=m?.kind==="plot" ? m.index : !m && t?.kind==="plot" ? t.index : undefined;
        if (index !== undefined) { act({type:"water",index}); return; }
      }
      if (modalRef.current || !getState().started) return;
      bridge.keys.add(e.code);
      if (!e.repeat) {
        if (e.code === "KeyE") interact();
        if (e.code === "KeyQ" && bridge.target?.kind === "plot") open({kind:"plot",index:bridge.target.index});
        if (e.code === "KeyI") open({ kind: "inventory" });
        if (e.code === "KeyM") open({ kind: "map" });
        if (e.code === "KeyB") open({ kind: "encyclopedia" });
      }
    };
    const up = (e: KeyboardEvent) => bridge.keys.delete(e.code);
    const blur = () => {
      bridge.keys.clear();
      bridge.move = { x: 0, y: 0 };
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    window.addEventListener("blur", blur);
    const visibility = () => {
      blur();
      if (document.hidden) {
        save();
        if (getState().started) setModal((m) => m ?? { kind: "pause" });
      }
    };
    document.addEventListener("visibilitychange", visibility);
    window.addEventListener("pagehide", save);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      window.removeEventListener("blur", blur);
      window.removeEventListener("pagehide", save);
      document.removeEventListener("visibilitychange", visibility);
    };
  }, []);
  useEffect(() => {
    const t = setInterval(() => {
      if (!getState().started || document.hidden) return;
      if (!bridge.paused) {
        if (getState().time + 2 >= 1440) {
          beginNight({ type: "tick", amount: 2 });
          return;
        }
        const r = dispatch({ type: "tick", amount: 2 });
        if (r.message) notify(r.message);

      }
    }, 1000);
    const saver = setInterval(() => {
      if (getState().started)
        setSavedAt(
          save() ? "บันทึกแล้ว " + clock(getState().time) : "พื้นที่บันทึกเต็ม",
        );
    }, 15000);
    const pos = setInterval(() => setMapPos({ ...bridge.position }), 250);
    return () => {
      clearInterval(t);
      clearInterval(saver);
      clearInterval(pos);
    };
  }, []);
  useEffect(() => {
    const mq = matchMedia("(pointer:coarse)"),
      change = () => setTouch(mq.matches);
    mq.addEventListener("change", change);
    const f = () => setFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", f);
    return () => {
      mq.removeEventListener("change", change);
      document.removeEventListener("fullscreenchange", f);
    };
  }, []);
  const finish = (art: Omit<Artwork, "id" | "price">) =>
    act({ type: "art", art });
  const totalSeeds = Object.entries(s.inventory)
      .filter(([id]) => id.startsWith("seed:"))
      .reduce((n, [, v]) => n + v, 0),
    totalFlowers = FLOWERS.reduce((n, f) => n + (s.inventory[f.id] || 0), 0),
    planted = s.farm.filter((p) => p.seed).length;
  const quest = s.stats.harvested
    ? "ค่อย ๆ เติบโตไปด้วยกัน"
    : planted
      ? "ดูแลสวนดอกไม้แรกของคุณ"
      : totalSeeds
        ? "เริ่มต้นสวนเล็ก ๆ ของคุณ"
        : "แวะทักทายลิลลี่";
  const questDetail = s.stats.harvested
    ? "จัดช่อดอกไม้ ส่งออร์เดอร์ แล้วขยายสวนในแบบคุณ"
    : planted
      ? "รดน้ำแปลงทุกวัน แล้วนอนที่บ้านเมื่อถึงกลางคืน"
      : totalSeeds
        ? "เดินเข้าประตูสวน เลือกแปลงว่างแล้วกด E เพื่อปลูก"
        : "ซื้อเมล็ดเดซี่จากร้านทางซ้ายของถนน เริ่มต้นที่ 10 เหรียญ";
  function content() {
    if (!modal) return null;
    switch (modal.kind) {
      case "food":
        return <><p className="dialogue">“อาหารอุ่น ๆ ช่วยเติมแรงให้วันของคุณ” — โนรา</p><p className="recipe-summary">พลังงาน {s.energy}/{s.maxEnergy} · ซื้อเก็บในกระเป๋า กินเมื่อไรก็ได้</p><div className="shop-grid">{FOODS.map(f=><article className="product food-product" key={f.id}><ItemIcon id={f.id} size={100}/><h3>{f.name}</h3><strong>+{f.energy} พลังงาน</strong><p>มี {s.inventory[f.id]||0} ชิ้น</p><button disabled={s.money<f.price} onClick={()=>act({type:"buyFood",id:f.id})}>{s.money<f.price?`ขาด ${f.price-s.money} เหรียญ`:`ซื้อ · ${f.price} ◉`}</button><button className="secondary" disabled={!s.inventory[f.id] || s.energy>=s.maxEnergy} onClick={()=>act({type:"eatFood",id:f.id})}>{s.energy>=s.maxEnergy?"พลังงานเต็ม":"กินตอนนี้"}</button></article>)}</div></>;
      case "seed":
        return (
          <>
            <p className="dialogue">
              “สวนที่สวยงามเริ่มจากเมล็ดเล็ก ๆ เพียงเมล็ดเดียว”{" "}
              <span>— ลิลลี่</span>
            </p>
            <p className="subtle">ใส่ปุ๋ยได้ 1 ถุงต่อรอบปลูก · ระดับสูงคุ้มค่าต่อวันที่เร่งขึ้น · เลือกให้พอดีกับวันที่เหลือก่อนโตเต็มที่</p><div className="fertilizer-shop">{FERTILIZERS.map(f=><button className="secondary" key={f.id} disabled={s.money<f.price} onClick={()=>act({type:"buyFertilizer",id:f.id})}><ItemIcon id={f.id} size={56}/><b>{f.name}</b><span>เร่งโต {f.days} วัน · {f.price} ◉ ({f.price/f.days} ◉/วัน)</span><small>มี {s.inventory[f.id] || 0} ถุง</small></button>)}</div>
            <p className="subtle">ปุ๋ยใช้ได้ครั้งเดียวต่อการปลูก เลือกระดับให้เหมาะกับวันที่เหลือ</p>
            <div className="shop-grid">
              {FLOWERS.map((f) => (
                <article className="product" key={f.id}>
                  <div
                    className="flower-art"
                    style={{ "--flower": f.color } as React.CSSProperties}
                  >
                    <ItemIcon id={"seed:" + f.id} size={100} />
                  </div>
                  <div>
                    <small>{f.en.toUpperCase()}</small>
                    <h3>{f.name}</h3>
                    <p>
                      {f.days} วัน • ขาย {f.sell} เหรียญ
                    </p>
                    <div className="product-footer">
                      <b>
                        <Coins size={15} /> {f.seed}
                      </b>
                      <button
                        disabled={s.money < f.seed}
                        onClick={() => act({ type: "buy", id: f.id })}
                      >
                        <Plus size={15} /> ซื้อเมล็ด
                      </button>
                    </div>
                    <small>
                      ในกระเป๋า {s.inventory["seed:" + f.id] || 0} เมล็ด
                    </small>
                  </div>
                </article>
              ))}
            </div>
          </>
        );
      case "plot": {
        const p = s.farm[modal.index!];
        if (!p) return null;
        return (
          <>
            <div className="plot-hero">
              <ItemIcon id={p.seed || "seed:daisy"} size={80} />
              <h3>
                {p.seed ? flower(p.seed).name : `แปลงที่ ${modal.index! + 1}`}
              </h3>
              <p>
                {p.seed
                  ? `${p.age} / ${flower(p.seed).days} วันเติบโต • ${p.watered ? "ดินชุ่มน้ำแล้ว" : "ต้องการน้ำ"}`
                  : "ดินพร้อมแล้ว เลือกเมล็ดพันธุ์เพื่อเริ่มต้น"}
              </p>
            </div>
            <p className="subtle">เลือกเมล็ดแล้วกดปลูก · Space รดน้ำ · เก็บดอกไม้เมื่อโตเต็มที่</p>
            {p.seed ? (
              <>
                <div className="progress">
                  <i
                    style={{ width: (p.age / flower(p.seed).days) * 100 + "%" }}
                  />
                </div>
                <div className="form-row">
                  <button
                    disabled={p.watered || p.age >= flower(p.seed).days}
                    onClick={() => act({ type: "water", index: modal.index })}
                  >
                    <ItemIcon id="watering-can" size={28} /> รดน้ำ [Space] −3 ⚡
                  </button>
                  <button
                    disabled={p.age < flower(p.seed).days}
                    onClick={() => act({ type: "harvest", index: modal.index })}
                  >
                    ✂ เก็บดอกไม้ −5 ⚡
                  </button>
                </div>
                <div className="fertilizer-shop">{FERTILIZERS.map(f=><button key={f.id} className="secondary" disabled={p.fertilized || p.age>=flower(p.seed!).days || !(s.inventory[f.id]>0)} onClick={()=>act({type:"fertilize",id:f.id,index:modal.index})}><ItemIcon id={f.id} size={44}/>{f.name}<small>โต +{Math.min(f.days,flower(p.seed!).days-p.age)} วัน · เหลือ {s.inventory[f.id]||0}</small></button>)}</div>
                {p.fertilized && <p className="subtle">ใส่ปุ๋ยให้การปลูกรอบนี้แล้ว</p>}
                <p className="subtle">
                  เติบโตหนึ่งขั้นเมื่อเริ่มวันใหม่ หากรดน้ำในวันก่อนหน้า
                  ดอกไม้ที่โตเต็มที่แล้วจะรอให้คุณเก็บ
                </p>
              </>
            ) : (
              <>
                <div className="seed-options">
                  {FLOWERS.map((f) => (
                    <button
                      className={selectedSeed === f.id ? "chosen" : "secondary"}
                      key={f.id}
                      onClick={() => setSelectedSeed(f.id)}
                    >
                      <ItemIcon id={"seed:" + f.id} /> {f.name}
                      <span>×{s.inventory["seed:" + f.id] || 0}</span>
                    </button>
                  ))}
                </div>
                <button
                  className="wide"
                  disabled={
                    !(s.inventory["seed:" + selectedSeed] > 0) || s.energy < 5
                  }
                  onClick={() =>
                    act({ type: "plant", id: selectedSeed, index: modal.index })
                  }
                >
                  ปลูก{flower(selectedSeed).name} <span>−5 ⚡</span>
                </button>
              </>
            )}
          </>
        );
      }
      case "inventory":
        return (
          <>
            <div className="inventory-summary">
              <span>
                เมล็ดพันธุ์ <b>{totalSeeds}</b>
              </span>
              <span>
                ดอกไม้ <b>{totalFlowers}</b>
              </span>
              <span>
                ช่อดอกไม้ <b>{s.bouquets.length}</b>
              </span>
            </div>
            <div className="item-list">
              {Object.entries(s.inventory)
                .filter(([, n]) => n > 0)
                .map(([id, n]) => (
                  <div key={id}>
                    <span>
                      <ItemIcon id={id} /> {itemName(id)}
                    </span>
                    <b>× {n}</b>
                    {EDIBLES.some(f=>f.id===id) && <button disabled={s.energy>=s.maxEnergy} onClick={()=>act({type:"eatFood",id})}>กิน · +{EDIBLES.find(f=>f.id===id)!.energy} พลังงาน</button>}
                  </div>
                ))}
              {!Object.values(s.inventory).some((n) => n > 0) && (
                <p className="empty">
                  กระเป๋ายังว่างอยู่ แวะซื้อเมล็ดแล้วเริ่มปลูกกัน
                </p>
              )}
              {s.bouquets.map((b, i) => (
                <div key={b.id}>
                  <span>
                    <ItemIcon id="bouquet" /> ช่อที่ {i + 1} ·{" "}
                    {b.flowers.map((id) => flower(id).name).join(", ")}
                  </span>
                  <b>{b.price} ◉</b>
                </div>
              ))}
              {s.artworks.map((a) => (
                <div key={a.id}>
                  <span>🎨 {a.name}</span>
                  <b>{a.price} ◉</b>
                </div>
              ))}
            </div>
          </>
        );
      case "sell":
      case "fish":
      case "general":
        return (
          <>
            <p className="dialogue">
              {modal.kind === "general" ? "“ของที่เก็บมาอาจมีค่า แวะเอามาให้ผมดูได้นะ” — โรวัน" : modal.kind === "fish"
                ? "“ทะเลสาบมีของขวัญให้คนที่ใจเย็นเสมอ” — ฟินน์"
                : "“ดอกไม้จากสวนของคุณจะทำให้ใครบางคนยิ้มได้” — เมย์"}
            </p>
            {modal.kind === "fish" && <div className="recipe-summary"><ItemIcon id={"rod:"+s.upgrades.rodLevel} size={54}/><b>{RODS[s.upgrades.rodLevel].name}</b><p>ปลาหายาก {Math.round(RODS[s.upgrades.rodLevel].rare*100)}% · ขยะ {Math.round(RODS[s.upgrades.rodLevel].trash*100)}%</p><button disabled={s.upgrades.rodLevel>=2 || s.money<(RODS[s.upgrades.rodLevel+1]?.price ?? 0)} onClick={()=>act({type:"upgradeRod"})}>{s.upgrades.rodLevel>=2 ? "เบ็ดระดับสูงสุดแล้ว" : `ซื้อ${RODS[s.upgrades.rodLevel+1].name} · ${RODS[s.upgrades.rodLevel+1].price} ◉`}</button></div>}
            {modal.kind === "general" && <p className="subtle">รับซื้อของจิปาถะที่ตกได้จากทะเลสาบ ส่วนของป่าจะเพิ่มในระบบเก็บของภายหลัง</p>}
            <div className="item-list">
              {(modal.kind === "general" ? TRASH : modal.kind === "fish"
                ? [...FISH, ...GRILLED_FISH]
                : FLOWERS
              ).map((f) => (
                <SaleRow key={f.id} id={f.id} name={f.name} count={s.inventory[f.id] || 0} price={"price" in f ? f.price : f.sell} act={act} />
              ))}
            </div>
            {modal.kind === "sell" && (
              <>
                <h3>ช่อดอกไม้ของคุณ</h3>
                {!s.bouquets.length && (
                  <p className="subtle">
                    ใช้โต๊ะในบ้านหรือข้างร้านจัดช่อดอกไม้เพื่อเพิ่มมูลค่า 25%
                  </p>
                )}
                {s.bouquets.map((b) => (
                  <div className="order-row" key={b.id}>
                    <span>
                      <ItemIcon id="bouquet" />{" "}
                      {b.flowers.map((id, i) => (
                        <ItemIcon key={i} id={id} size={28} />
                      ))}
                    </span>
                    <button
                      onClick={() => act({ type: "sellBouquet", id: b.id })}
                    >
                      ขาย +{b.price} ◉
                    </button>
                  </div>
                ))}
              </>
            )}
          </>
        );
      case "bouquet":
        return (
          <>
            <p className="subtle">
              เลือกดอกไม้ 3 ดอก จะใช้ชนิดเดียวกันหรือผสมก็ได้ มูลค่าช่อ =
              ราคาดอกไม้รวม × 1.25
            </p>
            <div className="bouquet-slots">
              {[0, 1, 2].map((i) => (
                <button
                  className="secondary"
                  key={i}
                  aria-label={`ดอกที่ ${i + 1} คลิกเพื่อนำออก`}
                  onClick={() => setBouquet(bouquet.filter((_, j) => j !== i))}
                >
                  {bouquet[i] ? <ItemIcon id={bouquet[i]} size={64} /> : "＋"}
                </button>
              ))}
            </div>
            <div className="seed-options">
              {FLOWERS.map((f) => (
                <button
                  key={f.id}
                  className="secondary"
                  disabled={
                    bouquet.length >= 3 ||
                    (s.inventory[f.id] || 0) <=
                      bouquet.filter((id) => id === f.id).length
                  }
                  onClick={() => setBouquet([...bouquet, f.id])}
                >
                  <ItemIcon id={f.id} /> {f.name}
                  <span>
                    เหลือ{" "}
                    {(s.inventory[f.id] || 0) -
                      bouquet.filter((id) => id === f.id).length}
                  </span>
                </button>
              ))}
            </div>
            <div className="recipe-summary">
              {FLOWERS.filter(f => bouquet.includes(f.id)).map(f => { const used = bouquet.filter(id => id === f.id).length; return <p key={f.id}>{f.name}: ใช้ {used} / มี {s.inventory[f.id] || 0} → เหลือ {(s.inventory[f.id] || 0) - used}</p>; })}
              <p>ขายแยก {bouquet.reduce((n,id) => n + flower(id).sell,0)} ◉ → จัดช่อ {Math.round(bouquet.reduce((n,id) => n + flower(id).sell,0)*1.25)} ◉</p>
              <strong>มูลค่าเพิ่ม +{Math.round(bouquet.reduce((n,id) => n + flower(id).sell,0)*1.25) - bouquet.reduce((n,id) => n + flower(id).sell,0)} ◉ โดยไม่เสียเงินเพิ่ม</strong>
            </div>
            <button
              className="wide"
              disabled={bouquet.length !== 3}
              onClick={() => {
                if (act({ type: "bouquet", flowers: bouquet })) setBouquet([]);
              }}
            >
              จัดช่อดอกไม้ ·{" "}
              {Math.round(
                bouquet.reduce((n, id) => n + flower(id).sell, 0) * 1.25,
              )}{" "}
              ◉
            </button>
          </>
        );
      case "customer":
        return (
          <>
            <p className="dialogue">
              “วันนี้ฉันอยากได้ช่อดอกไม้ที่มี{flower(s.order.flower).name}
              สักช่อค่ะ” <span>— เอ็มม่า</span>
            </p>
            <div className="order-badge">
              <ItemIcon id={s.order.flower} size={72} />
              <h3>
                {s.order.fulfilled
                  ? "ส่งออร์เดอร์วันนี้แล้ว ขอบคุณนะ!"
                  : `ช่อดอกไม้ที่มี${flower(s.order.flower).name}`}
              </h3>
              <p>รับราคาขายช่อดอกไม้ + โบนัส 50 เหรียญ</p>
            </div>
            {!s.order.fulfilled &&
              s.bouquets.map((b) => (
                <div className="order-row" key={b.id}>
                  <span>
                    {b.flowers.map((id, i) => (
                      <ItemIcon key={i} id={id} />
                    ))}
                  </span>
                  <button
                    disabled={!b.flowers.includes(s.order.flower)}
                    onClick={() => act({ type: "order", id: b.id })}
                  >
                    ส่งออร์เดอร์ +{b.price + 50} ◉
                  </button>
                </div>
              ))}
            {!s.bouquets.length && !s.order.fulfilled && (
              <p className="empty">
                จัดช่อดอกไม้ที่โต๊ะในบ้านหรือข้างร้าน แล้วนำกลับมาส่งให้เอ็มม่า
              </p>
            )}
          </>
        );
      case "grill":
        return <Grilling notify={notify} />;
      case "fishing":
        return <Fishing notify={notify} />;
      case "sleep":
        return (
          <div className="sleep-panel">
            <Moon size={54} strokeWidth={1} />
            <h3>บ้านคือที่พักใจ</h3>
            <p>ตอนนี้ {clock(s.time)} น. • นอนได้ตั้งแต่ 20:00 น.</p>
            <p className="subtle">
              นอนก่อนเที่ยงคืน ตื่น 06:00 น. พร้อมพลังงานเต็ม
              หากอยู่ถึงเที่ยงคืนจะถูกบังคับให้นอน และฟื้นพลังงานเพียง 60%
            </p>
            {s.time < 1200 && (
              <button
                className="secondary wide"
                onClick={() => act({ type: "tick", amount: 1200 - s.time })}
              >
                พักผ่อนจนถึง 20:00 น.
              </button>
            )}
            <button
              className="wide"
              disabled={s.time < 1200}
              onClick={() => beginNight({ type: "sleep" })}
            >
              นอนหลับและเริ่มวันใหม่
            </button>
          </div>
        );
      case "rest":
        return (
          <div className="sleep-panel">
            <Leaf size={52} strokeWidth={1} />
            <h3>ให้ตัวเองได้พักสักครู่</h3>
            <p>
              พลังงาน {s.energy} / {s.maxEnergy}
            </p>
            <p className="subtle">
              นั่งพักแต่ละครั้งใช้เวลา 30 นาทีในเกม และฟื้นพลังงานสูงสุด 20
              หน่วย หากพักจนถึงเที่ยงคืนจะเผลอหลับ และตื่นพร้อมพลังงาน 60%
            </p>
            <button
              className="wide"
              disabled={s.energy >= s.maxEnergy}
              onClick={() => {
                if (s.time + REST_MINUTES >= 1440) beginNight({ type: "rest" });
                else act({ type: "rest" });
              }}
            >
              นั่งพัก 30 นาที · +20 พลังงาน
            </button>
            <button className="secondary wide" onClick={close}>
              ลุกจากท่อนไม้
            </button>
          </div>
        );
      case "pond":
        return <PondPanel s={s} act={act}/>;
      case "upgrades":
        return (
          <>
            <p className="dialogue">
              “ผมธีโอ ช่างประจำหมู่บ้านครับ
              มาช่วยทำให้บ้านและสวนของคุณน่าอยู่ขึ้นกัน” — ธีโอ
            </p>
            <p className="upgrade-help">เลือกสิ่งที่อยากปรับปรุง · ปุ่มสีเข้มซื้อได้ · ปุ่มจางต้องเก็บเงินเพิ่มหรืออัปเกรดครบแล้ว</p><div className="upgrade-grid">
              <article>
                <Shovel />
                <h3>พื้นที่แห่งการเติบโต</h3>
                <p>สวนปัจจุบัน {s.farm.length} แปลง · ขยายเป็น {FARM_SIZES[s.upgrades.farmLevel + 1] ?? 20} แปลง</p>
                <button
                  disabled={s.upgrades.farmLevel >= 5 || s.money < FARM_COSTS[s.upgrades.farmLevel]}
                  onClick={() => act({ type: "upgradeFarm" })}
                >
                  {s.upgrades.farmLevel >= 5 ? "ขยายสวนเต็มแล้ว" : `ขยายสวน · ${FARM_COSTS[s.upgrades.farmLevel]} ◉`}
                </button>
              </article>
              <article><ItemIcon id="watering-can" /><h3>บัวรดน้ำอัปเกรด</h3><p>ปัจจุบัน: {[1,4,8][s.upgrades.wateringLevel]} แปลงต่อครั้ง · ใช้พลังงาน 3{s.upgrades.wateringLevel<2 && <> · ถัดไป: {[4,8][s.upgrades.wateringLevel]} แปลง</>}</p><button disabled={s.upgrades.wateringLevel >= 2 || s.money < WATERING_COSTS[s.upgrades.wateringLevel]} onClick={() => act({type:"upgradeWatering"})}>{s.upgrades.wateringLevel >= 2 ? "ระดับสูงสุดแล้ว" : `อัปเกรด · ${WATERING_COSTS[s.upgrades.wateringLevel]} ◉`}</button></article>
              <article>
                <Zap />
                <h3>พลังสำหรับวันใหม่</h3>
                <p>พลังงานสูงสุด +20 · ระดับ {s.upgrades.energyLevel}/5</p>
                <button
                  disabled={
                    s.upgrades.energyLevel >= 5 ||
                    s.money < 300 * (s.upgrades.energyLevel + 1)
                  }
                  onClick={() => act({ type: "upgradeEnergy" })}
                >
                  {s.upgrades.energyLevel >= 5
                    ? "ระดับสูงสุดแล้ว"
                    : `อัปเกรด · ${300 * (s.upgrades.energyLevel + 1)} ◉`}
                </button>
              </article>
              <article className="home-style-card"><h3>สีหลังคาและผนังบ้าน</h3><p>ซื้อครั้งเดียว สลับรูปแบบที่มีได้ฟรี</p>{HOME_STYLES.map(style=><button key={style.id} style={{borderLeft:`6px solid ${style.wall}`}} disabled={s.home.style===style.id || (!s.home.ownedStyles.includes(style.id) && s.money<style.price)} onClick={()=>act({type:"homeStyle",id:style.id})}>{style.name} · {s.home.style===style.id?"ใช้อยู่":s.home.ownedStyles.includes(style.id)?"เลือกใช้":`${style.price} ◉`}</button>)}</article>
              <article><h3>สวนดอกไม้หลังบ้าน</h3><p>สวนประดับสำเร็จรูป ไม่ต้องปลูกหรือรดน้ำ และเก็บเกี่ยวไม่ได้</p><button disabled={s.home.garden || s.money<650} onClick={()=>act({type:"homeGarden"})}>{s.home.garden?"จัดสวนแล้ว":"จัดสวน · 650 ◉"}</button></article>
              <PondPanel s={s} act={act}/>
              <article><h3>บ้านที่อบอุ่นขึ้น</h3><p>{["แปลงดอกไม้ข้างบ้าน","ซุ้มไม้ในสวนข้างบ้าน","มุมพักผ่อนด้านข้างบ้าน","ตกแต่งครบแล้ว"][s.upgrades.homeLevel]}</p><button disabled={s.upgrades.homeLevel>=3 || s.money<HOME_COSTS[s.upgrades.homeLevel]} onClick={()=>act({type:"upgradeHome"})}>{s.upgrades.homeLevel>=3?"ครบแล้ว":`ติดตั้ง · ${HOME_COSTS[s.upgrades.homeLevel]} ◉`}</button></article>
              <article>
                <Flower2 />
                <h3>แต่งทางเข้าบ้าน</h3>
                <p>กระถางบนสนามหน้าบ้าน {s.decorations}/6 ใบ · ฝั่งละ 3 ใบ เว้นทางเข้าตรงกลาง</p>
                <button
                  disabled={s.decorations >= 6 || s.money < 100}
                  onClick={() => act({ type: "decorate" })}
                >
                  {s.decorations >= 6 ? "ครบ 6 กระถางแล้ว" : "เพิ่มกระถาง · 100 ◉"}
                </button>
              </article>
            </div>
          </>
        );
      case "workshop":
        return (
          <>
            <p className="dialogue">
              “ไม่ต้องสมบูรณ์แบบ แค่เป็นสิ่งที่คุณอยากสร้างก็พอ” — โอลิเวอร์
            </p>
            <p className="recipe-summary">วันนี้{moodName(s.artDay)} · ขายงานได้อีก {s.artDay.limit - s.artDay.used}/{s.artDay.limit} ชิ้น (ภาพวาดและโมเดลใช้โควตาขายร่วมกัน) · สร้างงานได้หลายชิ้น</p>
            <div className="workshop-choices">
              {[
                ["painting", "🖌️", "วาดภาพ", "เลือกสีและวาดลงบนผ้าใบ"],
                [
                  "sculpture",
                  "🧱",
                  "ระบายสีโมเดล",
                  "เลือกแมว หมา และเพื่อนตัวอื่น ๆ",
                ],
                [
                  "gallery",
                  "🖼️",
                  "ขายผลงานให้โอลิเวอร์",
                  "เลือกงานที่อยากส่งต่อ แล้วรับเหรียญ",
                ],
              ].map(([kind, icon, name, desc]) => (
                <button
                  className="secondary"
                  key={kind}
                  onClick={() => open({ kind })}
                >
                  <span>{icon}</span>
                  <h3>{name}</h3>
                  <p>{desc}</p>
                  <ChevronRight />
                </button>
              ))}
            </div>
          </>
        );
      case "painting":
        return <Painting finish={finish} />;
      case "sculpture":
        return <Sculpture finish={finish} />;
      case "gallery":
        return (
          <>
            <p className="dialogue">
              “ผมรับซื้อทั้งภาพวาดและโมเดลที่คุณระบายสี
              เลือกชิ้นที่อยากขายได้เลยครับ” — โอลิเวอร์
            </p>
            <p className="subtle">
              ผลงานล่าสุดจะแสดงอยู่ในสตูดิโอด้วย · {s.artworks.length}/24 ชิ้น
            </p>
            <p className="recipe-summary">วันนี้ขายแล้ว {s.artDay.used}/{s.artDay.limit} ชิ้น · {s.artDay.used>=s.artDay.limit?"ขายเพิ่มได้พรุ่งนี้ ยังสร้างและเก็บผลงานได้":"เลือกผลงานที่ต้องการขาย"}</p>
            <div className="gallery">
              {s.artworks.map((a) => (
                <article key={a.id}>
                  {a.image ? (
                    <img src={a.image} alt={a.name} />
                  ) : (
                    <div className="sculpture-thumb">
                      ◇<span>{a.parts?.length} รูปทรง</span>
                    </div>
                  )}
                  <h3>{a.name}</h3>
                  {a.kind === "painting" && a.image && <a className="secondary" href={a.image} download={a.name+".png"}>ส่งออกภาพ PNG</a>}
                  <button disabled={s.artDay.used>=s.artDay.limit} onClick={() => act({ type: "sellArt", id: a.id })}>
                    ขายให้โอลิเวอร์ +{a.price} ◉
                  </button>
                </article>
              ))}
            </div>
            {!s.artworks.length && (
              <p className="empty">ผนังยังว่างอยู่ เริ่มสร้างผลงานชิ้นแรกกัน</p>
            )}
          </>
        );
      case "encyclopedia":
        return (
          <div className="encyclopedia">
            {FLOWERS.map((f) => (
              <article key={f.id}>
                <ItemIcon id={f.id} size={70} />
                <div>
                  <small>{f.en.toUpperCase()}</small>
                  <h3>{f.name}</h3>
                  <p>{f.description}</p>
                  <div className="facts">
                    <span>เติบโต {f.days} วัน</span>
                    <span>เมล็ด {f.seed} ◉</span>
                    <span>ขาย {f.sell} ◉</span>
                    <span>รดน้ำทุกวัน</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        );
      case "map":
        return (
          <>
            <div className="map-world">
              <div className="map-path vertical" />
              <div className="map-path horizontal" />
              <div className="map-lake">MIRROR LAKE</div>
              {ZONES.map((z) => (
                <div
                  className={"map-marker " + z.id}
                  key={z.id}
                  style={{
                    left: ((z.x + 28) / 56) * 100 + "%",
                    top: ((z.z + 38) / 76) * 100 + "%",
                  }}
                >
                  <span>{z.icon}</span>
                  <small>{z.name}</small>
                </div>
              ))}
              <div
                className="map-player"
                style={{
                  left: ((mapPos.x + 28) / 56) * 100 + "%",
                  top: ((mapPos.z + 38) / 76) * 100 + "%",
                  transform: `translate(-50%,-50%) rotate(${(-mapPos.yaw * 180) / Math.PI}deg)`,
                }}
              >
                ▲
              </div>
              <span className="map-north">N ↑</span>
            </div>
            <p className="subtle">
              ▲ ตำแหน่งของคุณ • ร้านค้าเปิด 07:00–20:00 น. •
              เกมหยุดเวลาขณะเปิดแผนที่
            </p>
          </>
        );
      case "pause":
      case "settings":
        return (
          <>
            <div className="settings-list">
              <div>
                <span>
                  เสียงเกม<small>เสียงลม นก ดนตรี และกิจกรรม</small>
                </span>
                <button
                  className="secondary"
                  onClick={() => {
                    setSoundEnabled(!sound);
                    setSound(!sound);
                  }}
                >
                  {sound ? "เปิดอยู่" : "ปิดอยู่"}
                </button>
              </div>
              <div><span>เพลงบรรเลง<small>ทำนองเบา ๆ ในสวน</small></span><button className="secondary" onClick={() => {setMusicEnabled(!music);setMusic(!music);}}>{music ? "เปิดอยู่" : "ปิดอยู่"}</button></div>
              <div><span>ความดังเสียง</span><input aria-label="ความดังเสียง" type="range" min="0" max="1" step="0.05" value={volume} onChange={e => {setVolumeValue(Number(e.target.value));setVolume(Number(e.target.value));}} /></div>
              <div>
                <span>
                  คุณภาพภาพ<small>โหมดประหยัดลดเงาและความละเอียด</small>
                </span>
                <select
                  aria-label="คุณภาพภาพ"
                  value={quality}
                  onChange={(e) => setQuality(e.target.value)}
                >
                  <option value="high">สูง</option>
                  <option value="low">ประหยัด</option>
                </select>
              </div>
              <div>
                <span>
                  ปุ่มสัมผัส<small>สำหรับมือถือ / iPad</small>
                </span>
                <button className="secondary" onClick={() => setTouch(!touch)}>
                  {touch ? "แสดง" : "ซ่อน"}
                </button>
              </div>
              <div>
                <span>
                  บันทึกเกม<small>ข้อมูลอยู่ในเบราว์เซอร์เครื่องนี้</small>
                </span>
                <button
                  onClick={() =>
                    notify(
                      save()
                        ? "บันทึกเกมแล้ว"
                        : "บันทึกไม่ได้ พื้นที่เบราว์เซอร์อาจเต็ม",
                    )
                  }
                >
                  <Save size={16} /> บันทึก
                </button>
              </div>
            </div>
            <div className="controls-help">
              <p>
                <kbd>W A S D</kbd> เดิน <kbd>Shift</kbd> วิ่ง <kbd>E</kbd>{" "}
                โต้ตอบ
              </p>
              <p>
                <kbd>I</kbd> กระเป๋า <kbd>M</kbd> แผนที่ <kbd>B</kbd> สารานุกรม
              </p>
              <p>
                คลิกในโลกเพื่อจับเมาส์ · Esc เพื่อปล่อยเมาส์/พักเกม
                <br />
                มือถือ: จอยซ้ายเดิน · ลากพื้นที่โลกเพื่อมอง · ปุ่ม E เพื่อโต้ตอบ
              </p>
            </div>
            <button className="wide" onClick={close}>
              กลับเข้าสวน <ArrowUpRight size={16} />
            </button>
            <p className="credits">
              พื้นผิวและโมเดล CC0 จาก{" "}
              <a href="https://polyhaven.com" target="_blank" rel="noreferrer">
                Poly Haven
              </a>{" "}
              และ{" "}
              <a
                href="https://3dassets.dev/packs/companion-animals-and-pet-home"
                target="_blank"
                rel="noreferrer"
              >
                3DAssets.dev
              </a>{" "}
              · NPC จาก{" "}
              <a
                href="https://www.cgtrader.com/free-3d-models/character/fantasy-character/npc-for-male-and-female"
                target="_blank"
                rel="noreferrer"
              >
                Maniacie / CGTrader
              </a>
            </p>
          </>
        );
      default:
        return null;
    }
  }
  const titles: Record<string, string> = {
    seed: "เมล็ดเล็ก ๆ ความเป็นไปได้มากมาย",
    plot: "สวนดอกไม้ของคุณ",
    inventory: "กระเป๋าของคุณ",
    sell: "ร้านดอกไม้ของเมย์",
    fish: "ร้านปลาของฟินน์",
    general: "โรวัน · ของจิปาถะ",
    bouquet: "จัดช่อดอกไม้",
    customer: "ออร์เดอร์ประจำวัน",
    fishing: "ตกปลาที่ Mirror Lake",
    sleep: "พักผ่อนที่บ้าน",
    rest: "มุมสงบใต้ร่มไม้",
    food: "ครัวอุ่นใจของโนรา",
    upgrades: "ธีโอ · ช่างประจำหมู่บ้าน",
    grill: "ย่างปลาข้างกองไฟ",
    workshop: "The little atelier",
    painting: "สีสันบนผืนผ้าใบ",
    sculpture: "เติมสีให้เพื่อนตัวโปรด",
    gallery: "โอลิเวอร์ · รับซื้อผลงาน",
    encyclopedia: "บันทึกดอกไม้",
    map: "ทุกเส้นทางมีเรื่องราว",
    pause: "พักสักครู่",
    settings: "ปรับให้เป็นจังหวะของคุณ",
  };
  return (
    <>
      <World />
      <div className="vignette" />
      <header className="hud-header">
        <button
          className="brand"
          onClick={() => s.started && open({ kind: "pause" })}
          aria-label="Flower Valley เมนู"
        >
          <div className="brand-icon">
            <Flower2 size={25} />
          </div>
          <span>
            flower valley<small>A LITTLE CLOSER TO NATURE</small>
          </span>
        </button>
        <div className="location">
          <Compass size={15} />
          <span>{zone}</span>
          <div>
            W <b>N</b> E
          </div>
        </div>
        <div className="day-card">
          <div className="weather-icon">
            {s.time >= 1200 ? (
              <Moon />
            ) : s.weather === "rain" ? (
              <CloudRain />
            ) : (
              <Sun />
            )}
          </div>
          <div>
            <b>
              วันที่ {s.day}{" "}
              <span>· {s.weather === "rain" ? "ฝนตก" : "ฟ้าใส"}</span>
            </b>
            <small>
              {clock(s.time)} <span>เวลาของคุณ ค่อย ๆ เดิน</span>
            </small>
          </div>
        </div>
      </header>
      {s.started ? (
        <>
          <aside className="left-hud">
            <button
              className="map-button"
              onClick={() => open({ kind: "map" })}
            >
              <MapIcon size={17} />
              <span>แผนที่หุบเขา</span>
              <kbd>M</kbd>
            </button>
            <div className="quest-card">
              <span className="eyebrow">
                <Leaf size={13} /> A LITTLE SOMETHING TO DO
              </span>
              <h3>{quest}</h3>
              <p>{questDetail}</p>
              <div className="quest-steps">
                <span
                  className={
                    totalSeeds || planted || s.stats.harvested ? "complete" : ""
                  }
                />
                <span
                  className={planted || s.stats.harvested ? "complete" : ""}
                />
                <span className={s.stats.harvested ? "complete" : ""} />
              </div>
              <button onClick={() => open({ kind: "encyclopedia" })}>
                เปิดบันทึกดอกไม้ <ArrowUpRight size={14} />
              </button>
            </div>
          </aside>
          <aside className="right-hud">
            <div className="money">
              <Coins size={18} />
              <b>{s.money.toLocaleString()}</b>
              <small>เหรียญ</small>
            </div>
            <div className={"energy " + (s.energy < 20 ? "tired" : "")}>
              <span>
                <Zap size={15} /> พลังงาน{" "}
                <b>
                  {s.energy}
                  <small> / {s.maxEnergy}</small>
                </b>
              </span>
              <div>
                <i style={{ width: (s.energy / s.maxEnergy) * 100 + "%" }} />
              </div>
              {s.energy < 20 && <small>เหนื่อยแล้ว แวะนั่งพักสักหน่อย</small>}
            </div>
          </aside>
          <div className="crosshair" />
          <div className="interaction">
            {target && !modal ? (
              <button onClick={interact}>
                <kbd>E</kbd>
                <span>
                  <b>{target.name}</b>
                  <small>{target.hint}</small>
                </span>
                <ChevronRight size={18} />
              </button>
            ) : !modal ? (
              <span className="wander-hint">
                เดินช้า ๆ แล้วมองหาสิ่งเล็ก ๆ รอบตัว
              </span>
            ) : null}
          </div>
          <footer className="bottom-hud">
            <div className="save-state">
              <span /> {savedAt}
            </div>
            <nav className="toolbar" aria-label="เมนูเกม">
              {[
                [Backpack, "inventory", "กระเป๋า", "I"],
                [MapIcon, "map", "แผนที่", "M"],
                [BookOpen, "encyclopedia", "ดอกไม้", "B"],
                [Settings, "settings", "ตั้งค่า", "Esc"],
              ].map(([Icon, kind, label, key]: any) => (
                <button
                  key={kind}
                  onClick={() => open({ kind })}
                  aria-label={label}
                >
                  <Icon size={22} />
                  <span>{label}</span>
                  <kbd>{key}</kbd>
                </button>
              ))}
            </nav>
            <div className="utility">
              <button
                aria-label={sound ? "ปิดเสียง" : "เปิดเสียง"}
                onClick={() => {
                  setSoundEnabled(!sound);
                  setSound(!sound);
                }}
              >
                {sound ? <Volume2 size={19} /> : <VolumeX size={19} />}
              </button>
              {document.documentElement.requestFullscreen && (
                <button
                  aria-label="เต็มจอ"
                  onClick={() => {
                    if (fullscreen) document.exitFullscreen();
                    else
                      document.documentElement
                        .requestFullscreen()
                        .catch(() =>
                          notify("เบราว์เซอร์นี้ไม่รองรับโหมดเต็มจอ"),
                        );
                  }}
                >
                  <Maximize2 size={19} />
                </button>
              )}
            </div>
          </footer>
          {touch && !modal && (
            <TouchControls interact={interact} available={!!target} />
          )}
        </>
      ) : (
        <div className="welcome">
          <span className="eyebrow">WELCOME TO YOUR OWN LITTLE WORLD</span>
          <h1>
            A slower day.
            <br />
            <em>A fuller life.</em>
          </h1>
          <p>
            ทิ้งความวุ่นวายไว้ข้างหลัง
            <br />
            ปลูกดอกไม้ ตกปลา และสร้างวันธรรมดาที่แสนพิเศษ
            <br />
            ในหุบเขาเล็ก ๆ ที่รอให้คุณเรียกว่าบ้าน
          </p>
          <button
            className="start-button"
            disabled={!ready}
            onClick={() => {
              act({ type: "start" });
              setSoundEnabled(true);
              setSound(true);
            }}
          >
            {ready ? "เริ่มต้นชีวิตในหุบเขา" : "กำลังเตรียมสวนของคุณ…"}{" "}
            <ArrowUpRight size={20} />
          </button>
          <small>
            <span /> เดินสำรวจได้อย่างอิสระ · บันทึกความคืบหน้าอัตโนมัติ
          </small>
          <div className="welcome-controls">
            <kbd>W A S D</kbd> เดิน <span>·</span>
            <kbd>เมาส์</kbd> มอง <span>·</span>
            <kbd>E</kbd> โต้ตอบ
            <br />
            <span>รองรับปุ่มสัมผัสบนมือถือและ iPad</span>
          </div>
        </div>
      )}
      {toast && !modal && (
        <div className="toast" role="status">
          <Leaf size={17} />
          {toast}
        </div>
      )}

      {modal && (
        <ModalFrame
          title={titles[modal.kind] || modal.name || ""}
          kind={modal.kind}
          onClose={close}
          money={s.money}
          toast={toast}
        >
          {content()}
        </ModalFrame>
      )}
      {night && <SleepTransition action={night} onComplete={finishNight} />}
      <div className="world-label">
        FLOWER VALLEY <span>01 / A PLACE TO GROW</span>
      </div>
    </>
  );
}
function ModalFrame({
  title,
  kind,
  onClose,
  money,
  children,
  toast,
}: {
  title: string;
  kind: string;
  onClose: () => void;
  money: number;
  children: React.ReactNode;
  toast: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const previous = document.activeElement as HTMLElement;
    ref.current?.focus();
    const trap = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      const nodes = Array.from(
        ref.current!.querySelectorAll<HTMLElement>(
          'button:not(:disabled), input, select, a, [tabindex="0"]',
        ),
      ).filter((n) => n.offsetParent !== null);
      const first = nodes[0],
        last = nodes.at(-1);
      if (
        e.shiftKey &&
        (document.activeElement === first ||
          document.activeElement === ref.current)
      ) {
        e.preventDefault();
        last?.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first?.focus();
      }
    };
    ref.current?.addEventListener("keydown", trap);
    return () => {
      ref.current?.removeEventListener("keydown", trap);
      previous?.focus();
    };
  }, [kind]);
  return (
    <div
      className={"modal-backdrop " + (kind === "rest" ? "rest-backdrop" : "")}
      onPointerDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <section
        className={"modal modal-" + kind}
        ref={ref}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        {toast && <div className="modal-notice" role="status"><Leaf size={17}/>{toast}</div>}
        <div className="modal-top">
          <span className="eyebrow">FLOWER VALLEY / {kind.toUpperCase()}</span>
          <button
            className="close-button"
            aria-label="ปิดหน้าต่าง"
            onClick={onClose}
          >
            <X size={20} />
          </button>
        </div>
        <div className="modal-heading">
          <h2 id="modal-title">{title}</h2>
          <span>
            <Coins size={17} />
            {money.toLocaleString()}
          </span>
        </div>
        <div className="modal-content" key={kind}>
          {children}
        </div>
        <div className="modal-foot">
          <span>ใช้เวลาในแบบของคุณ</span>
          <small>Esc เพื่อกลับสู่โลก</small>
        </div>
      </section>
    </div>
  );
}
function TouchControls({
  interact,
  available,
}: {
  interact: () => void;
  available: boolean;
}) {
  const [stick, setStick] = useState({ x: 0, y: 0 });
  const origin = useRef({ x: 0, y: 0 });
  const active = useRef<number | null>(null);
  const stop = () => {
    active.current = null;
    bridge.move = { x: 0, y: 0 };
    setStick({ x: 0, y: 0 });
  };
  useEffect(() => stop, []);
  return (
    <div className="touch-controls">
      <div
        className="joystick"
        aria-label="จอยเดิน"
        onPointerDown={(e) => {
          active.current = e.pointerId;
          const r = e.currentTarget.getBoundingClientRect();
          origin.current = { x: r.left + r.width / 2, y: r.top + r.height / 2 };
          e.currentTarget.setPointerCapture(e.pointerId);
        }}
        onPointerMove={(e) => {
          if (active.current !== e.pointerId) return;
          let x = e.clientX - origin.current.x,
            y = e.clientY - origin.current.y;
          const len = Math.hypot(x, y);
          if (len > 36) {
            x = (x / len) * 36;
            y = (y / len) * 36;
          }
          setStick({ x, y });
          bridge.move = { x: x / 36, y: y / 36 };
        }}
        onPointerUp={stop}
        onPointerCancel={stop}
      >
        <span style={{ transform: `translate(${stick.x}px,${stick.y}px)` }} />
      </div>
      <button
        className="touch-interact"
        disabled={!available}
        onClick={interact}
      >
        E<small>โต้ตอบ</small>
      </button>
    </div>
  );
}

function PondPanel({s,act}:{s:import("./game/engine").GameState;act:(action:import("./game/engine").Action)=>unknown}) {
  const full=s.home.fish.length>=6;
  return <article className="pond-panel">
    <div className="pond-heading"><h3>บ่อปลาประดับข้างบ้าน</h3><span className="pond-capacity">{s.home.fish.length} / 6 ตัว</span></div>
    <p>เลือกปลาจากกระเป๋ามาเลี้ยง และนำกลับได้ทุกเมื่อ</p>
    {!s.home.pond ? <button disabled={s.money<850} onClick={()=>act({type:"homePond"})}>สร้างบ่อ · 850 ◉</button> : <>
      <p className="pond-hint">{full?"บ่อเต็มแล้ว · นำปลาออกก่อนเพิ่มตัวใหม่":"ปล่อยหรือนำกลับครั้งละ 1 ตัว"}</p>
      <div className="pond-list">{FISH.map(f=>{
        const owned=s.inventory[f.id]||0, stocked=s.home.fish.filter(id=>id===f.id).length;
        return <div className="pond-row" key={f.id}>
          <ItemIcon id={f.id} size={44}/>
          <div className="pond-fish-info"><strong>{f.name}</strong><span>ในกระเป๋า {owned} · ในบ่อ {stocked}</span></div>
          <div className="pond-actions">
            <button aria-label={`ปล่อย${f.name}ลงบ่อ 1 ตัว`} disabled={!owned||full} onClick={()=>act({type:"pondAdd",id:f.id})}>{!owned?"ไม่มีในกระเป๋า":full?"บ่อเต็ม":"ปล่อยลงบ่อ"}</button>
            <button className="secondary" aria-label={`นำ${f.name}กลับ 1 ตัว`} disabled={!stocked} onClick={()=>act({type:"pondRemove",id:f.id})}>นำกลับ</button>
          </div>
        </div>;
      })}</div>
    </>}
  </article>;
}
