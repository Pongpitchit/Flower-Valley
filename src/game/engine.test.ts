import { describe, it, expect } from "vitest";
import {
  initialState,
  transition,
  validateSave,
  migrateSave,
  validParts,
  type GameState,
} from "./engine";
import { FLOWERS, FISH, GRILLED_FISH, FOODS, FERTILIZERS, catchTable, seaCatchTable, SEA_FISH, FORAGE, FORAGE_SPOTS, SCENES, sceneAt } from "./data";
import { canMove, colliders, groundHeight, HILL, PIER } from "../world/bridge";
const apply = (s: GameState, type: string, args = {}) =>
  transition(s, { type, ...args }, () => 0.8);
const day = (s: GameState, rain = false) =>
  transition({ ...s, time: 1200 }, { type: "sleep" }, () => (rain ? 0.1 : 0.8))
    .state;
describe("Grilled fish economy", () => {
  for (const [i, fish] of FISH.entries())
    it(`cooks and sells ${fish.id} once, preserves save and raw prices`, () => {
      const s = initialState(() => 0.1);
      s.inventory[fish.id] = 2;
      const cooked = apply(s, "grill", { id: fish.id });
      expect(cooked.ok).toBe(true);
      expect(cooked.state.inventory[fish.id]).toBe(1);
      expect(cooked.state.inventory[GRILLED_FISH[i].id]).toBe(1);
      expect(cooked.state.energy).toBe(95);
      expect(cooked.state.time).toBe(s.time + 10);
      expect(cooked.state.money).toBe(s.money);
      expect(validateSave(JSON.parse(JSON.stringify(cooked.state)))).toBe(true);
      const sold = apply(cooked.state, "sell", { id: GRILLED_FISH[i].id });
      expect(sold.state.money).toBe(s.money + Math.round(fish.price * 1.5));
      expect(apply(sold.state, "sell", { id: GRILLED_FISH[i].id }).ok).toBe(
        false,
      );
      expect(apply(sold.state, "sell", { id: fish.id }).state.money).toBe(
        s.money + fish.price + Math.round(fish.price * 1.5),
      );
    });
  it("rejects absent fish, unknown recipes, insufficient energy and midnight atomically", () => {
    for (const [id, energy, time, count] of [
      ["carp", 100, 480, 0],
      ["rose", 100, 480, 1],
      ["grilled:carp", 100, 480, 1],
      ["carp", 4, 480, 1],
      ["carp", 100, 1430, 1],
    ] as const) {
      const s = initialState(() => 0.1);
      s.inventory[id] = count;
      s.energy = energy;
      s.time = time;
      const r = apply(s, "grill", { id });
      expect(r.ok).toBe(false);
      expect(r.state).toBe(s);
    }
  });
  it("allows the last complete cooking interval before midnight", () => {
    const s = initialState(() => 0.1);
    s.time = 1429;
    s.inventory.carp = 1;
    s.energy = 5;
    expect(apply(s, "grill", { id: "carp" }).state).toMatchObject({
      time: 1439,
      day: 1,
      energy: 0,
    });
  });
});
describe("Complete farming and economy loop", () => {
  for (const f of FLOWERS)
    it(`${f.id}: buy → plant → water daily → grow → harvest → sell`, () => {
      let s = initialState(() => 0.1);
      s = apply(s, "buy", { id: f.id }).state;
      expect(s.money).toBe(500 - f.seed);
      s = apply(s, "plant", { id: f.id, index: 0 }).state;
      expect(s.inventory["seed:" + f.id]).toBe(0);
      for (let i = 0; i < f.days; i++) {
        s = apply(s, "water", { index: 0 }).state;
        s = day(s);
      }
      expect(s.farm[0].age).toBe(f.days);
      s = apply(s, "harvest", { index: 0 }).state;
      expect(s.inventory[f.id]).toBe(1);
      expect(s.farm[0].seed).toBeNull();
      s = apply(s, "sell", { id: f.id }).state;
      expect(s.money).toBe(500 - f.seed + f.sell);
      expect(s.inventory[f.id]).toBe(0);
      expect(validateSave(s)).toBe(true);
    });
  it("rejects insufficient funds without mutation", () => {
    const s = { ...initialState(() => 0.1), money: 0 };
    expect(apply(s, "buy", { id: "rose" })).toMatchObject({
      ok: false,
      state: s,
    });
  });
  it("rejects missing seeds, occupied plots, premature and repeated harvests", () => {
    let s = initialState(() => 0.1);
    expect(apply(s, "plant", { id: "daisy", index: 0 }).ok).toBe(false);
    s = apply(s, "buy", { id: "daisy" }).state;
    s = apply(s, "plant", { id: "daisy", index: 0 }).state;
    expect(apply(s, "plant", { id: "daisy", index: 0 }).ok).toBe(false);
    expect(apply(s, "harvest", { index: 0 }).ok).toBe(false);
    expect(apply(s, "harvest", { index: 99 }).ok).toBe(false);
  });
  it("dry crops do not grow; watered crops grow once; rain waters new plants and next day", () => {
    let s = initialState(() => 0.1);
    s.inventory["seed:rose"] = 1;
    s = apply(s, "plant", { id: "rose", index: 0 }).state;
    s = day(s);
    expect(s.farm[0].age).toBe(0);
    s = apply(s, "water", { index: 0 }).state;
    expect(apply(s, "water", { index: 0 }).ok).toBe(false);
    s = day(s, true);
    expect(s.farm[0]).toMatchObject({ age: 1, watered: true });
    s.inventory["seed:daisy"] = 1;
    s = apply(s, "plant", { id: "daisy", index: 1 }).state;
    expect(s.farm[1].watered).toBe(true);
    s = day(s);
    expect(s.farm[0]).toMatchObject({ age: 2, watered: false });
    expect(s.farm[1].age).toBe(1);
  });
  it("keeps mature flowers ready without overflowing age", () => {
    const s = initialState(() => 0.1);
    s.farm[0] = { seed: "daisy", age: 2, watered: true };
    expect(day(s).farm[0].age).toBe(2);
  });
});
describe("Energy and time", () => {
  it("blocks heavy actions at zero energy", () => {
    const s = initialState(() => 0.1);
    s.energy = 0;
    s.inventory["seed:daisy"] = 1;
    for (const type of ["cast", "plant"])
      expect(apply(s, type, { id: "daisy", index: 0 }).ok).toBe(false);
  });
  it("rest restores up to 20 and spends 30 minutes without moving or advancing day", () => {
    let s = initialState(() => 0.1);
    s.energy = 90;
    const before = s.time,
      position = { ...s.position };
    s = apply(s, "rest").state;
    expect(s.energy).toBe(100);
    expect(s.time).toBe(before + 30);
    expect(s.day).toBe(1);
    expect(s.position).toEqual(position);
    const full = apply(s, "rest");
    expect(full.ok).toBe(false);
    expect(full.state.time).toBe(s.time);
    s.energy = 20;
    const rested = apply(s, "rest").state;
    expect(rested.energy).toBe(40);
    expect(rested.time).toBe(before + 60);
  });
  it("sleep only at night; midnight gives 60 percent energy and advances day", () => {
    let s = initialState(() => 0.1);
    expect(apply(s, "sleep").ok).toBe(false);
    s.time = 1439;
    s.energy = 0;
    s = apply(s, "tick", { amount: 2 }).state;
    expect(s).toMatchObject({ day: 2, time: 360, energy: 60 });
  });
  it("normal sleep restores full upgraded energy and wakes beside the bed", () => {
    const s = initialState(() => 0.1);
    s.maxEnergy = 160;
    s.energy = 3;
    s.time = 1200;
    const next = apply(s, "sleep").state;
    expect(next).toMatchObject({
      day: 2,
      time: 360,
      energy: 160,
      position: { x: 13, z: 2 },
    });
  });
  it("rest crossing midnight forces sleep at 60 percent of upgraded capacity and grows crops once", () => {
    const s = initialState(() => 0.1);
    s.maxEnergy = 160;
    s.energy = 10;
    s.time = 1425;
    s.farm[0] = { seed: "daisy", age: 0, watered: true };
    const next = apply(s, "rest").state;
    expect(next).toMatchObject({ day: 2, time: 360, energy: 96 });
    expect(next.farm[0].age).toBe(1);
  });
  it("stays awake until midnight and does not advance early", () => {
    const s = initialState(() => 0.1);
    s.time = 1437;
    s.energy = 15;
    const late = apply(s, "tick", { amount: 2 }).state;
    expect(late).toMatchObject({ day: 1, time: 1439, energy: 15 });
    expect(apply(late, "tick", { amount: 2 }).state).toMatchObject({
      day: 2,
      time: 360,
      energy: 60,
    });
  });
  it("running is free even with zero energy", () => {
    const s = initialState(() => 0.1);
    s.energy = 1;
    const r = apply(s, "run");
    expect(r.state.energy).toBe(1);
    expect(apply({...r.state,energy:0}, "run").ok).toBe(true);
  });
});
describe("Bouquets, orders and upgrades", () => {
  it("accounts for duplicate flower selections atomically", () => {
    let s = initialState(() => 0.1);
    s.inventory.daisy = 2;
    const result = apply(s, "bouquet", {
      flowers: ["daisy", "daisy", "daisy"],
    });
    expect(result.ok).toBe(false);
    expect(s.inventory.daisy).toBe(2);
    s.inventory.daisy = 3;
    s = apply(s, "bouquet", { flowers: ["daisy", "daisy", "daisy"] }).state;
    expect(s.inventory.daisy).toBe(0);
    expect(s.bouquets[0].price).toBe(131);
  });
  it("customer pays sale price plus 50 once daily and requires matching flower", () => {
    let s = initialState(() => 0.1);
    s.inventory.daisy = 3;
    s = apply(s, "bouquet", { flowers: ["daisy", "daisy", "daisy"] }).state;
    const id = s.bouquets[0].id;
    s.order.flower = "rose";
    expect(apply(s, "order", { id }).ok).toBe(false);
    s.order.flower = "daisy";
    s = apply(s, "order", { id }).state;
    expect(s.money).toBe(681);
    expect(s.order.fulfilled).toBe(true);
    expect(apply(s, "order", { id }).ok).toBe(false);
    expect(day(s).order.fulfilled).toBe(false);
  });
  it("normal bouquet sale removes the bouquet", () => {
    let s = initialState(() => 0.1);
    s.inventory.rose = 3;
    s = apply(s, "bouquet", { flowers: ["rose", "rose", "rose"] }).state;
    s = apply(s, "sellBouquet", { id: s.bouquets[0].id }).state;
    expect(s.money).toBe(1006);
    expect(s.bouquets.length).toBe(0);
  });
  it("charges for upgrades and enforces caps", () => {
    let s = initialState(() => 0.1);
    s.money = 10000;
    s = apply(s, "upgradeFarm").state;
    expect(s.money).toBe(9880);
    expect(s.farm.length).toBe(6);
    for (let i=0;i<4;i++) s=apply(s,"upgradeFarm").state;
    expect(s.farm.length).toBe(20);
    expect(apply(s, "upgradeFarm").ok).toBe(false);
    for (let i = 0; i < 5; i++) s = apply(s, "upgradeEnergy").state;
    expect(s.maxEnergy).toBe(200);
    expect(s.money).toBe(3300);
    expect(apply(s, "upgradeEnergy").ok).toBe(false);
    for (let i = 0; i < 6; i++) s = apply(s, "decorate").state;
    expect(apply(s, "decorate").ok).toBe(false);
    expect(validateSave(s)).toBe(true);
  });
});
describe("Fishing and art", () => {
  it("charges for a cast and adds all three fish rarities with correct sale prices", () => {
    for (const [rng, id, price] of [
      [0.4, "carp", 40],
      [0.5, "goldfish", 60],
      [0.98, "rare", 150],
    ] as const) {
      let s = apply(initialState(() => 0.1), "cast").state;
      expect(s.energy).toBe(90);
      s = transition(s, { type: "catch" }, () => rng).state;
      expect(s.inventory[id]).toBe(1);
      s = apply(s, "sell", { id }).state;
      expect(s.money).toBe(500 + price);
    }
  });
  it("saves painting and sculpture; charges energy; sells artwork exactly once", () => {
    let s = initialState(() => 0.1);
    s = apply(s, "art", {
      art: {
        kind: "painting",
        name: "Garden",
        image: "data:image/png;base64,AAAA",
      },
    }).state;
    expect(s.energy).toBe(85);
    const part = {
      type: "cone",
      x: 0,
      y: 1,
      z: 0,
      rx: 0,
      ry: 45,
      rz: 0,
      scale: 1,
      color: "#123456",
      material: "metal",
    };
    s = apply(s, "art", {
      art: { kind: "sculpture", name: "Cone", parts: [part] },
    }).state;
    expect(s.energy).toBe(70);
    expect(validateSave(s)).toBe(true);
    const id = s.artworks[1].id;
    s = apply(s, "sellArt", { id }).state;
    expect(s.money).toBe(590);
    expect(apply(s, "sellArt", { id }).ok).toBe(false);
  });
  it("rejects invalid and empty art without spending energy", () => {
    const s = initialState(() => 0.1);
    expect(
      apply(s, "art", { art: { kind: "sculpture", name: "Empty", parts: [] } })
        .ok,
    ).toBe(false);
    expect(
      apply(s, "art", {
        art: { kind: "painting", name: "bad", image: "javascript:alert(1)" },
      }).ok,
    ).toBe(false);
    expect(validParts([{ x: NaN }])).toBe(false);
  });
});
describe("Persistence and collisions", () => {
  it("round trips a save and rejects corrupted nested data", () => {
    const s = initialState(() => 0.1);
    expect(validateSave(JSON.parse(JSON.stringify(s)))).toBe(true);
    for (const invalid of [
      null,
      {},
      { ...s, energy: -1 },
      { ...s, inventory: { rose: 1.5 } },
      { ...s, farm: [] },
      { ...s, position: { x: Infinity, z: 0, yaw: 0 } },
      { ...s, maxEnergy: 200 },
    ])
      expect(validateSave(invalid)).toBe(false);
  });
  it("blocks world boundary, water and important objects", () => {
    colliders.length = 0;
    colliders.push({ x: 5, z: 5, w: 2, d: 2 });
    expect(canMove(0, 20)).toBe(true);
    expect(canMove(46, 30)).toBe(false);
    expect(canMove(0, 90)).toBe(false);
    expect(canMove(0, -31)).toBe(false);
    expect(canMove(5, 5)).toBe(false);
    expect(canMove(7, 5)).toBe(true);
    colliders.length = 0;
  });
});

describe("Ready-made model painting", () => {
  it("saves painted animals, restores colors, preserves old art, and sells once", () => {
    let s = initialState(() => 0.1);
    s = apply(s, "art", {
      art: {
        kind: "sculpture",
        name: "Earlier artwork",
        parts: [
          {
            type: "box",
            x: 0,
            y: 1,
            z: 0,
            rx: 0,
            ry: 0,
            rz: 0,
            scale: 1,
            color: "#123456",
            material: "matte",
          },
        ],
      },
    }).state;
    s = apply(s, "art", {
      art: {
        kind: "model",
        modelId: "cat",
        name: "Pink cat",
        colors: { "0": "#e78293", "3": "#ab88c8" },
        image: "data:image/png;base64,AAAA",
      },
    }).state;
    expect(s.energy).toBe(70);
    expect(s.artworks).toHaveLength(2);
    const saved = JSON.parse(JSON.stringify(s));
    expect(validateSave(saved)).toBe(true);
    expect(saved.artworks[1].colors["0"]).toBe("#e78293");
    const id = s.artworks[1].id;
    s = apply(s, "sellArt", { id }).state;
    expect(s.money).toBe(610);
    expect(s.artworks[0].kind).toBe("sculpture");
    expect(apply(s, "sellArt", { id }).ok).toBe(false);
  });
  it("rejects unknown models, empty paint, invalid colors and invalid region keys atomically", () => {
    for (const art of [
      { kind: "model", modelId: "unknown", colors: { "0": "#ffffff" } },
      { kind: "model", modelId: "dog", colors: {} },
      { kind: "model", modelId: "rabbit", colors: { "0": "red" } },
      { kind: "model", modelId: "tortoise", colors: { script: "#ffffff" } },
    ]) {
      const s = initialState(() => 0.1),
        r = apply(s, "art", { art: { ...art, name: "Test" } });
      expect(r.ok).toBe(false);
      expect(r.state).toBe(s);
    }
  });
  it("supports each of the five selectable models", () => {
    for (const modelId of ["cat", "dog", "rabbit", "tortoise", "guinea"]) {
      const r = apply(initialState(() => 0.1), "art", {
        art: {
          kind: "model",
          modelId,
          name: modelId,
          colors: { "0": "#ffffff" },
        },
      });
      expect(r.ok).toBe(true);
      expect(validateSave(r.state)).toBe(true);
    }
  });
});

describe('Daily creativity, farm progression and bulk trade', () => {
  const art = {kind:'painting' as const,name:'Meadow',image:'data:image/png;base64,AAAA'};
  it('allows repeated creation but limits successful daily sales, persisting and resetting the count',()=>{
    for(const [rng,limit] of [[.8,1],[.1,2]]) {
      let s=initialState(()=>rng);
      expect(s.artDay.limit).toBe(limit);
      for(let i=0;i<4;i++){const r=apply(s,'art',{art});expect(r.ok).toBe(true);s=r.state;}
      expect(s.artDay.used).toBe(0);
      expect(apply(s,'sellArt',{id:'missing'}).state).toBe(s);
      for(let i=0;i<limit;i++){const r=apply(s,'sellArt',{id:s.artworks[0].id});expect(r.ok).toBe(true);s=r.state;}
      const saved=JSON.parse(JSON.stringify(s));expect(validateSave(saved)).toBe(true);
      expect(apply(saved,'sellArt',{id:saved.artworks[0].id}).state).toBe(saved);
      expect(apply(saved,'art',{art}).ok).toBe(true);
      s=day(s);expect(s.artDay.used).toBe(0);expect(apply(s,'sellArt',{id:s.artworks[0].id}).ok).toBe(true);
    }
  });
  it('migrates creation counters without consuming sales and keeps new sales on reload',()=>{
    const old:any=initialState(()=>.8);old.version=4;old.artDay.used=1;
    const migrated:any=migrateSave(old);expect(validateSave(migrated)).toBe(true);expect(migrated.artDay.used).toBe(0);
    const made=apply(migrated,'art',{art}).state;
    const sold=apply(made,'sellArt',{id:made.artworks[0].id}).state;
    expect((migrateSave(JSON.parse(JSON.stringify(sold))) as GameState).artDay.used).toBe(1);
  });
  it('does not consume creativity or energy when artwork is invalid',()=>{
    const s=initialState(()=>.8);
    expect(apply(s,'art',{art:{...art,image:'bad'}}).state).toBe(s);
    expect(s.artDay.used).toBe(0);
  });
  it('starts with three plots and preserves old twelve/twenty-plot saves and prices',()=>{
    expect(initialState().farm).toHaveLength(3);
    for(const level of [0,1]) {
      const old:any=initialState();old.version=1;delete old.artDay;delete old.upgrades.wateringLevel;
      old.upgrades.farmLevel=level;old.farm=Array.from({length:12+level*8},()=>({seed:'daisy',age:1,watered:true}));
      old.bouquets=[{id:'legacy',flowers:['daisy','daisy','daisy'],price:94}];old.money=9876;
      const migrated=migrateSave(old) as GameState;
      expect(validateSave(migrated)).toBe(true);expect(migrated.money).toBe(9876);expect(migrated.farm).toHaveLength(old.farm.length);
      expect(migrated.bouquets[0].price).toBe(94);expect(migrateSave(migrated)).toBe(migrated);
      expect(apply(migrated,'sellBouquet',{id:'legacy'}).state.money).toBe(9970);
    }
  });
  it('sells exact quantities, rejects invalid counts atomically, and cannot sell depleted items',()=>{
    for(const id of ['daisy','carp','grilled:carp']) {
      const s=initialState();s.inventory[id]=5;
      for(const amount of [0,-1,1.5,6,NaN,Infinity]) expect(apply(s,'sell',{id,amount}).state).toBe(s);
      const price=id==='daisy'?35:id==='carp'?40:60;
      const partial=apply(s,'sell',{id,amount:2}).state;expect(partial.inventory[id]).toBe(3);expect(partial.money).toBe(500+2*price);
      const all=apply(partial,'sell',{id,amount:3}).state;expect(all.inventory[id]).toBe(0);expect(all.stats.earned).toBe(5*price);
      expect(apply(all,'sell',{id}).ok).toBe(false);
    }
  });
  it('fertilizer grows a crop once and resets after harvesting and replanting',()=>{
    let s=initialState();s.inventory={'seed:daisy':2,fertilizer:3};s=apply(s,'plant',{index:0,id:'daisy'}).state;
    s=apply(s,'fertilize',{index:0}).state;expect(s.farm[0].age).toBe(1);expect(s.inventory.fertilizer).toBe(2);
    expect(apply(s,'fertilize',{index:0}).state).toBe(s);
    s=day(apply(s,'water',{index:0}).state);s=apply(s,'harvest',{index:0}).state;s=apply(s,'plant',{index:0,id:'daisy'}).state;
    expect(apply(s,'fertilize',{index:0}).ok).toBe(true);
    expect(apply(s,'fertilize',{index:1}).state).toBe(s);
  });
  it('watering upgrades water only eligible plots in the same row for three energy',()=>{
    let s=initialState();s.money=2000;s=apply(s,'upgradeFarm').state;s=apply(s,'upgradeWatering').state;
    s.farm=s.farm.map(()=>({seed:'daisy',age:0,watered:false}));s.farm[1].watered=true;
    const r=apply(s,'water',{index:0});expect(r.state.energy).toBe(97);expect(r.state.farm.slice(0,3).every(p=>p.watered)).toBe(true);expect(r.state.farm[3].watered).toBe(true);
    expect(apply(r.state,'water',{index:0}).state).toBe(r.state);
    const edge=apply(r.state,'water',{index:3}).state;expect(edge.farm[3].watered).toBe(true);expect(edge.farm[4].watered).toBe(false);
    s.energy=2;expect(apply(s,'water',{index:0}).state).toBe(s);
  });
});

describe('Village expansion rules',()=>{
  it('migrates the previous daily-mood save without losing fertilizer, resets legacy creation quota',()=>{
    const old:any=initialState(()=>.1);old.version=2;old.artDay.used=1;old.inventory.fertilizer=4;
    delete old.upgrades.rodLevel;delete old.upgrades.homeLevel;
    const upgraded=migrateSave(old) as GameState;
    expect(validateSave(upgraded)).toBe(true);expect(upgraded.artDay.used).toBe(0);expect(upgraded.inventory.fertilizer).toBe(4);expect(upgraded.upgrades.rodLevel).toBe(0);
  });
  it('fertilizer tiers consume exactly one bag, cap at maturity and cannot stack',()=>{
    for(const [id,price,days] of [['fertilizer',10,1],['fertilizer:good',18,2],['fertilizer:premium',24,3]] as const){
      let s=initialState();s.inventory['seed:hydrangea']=1;s=apply(s,'buyFertilizer',{id}).state;
      expect(s.money).toBe(500-price);s=apply(s,'plant',{id:'hydrangea',index:0}).state;
      s=apply(s,'fertilize',{id,index:0}).state;expect(s.farm[0].age).toBe(days);expect(s.inventory[id]).toBe(0);expect(validateSave(s)).toBe(true);
      s.inventory[id]=1;expect(apply(s,'fertilize',{id,index:0}).state).toBe(s);
      s.farm[1]={seed:'daisy',age:1,watered:false};s=apply(s,'fertilize',{id,index:1}).state;expect(s.farm[1].age).toBe(2);
    }
  });
  it('buys rod and home upgrades once per level and refuses unaffordable purchases',()=>{
    let s=initialState();s.money=4000;
    s=apply(s,'upgradeRod').state;s=apply(s,'upgradeRod').state;expect(s.money).toBe(2750);expect(s.upgrades.rodLevel).toBe(2);expect(apply(s,'upgradeRod').state).toBe(s);
    for(let i=0;i<3;i++)s=apply(s,'upgradeHome').state;
    expect(s.money).toBe(1300);expect(apply(s,'upgradeHome').state).toBe(s);expect(validateSave(s)).toBe(true);
    const broke=initialState();broke.money=0;expect(apply(broke,'upgradeRod').state).toBe(broke);expect(apply(broke,'upgradeHome').state).toBe(broke);
  });
  it('all catch probabilities sum to one, match rod rarity, and include low-value sellable trash',()=>{
    for(const level of [0,1,2]){
      const counts:Record<string,number>={};
      const s=initialState();s.upgrades.rodLevel=level;
      for(let i=0;i<1000;i++){
        const r=transition(s,{type:'catch'},()=>(i+.5)/1000);const id=Object.keys(r.state.inventory)[0];counts[id]=(counts[id]||0)+1;
        if(id==='tin-can'||id==='old-boot')expect(r.state.stats.fish).toBe(0);
      }
      expect(counts.rare).toBe([40,120,200][level]);expect(counts['tin-can']+counts['old-boot']).toBe(100);expect(Object.keys(counts)).toHaveLength(8);
    }
    for(const [id,price] of [['tin-can',3],['old-boot',5]] as const){const s=initialState();s.inventory[id]=4;expect(apply(s,'sell',{id,amount:4}).state.money).toBe(500+price*4);expect(apply(s,'grill',{id}).state).toBe(s);}
  });
});

describe('home customization and ornamental pond',()=>{
  it('migrates v3 without losing inventory and rejects invalid pond saves',()=>{
    const old:any=initialState();old.version=3;delete old.home;old.inventory.carp=2;
    const s=migrateSave(old) as GameState;
    expect(validateSave(s)).toBe(true);expect(s.inventory.carp).toBe(2);
    expect(s.home.fish).toEqual([]);
    expect(validateSave({...s,home:{...s.home,fish:['carp']}})).toBe(false);
  });
  it('charges for a style once and preserves unrelated progress',()=>{
    const s=initialState();s.money=1000;
    const chosen=apply(s,'homeStyle',{id:'sage'}).state;
    expect(chosen.money).toBe(700);
    const original=apply(chosen,'homeStyle',{id:'original'}).state;
    expect(apply(original,'homeStyle',{id:'sage'}).state.money).toBe(700);
    expect(apply(s,'homeStyle',{id:'invalid'}).state).toBe(s);
  });
  it('buys each garden upgrade once and fails atomically when unaffordable',()=>{
    const s=initialState();expect(apply(s,'homeGarden').state).toBe(s);
    s.money=2000;const garden=apply(s,'homeGarden').state;
    expect(garden.money).toBe(1350);expect(garden.home.garden).toBe(true);
    expect(apply(garden,'homeGarden').state).toBe(garden);
    const pond=apply(garden,'homePond').state;expect(pond.money).toBe(500);
    expect(apply(pond,'homePond').state).toBe(pond);
  });
  it('conserves fish across transfers, capacity, invalid items and reloads',()=>{
    let s=initialState();s.money=2000;s.inventory.carp=7;s.inventory['grilled:carp']=1;
    expect(apply(s,'pondAdd',{id:'carp'}).state).toBe(s);
    s=apply(s,'homePond').state;
    expect(apply(s,'pondAdd',{id:'grilled:carp'}).state).toBe(s);
    for(let i=0;i<6;i++)s=apply(s,'pondAdd',{id:'carp'}).state;
    expect(s.inventory.carp).toBe(1);expect(s.home.fish.length).toBe(6);
    s=apply(s,'pondAdd',{id:'carp'}).state;
    expect(s.inventory.carp).toBe(0);expect(s.home.fish.length).toBe(7);
    expect(apply(s,'pondAdd',{id:'carp'}).state).toBe(s);
    s=JSON.parse(JSON.stringify(s));expect(validateSave(s)).toBe(true);
    s=apply(s,'pondRemove',{id:'carp'}).state;
    expect(s.inventory.carp+s.home.fish.length).toBe(7);
    expect(apply(s,'pondRemove',{id:'rare'}).state).toBe(s);
  });
  it('holds as many fish as the player owns and moves them in bulk',()=>{
    let s=initialState();s.home.pond=true;s.inventory.goldfish=40;s.inventory.trout=3;
    s=apply(s,'pondAdd',{id:'goldfish',amount:40}).state;
    s=apply(s,'pondAdd',{id:'trout',amount:3}).state;
    expect(s.home.fish.length).toBe(43);expect(s.inventory.goldfish).toBe(0);
    expect(validateSave(JSON.parse(JSON.stringify(s)))).toBe(true);
    expect(apply(s,'pondAdd',{id:'goldfish',amount:1}).state).toBe(s);
    expect(apply(s,'pondRemove',{id:'trout',amount:4}).state).toBe(s);
    expect(apply(s,'pondRemove',{id:'trout',amount:0}).state).toBe(s);
    s=apply(s,'pondRemove',{id:'goldfish',amount:15}).state;
    expect(s.inventory.goldfish).toBe(15);expect(s.home.fish.filter(f=>f==='goldfish').length).toBe(25);
  });
});

describe('activity energy and painting recovery',()=>{
  it('saves paintings at zero energy without negative energy or consuming sales quota',()=>{
    const s=initialState(()=>0.9);s.energy=0;
    const art={kind:'painting' as const,name:'Evening',image:'data:image/png;base64,YQ=='};
    const saved=apply(s,'art',{art});expect(saved.ok).toBe(true);expect(saved.state.energy).toBe(0);
    expect(saved.state.artworks).toHaveLength(1);expect(validateSave(saved.state)).toBe(true);
    expect(apply(saved.state,'art',{art}).ok).toBe(true);expect(saved.state.artDay.used).toBe(0);
  });
  it('waters four plots from the middle of a row and eight at the highest level',()=>{
    const s=initialState();s.upgrades.farmLevel=3;s.upgrades.wateringLevel=1;
    s.farm=Array.from({length:12},()=>({seed:'daisy',age:0,watered:false}));
    const first=apply(s,'water',{index:2}).state;
    expect(first.farm.slice(0,4).every(p=>p.watered)).toBe(true);expect(first.farm[4].watered).toBe(false);
    s.upgrades.wateringLevel=2;
    const second=apply(s,'water',{index:2}).state;
    expect(second.farm.filter(p=>p.watered)).toHaveLength(8);expect(second.energy).toBe(97);
  });
  it('accepts and preserves 200 energy saves',()=>{
    const s=initialState();s.upgrades.energyLevel=5;s.maxEnergy=200;s.energy=200;
    expect(validateSave(s)).toBe(true);expect(apply(s,'upgradeEnergy').state).toBe(s);
  });
});

describe("Food shop",()=>{
  for(const food of FOODS)it(`buys and eats ${food.id}, persists and caps restoration`,()=>{
    const s=initialState(()=>.1);s.money=1000;s.energy=0;
    const bought=apply(s,"buyFood",{id:food.id});
    expect(bought.ok).toBe(true);expect(bought.state.money).toBe(1000-food.price);
    expect(validateSave(JSON.parse(JSON.stringify(bought.state)))).toBe(true);
    const ate=apply(bought.state,"eatFood",{id:food.id});
    expect(ate.state.energy).toBe(food.energy);expect(ate.state.inventory[food.id]).toBe(0);
    expect(apply(ate.state,"eatFood",{id:food.id}).ok).toBe(false);
    bought.state.energy=99;expect(apply(bought.state,"eatFood",{id:food.id}).state.energy).toBe(100);
    bought.state.energy=100;const full=apply(bought.state,"eatFood",{id:food.id});expect(full.ok).toBe(false);expect(full.state.inventory[food.id]).toBe(1);
  });
  it("rejects invalid and unaffordable purchases without changing inventory",()=>{
    const s=initialState(()=>.1);s.money=0;
    for(const id of [FOODS[0].id,"food:unknown"]){const result=apply(s,"buyFood",{id});expect(result.ok).toBe(false);expect(result.state).toEqual(s);}
  });
});

describe('Balanced fishing and cooked meals',()=>{
  for(const food of GRILLED_FISH)it(`eats ${food.id} once, caps energy and cannot eat raw fish`,()=>{
    const s=initialState();s.energy=0;s.inventory[food.id]=2;
    const ate=apply(s,'eatFood',{id:food.id});expect(ate.ok).toBe(true);expect(ate.state.energy).toBe(food.energy);expect(ate.state.inventory[food.id]).toBe(1);
    ate.state.energy=99;const capped=apply(ate.state,'eatFood',{id:food.id});expect(capped.state.energy).toBe(100);expect(capped.state.inventory[food.id]).toBe(0);
    s.energy=100;expect(apply(s,'eatFood',{id:food.id}).state).toBe(s);
    s.energy=0;s.inventory.carp=1;expect(apply(s,'eatFood',{id:'carp'}).ok).toBe(false);
  });
  it('charges cast time and energy once and rejects unaffordable or late casts atomically',()=>{
    const s=initialState();const cast=apply(s,'cast');expect(cast.state.energy).toBe(90);expect(cast.state.time).toBe(s.time+15);
    for(const [time,energy] of [[1430,100],[600,9]]){s.time=time;s.energy=energy;expect(apply(s,'cast').state).toBe(s);}
  });
});

describe('Catch identity for result icons',()=>{
  it('returns the exact item ID for every outcome and rod, including overlapping carp names',()=>{
    for(const level of [0,1,2]){
      const s=initialState();s.upgrades.rodLevel=level;let start=0;
      for(const item of catchTable(level)){
        const result=transition(s,{type:'catch'},()=>start+item.chance/2);
        expect(result.ok).toBe(true);expect(result.caughtItemId).toBe(item.id);
        expect(result.state.inventory[result.caughtItemId!]).toBe(1);
        start+=item.chance;
      }
    }
  });
});

describe('Home garden rest and economy safeguards',()=>{
  it('unlocks double recovery with the final home upgrade, caps energy and preserves midnight rules',()=>{
    const s=initialState();s.energy=0;
    expect(apply(s,'rest',{index:1}).state).toBe(s);
    s.upgrades.homeLevel=3;
    const home=apply(s,'rest',{index:1});expect(home.state.energy).toBe(40);expect(home.state.time).toBe(s.time+30);
    expect(apply(s,'rest').state.energy).toBe(20);
    s.energy=90;expect(apply(s,'rest',{index:1}).state.energy).toBe(100);
    s.energy=100;expect(apply(s,'rest',{index:1}).state).toBe(s);
    s.energy=0;s.time=1430;const night=apply(s,'rest',{index:1});expect(night.state.day).toBe(s.day+1);expect(night.state.energy).toBe(60);
  });
  it('keeps bulk meals and fertilizer tiers economical while preserving profitable flower harvests',()=>{
    for(let i=1;i<FOODS.length;i++)expect(FOODS[i].price/FOODS[i].energy).toBeLessThanOrEqual(FOODS[i-1].price/FOODS[i-1].energy);
    for(let i=1;i<FERTILIZERS.length;i++)expect(FERTILIZERS[i].price/FERTILIZERS[i].days).toBeLessThan(FERTILIZERS[i-1].price/FERTILIZERS[i-1].days);
    for(const flower of FLOWERS){
      expect(flower.sell-flower.seed).toBeGreaterThan(0);
      for(const fertilizer of FERTILIZERS)expect(flower.sell-flower.seed-fertilizer.price).toBeGreaterThanOrEqual(0);
    }
    for(const cooked of GRILLED_FISH)expect(cooked.price/cooked.energy).toBeGreaterThan(FOODS[2].price/FOODS[2].energy);
  });
});

describe('New scenes: sea pier, Deep Woods and Skyhill',()=>{
  it('catches only sea fish or junk at the pier with exact rod chances, distinct from the lake',()=>{
    for(const level of [0,1,2]){
      const table=seaCatchTable(level);
      expect(table.reduce((n,e)=>n+e.chance,0)).toBeCloseTo(1,10);
      expect(table.find(e=>e.id==='tuna')!.chance).toBe([.04,.12,.2][level]);
      expect(table.every(e=>!FISH.some(f=>f.id===e.id))).toBe(true);
      const s=initialState();s.upgrades.rodLevel=level;let start=0;
      for(const item of table){
        const r=transition(s,{type:'catch',id:'sea'},()=>start+item.chance/2);
        expect(r.caughtItemId).toBe(item.id);expect(r.state.inventory[item.id]).toBe(1);
        start+=item.chance;
      }
    }
    expect(SEA_FISH.map(f=>f.price)).toEqual([45,70,120,280,90]);
  });
  it('sells and grills sea fish but keeps them out of the freshwater pond',()=>{
    const s=initialState();s.inventory.tuna=2;s.home.pond=true;
    const sold=apply(s,'sell',{id:'tuna'});expect(sold.state.money).toBe(500+280);
    const grilled=apply(s,'grill',{id:'tuna'});expect(grilled.state.inventory['grilled:tuna']).toBe(1);
    expect(GRILLED_FISH.find(f=>f.id==='grilled:tuna')!.price).toBe(420);
    expect(apply(s,'pondAdd',{id:'tuna'}).ok).toBe(false);
  });
  it('forages each spot once per day for energy and time, then regrows next morning',()=>{
    const s=initialState();
    const rare=FORAGE_SPOTS.findIndex(p=>p.item==='forage:rare-mushroom');
    const r=apply(s,'forage',{index:rare});
    expect(r.ok).toBe(true);expect(r.state.inventory['forage:rare-mushroom']).toBe(1);
    expect(r.state.energy).toBe(97);expect(r.state.time).toBe(s.time+5);
    expect(apply(r.state,'forage',{index:rare}).ok).toBe(false);
    expect(apply(s,'forage',{index:99}).ok).toBe(false);
    expect(apply({...s,energy:2},'forage',{index:0}).ok).toBe(false);
    expect(apply({...s,time:1436},'forage',{index:0}).ok).toBe(false);
    const sold=apply(r.state,'sell',{id:'forage:rare-mushroom'});expect(sold.state.money).toBe(650);
    const next=day(r.state);expect(next.foraged).toEqual([]);expect(apply(next,'forage',{index:rare}).ok).toBe(true);
    expect(FORAGE.map(f=>f.price)).toEqual([25,20,30,150]);
  });
  it('migrates version 5 saves and validates foraged spots and wider positions',()=>{
    const old:any=initialState();old.version=5;delete old.foraged;old.inventory.carp=1;
    const migrated:any=migrateSave(old);
    expect(validateSave(migrated)).toBe(true);expect(migrated.foraged).toEqual([]);expect(migrated.inventory.carp).toBe(1);
    const s=initialState();
    expect(validateSave({...s,foraged:[0,0]})).toBe(false);
    expect(validateSave({...s,foraged:[FORAGE_SPOTS.length]})).toBe(false);
    expect(validateSave({...s,position:{x:70,z:-16,yaw:0}})).toBe(true);
    expect(validateSave({...s,position:{x:0,z:66,yaw:0}})).toBe(true);
  });
  it('connects every scene by walkable paths and raises the lookout hill and pier',()=>{
    colliders.length=0;
    expect(SCENES.length).toBeGreaterThanOrEqual(5);
    for(const scene of SCENES){expect(canMove(scene.x,scene.z)).toBe(true);expect(sceneAt(scene.x,scene.z).id).toBe(scene.id);}
    for(let x=16;x<=60;x++)expect(canMove(x,-16)).toBe(true);
    for(let x=-18;x>=-60;x--)expect(canMove(x,15)).toBe(true);
    for(let z=40;z<=66;z++)expect(canMove(0,z)).toBe(true);
    for(let x=56;x<=75;x++)expect(canMove(x,PIER.z)).toBe(true);
    expect(canMove(70,-10)).toBe(false);
    // Areas are fenced apart and the sea is closed: entry is through the gates only.
    for(const [x,z] of [[46,0],[46,30],[-46.5,0],[-46.5,30],[10,44.5],[-15,44.5],[60,0],[60,-30]])expect(canMove(x,z)).toBe(false);
    for(const [x,z] of [[44.5,-40],[-44.5,40],[55,35],[55,-50],[58.5,0],[19,66]])expect(canMove(x,z)).toBe(true);
    expect(groundHeight(HILL.x,HILL.z)).toBe(HILL.height);
    expect(groundHeight(0,40)).toBe(0);
    expect(groundHeight(74,PIER.z)).toBe(PIER.height);
    for(const spot of FORAGE_SPOTS)expect(canMove(spot.x,spot.z)).toBe(true);
  });
});
