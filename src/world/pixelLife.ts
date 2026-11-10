// Pixel-art weather, critters and water effects from pixelfx, placed around the six scenes.
import { colliders, groundHeight } from "./bridge";
import { landscapeMaterial } from "./homeGarden";
import { WATERFALL } from "./scenes";
import { pixelMaterial, pixelPlane, pixelTexture, type PixelTexture } from "./pixelfx";

export type PixelLifeFrame = {
  time: number;
  dt: number;
  hours: number;
  night: boolean;
  dusk: boolean;
  rain: boolean;
  day: number;
  scene: string;
  camera: any;
  low: boolean;
};

// Colour ramps, dark to bright, so each critter can come in several looks.
const BUTTERFLIES: Record<string, string[]>[] = [
  {},
  { palette: ["#1a0a04", "#4a1a08", "#8a3410", "#d0601c", "#f49a32", "#ffd27a", "#fff4d6"], spots: ["#140804", "#2a1608", "#fff6e0", "#ffffff"] },
  { palette: ["#2a0a1e", "#5a1840", "#9a2e6e", "#d8549c", "#f48cc4", "#ffc4e4", "#fff4fa"], spots: ["#3a0a22", "#f0e05a", "#fff4a0", "#ffffff"] },
  { palette: ["#2a2006", "#5a4410", "#9a7a1a", "#d8b42a", "#f4dc52", "#fff09a", "#fffbe0"], spots: ["#1a1408", "#3a2a10", "#6a4a1a", "#fff6d0"] },
  { palette: ["#140a2a", "#2c1658", "#4e2a96", "#7a46cc", "#a87aec", "#d8baff", "#f8f0ff"], spots: ["#1a0a30", "#f070b0", "#ffb0d8", "#ffffff"] },
  { palette: ["#06180e", "#0e3a1e", "#1a6a34", "#2ea052", "#5ad27a", "#a8f0b8", "#f0fff4"], spots: ["#0a1a0e", "#e8c040", "#fff08a", "#ffffff"] },
];
const BIRDS: Record<string, string[]>[] = [
  {},
  { palette: ["#140c08", "#2a1a10", "#4a2e1a", "#6e4628", "#94683e", "#c09a6e", "#f0e0c8"] },
  { palette: ["#1a1404", "#3a2c08", "#6a5410", "#a8861c", "#dcbc32", "#f6e46a", "#fffbd0"], breast: ["#5a3a08", "#c8861a", "#f4b83a", "#ffe08a"] },
  { palette: ["#1a0606", "#3a0c0c", "#6a1414", "#a41e1e", "#d83a2a", "#f47a5a", "#ffd8c8"], breast: ["#2a0808", "#6a1414", "#c42a1e", "#f06a4a"] },
];
const GULL = { palette: ["#1a1e26", "#3a424e", "#6a7482", "#a4adb8", "#d0d6dc", "#eef1f4", "#ffffff"], breast: ["#8a929c", "#c8ced4", "#eef1f4", "#ffffff"] };
const SLIMES: Record<string, string[]>[] = [
  {},
  { palette: ["#060c1a", "#0b1f3f", "#123a72", "#1f62b0", "#3f94e0", "#8cd0ff", "#e6f6ff"] },
  { palette: ["#1a0612", "#3f0b2a", "#72124e", "#b01f7a", "#e047a8", "#ff9ad6", "#ffe6f4"] },
  { palette: ["#0e061a", "#22103f", "#3c1a72", "#5e2ab0", "#8a4ae0", "#c09aff", "#f2e6ff"] },
  { palette: ["#1a0c04", "#3f1e08", "#723a10", "#b0601a", "#e08a2a", "#ffc06a", "#fff0d2"] },
];
const FISH_SCHOOLS: Record<string, string[]>[] = [
  {},
  { palette: ["#1a1404", "#3a2c08", "#7a5c10", "#c09a1c", "#f0cc3a", "#fff08a", "#fffbe0"], stripe: ["#0a1a4a", "#1a4ab0", "#4a8af0"] },
  { palette: ["#0e141c", "#22303e", "#3e5262", "#64808e", "#98b4bc", "#d4e6ea", "#ffffff"], stripe: ["#1a2a3a", "#3a6a8a", "#7ab4d0"] },
  { palette: ["#1a0606", "#3e0e0c", "#721c16", "#b03424", "#e05e3e", "#ffa07e", "#ffe6dc"], stripe: ["#d8d8d8", "#f4f4f4", "#ffffff"] },
];
const JELLIES: Record<string, string[]>[] = [
  {},
  { palette: ["#2a0b1c", "#501638", "#86235e", "#b83c8a", "#e066b4", "#f59cd6", "#ffd6ee", "#ffffff"], glow: ["#501030", "#a8306a", "#f070a8", "#ffd0e8"] },
  { palette: ["#0b142b", "#162a50", "#234886", "#3c6eb8", "#66a0e0", "#9ccaf5", "#d6f0ff", "#ffffff"] },
  { palette: ["#2b140b", "#502616", "#864023", "#b8643c", "#e09066", "#f5bc9c", "#ffe6d6", "#ffffff"], glow: ["#503010", "#a86a1f", "#e8b44f", "#fff0b8"] },
  { palette: ["#0b2b1e", "#165038", "#23865e", "#3cb886", "#66e0ae", "#9cf5d0", "#d6fff0", "#ffffff"], glow: ["#0b5035", "#1fa87f", "#4fe8b2", "#b8ffe8"] },
];
// Each day picks one leaf colouring, one firefly glow and the night's sky shows.
const LEAF_SEASONS: Record<string, string[]>[] = [
  {},
  {
    palette: ["#0e2a0c", "#1e4a14", "#3a7a1e", "#5ea42e", "#9ad25a", "#e0f8b0"],
    reds: ["#1a3a0c", "#2e5e14", "#4e8a22", "#76b43a", "#aee070", "#ecffd0"],
    golds: ["#2a3a0c", "#4e6a14", "#7e9a1e", "#b4c83a", "#e4f07a", "#fbffe0"],
  },
  {
    palette: ["#3a1020", "#7a2a46", "#c05a80", "#e88ab0", "#ffc4dc", "#fff0f6"],
    reds: ["#401028", "#80204a", "#c84078", "#f070a4", "#ffa8cc", "#ffe4f0"],
    golds: ["#3a1a2a", "#7a3a5a", "#c87a9a", "#f0b0c8", "#ffe0ec", "#ffffff"],
  },
  {
    palette: ["#3e300c", "#7a5c14", "#b8901e", "#e8c23a", "#fff09a", "#fffbe0"],
    reds: ["#3e200c", "#7a3c14", "#b8601e", "#e88c3a", "#ffc07a", "#fff0d8"],
  },
  {
    palette: ["#40101a", "#7c1c22", "#b8302a", "#e85a3c", "#ff9a72", "#ffd8c4"],
    golds: ["#4a1d0c", "#8a3a14", "#c8621e", "#f0982e", "#ffcf72", "#fff0c4"],
  },
];
const FIREFLY_GLOWS: Record<string, string[]>[] = [
  {},
  { palette: ["#3a240a", "#7a4a12", "#d08a22", "#ffc04a", "#ffe8a8", "#ffffff"] },
  { palette: ["#0a2a3a", "#12587a", "#22a6d0", "#5ae0ff", "#b8f6ff", "#ffffff"] },
];
const AURORAS: Record<string, string[]>[] = [
  {},
  {
    palette: ["#1e0818", "#3a0d36", "#66134e", "#a01f6a", "#d83f8e", "#f79abf", "#fff0f6"],
    upper: ["#0b1a2a", "#16304f", "#20508a", "#3474c0", "#62a4e8", "#b4d8ff", "#eef6ff"],
  },
];
const METEORS: Record<string, string[]>[] = [{}, { palette: ["#1e2a5a", "#3a4a8a", "#607ae0", "#6ab0ff", "#a8e6ff", "#ffffff"] }];

/** A repeatable 0..1 roll for one day, so a reload keeps the same weather show. */
export function dayRoll(day: number, salt: number) {
  const x = Math.sin(day * 127.1 + salt * 311.7) * 43758.5453;
  return x - Math.floor(x);
}
export function nightShows(day: number, rain: boolean) {
  const stars = dayRoll(day, 1) < 0.6,
    aurora = dayRoll(day, 2) < 0.4,
    clouds = rain || dayRoll(day, 3) < 0.45;
  return { stars: stars || (!aurora && !clouds), aurora, clouds, fireflies: !rain };
}

type Board = {
  mesh: any;
  geos: any[];
  mode: "full" | "yaw" | "fixed";
  turn: boolean;
  last: any;
  px: PixelTexture;
};

export function buildPixelLife(w: any) {
  const T = window.AFRAME.THREE,
    group = new T.Group();
  w.world.add(group);
  const textures: PixelTexture[] = [],
    boards: Board[] = [],
    lit: any[] = [];
  const tex = (id: string, options: Record<string, unknown> = {}, crop?: [number, number, number, number]) => {
    const px = pixelTexture(id, options, crop);
    textures.push(px);
    return px;
  };
  const material = (px: PixelTexture, extra: Record<string, unknown> = {}, tinted = true) => {
    const m = pixelMaterial(px, extra);
    if (tinted) lit.push(m);
    return m;
  };
  // A camera-facing card; "turn" ones flip to face the way they move, since every effect faces right.
  const board = (px: PixelTexture, mat: any, height: number, anchorRow: number, mode: Board["mode"], turn = false) => {
    const geos = [pixelPlane(px, height, anchorRow), pixelPlane(px, height, anchorRow, true)],
      mesh = new T.Mesh(geos[0], mat);
    mesh.frustumCulled = false;
    group.add(mesh);
    const b: Board = { mesh, geos, mode, turn, last: new T.Vector3(), px };
    boards.push(b);
    return b;
  };
  const place = (b: Board, x: number, y: number, z: number) => b.mesh.position.set(x, y, z);

  // ---- Rain: a pixel curtain pinned in front of the camera.
  const rainTex = tex("weather/rain", { bare: true, density: 0.3 }, [0, 0, 320, 150]);
  const rain = new T.Mesh(
    new T.PlaneGeometry(1, 1),
    pixelMaterial(rainTex, { fog: false, depthTest: false, alphaTest: 0, opacity: 0.55 }),
  );
  // Two tiles across keep the drops fine on wide screens.
  rainTex.texture.wrapS = T.RepeatWrapping;
  rainTex.texture.repeat.set(2, 1);
  rain.renderOrder = 999;
  rain.frustumCulled = false;

  // ---- Night sky shows on curved panels that ride with the player, like the sky dome.
  const skyGroup = new T.Group();
  group.add(skyGroup);
  const skyPanels: { mesh: any; px: PixelTexture; show: "stars" | "aurora" | "clouds" }[] = [];
  const skyPanel = (px: PixelTexture, show: "stars" | "aurora" | "clouds", center: number, span: number, base: number, additive: boolean) => {
    const radius = 190,
      height = (radius * span * px.height) / px.width;
    const geo = new T.CylinderGeometry(radius, radius, height, 24, 1, true, center - span / 2, span);
    const uv = geo.attributes.uv;
    for (let i = 0; i < uv.count; i++) uv.setX(i, 1 - uv.getX(i));
    geo.translate(0, base + height / 2, 0);
    const mesh = new T.Mesh(
      geo,
      pixelMaterial(px, { fog: false, side: T.BackSide, alphaTest: 0, opacity: 0, blending: additive ? T.AdditiveBlending : T.NormalBlending }),
    );
    mesh.frustumCulled = false;
    skyGroup.add(mesh);
    skyPanels.push({ mesh, px, show });
  };
  // Angles: 0 faces +z (south), π faces -z (north, toward the lake).
  const aurora = tex("weather/aurora", { bare: true });
  skyPanel(aurora, "aurora", Math.PI, 1.6, 4, true);
  skyPanel(aurora, "aurora", Math.PI * 0.15, 1.4, 6, true);
  const meteorsA = tex("weather/shooting-stars", { bare: true, seed: 4 }),
    meteorsB = tex("weather/shooting-stars", { bare: true, seed: 11 });
  skyPanel(meteorsA, "stars", Math.PI * 0.8, 1.7, 10, true);
  skyPanel(meteorsB, "stars", -Math.PI * 0.45, 1.7, 14, true);
  const cloudsA = tex("weather/clouds", { bare: true, seed: 7 }),
    cloudsB = tex("weather/clouds", { bare: true, seed: 13 });
  skyPanel(cloudsA, "clouds", Math.PI * 1.05, 1.35, 0, false);
  skyPanel(cloudsB, "clouds", Math.PI * 0.35, 1.35, -4, false);
  skyPanel(cloudsA, "clouds", -Math.PI * 0.4, 1.35, -2, false);

  // ---- Fireflies over the garden beds, the woods and the hill at night.
  const fireflyTex = [tex("weather/fireflies", { bare: true, seed: 2 }, [0, 0, 320, 150]), tex("weather/fireflies", { bare: true, seed: 9 }, [0, 0, 320, 150])];
  const fireflyMats = fireflyTex.map((px) => material(px, { blending: T.AdditiveBlending, alphaTest: 0 }, false));
  const fireflies = [
    [22, 10], [-24, 4], [5, 1], [-6, 10], [23, 24], [-24, 23], [-60, 20], [-70, 30], [-56, 2], [-74, 6], [-6, 74], [8, 60],
  ].map(([x, z], i) => {
    const b = board(fireflyTex[i % 2], fireflyMats[i % 2], 3.6, 75, "full");
    place(b, x, 1.5 + groundHeight(x, z), z);
    return b;
  });

  // ---- Falling leaves near trees in the daytime, coloured by the day's season.
  const leafTex = [tex("weather/falling-leaves", { bare: true, seed: 8 }, [0, 0, 320, 150]), tex("weather/falling-leaves", { bare: true, seed: 3 }, [0, 0, 320, 150])];
  const leafMats = leafTex.map((px) => material(px));
  const leaves = [
    [-55, 20], [-63, 8], [-72, 22], [-66, -4], [-77, 14], [-52, 32], [2.5, 70.4], [30, -28], [-32, -26], [-34, 30], [36, 28], [-16, -6],
  ].map(([x, z], i) => {
    const b = board(leafTex[i % 2], leafMats[i % 2], 4.6, 75, "full");
    place(b, x, 3.4 + groundHeight(x, z), z);
    return b;
  });

  // ---- Songbirds over the valley and gulls over the beach.
  const birdTex = BIRDS.map((o, i) => tex("critters/bird", { ...o, seed: i + 1 }));
  const birdMats = birdTex.map((px) => material(px));
  const birds = Array.from({ length: 6 }, (_, i) => board(birdTex[i % 4], birdMats[i % 4], 2.5, 40, "full", true));
  const gullTex = tex("critters/bird", { ...GULL, seed: 6 }),
    gullMat = material(gullTex);
  const gulls = Array.from({ length: 6 }, (_, i) => ({
    b: board(gullTex, gullMat, 2.3, 40, "full", true),
    r: 6 + i * 2.2,
    speed: 0.00018 + i * 0.00003,
    y: 8 + (i % 3) * 2,
    cx: 62 + (i % 2) * 6,
    cz: -16 + (i - 3) * 4,
  }));

  // ---- Butterflies in six colours over the flower beds and the hill.
  const butterflyTex = BUTTERFLIES.map((o, i) => tex("critters/butterfly", { ...o, seed: i + 1 }));
  const butterflyMats = butterflyTex.map((px) => material(px));
  const flowerSpots = [[22, 10], [-24, 4], [5, 1], [-6, 10], [23, 24], [-24, 23], [-6, 62], [6, 70], [-8, 72], [7, 60]];
  const butterflies = Array.from({ length: 22 }, (_, i) => ({
    b: board(butterflyTex[i % 6], butterflyMats[i % 6], 1.05, 44, "full", true),
    center: flowerSpots[i < 18 ? i % 6 : 6 + (i - 18)],
    phase: i * 2.39,
  }));

  // ---- Deep Woods: snakes along the trails, slimes hopping, and the camp's fire.
  const snakeTex = tex("critters/snake"),
    snakeMat = material(snakeTex);
  const snakes = [[-61, 22], [-73, 18], [-56, 8]].map(([x, z], i) => ({ b: board(snakeTex, snakeMat, 1.05, 48, "yaw", true), x, z, phase: i * 2.1 }));
  const slimeTex = SLIMES.map((o, i) => tex("critters/slime", { ...o, seed: i + 1 }));
  const slimeMats = slimeTex.map((px) => material(px));
  const slimes = [[-60, 28], [-66, 18], [-75, 0], [-57, -2], [-70, 36]].map(([x, z], i) => ({ b: board(slimeTex[i], slimeMats[i], 1, 72, "yaw", true), x, z, phase: i * 1.7 }));
  const campfireTex = tex("fire/campfire");
  const campfire = board(campfireTex, material(campfireTex, {}, false), 2.9, 112, "yaw");
  place(campfire, -66.4, 0.22, 25.7);

  // ---- Sea: fish schools and jellyfish under the clear water round the pier.
  const sand = (x: number) => 0.015 - (x - 57) * 0.1,
    surface = -0.25;
  const schoolTex = FISH_SCHOOLS.map((o, i) => tex("critters/fish-school", { ...o, seed: i + 1, light: 0.5 }));
  // The sea writes no depth, so these draw after it, a little see-through and sea-tinted.
  const underwater = { opacity: 0.82 };
  const schoolMats = schoolTex.map((px) => material(px, underwater));
  const schools = [[68, -11], [71, -21], [74, -12], [67.5, -21.5]].map(([x, z], i) => {
    const b = board(schoolTex[i], schoolMats[i], 1.9, 40, "full", true);
    b.mesh.renderOrder = 1;
    return { b, x, z, phase: i * 1.3 };
  });
  const jellyTex = JELLIES.map((o, i) => tex("critters/jellyfish", { ...o, seed: i + 1 }));
  const jellies = [[70, -13.5], [73, -18.6], [76, -14.5], [69, -19], [75, -10.5]].map(([x, z], i) => {
    const b = board(jellyTex[i], material(jellyTex[i], { ...underwater, color: "#d8f2ee" }, false), 1.7, 60, "full");
    b.mesh.renderOrder = 1;
    return { b, x, z, phase: i * 2.3 };
  });

  // ---- Skyhill: a waterfall pouring off a rock outcrop at the hill's far edge, straight ahead of the path up.
  const fall = WATERFALL,
    fallY = groundHeight(fall.x, fall.z),
    facing = Math.atan2(0 - fall.x, 58 - fall.z);
  const waterfallTex = tex("water/waterfall");
  const waterfall = board(waterfallTex, material(waterfallTex), 14, 118, "fixed");
  place(waterfall, fall.x, fallY - 0.1, fall.z);
  waterfall.mesh.rotation.y = facing;
  const stone = landscapeMaterial(T),
    back = { x: -Math.sin(facing), z: -Math.cos(facing) },
    side = { x: Math.cos(facing), z: -Math.sin(facing) };
  // Boulders stacked behind and beside the falling water so it has something to pour from.
  for (const [along, out, up, r] of [
    [0, 4.6, 0.8, 4.1], [0, 4.3, 5.1, 3.8], [0, 3.8, 9.2, 3.1], [-5.9, 2.8, 1, 3.1], [5.9, 2.9, 1, 3.2],
    [-4.8, 3.3, 4.8, 2.5], [5, 3.4, 5.1, 2.7], [-2.4, 3.8, 11.7, 2.2], [2.5, 3.7, 11.5, 2], [8.2, 1.8, 0.4, 1.9], [-7.9, 1.7, 0.3, 1.7],
  ]) {
    const rock = new T.Mesh(new T.DodecahedronGeometry(r, 0), stone);
    rock.geometry.userData.owned = true;
    rock.position.set(fall.x + side.x * along + back.x * out, fallY + up, fall.z + side.z * along + back.z * out);
    rock.rotation.set(along, up, out);
    rock.scale.set(1, 0.85, 1);
    rock.castShadow = rock.receiveShadow = true;
    group.add(rock);
  }
  colliders.push({ x: fall.x + back.x * 3.3, z: fall.z + back.z * 3.3, w: 17, d: 6 });

  // ---- Ponds: bubbles rising through the water, rain splashes when it rains.
  const bubbleTex = tex("water/bubbles", { bare: true }, [0, 2, 104, 44]),
    bubbleMat = material(bubbleTex, { alphaTest: 0.02 });
  const splashTex = tex("water/rain-splash", { bare: true }),
    splashMat = material(splashTex, { alphaTest: 0.02 });
  const ponds = [
    { home: true, x: 23.2, z: 1.5, y: 0.48, size: 0.5 },
    { home: true, x: 25, z: 2.6, y: 0.48, size: 0.5 },
    { home: false, x: -4, z: -29, y: 0.035, size: 1.1 },
    { home: false, x: 3, z: -33, y: 0.035, size: 1.1 },
    { home: false, x: 6.5, z: -27, y: 0.035, size: 1.1 },
    { home: false, x: -7, z: -34, y: 0.035, size: 1.1 },
    { home: false, x: 0, z: -25, y: 0.035, size: 1.1 },
  ];
  const bubbles = ponds.map((p) => {
    const b = board(bubbleTex, bubbleMat, p.home ? p.size : 0.75, 10, "yaw");
    b.mesh.renderOrder = 2;
    place(b, p.x, p.y, p.z);
    return { b, p };
  });
  const splashes = [...ponds, { home: true, x: 24.4, z: 1.2, y: 0.48, size: 0.5 }, { home: false, x: -2, z: -36, y: 0.035, size: 1.1 }, { home: false, x: 8, z: -32, y: 0.035, size: 1.1 }, { home: false, x: -8, z: -27, y: 0.035, size: 1.1 }].map((p, i) => {
    const b = board(splashTex, splashMat, p.size * (p.home ? 1.15 : 1.6), 50, "yaw");
    b.mesh.renderOrder = 2;
    place(b, p.x + Math.sin(i * 2.2) * (p.home ? 0.4 : 2), p.y + p.size * 0.12, p.z + Math.cos(i * 1.7) * (p.home ? 0.3 : 2));
    return { b, p };
  });

  let lastDay = -1,
    drawClock = 0,
    skyClock = 0;
  const right = new T.Vector3(),
    camPos = new T.Vector3(),
    camQuat = new T.Quaternion(),
    nightTint = new T.Color("#7d8fb0"),
    duskTint = new T.Color("#f0cfb4"),
    dayTint = new T.Color("#ffffff"),
    rainTint = new T.Color("#c9d0d4"),
    tint = new T.Color();

  return (f: PixelLifeFrame) => {
    const t = f.time * 0.001,
      cam = f.camera;
    if (!cam) return;
    cam.getWorldPosition(camPos);
    cam.getWorldQuaternion(camQuat);
    right.set(1, 0, 0).applyQuaternion(camQuat);
    const near = (x: number, z: number, d: number) => Math.hypot(camPos.x - x, camPos.z - z) < d;

    if (f.day !== lastDay) {
      lastDay = f.day;
      leafTex.forEach((px) => px.setOptions(LEAF_SEASONS[Math.floor(dayRoll(f.day, 4) * LEAF_SEASONS.length)]));
      fireflyTex.forEach((px) => px.setOptions(FIREFLY_GLOWS[Math.floor(dayRoll(f.day, 5) * FIREFLY_GLOWS.length)]));
      aurora.setOptions(AURORAS[Math.floor(dayRoll(f.day, 6) * AURORAS.length)]);
      [meteorsA, meteorsB].forEach((px) => px.setOptions(METEORS[Math.floor(dayRoll(f.day, 7) * METEORS.length)]));
    }
    textures.forEach((px) => (px.active = false));
    const show = (b: Board, visible: boolean) => {
      b.mesh.visible = visible;
      if (visible) b.px.active = true;
    };

    // Darkness 0..1 over dusk and dawn so the sky shows fade instead of popping.
    const h = f.hours,
      dark = h >= 20 || h < 5 ? 1 : h >= 18.5 ? (h - 18.5) / 1.5 : h < 6 ? 1 - (h - 5) : 0;
    tint.copy(f.night ? nightTint : f.dusk ? duskTint : dayTint);
    if (f.rain) tint.multiply(rainTint);
    lit.forEach((m) => m.color.copy(tint));

    if (cam.children.indexOf(rain) < 0) cam.add(rain);
    rain.visible = f.rain;
    if (rain.visible) {
      rainTex.active = true;
      const d = 0.5,
        hh = 2 * d * Math.tan((cam.fov * Math.PI) / 360);
      rain.position.set(0, 0, -d);
      rain.scale.set(hh * cam.aspect, hh, 1);
    }

    const shows = nightShows(f.day, f.rain);
    skyGroup.position.set(camPos.x, 0, camPos.z);
    skyPanels.forEach((p) => {
      const on = dark > 0 && shows[p.show],
        target = on ? dark * (p.show === "clouds" ? 0.85 : 1) : 0;
      p.mesh.material.opacity += (target - p.mesh.material.opacity) * Math.min(1, f.dt * 1.5);
      p.mesh.visible = p.mesh.material.opacity > 0.01;
      if (p.mesh.visible) p.px.active = true;
    });

    fireflies.forEach((b, i) => show(b, shows.fireflies && dark > 0.5 && (!f.low || i % 2 === 0) && near(b.mesh.position.x, b.mesh.position.z, 70)));
    leaves.forEach((b) => show(b, !f.rain && dark < 0.6 && near(b.mesh.position.x, b.mesh.position.z, 60)));

    birds.forEach((b, i) => {
      const a = t * 0.065 + i * 0.5;
      place(b, Math.cos(a) * 31, 12 + i * 0.65 + Math.sin(a * 3) * 0.8, Math.sin(a) * 24 + 2);
      show(b, !f.night && !f.rain && (!f.low || i < 3));
    });
    gulls.forEach((g, i) => {
      const a = f.time * g.speed + i * 1.7;
      place(g.b, g.cx + Math.cos(a) * g.r, g.y + Math.sin(f.time * 0.0007 + i) * 0.6, g.cz + Math.sin(a) * g.r);
      show(g.b, !f.night && near(g.cx, g.cz, 90));
    });
    butterflies.forEach((bf, i) => {
      const a = t * 0.55 + bf.phase,
        [cx, cz] = bf.center;
      place(bf.b, cx + Math.sin(a) * 1.6, 0.85 + Math.sin(a * 1.8) * 0.32 + groundHeight(cx, cz), cz + Math.cos(a * 0.8) * 1.5);
      show(bf.b, !f.night && !f.rain && (!f.low || i < 8) && near(cx, cz, 60));
    });

    const inWoods = near(-64, 16, 42);
    snakes.forEach((s) => {
      place(s.b, s.x + Math.sin(t * 0.12 + s.phase) * 3, 0.03, s.z + Math.sin(t * 0.05 + s.phase) * 0.6);
      show(s.b, inWoods);
    });
    slimes.forEach((s) => {
      place(s.b, s.x + Math.sin(t * 0.18 + s.phase) * 1.6, 0.02, s.z + Math.cos(t * 0.15 + s.phase) * 1.6);
      show(s.b, inWoods);
    });
    show(campfire, near(-66.4, 25.7, 45));

    const atSea = f.scene === "beach";
    schools.forEach((s) => {
      const x = s.x + Math.sin(t * 0.09 + s.phase) * 2.2;
      place(s.b, x, (sand(x) + surface) / 2 - 0.05, s.z + Math.cos(t * 0.07 + s.phase) * 0.8);
      show(s.b, atSea);
    });
    jellies.forEach((j) => {
      const floor = sand(j.x) + 0.55;
      place(j.b, j.x + Math.sin(t * 0.05 + j.phase) * 0.6, floor + (surface - 0.35 - floor) * (0.5 + 0.5 * Math.sin(t * 0.25 + j.phase)), j.z);
      show(j.b, atSea);
    });

    show(waterfall, f.scene === "lookout" || near(fall.x, fall.z, 75));
    const homePond = !!w.pondWater;
    bubbles.forEach(({ b, p }) => show(b, (p.home ? homePond : true) && near(p.x, p.z, 28)));
    splashes.forEach(({ b, p }) => show(b, f.rain && (p.home ? homePond : true) && near(p.x, p.z, 30)));

    // Face the camera and turn to the way of travel.
    boards.forEach((b) => {
      if (!b.mesh.visible) return;
      const m = b.mesh;
      if (b.mode === "full") m.quaternion.copy(camQuat);
      else if (b.mode === "yaw") m.rotation.set(0, Math.atan2(camPos.x - m.position.x, camPos.z - m.position.z), 0);
      if (b.turn) {
        const dx = m.position.x - b.last.x,
          dy = m.position.y - b.last.y,
          dz = m.position.z - b.last.z,
          side = dx * right.x + dy * right.y + dz * right.z;
        if (Math.abs(side) > 1e-4) m.geometry = b.geos[side < 0 ? 1 : 0];
      }
      b.last.copy(m.position);
    });

    // Redraw the pixels at a pixel-art frame rate, the sky a little slower.
    const fps = f.low ? 10 : 15;
    drawClock += f.dt;
    skyClock += f.dt;
    if (drawClock >= 1 / fps) {
      const step = drawClock;
      drawClock = 0;
      textures.forEach((px) => {
        if (px.active && !skyPanels.some((p) => p.px === px)) px.draw(step);
      });
    }
    if (skyClock >= 1 / (f.low ? 6 : 10)) {
      const step = skyClock;
      skyClock = 0;
      new Set(skyPanels.filter((p) => p.px.active).map((p) => p.px)).forEach((px) => px.draw(step));
    }
  };
}
