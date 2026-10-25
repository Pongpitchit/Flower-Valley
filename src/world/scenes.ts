import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { addBreeze } from "./atmosphere";
import { villageProp } from "./villageProps";
import { bridge, colliders, groundHeight, HILL, PIER } from "./bridge";
import { FORAGE_SPOTS } from "../game/data";
import type { GameState } from "../game/engine";

// Three explorable scenes beyond the original valley: Breezy Beach (east),
// the Deep Woods (west) and Skyhill Lookout (south). Kenney CC0 models and
// Poly Haven CC0 textures; everything else is procedural.
const loader = new GLTFLoader();
const sources = new Map<string, Promise<any>>();
// Kenney's saturated teal foliage is recoloured once to match the valley palette.
const PALETTE: Record<string, string> = {
  grass: "#6e8f45", leafsGreen: "#5d8a3e", leafsDark: "#3f6634", woodBark: "#8a6347", woodBarkDark: "#6e4d3a",
  dirt: "#8d7258", stone: "#a7a596", wood: "#b98c63", woodInner: "#d8bf98",
};
const source = (url: string) => {
  if (!sources.has(url))
    sources.set(url, loader.loadAsync(url).then((g) => {
      if (url.includes("/woods/") || url.includes("/tree_palm"))
        g.scene.traverse((o: any) => o.isMesh && PALETTE[o.material.name] && o.material.color.set(PALETTE[o.material.name]));
      return g.scene;
    }));
  return sources.get(url)!;
};
const loadError = () => bridge.onError("โหลดโมเดลฉากใหม่ไม่สำเร็จ ลองรีเฟรชเกม");
type Place = { x: number; z: number; h: number; y?: number; yaw?: number };
let seed = 9137;
const rand = () => {
  seed = (seed * 16807) % 2147483647;
  return (seed - 1) / 2147483646;
};
const between = (a: number, b: number) => a + rand() * (b - a);

// One InstancedMesh per source mesh keeps dense props to a few draw calls.
function scatter(w: any, url: string, places: Place[], breeze = 0) {
  if (!places.length) return;
  const T = window.AFRAME.THREE;
  source(url)
    .then((scene) => {
      if (w.removed) return;
      scene.updateMatrixWorld(true);
      const box = new T.Box3().setFromObject(scene),
        size = box.getSize(new T.Vector3()),
        center = box.getCenter(new T.Vector3());
      const base = new T.Matrix4().makeTranslation(-center.x, -box.min.y, -center.z);
      const o = new T.Object3D();
      scene.traverse((node: any) => {
        if (!node.isMesh) return;
        const geometry = node.geometry.clone().applyMatrix4(base.clone().multiply(node.matrixWorld));
        let material = node.material;
        if (breeze) {
          material = material.clone();
          addBreeze(material, w.breezeClock, breeze);
        }
        const mesh = new T.InstancedMesh(geometry, material, places.length);
        places.forEach((p, i) => {
          o.position.set(p.x, p.y ?? groundHeight(p.x, p.z), p.z);
          o.rotation.set(0, p.yaw ?? rand() * Math.PI * 2, 0);
          o.scale.setScalar(p.h / size.y);
          o.updateMatrix();
          mesh.setMatrixAt(i, o.matrix);
        });
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        w.world.add(mesh);
      });
    })
    .catch(loadError);
}
function place(w: any, url: string, x: number, y: number, z: number, h: number, yaw = 0, parent = w.world) {
  const T = window.AFRAME.THREE,
    holder = new T.Group();
  holder.position.set(x, y, z);
  holder.rotation.y = yaw;
  parent.add(holder);
  source(url)
    .then((scene) => {
      if (w.removed) return;
      const model = scene.clone(true),
        box = new T.Box3().setFromObject(model),
        size = box.getSize(new T.Vector3()),
        center = box.getCenter(new T.Vector3());
      model.position.set(-center.x, -box.min.y, -center.z);
      model.traverse((o: any) => {
        if (o.isMesh) o.castShadow = o.receiveShadow = true;
      });
      const inner = new T.Group();
      inner.add(model);
      inner.scale.setScalar(h / size.y);
      holder.add(inner);
    })
    .catch(loadError);
  return holder;
}
function texture(url: string, srgb: boolean) {
  const T = window.AFRAME.THREE,
    t = new T.TextureLoader().load(url, undefined, undefined, loadError);
  t.wrapS = t.wrapT = T.RepeatWrapping;
  t.anisotropy = 4;
  if (srgb) t.colorSpace = T.SRGBColorSpace;
  return t;
}
// Flat ribbon that follows the terrain; world-space UVs match the village paths.
function ribbon(w: any, material: any, points: [number, number][], width: number, lift = 0.03) {
  const T = window.AFRAME.THREE,
    pos: number[] = [],
    uv: number[] = [],
    index: number[] = [];
  const samples: [number, number, number, number][] = [];
  for (let i = 0; i < points.length - 1; i++) {
    const [x1, z1] = points[i],
      [x2, z2] = points[i + 1],
      len = Math.hypot(x2 - x1, z2 - z1),
      steps = Math.max(1, Math.ceil(len / 0.8));
    for (let s = i ? 1 : 0; s <= steps; s++)
      samples.push([x1 + ((x2 - x1) * s) / steps, z1 + ((z2 - z1) * s) / steps, (x2 - x1) / len, (z2 - z1) / len]);
  }
  samples.forEach(([x, z, dx, dz], i) => {
    for (const side of [-1, 1]) {
      const px = x - dz * side * width * 0.5,
        pz = z + dx * side * width * 0.5;
      pos.push(px, groundHeight(px, pz) + lift, pz);
      uv.push(px / 3, pz / 3);
    }
    if (i) index.push(i * 2 - 2, i * 2, i * 2 - 1, i * 2 - 1, i * 2, i * 2 + 1);
  });
  const geo = new T.BufferGeometry();
  geo.setAttribute("position", new T.Float32BufferAttribute(pos, 3));
  geo.setAttribute("uv", new T.Float32BufferAttribute(uv, 2));
  geo.setIndex(index);
  geo.computeVertexNormals();
  if (geo.attributes.normal.getY(0) < 0) {
    index.reverse();
    geo.setIndex(index);
    geo.computeVertexNormals();
  }
  const mesh = new T.Mesh(geo, material);
  mesh.receiveShadow = true;
  w.world.add(mesh);
  return mesh;
}
function waves(material: any, clock: { value: number }, height: number) {
  material.onBeforeCompile = (shader: any) => {
    shader.uniforms.waveTime = clock;
    shader.vertexShader = "uniform float waveTime;\n" + shader.vertexShader.replace(
      "#include <begin_vertex>",
      `#include <begin_vertex>
      vec4 waveWorld = modelMatrix * vec4(position, 1.0);
      transformed.y += (sin(waveWorld.x * .33 + waveTime * 1.3) * .6 + sin(waveWorld.z * .21 - waveTime * .8) * .4) * ${height.toFixed(3)};`,
    );
  };
  material.customProgramCacheKey = () => `scene-waves-${height}`;
}
function canvasTexture(width: number, height: number, draw: (ctx: CanvasRenderingContext2D) => void) {
  const T = window.AFRAME.THREE,
    c = document.createElement("canvas");
  c.width = width;
  c.height = height;
  draw(c.getContext("2d")!);
  const t = new T.CanvasTexture(c);
  t.colorSpace = T.SRGBColorSpace;
  return t;
}
const softDot = () =>
  canvasTexture(64, 64, (ctx) => {
    const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    g.addColorStop(0, "rgba(255,255,255,1)");
    g.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 64, 64);
  });
// A timber gate with the scene name, facing travellers who arrive from the valley.
function gate(w: any, text: string, x: number, z: number, yaw: number, span = 4.6) {
  const T = window.AFRAME.THREE,
    g = new T.Group();
  g.position.set(x, 0, z);
  g.rotation.y = yaw;
  for (const side of [-1, 1]) {
    w.mesh(new T.CylinderGeometry(0.13, 0.16, 3.6, 8), w.m.darkWood, side * span * 0.5, 1.8, 0, 1, 1, 1, g);
    w.mesh(new T.SphereGeometry(0.2, 10, 8), w.m.wood, side * span * 0.5, 3.66, 0, 1, 1, 1, g);
  }
  w.mesh(new T.BoxGeometry(span + 0.6, 0.18, 0.22), w.m.wood, 0, 3.4, 0, 1, 1, 1, g);
  const sign = w.sign(text, 0, 2.95, 0.12, 3);
  w.world.remove(sign);
  g.add(sign);
  w.world.add(g);
  g.updateMatrixWorld(true);
  for (const side of [-1, 1]) {
    const p = new T.Vector3(side * span * 0.5, 0, 0).applyMatrix4(g.matrixWorld);
    colliders.push({ x: p.x, z: p.z, w: 0.4, d: 0.4 });
  }
}

export function buildBeach(w: any) {
  const T = window.AFRAME.THREE,
    clock = w.breezeClock;
  // Sand slopes gently under the sea from x≈58.
  const sandHeight = (x: number, z: number) =>
    x < 57 ? 0.015 + Math.max(0, Math.sin(z * 0.37 + x * 0.6) * 0.05) * Math.min(1, (57 - x) / 4) : 0.015 - (x - 57) * 0.1;
  const sandGeo = new T.PlaneGeometry(30, 170, 60, 120);
  sandGeo.rotateX(-Math.PI / 2);
  sandGeo.translate(62, 0, 0);
  const sp = sandGeo.attributes.position,
    suv = sandGeo.attributes.uv;
  for (let i = 0; i < sp.count; i++) {
    sp.setY(i, sandHeight(sp.getX(i), sp.getZ(i)));
    suv.setXY(i, sp.getX(i) / 5, sp.getZ(i) / 5);
  }
  sandGeo.computeVertexNormals();
  const sand = new T.Mesh(
    sandGeo,
    new T.MeshStandardMaterial({
      color: "#f1e2c4",
      map: texture("/textures/scenes/sand-color.jpg", true),
      normalMap: texture("/textures/scenes/sand-normal.jpg", false),
      roughness: 1,
    }),
  );
  sand.receiveShadow = true;
  w.world.add(sand);
  // Shallow turquoise fades to deep blue toward the horizon.
  const seaGeo = new T.PlaneGeometry(300, 360, 150, 120);
  seaGeo.rotateX(-Math.PI / 2);
  seaGeo.translate(57 + 150, -0.25, 0);
  const seaColors: number[] = [],
    shallow = new T.Color("#62c3c2"),
    deep = new T.Color("#245f84"),
    c = new T.Color();
  const seaPos = seaGeo.attributes.position;
  for (let i = 0; i < seaPos.count; i++) {
    c.copy(shallow).lerp(deep, Math.min(1, Math.max(0, (seaPos.getX(i) - 60) / 28)));
    seaColors.push(c.r, c.g, c.b);
  }
  seaGeo.setAttribute("color", new T.Float32BufferAttribute(seaColors, 3));
  const seaMaterial = new T.MeshStandardMaterial({ vertexColors: true, roughness: 0.16, metalness: 0.08, transparent: true, opacity: 0.9 });
  waves(seaMaterial, clock, 0.09);
  w.world.add(new T.Mesh(seaGeo, seaMaterial));
  const foamTexture = canvasTexture(64, 16, (ctx) => {
    const g = ctx.createLinearGradient(0, 0, 64, 0);
    g.addColorStop(0, "rgba(255,255,255,0)");
    g.addColorStop(0.45, "rgba(255,255,255,.9)");
    g.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 64, 16);
  });
  const foams: any[] = [];
  for (let i = 0; i < 2; i++) {
    const foam = new T.Mesh(
      new T.PlaneGeometry(1.6, 170),
      new T.MeshBasicMaterial({ map: foamTexture, transparent: true, depthWrite: false, opacity: 0.5 }),
    );
    foam.rotation.x = -Math.PI / 2;
    foam.position.set(59.6 + i * 1.6, -0.18, 0);
    w.world.add(foam);
    foams.push(foam);
  }

  // Wooden fishing pier; the deck matches PIER/groundHeight so the player walks on top.
  for (let x = PIER.x0 + 0.17; x < PIER.x1 + 0.4; x += 0.36) {
    const top = Math.min(PIER.height, (x - PIER.x0) * 0.12);
    w.box(w.m.wood, x, top - 0.05, PIER.z, 0.32, 0.1, PIER.half * 2 + 0.25);
  }
  for (let x = 59; x <= 76; x += 2.5)
    for (const side of [-1, 1]) {
      w.box(w.m.darkWood, x, -0.65, PIER.z + side * 1.3, 0.22, 2.2, 0.22);
      if (x > 61) w.box(w.m.darkWood, x, 0.95, PIER.z + side * 1.3, 0.12, 1, 0.12);
    }
  for (const side of [-1, 1]) {
    w.box(w.m.darkWood, 67.8, 0.33, PIER.z + side * 1.3, 17.2, 0.14, 0.12);
    w.box(w.m.wood, 69, 1.42, PIER.z + side * 1.3, 15.4, 0.08, 0.14);
  }
  villageProp(w, "lantern", 75.6, PIER.height, PIER.z - 1.05, 1.3);
  villageProp(w, "lantern", 75.6, PIER.height, PIER.z + 1.05, 1.3);
  place(w, "/models/beach/barrel.glb", 63.4, PIER.height, PIER.z - 0.85, 0.7);
  place(w, "/models/beach/crate.glb", 64.3, PIER.height, PIER.z - 0.9, 0.55, 0.3);
  colliders.push({ x: 63.8, z: PIER.z - 0.9, w: 1.7, d: 0.4 });
  w.targets.push({ id: "sea-fishing", kind: "fishing", index: 1, name: "ปลายท่าเรือ", hint: "ตกปลาทะเล • พลังงาน −10", x: 75, z: PIER.z });

  // Boats rock on the swell; the far ship sits on the horizon.
  const boats = [
    place(w, "/models/beach/boat-row-small.glb", 68, -0.32, PIER.z + 3.1, 0.9, 0.2),
    place(w, "/models/beach/boat-row-large.glb", 64.5, -0.32, PIER.z - 3.3, 1.1, -0.15),
    place(w, "/models/beach/ship-small.glb", 118, -0.4, 34, 9, 1.2),
  ];

  // Red-and-white lighthouse on a rocky islet.
  const lighthouse = new T.Group();
  lighthouse.position.set(69, 0, -33);
  w.world.add(lighthouse);
  place(w, "/models/beach/rocks-sand-a.glb", 0, -0.6, 0, 1.6, 0, lighthouse);
  place(w, "/models/beach/rocks-sand-b.glb", 2.2, -0.5, 1.4, 1, 1.2, lighthouse);
  const red = new T.MeshStandardMaterial({ color: "#c2463c", roughness: 0.6 }),
    white = new T.MeshStandardMaterial({ color: "#f4efe4", roughness: 0.6 });
  for (let i = 0; i < 6; i++) {
    const r0 = 1.25 - i * 0.08,
      r1 = r0 - 0.08;
    w.mesh(new T.CylinderGeometry(r1, r0, 1.3, 20), i % 2 ? red : white, 0, 0.9 + i * 1.3, 0, 1, 1, 1, lighthouse);
  }
  w.mesh(new T.CylinderGeometry(1.2, 1.2, 0.16, 20), w.m.metal, 0, 8.7, 0, 1, 1, 1, lighthouse);
  const lamp = new T.MeshStandardMaterial({ color: "#fff1b8", emissive: "#ffd36b", emissiveIntensity: 0.4, transparent: true, opacity: 0.85 });
  w.mesh(new T.CylinderGeometry(0.62, 0.62, 1, 12), lamp, 0, 9.3, 0, 1, 1, 1, lighthouse);
  w.mesh(new T.ConeGeometry(0.9, 0.9, 16), red, 0, 10.2, 0, 1, 1, 1, lighthouse);
  const beam = new T.Group();
  beam.position.y = 9.3;
  lighthouse.add(beam);
  const beamMaterial = new T.MeshBasicMaterial({ color: "#fff3c4", fog: false, transparent: true, opacity: 0.1, depthWrite: false, blending: T.AdditiveBlending, side: T.DoubleSide });
  for (const dir of [1, -1]) {
    const cone = new T.Mesh(new T.ConeGeometry(2.2, 26, 16, 1, true), beamMaterial);
    cone.rotation.z = (dir * Math.PI) / 2;
    cone.position.x = -dir * 13;
    beam.add(cone);
  }
  const beacon = new T.PointLight("#ffd690", 0, 30, 1.6);
  beacon.position.y = 9.3;
  lighthouse.add(beacon);

  // Palms, umbrellas, towels, a sandcastle, shells and a half-buried chest.
  const palms: Place[] = [
    [49.5, -31], [51.5, -24.5], [53, -3.5], [50, 4], [55.5, 7], [48.5, -38], [55.5, -37.5], [52, 9.5],
  ].map(([x, z]) => ({ x, z, h: between(6.5, 8.5), y: 0 }));
  scatter(w, "/models/beach/tree_palmDetailedTall.glb", palms.filter((_, i) => i % 2 === 0), 0.03);
  scatter(w, "/models/beach/tree_palmBend.glb", palms.filter((_, i) => i % 2 === 1), 0.03);
  palms.forEach((p) => colliders.push({ x: p.x, z: p.z, w: 0.6, d: 0.6 }));
  scatter(w, "/models/woods/grass_leafsLarge.glb", Array.from({ length: 40 }, () => ({ x: between(47.5, 51), z: between(-40, 10), h: between(0.25, 0.5), y: 0 })).filter((p) => Math.abs(p.z - PIER.z) > 2), 0.18);
  const stripes = (a: string, b: string) =>
    canvasTexture(256, 32, (ctx) => {
      for (let i = 0; i < 8; i++) {
        ctx.fillStyle = i % 2 ? a : b;
        ctx.fillRect(i * 32, 0, 32, 32);
      }
    });
  for (const [x, z, a, b] of [
    [55, -6, "#e8604f", "#fbf3e3"],
    [56, -26, "#3f8fb3", "#fbf3e3"],
    [53.5, -10.5, "#f1b847", "#fbf3e3"],
  ] as [number, number, string, string][]) {
    w.mesh(new T.CylinderGeometry(0.04, 0.04, 2.5, 6), w.m.white, x, 1.25, z, 1, 1, 1);
    const canopy = w.mesh(new T.ConeGeometry(1.5, 0.6, 16, 1, true), new T.MeshStandardMaterial({ map: stripes(a, b), side: T.DoubleSide, roughness: 0.8 }), x, 2.35, z, 1, 1, 1, w.world);
    canopy.rotation.z = 0.12;
    const towel = w.mesh(new T.BoxGeometry(0.9, 0.02, 1.8), new T.MeshStandardMaterial({ map: stripes(a, "#ffffff"), roughness: 1 }), x + 0.9, 0.07, z + 0.4, 1, 1, 1, w.world);
    towel.rotation.y = 0.3;
    colliders.push({ x, z, w: 0.3, d: 0.3 });
  }
  const sandMat = new T.MeshStandardMaterial({ color: "#e2cc9b", roughness: 1 });
  for (const [dx, dz, r, h] of [[0, 0, 0.55, 0.5], [0.7, 0.4, 0.22, 0.75], [-0.6, 0.4, 0.22, 0.75], [0.7, -0.5, 0.22, 0.75], [-0.6, -0.5, 0.22, 0.75]]) {
    w.mesh(new T.CylinderGeometry(r * 0.85, r, h, 10), sandMat, 57 + dx, h / 2, -9 + dz, 1, 1, 1, w.world);
    w.mesh(new T.ConeGeometry(r * 0.95, 0.3, 10), sandMat, 57 + dx, h + 0.15, -9 + dz, 1, 1, 1, w.world);
  }
  colliders.push({ x: 57, z: -9, w: 1.8, d: 1.6 });
  const shellColors = ["#f6d7cf", "#fbefe0", "#f0b9a0", "#e9c9e2"];
  for (let i = 0; i < 26; i++) {
    const x = between(50, 59),
      z = between(-39, 9);
    if (Math.abs(z - PIER.z) < 2.5) continue;
    if (i % 4 === 0) {
      const star = new T.Group();
      for (let a = 0; a < 5; a++) {
        const arm = w.mesh(new T.SphereGeometry(1, 8, 6), new T.MeshStandardMaterial({ color: "#e98a4c", roughness: 0.9 }), Math.sin((a / 5) * Math.PI * 2) * 0.07, 0, Math.cos((a / 5) * Math.PI * 2) * 0.07, 0.035, 0.015, 0.09, star);
        arm.rotation.y = (a / 5) * Math.PI * 2;
      }
      star.position.set(x, 0.05, z);
      w.world.add(star);
    } else w.mesh(new T.SphereGeometry(0.07, 8, 6, 0, Math.PI * 2, 0, Math.PI / 2), new T.MeshStandardMaterial({ color: shellColors[i % 4], roughness: 0.5 }), x, 0.03, z, 1, 0.6, 1.3, w.world);
  }
  place(w, "/models/beach/chest.glb", 57.5, -0.15, -34, 0.65, 0.5);
  place(w, "/models/woods/log.glb", 52, 0, -12, 0.45, 1.1);
  colliders.push({ x: 52, z: -12, w: 1.4, d: 1.4 });
  for (const [x, z, s] of [[59.5, -38.5, 1.3], [59.8, 7.5, 1.1], [60.5, -22, 0.8]]) place(w, "/models/beach/rocks-sand-b.glb", x, -0.3, z, s, rand() * 6);
  gate(w, "BREEZY BEACH", 46.2, PIER.z, -Math.PI / 2);

  // Gulls circle the bay; a silver fish leaps near the pier every few seconds.
  const gullMat = new T.MeshStandardMaterial({ color: "#f7f7f2", roughness: 0.8, side: T.DoubleSide });
  const gulls = Array.from({ length: 6 }, (_, i) => {
    const g = new T.Group(),
      wings: any[] = [];
    w.mesh(new T.SphereGeometry(1, 10, 8), gullMat, 0, 0, 0, 0.1, 0.09, 0.26, g);
    for (const side of [-1, 1]) {
      const hinge = new T.Group();
      w.mesh(new T.BoxGeometry(0.42, 0.012, 0.13), gullMat, side * 0.21, 0, 0, 1, 1, 1, hinge);
      g.add(hinge);
      wings.push(hinge);
    }
    w.world.add(g);
    return { g, wings, r: 6 + i * 2.2, speed: 0.00018 + i * 0.00003, y: 8 + (i % 3) * 2, cx: 62 + (i % 2) * 6, cz: -16 + (i - 3) * 4 };
  });
  const leaper = new T.Mesh(new T.SphereGeometry(1, 12, 8), new T.MeshStandardMaterial({ color: "#c8d4dc", metalness: 0.6, roughness: 0.3 }));
  leaper.scale.set(0.32, 0.12, 0.09);
  w.world.add(leaper);
  const splash = new T.Mesh(new T.RingGeometry(0.2, 0.32, 24), new T.MeshBasicMaterial({ color: "#ffffff", transparent: true, depthWrite: false }));
  splash.rotation.x = -Math.PI / 2;
  w.world.add(splash);
  let jumpStart = 0,
    jumpX = 70,
    jumpZ = -12;

  return (time: number, night: boolean, dusk: boolean) => {
    foams.forEach((f, i) => {
      const phase = Math.sin(time * 0.0007 + i * 2.2);
      f.position.x = 59.3 + i * 1.7 + phase * 0.45;
      f.material.opacity = 0.32 + 0.22 * Math.max(0, -phase);
    });
    boats.forEach((b, i) => {
      b.position.y = (i === 2 ? -0.4 : -0.32) + Math.sin(time * 0.0012 + i * 2) * 0.06;
      b.rotation.z = Math.sin(time * 0.0009 + i) * 0.04;
      b.rotation.x = Math.sin(time * 0.0011 + i * 3) * 0.03;
    });
    // Vertex-coloured water ignores most lighting, so dim it with the sky.
    seaMaterial.color.set(night ? "#2b3d55" : dusk ? "#d6b9a6" : "#ffffff");
    seaMaterial.envMapIntensity = night ? 0.2 : 1;
    beam.visible = night || dusk;
    beam.rotation.y = time * 0.0006;
    beacon.intensity = night ? 40 : dusk ? 15 : 0;
    lamp.emissiveIntensity = night || dusk ? 2.4 : 0.4;
    gulls.forEach((gull, i) => {
      const a = time * gull.speed + i * 1.7;
      gull.g.position.set(gull.cx + Math.cos(a) * gull.r, gull.y + Math.sin(time * 0.0007 + i) * 0.6, gull.cz + Math.sin(a) * gull.r);
      gull.g.rotation.y = -a;
      gull.g.visible = !night;
      gull.wings.forEach((wing: any, j: number) => (wing.rotation.z = (j ? -1 : 1) * Math.sin(time * 0.009 + i) * 0.45));
    });
    const t = (time - jumpStart) / 900;
    if (t > 7) {
      jumpStart = time;
      jumpX = between(63, 74);
      jumpZ = PIER.z + (rand() < 0.5 ? -1 : 1) * between(3, 7);
    }
    leaper.visible = t < 1;
    if (t < 1) {
      leaper.position.set(jumpX + t * 1.6, -0.25 + Math.sin(t * Math.PI) * 1.1, jumpZ);
      leaper.rotation.z = Math.cos(t * Math.PI) * 0.9;
    }
    const s = Math.max(0, t - 1);
    splash.visible = s < 1.2;
    splash.position.set(jumpX + 1.6, -0.15, jumpZ);
    splash.scale.setScalar(1 + s * 4);
    splash.material.opacity = Math.max(0, 0.6 - s * 0.5);
  };
}

const streamX = (z: number) => -62 + 1.2 * Math.sin(z * 0.15);
const WOOD_TRAILS: [number, number][][] = [
  [[-43, 15], [-58, 15], [-64, 15], [-70, 13], [-75, 8], [-78.5, -6]],
  [[-70, 13], [-70.5, 24], [-66, 33]],
  [[-58, 15], [-56.5, 24], [-58, 31.5]],
  [[-58, 15], [-55.5, 5], [-54, -3]],
];
const nearPolyline = (x: number, z: number, line: [number, number][], d: number) =>
  line.some((p, i) => {
    if (!i) return false;
    const [x1, z1] = line[i - 1],
      [x2, z2] = p,
      lx = x2 - x1,
      lz = z2 - z1,
      t = Math.max(0, Math.min(1, ((x - x1) * lx + (z - z1) * lz) / (lx * lx + lz * lz)));
    return Math.hypot(x - x1 - lx * t, z - z1 - lz * t) < d;
  });

export function buildWoods(w: any) {
  const T = window.AFRAME.THREE;
  const floorColor = texture("/textures/scenes/forest-floor-color.jpg", true),
    floorNormal = texture("/textures/scenes/forest-floor-normal.jpg", false);
  floorColor.repeat.set(9, 13);
  floorNormal.repeat.set(9, 13);
  const floor = new T.Mesh(new T.PlaneGeometry(38, 58), new T.MeshStandardMaterial({ color: "#a59b80", map: floorColor, normalMap: floorNormal, roughness: 1 }));
  floor.rotation.x = -Math.PI / 2;
  floor.position.set(-65.5, -0.012, 14);
  floor.receiveShadow = true;
  w.world.add(floor);
  WOOD_TRAILS.forEach((line) => ribbon(w, w.m.path, line, 1.9, 0.005));

  // A shallow brook with a plank bridge on the main trail.
  const brook: [number, number][] = [];
  for (let z = -14; z <= 42; z += 1) brook.push([streamX(z), z]);
  const waterMaterial = new T.MeshStandardMaterial({ color: "#4f8f90", roughness: 0.08, metalness: 0.1, transparent: true, opacity: 0.86 });
  waves(waterMaterial, w.breezeClock, 0.015);
  ribbon(w, waterMaterial, brook, 2.2, 0.025);
  const pebble = w.m.stone;
  for (let z = -13; z <= 41; z += 0.9)
    for (const side of [-1, 1]) {
      if (Math.abs(z - 15) < 1.5) continue;
      w.mesh(w.geometries.sphere, pebble, streamX(z) + side * between(1.05, 1.35), 0.04, z + between(-0.3, 0.3), between(0.12, 0.3), between(0.06, 0.14), between(0.12, 0.28));
    }
  for (let z = -12.5; z <= 40.5; z += 1.5) if (Math.abs(z - 15) > 1.6) colliders.push({ x: streamX(z), z, w: 2.3, d: 1.6 });
  for (let x = -63.8; x <= -58.4; x += 0.3) w.box(w.m.wood, x, 0.11, 15, 0.26, 0.08, 2.2);
  for (const side of [-1, 1]) {
    w.box(w.m.darkWood, -61.1, 0.85, 15 + side * 1.08, 5.4, 0.08, 0.08);
    for (const x of [-63.6, -61.1, -58.6]) w.box(w.m.darkWood, x, 0.45, 15 + side * 1.08, 0.1, 0.9, 0.1);
  }
  gate(w, "THE DEEP WOODS", -48.3, 15, Math.PI / 2);

  // Dense canopy kept clear of trails, the brook, the camp and every forage spot.
  const camp = { x: -67, z: 26.5 };
  const clear = (x: number, z: number, r: number) =>
    WOOD_TRAILS.some((l) => nearPolyline(x, z, l, 1.6 + r)) ||
    Math.abs(x - streamX(z)) < 1.8 + r ||
    Math.hypot(x - camp.x, z - camp.z) < 4 + r ||
    FORAGE_SPOTS.some((p) => Math.hypot(x - p.x, z - p.z) < 1.2 + r);
  const trees: Place[] = [];
  for (let i = 0; i < 500 && trees.length < 115; i++) {
    const edge = i % 4 === 0;
    const x = edge ? between(-88, -82) : between(-81, -49),
      z = edge ? between(-16, 44) : between(-11.5, 39.5);
    if (!edge && clear(x, z, 0.8)) continue;
    if (trees.some((t) => Math.hypot(t.x - x, t.z - z) < 2.7)) continue;
    trees.push({ x, z, h: between(7, 11.5), y: 0 });
    if (!edge) colliders.push({ x, z, w: 0.7, d: 0.7 });
  }
  for (let x = -82; x <= -50; x += 3.2)
    for (const z of [between(-16, -13), between(41, 44)]) trees.push({ x: x + between(-1, 1), z, h: between(7, 11), y: 0 });
  const models = ["/models/forest/oak-lush.glb", "/models/forest/spruce.glb", "/models/woods/tree_pineTallA_detailed.glb", "/models/forest/oak.glb", "/models/woods/tree_tall_dark.glb", "/models/woods/tree_fat_darkh.glb"];
  models.forEach((url, m) => scatter(w, url, trees.filter((_, i) => i % models.length === m), 0.015));
  const under = (count: number, h0: number, h1: number, r = 0.4) => {
    const out: Place[] = [];
    for (let i = 0; i < count * 6 && out.length < count; i++) {
      const x = between(-81, -49),
        z = between(-11.5, 39.5);
      if (clear(x, z, r)) continue;
      out.push({ x, z, h: between(h0, h1), y: 0 });
    }
    return out;
  };
  scatter(w, "/models/woods/plant_bushLarge.glb", under(30, 0.9, 1.6), 0.05);
  scatter(w, "/models/woods/plant_bush.glb", under(30, 0.6, 1), 0.05);
  scatter(w, "/models/woods/plant_flatTall.glb", under(60, 0.6, 1.1, 0.2), 0.12);
  scatter(w, "/models/woods/grass_leafsLarge.glb", under(110, 0.2, 0.42, 0.1), 0.18);
  scatter(w, "/models/woods/flower_purpleA.glb", under(26, 0.3, 0.5, 0.1), 0.15);
  scatter(w, "/models/woods/mushroom_tanGroup.glb", under(14, 0.25, 0.4, 0.1));
  const solid = (url: string, count: number, h0: number, h1: number, size: number) => {
    const items = under(count, h0, h1, size);
    items.forEach((p) => colliders.push({ x: p.x, z: p.z, w: size, d: size }));
    scatter(w, url, items);
  };
  solid("/models/woods/stump_old.glb", 6, 0.5, 0.8, 0.8);
  solid("/models/woods/log_large.glb", 5, 0.6, 0.8, 1.6);
  solid("/models/woods/rock_largeA.glb", 6, 0.8, 1.6, 1.3);
  solid("/models/woods/rock_tallB.glb", 3, 1.6, 2.4, 1.2);

  // Forager's camp: tent, stone fire ring and a log seat.
  place(w, "/models/woods/tent_detailedOpen.glb", camp.x - 2, 0, camp.z + 2.2, 2.2, Math.PI * 0.85);
  place(w, "/models/woods/campfire_stones.glb", camp.x + 0.6, 0, camp.z - 0.8, 0.35);
  place(w, "/models/woods/log.glb", camp.x + 2.4, 0, camp.z - 0.4, 0.45, 1.4);
  place(w, "/models/woods/canoe.glb", camp.x - 3.2, 0, camp.z - 2.2, 0.45, 0.4);
  colliders.push({ x: camp.x - 2, z: camp.z + 2.2, w: 2.6, d: 2.6 }, { x: camp.x + 0.6, z: camp.z - 0.8, w: 1.1, d: 1.1 });
  const flame = new T.Mesh(new T.ConeGeometry(0.18, 0.5, 8), new T.MeshBasicMaterial({ color: "#ffb347", transparent: true, opacity: 0.85 }));
  flame.position.set(camp.x + 0.6, 0.3, camp.z - 0.8);
  w.world.add(flame);
  const fireLight = new T.PointLight("#ff9a4a", 0, 9, 1.8);
  fireLight.position.set(camp.x + 0.6, 0.8, camp.z - 0.8);
  w.world.add(fireLight);

  // Forage spots; refreshForage hides the ones collected today.
  const spots = FORAGE_SPOTS.map((spot) => {
    const g = new T.Group();
    g.position.set(spot.x, 0, spot.z);
    w.world.add(g);
    if (spot.item === "forage:mushroom") place(w, "/models/woods/mushroom_redGroup.glb", 0, 0, 0, 0.42, rand() * 6, g);
    if (spot.item === "forage:berry") {
      place(w, "/models/woods/plant_bushDetailed.glb", 0, 0, 0, 0.9, rand() * 6, g);
      const berry = new T.MeshStandardMaterial({ color: "#3d4f9d", roughness: 0.35 }),
        redBerry = new T.MeshStandardMaterial({ color: "#c43a4a", roughness: 0.35 });
      for (let i = 0; i < 16; i++) {
        const a = rand() * Math.PI * 2,
          y = between(0.3, 0.8);
        w.mesh(w.geometries.sphere, i % 3 ? berry : redBerry, Math.cos(a) * 0.42, y, Math.sin(a) * 0.42, 0.05, 0.05, 0.05, g);
      }
    }
    if (spot.item === "forage:herb") {
      const leaf = new T.MeshStandardMaterial({ color: "#5f9b4a", roughness: 0.8 }),
        bloom = new T.MeshStandardMaterial({ color: "#f5f1e0", roughness: 0.8 });
      for (let i = 0; i < 9; i++) {
        const a = (i / 9) * Math.PI * 2,
          r = 0.12 + (i % 3) * 0.06;
        const stem = w.mesh(w.geometries.cone, leaf, Math.cos(a) * r, 0.22, Math.sin(a) * r, 0.05, 0.45, 0.05, g);
        stem.rotation.set(Math.sin(a) * 0.3, 0, -Math.cos(a) * 0.3);
        w.mesh(w.geometries.sphere, bloom, Math.cos(a) * r * 1.6, 0.46, Math.sin(a) * r * 1.6, 0.035, 0.035, 0.035, g);
      }
    }
    let glow: any = null;
    if (spot.item === "forage:rare-mushroom") {
      glow = new T.MeshStandardMaterial({ color: "#b58cff", emissive: "#9a63ff", emissiveIntensity: 1.2, roughness: 0.4 });
      const stem = new T.MeshStandardMaterial({ color: "#eef0ff", emissive: "#c8d0ff", emissiveIntensity: 0.3 });
      for (const [x, z, s] of [[0, 0, 1], [0.25, 0.15, 0.7], [-0.2, 0.2, 0.55]]) {
        w.mesh(w.geometries.cylinder, stem, x, 0.15 * s, z, 0.05 * s, 0.3 * s, 0.05 * s, g);
        w.mesh(new T.SphereGeometry(0.2 * s, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2), glow, x, 0.29 * s, z, 1, 0.7, 1, g);
      }
      const light = new T.PointLight("#a77bff", 6, 5, 2);
      light.position.y = 0.6;
      g.add(light);
    }
    const sparkle = new T.Sprite(new T.SpriteMaterial({ map: softDot(), color: glow ? "#d6c2ff" : "#fff6c9", transparent: true, depthWrite: false, blending: T.AdditiveBlending }));
    sparkle.scale.setScalar(0.35);
    g.add(sparkle);
    return { g, sparkle, glow };
  });

  // Daylight shafts, low mist and night fireflies give the woods depth.
  const shaftTexture = canvasTexture(32, 128, (ctx) => {
    const g = ctx.createLinearGradient(0, 0, 0, 128);
    g.addColorStop(0, "rgba(255,244,205,0)");
    g.addColorStop(0.35, "rgba(255,244,205,.85)");
    g.addColorStop(1, "rgba(255,244,205,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 32, 128);
  });
  const shaftMaterial = new T.MeshBasicMaterial({ map: shaftTexture, transparent: true, depthWrite: false, blending: T.AdditiveBlending, side: T.DoubleSide, opacity: 0.1 });
  const shafts = new T.Group();
  for (const [x, z] of [[-56, 9], [-66, 19], [-73, 3], [-60, 28], [-76, 26], [-53, -6], [-69, 35]]) {
    for (const r of [0, Math.PI / 2]) {
      const shaft = new T.Mesh(new T.PlaneGeometry(2.2, 15), shaftMaterial);
      shaft.position.set(x, 6.5, z);
      shaft.rotation.set(0, r, 0.32);
      shafts.add(shaft);
    }
  }
  w.world.add(shafts);
  const dot = softDot();
  const mist = Array.from({ length: 26 }, () => {
    const s = new T.Sprite(new T.SpriteMaterial({ map: dot, color: "#e8efe6", transparent: true, depthWrite: false, opacity: 0.12 }));
    s.scale.set(between(6, 10), between(1.6, 2.6), 1);
    s.userData = { x: between(-80, -50), z: between(-10, 38), speed: between(0.3, 0.8) };
    s.position.set(s.userData.x, between(0.5, 1.3), s.userData.z);
    w.world.add(s);
    return s;
  });
  const flyGeo = new T.BufferGeometry(),
    flyBase: number[] = [];
  for (let i = 0; i < 90; i++) flyBase.push(between(-80, -50), between(0.4, 3), between(-10, 38));
  flyGeo.setAttribute("position", new T.Float32BufferAttribute(flyBase, 3));
  const flies = new T.Points(flyGeo, new T.PointsMaterial({ color: "#e9ff9a", size: 0.16, map: dot, transparent: true, depthWrite: false, blending: T.AdditiveBlending }));
  w.world.add(flies);

  const update = (time: number, night: boolean, dusk: boolean) => {
    spots.forEach(({ sparkle, glow, g }, i) => {
      if (!g.visible) return;
      sparkle.position.y = 0.9 + Math.sin(time * 0.003 + i) * 0.12;
      sparkle.material.opacity = 0.45 + Math.sin(time * 0.005 + i * 2) * 0.35;
      if (glow) glow.emissiveIntensity = (night ? 2.2 : 1) + Math.sin(time * 0.003) * 0.4;
    });
    shafts.visible = !night;
    shaftMaterial.opacity = dusk ? 0.05 : 0.1 + Math.sin(time * 0.0004) * 0.02;
    mist.forEach((s, i) => {
      s.position.x = s.userData.x + Math.sin(time * 0.00008 * s.userData.speed + i) * 3;
      s.material.opacity = night ? 0.06 : 0.12;
    });
    flies.visible = night || dusk;
    if (flies.visible) {
      const p = flies.geometry.attributes.position;
      for (let i = 0; i < p.count; i++) {
        p.setX(i, flyBase[i * 3] + Math.sin(time * 0.0007 + i) * 0.8);
        p.setY(i, flyBase[i * 3 + 1] + Math.sin(time * 0.0011 + i * 2) * 0.4);
        p.setZ(i, flyBase[i * 3 + 2] + Math.cos(time * 0.0006 + i) * 0.8);
      }
      p.needsUpdate = true;
    }
    flame.scale.set(1 + Math.sin(time * 0.02) * 0.12, 1 + Math.sin(time * 0.031) * 0.2, 1);
    fireLight.intensity = night ? 10 + Math.sin(time * 0.02) * 2 : dusk ? 5 : 0;
  };
  const refresh = (s: GameState) => spots.forEach((spot, i) => (spot.g.visible = !s.foraged.includes(i)));
  return { update, refresh };
}

export const TELESCOPE = { x: -2.2, z: HILL.z - 4.1 };
export function buildLookout(w: any) {
  const T = window.AFRAME.THREE,
    size = HILL.radius * 2 + 2;
  const hillGeo = new T.PlaneGeometry(size, size, 96, 96);
  hillGeo.rotateX(-Math.PI / 2);
  hillGeo.translate(HILL.x, 0, HILL.z);
  const hp = hillGeo.attributes.position,
    huv = hillGeo.attributes.uv;
  for (let i = 0; i < hp.count; i++) {
    const x = hp.getX(i),
      z = hp.getZ(i);
    hp.setY(i, groundHeight(x, z) - 0.02);
    huv.setXY(i, (x + 80) / 160, (z + 80) / 160);
  }
  hillGeo.computeVertexNormals();
  const hill = new T.Mesh(hillGeo, w.m.grass);
  hill.receiveShadow = true;
  w.world.add(hill);
  ribbon(w, w.m.path, [[0, 40], [0, HILL.z - HILL.top - 0.2]], 2.2, 0.04);
  gate(w, "SKYHILL LOOKOUT", 0, 45, Math.PI);

  // Round deck with a railing open toward the valley.
  const top = HILL.height;
  w.mesh(new T.CylinderGeometry(5.4, 5.6, 0.3, 32), w.m.wood, HILL.x, top - 0.1, HILL.z, 1, 1, 1);
  const posts: [number, number][] = [];
  for (let a = 0; a < Math.PI * 2; a += Math.PI / 15) {
    if (Math.abs(a - Math.PI) < 0.36) continue;
    posts.push([HILL.x + Math.sin(a) * 5.15, HILL.z + Math.cos(a) * 5.15]);
  }
  posts.forEach(([x, z], i) => {
    w.box(w.m.darkWood, x, top + 0.5, z, 0.12, 1, 0.12);
    colliders.push({ x, z, w: 0.25, d: 0.25 });
    const [nx, nz] = posts[(i + 1) % posts.length];
    if (Math.hypot(nx - x, nz - z) > 1.5) return;
    const rail = w.mesh(w.geometries.box, w.m.wood, (x + nx) / 2, top + 0.98, (z + nz) / 2, Math.hypot(nx - x, nz - z) + 0.1, 0.08, 0.1, w.world);
    rail.rotation.y = -Math.atan2(nz - z, nx - x);
  });

  // Brass telescope aimed at the valley.
  const brass = new T.MeshStandardMaterial({ color: "#b8935a", metalness: 0.75, roughness: 0.3 });
  const scope = new T.Group();
  scope.position.set(TELESCOPE.x, top, TELESCOPE.z);
  w.world.add(scope);
  for (let i = 0; i < 3; i++) {
    const leg = w.mesh(w.geometries.cylinder, w.m.darkWood, Math.sin((i / 3) * Math.PI * 2) * 0.22, 0.55, Math.cos((i / 3) * Math.PI * 2) * 0.22, 0.03, 1.1, 0.03, scope);
    leg.rotation.set(Math.cos((i / 3) * Math.PI * 2) * -0.2, 0, Math.sin((i / 3) * Math.PI * 2) * 0.2);
  }
  const tube = w.mesh(new T.CylinderGeometry(0.07, 0.11, 0.9, 14), brass, 0, 1.25, -0.1, 1, 1, 1, scope);
  tube.rotation.x = Math.PI / 2 - 0.12;
  colliders.push({ x: TELESCOPE.x, z: TELESCOPE.z, w: 0.5, d: 0.5 });
  w.targets.push({ id: "viewpoint", kind: "viewpoint", name: "กล้องส่องทางไกล", hint: "ชมวิวทั้งหุบเขา", x: TELESCOPE.x, z: TELESCOPE.z + 0.6 });

  // Benches facing the view, a signpost, a lone oak, flags and a kite.
  for (const [x, z] of [[2.4, HILL.z - 2.6], [3.6, HILL.z + 0.6]]) {
    w.box(w.m.wood, x, top + 0.45, z, 1.6, 0.08, 0.45);
    w.box(w.m.wood, x, top + 0.8, z + 0.22, 1.6, 0.5, 0.06);
    for (const dx of [-0.7, 0.7]) w.box(w.m.darkWood, x + dx, top + 0.22, z, 0.08, 0.45, 0.4);
    colliders.push({ x, z, w: 1.6, d: 0.6 });
  }
  const post = { x: -4.1, z: HILL.z - 1.4 };
  w.box(w.m.darkWood, post.x, top + 1.2, post.z, 0.14, 2.4, 0.14);
  colliders.push({ x: post.x, z: post.z, w: 0.3, d: 0.3 });
  ["← THE DEEP WOODS", "BREEZY BEACH →", "↑ FLOWER VILLAGE"].forEach((text, i) => {
    const board = w.sign(text, post.x, top + 2 - i * 0.42, post.z + 0.08, 1.5);
    board.rotation.y = i === 2 ? 0 : (i ? -0.12 : 0.12);
  });
  scatter(w, "/models/forest/oak-lush.glb", [{ x: 2.5, z: HILL.z + 4.4, h: 9.5, y: groundHeight(2.5, HILL.z + 4.4) - 0.1 }], 0.012);
  colliders.push({ x: 2.5, z: HILL.z + 4.4, w: 0.8, d: 0.8 });
  const flagGeo = new T.PlaneGeometry(1.3, 0.75, 12, 4);
  flagGeo.translate(0.65, 0, 0);
  const flagBase = Float32Array.from(flagGeo.attributes.position.array);
  const flag = new T.Mesh(flagGeo, new T.MeshStandardMaterial({ map: canvasTexture(128, 64, (ctx) => {
    ctx.fillStyle = "#e7b54a";
    ctx.fillRect(0, 0, 128, 64);
    ctx.fillStyle = "#cf5f6a";
    ctx.beginPath();
    ctx.arc(46, 32, 16, 0, Math.PI * 2);
    ctx.fill();
  }), side: T.DoubleSide, roughness: 0.9 }));
  flag.position.set(-3.6, top + 3.5, HILL.z + 3);
  w.world.add(flag);
  w.mesh(w.geometries.cylinder, w.m.white, -3.6, top + 1.95, HILL.z + 3, 0.05, 3.9, 0.05);
  colliders.push({ x: -3.6, z: HILL.z + 3, w: 0.3, d: 0.3 });
  const kite = new T.Group();
  const kiteShape = new T.Shape();
  kiteShape.moveTo(0, 0.7);
  kiteShape.lineTo(0.45, 0);
  kiteShape.lineTo(0, -0.9);
  kiteShape.lineTo(-0.45, 0);
  kiteShape.closePath();
  w.mesh(new T.ShapeGeometry(kiteShape), new T.MeshStandardMaterial({ color: "#e0626d", side: T.DoubleSide, roughness: 0.8 }), 0, 0, 0, 1, 1, 1, kite);
  for (let i = 0; i < 5; i++) w.mesh(w.geometries.box, new T.MeshStandardMaterial({ color: ["#f3c552", "#7fb5d8"][i % 2] }), 0, -1.1 - i * 0.35, 0, 0.14, 0.04, 0.02, kite);
  w.world.add(kite);
  const anchor = new T.Vector3(4.2, top + 0.9, HILL.z + 0.4);
  const stringGeo = new T.BufferGeometry().setFromPoints([anchor, anchor.clone()]);
  const kiteString = new T.Line(stringGeo, new T.LineBasicMaterial({ color: "#f4f1e8" }));
  w.world.add(kiteString);

  // Wildflowers and tall grass on the slopes, clear of the path.
  const slope = (count: number, h0: number, h1: number) => {
    const out: Place[] = [];
    while (out.length < count) {
      const a = rand() * Math.PI * 2,
        r = between(HILL.top + 0.8, HILL.radius - 0.5),
        x = HILL.x + Math.sin(a) * r,
        z = HILL.z + Math.cos(a) * r;
      if (Math.abs(x) < 1.8 && z < HILL.z) continue;
      out.push({ x, z, h: between(h0, h1) });
    }
    return out;
  };
  scatter(w, "/models/woods/flower_purpleA.glb", slope(70, 0.3, 0.5), 0.15);
  scatter(w, "/models/woods/flower_yellowB.glb", slope(70, 0.3, 0.5), 0.15);
  scatter(w, "/models/woods/grass_leafsLarge.glb", slope(160, 0.18, 0.36), 0.18);
  const rocks = slope(7, 0.6, 1.2);
  rocks.forEach((p) => colliders.push({ x: p.x, z: p.z, w: 1, d: 1 }));
  scatter(w, "/models/woods/rock_largeA.glb", rocks);

  return (time: number) => {
    const p = flagGeo.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const x = flagBase[i * 3];
      p.setZ(i, Math.sin(time * 0.006 - x * 4) * 0.12 * x);
    }
    p.needsUpdate = true;
    flagGeo.computeVertexNormals();
    kite.position.set(9 + Math.sin(time * 0.0005) * 2, top + 13 + Math.sin(time * 0.0009) * 1.2, HILL.z + 9 + Math.cos(time * 0.0004) * 1.5);
    kite.rotation.set(-0.3, Math.PI + Math.sin(time * 0.0007) * 0.3, Math.sin(time * 0.0011) * 0.25);
    stringGeo.attributes.position.setXYZ(1, kite.position.x, kite.position.y - 0.9, kite.position.z);
    stringGeo.attributes.position.needsUpdate = true;
  };
}
