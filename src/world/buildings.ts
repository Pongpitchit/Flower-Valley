import { colliders } from "./bridge";
export function buildingMaterials(T: any) {
  const loader = new T.TextureLoader();
  const map = (file: string, color = false) => {
    const tex = loader.load("/textures/buildings/" + file + ".jpg");
    tex.wrapS = tex.wrapT = T.RepeatWrapping;
    tex.anisotropy = 8;
    if (color) tex.colorSpace = T.SRGBColorSpace;
    return tex;
  };
  const surface = (id: string, tint: string, tile: number) => {
    const m = new T.MeshStandardMaterial({
      color: tint,
      map: map(id + "-color", true),
      normalMap: map(id + "-normal"),
      roughnessMap: map(id + "-roughness"),
      normalScale: new T.Vector2(0.7, 0.7),
      roughness: 1,
    });
    m.userData.worldTile = tile;
    return m;
  };
  return {
    plaster: surface("plaster", "#ede1c9", 2),
    masonry: surface("masonry", "#a9a493", 2),
    tiles: surface("roof", "#a99a82", 2),
    studioWall: surface("plaster", "#dce0cc", 2),
  };
}
export function buildHome(w: any, makeFlower: (id: string) => any) {
  const T = window.AFRAME.THREE,
    m = w.m;
  w.homeWall = m.plaster.clone();
  const wall = w.homeWall,
    wood = m.wood,
    dark = m.darkWood,
    stone = m.masonry;
  w.box(stone, 13, 0.14, 3, 8.2, 0.3, 7.2);
  w.box(wood, 13, 0.3, 3, 7.8, 0.12, 6.8);
  // Front wall: actual openings for door and two windows.
  for (const x of [10.4, 15.6]) {
    w.box(wall, x, 0.75, 6.5, 2.8, 0.9, 0.24);
    w.box(wall, x, 3, 6.5, 2.8, 1, 0.24);
    for (const dx of [-1.1, 1.1]) w.box(wall, x + dx, 1.9, 6.5, 0.6, 1.4, 0.24);
    windowFrame(w, x, 1.9, 6.56, 1.55, 1.5);
  }
  w.box(wood, 13, 3.3, 6.5, 2.4, 0.4, 0.3);
  for (const x of [9, 17]) {
    w.box(wall, x, 0.75, 3, 0.24, 0.9, 7);
    w.box(wall, x, 3, 3, 0.24, 1, 7);
    for (const z of [0.1, 5.9]) w.box(wall, x, 1.9, z, 0.24, 1.4, 1.2);
    w.box(wall, x, 1.9, 3, 0.24, 1.4, 1.2);
    for (const z of [1.5, 4.5])
      windowFrame(
        w,
        x + (x === 9 ? -0.15 : 0.15),
        1.9,
        z,
        1.6,
        1.45,
        Math.PI / 2,
      );
  }
  w.box(wall, 13, 1.95, -0.5, 8, 3.3, 0.24);
  // Real timber baseboards, stone footings and corner posts.
  for (const x of [9, 17]) {
    w.box(stone, x, 0.46, 3, 0.3, 0.6, 7.2);
    w.box(dark, x, 3.4, 3, 0.21, 0.18, 7.3);
  }
  for (const x of [10.4, 15.6]) w.box(stone, x, 0.46, 6.55, 2.8, 0.6, 0.3);
  for (const x of [9, 11.8, 14.2, 17])
    w.box(dark, x, 1.9, 6.7, 0.13, 3.5, 0.18);
  for (const x of [9, 17]) w.box(dark, x, 1.9, -0.55, 0.18, 3.5, 0.18);
  gableRoof(w, 13, 3, 9, 8.4, 3.6, 5.35, wall);
  // Porch with individual boards and slim support columns.
  for (let i = 0; i < 24; i++)
    w.box(wood, 8.7 + i * 0.37, 0.2, 7.5, 0.34, 0.15, 1.6);
  for (const x of [9.1, 16.9]) {
    w.box(stone, x, 0.3, 8.2, 0.4, 0.6, 0.4);
    w.box(dark, x, 1.7, 8.2, 0.15, 2.7, 0.15);
  }
  w.box(dark, 13, 3.1, 8.2, 8.4, 0.15, 0.18);
  w.box(wood, 13, 0.08, 8.6, 2.7, 0.12, 0.7);
  // Shutters have modeled slats; windows reveal a furnished interior.
  const shutter = new T.MeshStandardMaterial({
    color: "#627864",
    map: m.wood.map,
    roughness: 0.8,
  });
  shutter.userData.worldTile = 1;
  for (const x of [9.4, 11.4, 14.6, 16.6]) {
    w.box(shutter, x, 1.9, 6.88, 0.35, 1.65, 0.08);
    for (let j = 0; j < 7; j++)
      w.box(dark, x, 1.3 + j * 0.2, 6.94, 0.3, 0.04, 0.04);
  }
  for (const x of [10.4, 15.6]) {
    w.box(wood, x, 0.93, 6.94, 1.9, 0.28, 0.5);
    w.box(m.soil, x, 1.09, 6.94, 1.72, 0.06, 0.35);
  }
  w.box(stone, 15.8, 4.8, 0.4, 0.8, 2.7, 0.9);
  w.box(dark, 15.8, 6.2, 0.4, 1, 0.13, 1.1);
  const bedding = new T.MeshStandardMaterial({
    color: "#c4bdaa",
    roughness: 1,
  });
  w.box(dark, 15, 0.48, 2, 1.8, 0.7, 2.6);
  w.box(bedding, 15, 0.9, 2, 1.7, 0.3, 2.5);
  w.box(m.white, 15, 1.09, 1.25, 1.25, 0.18, 0.55);
  w.box(dark, 15, 1.3, 0.68, 1.95, 1.1, 0.12);
  w.box(wood, 16.3, 0.6, 0.8, 0.6, 1.1, 0.65);
  buildFlowerTable(w, makeFlower);
  w.sign("HOME, SWEET HOME", 13, 3.12, 8.35, 2.6);
  for (const [x, z, width, depth] of [
    [9, 3, 0.3, 7],
    [17, 3, 0.3, 7],
    [13, -0.5, 8, 0.3],
    [10.4, 6.5, 2.8, 0.3],
    [15.6, 6.5, 2.8, 0.3],
    [15, 2, 1.8, 2.6],
    [16.3, 0.8, 0.6, 0.65],
  ])
    colliders.push({ x, z, w: width, d: depth });
}
function buildFlowerTable(w: any, makeFlower: (id: string) => any) {
  const T = window.AFRAME.THREE,
    m = w.m,
    x = 10.55,
    z = 2.6;
  // Keep the central route from the doorway to the bed clear.
  w.box(m.wood, x, 1.2, z, 2.1, 0.15, 1.15);
  for (const dx of [-0.86, 0.86])
    for (const dz of [-0.4, 0.4])
      w.box(m.darkWood, x + dx, 0.75, z + dz, 0.12, 0.9, 0.12);
  w.box(m.wood, x, 0.53, z, 1.85, 0.09, 0.9);
  w.box(m.darkWood, x, 1.04, z + 0.49, 1.95, 0.22, 0.1);
  const paper = new T.MeshStandardMaterial({ color: "#ceb48a", roughness: 1 });
  const ribbon = new T.MeshStandardMaterial({
    color: "#bd8796",
    roughness: 0.8,
  });
  const ceramic = new T.MeshStandardMaterial({
    color: "#ced7c3",
    roughness: 0.45,
  });
  w.box(paper, x + 0.22, 1.284, z + 0.14, 0.75, 0.012, 0.65);
  w.box(ribbon, x + 0.22, 1.294, z + 0.14, 0.05, 0.008, 0.65);
  // A vase of sample flowers, wrapping paper, twine and florist scissors.
  w.mesh(
    new T.CylinderGeometry(0.18, 0.13, 0.35, 20),
    ceramic,
    x - 0.62,
    1.46,
    z - 0.25,
    1,
    1,
    1,
  );
  for (const [id, dx, dz] of [
    ["daisy", -0.08, 0],
    ["tulip", 0.08, -0.03],
    ["rose", 0, 0.07],
  ] as const) {
    const bloom = makeFlower(id);
    bloom.scale.setScalar(0.58);
    bloom.position.set(x - 0.62 + dx, 1.56, z - 0.25 + dz);
    w.mergeGroup(bloom);
  }
  w.mesh(
    new T.CylinderGeometry(0.09, 0.09, 0.17, 16),
    paper,
    x + 0.78,
    1.37,
    z - 0.3,
    1,
    1,
    1,
  );
  const steel = new T.MeshStandardMaterial({
    color: "#b9c0bb",
    metalness: 0.65,
    roughness: 0.3,
  });
  for (const dx of [-0.05, 0.05]) {
    w.mesh(
      new T.TorusGeometry(0.048, 0.013, 6, 16).rotateX(Math.PI / 2),
      ribbon,
      x + 0.6 + dx,
      1.3,
      z + 0.28,
      1,
      1,
      1,
    );
    w.box(steel, x + 0.6 + dx, 1.3, z + 0.08, 0.018, 0.015, 0.23);
  }
  w.sign("FLOWER ARRANGING", x, 1.02, z + 0.56, 1.15);
  colliders.push({ x, z, w: 2.1, d: 1.15 });
  w.targets.push({
    id: "home-bouquet",
    kind: "bouquet",
    name: "โต๊ะจัดดอกไม้ในบ้าน",
    hint: "จัดดอกไม้ 3 ดอกเป็นช่อ",
    x,
    z,
  });
}
export function buildAtelier(w: any) {
  const m = w.m,
    wall = m.studioWall;
  w.box(m.masonry, 15, 0.1, 26, 7.4, 0.2, 7.4);
  w.box(m.wood, 15, 0.25, 26, 7, 0.12, 7);
  w.box(wall, 15, 1.9, 29.5, 7, 3.4, 0.24);
  // Wide doorway faces the village, windows bring daylight onto the workbenches.
  for (const x of [12.25, 17.75]) {
    w.box(wall, x, 0.85, 22.5, 1.5, 1.1, 0.22);
    w.box(wall, x, 3.15, 22.5, 1.5, 0.9, 0.22);
    windowFrame(w, x, 2, 22.35, 1.1, 1.3);
  }
  for (const x of [11.5, 18.5]) {
    w.box(wall, x, 0.78, 26, 0.24, 1, 7);
    w.box(wall, x, 3.1, 26, 0.24, 1, 7);
    for (const z of [23.05, 26, 28.95]) w.box(wall, x, 1.95, z, 0.24, 1.4, 1.1);
    for (const z of [24.5, 27.5])
      windowFrame(
        w,
        x + (x < 15 ? -0.15 : 0.15),
        1.95,
        z,
        1.75,
        1.45,
        Math.PI / 2,
      );
    w.box(m.masonry, x, 0.48, 26, 0.3, 0.7, 7.3);
  }
  for (const x of [11.5, 13, 17, 18.5])
    w.box(m.darkWood, x, 1.95, 22.3, 0.16, 3.6, 0.18);
  for (const x of [11.5, 18.5])
    w.box(m.darkWood, x, 1.95, 29.6, 0.18, 3.6, 0.18);
  w.box(m.darkWood, 15, 3.45, 22.4, 7.5, 0.18, 0.18);
  gableRoof(w, 15, 26, 8.1, 8, 3.6, 5.1, wall);
  // Double workshop doors held open against the front wall.
  w.box(m.wood, 12, 1.55, 22.05, 1.35, 2.7, 0.12);
  w.box(m.wood, 18, 1.55, 22.05, 1.35, 2.7, 0.12);
  for (const x of [12, 18])
    for (const y of [0.65, 2.4])
      w.box(m.darkWood, x, y, 21.96, 1.3, 0.12, 0.08);
  const sign = w.sign("THE LITTLE ATELIER", 15, 3.38, 22.1, 3.5);
  sign.rotation.y = Math.PI;
  // Trestle workbench, easel, shelves and visible studio tools.
  w.box(m.wood, 17.4, 1, 24.7, 2, 0.13, 1.2);
  for (const x of [16.7, 18.1]) {
    w.box(m.darkWood, x, 0.55, 24.7, 0.1, 0.9, 0.8);
    w.box(m.darkWood, x, 0.2, 24.7, 0.65, 0.1, 1);
  }
  w.box(m.white, 12.3, 1.65, 24.7, 1.4, 1.2, 0.09);
  w.box(m.wood, 12.3, 0.8, 24.7, 0.09, 1.6, 0.14);
  w.box(m.wood, 12.3, 1.01, 24.6, 1.6, 0.08, 0.2);
  w.box(m.wood, 12.3, 2.3, 24.7, 0.2, 0.13, 0.15);
  // Four gallery shelves leave one distinct slot per unsold artwork (up to 24).
  for(const y of [.67,1.35,2.03,2.71])w.box(m.wood,15,y,29.04,6.35,.06,.58);
  for(const x of [11.9,18.1])w.box(m.darkWood,x,1.72,29.12,.08,2.9,.4);
  for (const [x, z, width, depth] of [
    [11.5, 26, 0.25, 7],
    [18.5, 26, 0.25, 7],
    [15, 29.5, 7, 0.25],
    [12.25, 22.5, 1.5, 0.25],
    [17.75, 22.5, 1.5, 0.25],
    [17.4, 24.7, 2, 1.2],
  ])
    colliders.push({ x, z, w: width, d: depth });
}
function windowFrame(
  w: any,
  x: number,
  y: number,
  z: number,
  width: number,
  height: number,
  rotation = 0,
) {
  const T = window.AFRAME.THREE,
    g = new T.Group(),
    m = w.m;
  const box = (
    material: any,
    px: number,
    py: number,
    pz: number,
    sw: number,
    sh: number,
    sd: number,
  ) => w.box(material, px, py, pz, sw, sh, sd, g);
  const glass = new T.MeshPhysicalMaterial({
    color: "#bbd3c9",
    transparent: true,
    opacity: 0.26,
    roughness: 0.08,
    metalness: 0.05,
    side: T.DoubleSide,
  });
  box(glass, 0, 0, 0, width, height, 0.025);
  for (const dx of [-width / 2, width / 2])
    box(m.darkWood, dx, 0, 0.025, 0.11, height + 0.17, 0.14);
  for (const dy of [-height / 2, height / 2])
    box(m.darkWood, 0, dy, 0.025, width + 0.16, 0.11, 0.14);
  box(m.white, 0, 0, 0.07, 0.045, height, 0.06);
  box(m.white, 0, 0, 0.07, width, 0.045, 0.06);
  box(m.masonry, 0, -height / 2 - 0.13, 0.09, width + 0.32, 0.16, 0.32);
  g.position.set(x, y, z);
  g.rotation.y = rotation;
  w.mergeGroup(g);
}
function gableRoof(
  w: any,
  x: number,
  z: number,
  width: number,
  depth: number,
  eave: number,
  ridge: number,
  wall: any,
) {
  const T = window.AFRAME.THREE,
    l = x - width / 2,
    r = x + width / 2,
    f = z + depth / 2,
    b = z - depth / 2;
  const geometry = new T.BufferGeometry();
  geometry.setAttribute(
    "position",
    new T.Float32BufferAttribute(
      [
        l,
        eave,
        b,
        x,
        ridge,
        b,
        x,
        ridge,
        f,
        l,
        eave,
        b,
        x,
        ridge,
        f,
        l,
        eave,
        f,
        x,
        ridge,
        b,
        r,
        eave,
        b,
        r,
        eave,
        f,
        x,
        ridge,
        b,
        r,
        eave,
        f,
        x,
        ridge,
        f,
      ],
      3,
    ),
  );
  const u = Math.hypot(width / 2, ridge - eave) / 2,
    v = depth / 2;
  geometry.setAttribute(
    "uv",
    new T.Float32BufferAttribute(
      [0, 0, u, 0, u, v, 0, 0, u, v, 0, v, 0, 0, u, 0, u, v, 0, 0, u, v, 0, v],
      2,
    ),
  );
  geometry.computeVertexNormals();
  const material = w.m.tiles.clone();
  material.side = T.DoubleSide;
  if (wall === w.homeWall) w.homeRoof = material;
  const roof = new T.Mesh(geometry, material);
  roof.castShadow = true;
  roof.receiveShadow = true;
  w.world.add(roof);
  for (const zz of [z - depth / 2 + 0.4, z + depth / 2 - 0.4]) {
    const g = new T.BufferGeometry();
    g.setAttribute(
      "position",
      new T.Float32BufferAttribute(
        [l + 0.4, eave, zz, r - 0.4, eave, zz, x, ridge - 0.1, zz],
        3,
      ),
    );
    g.setAttribute(
      "uv",
      new T.Float32BufferAttribute(
        [0, 0, (width - 0.8) / 2, 0, (width - 0.8) / 4, (ridge - eave) / 2],
        2,
      ),
    );
    g.computeVertexNormals();
    const m = wall === w.homeWall ? wall : wall.clone();
    m.side = T.DoubleSide;
    const triangle = new T.Mesh(g, m);
    triangle.castShadow = true;
    w.world.add(triangle);
    w.branch(
      new T.Vector3(l, eave, zz),
      new T.Vector3(x, ridge, zz),
      0.075,
      w.m.darkWood,
    );
    w.branch(
      new T.Vector3(x, ridge, zz),
      new T.Vector3(r, eave, zz),
      0.075,
      w.m.darkWood,
    );
    w.box(w.m.darkWood, x, eave, zz, width, 0.14, 0.16);
  }
  for (const xx of [l, r])
    w.box(w.m.darkWood, xx, eave, z, 0.14, 0.2, depth + 0.1);
  for (let i = 0; i < Math.ceil(depth / 0.4); i++) {
    const cap = new T.Mesh(
      new T.CylinderGeometry(0.12, 0.12, 0.41, 12, 1, false, 0, Math.PI),
      wall === w.homeWall ? material : w.m.tiles,
    );
    cap.rotation.z = Math.PI / 2;
    cap.rotation.y = Math.PI / 2;
    cap.position.set(x, ridge, z - depth / 2 + i * 0.4);
    w.mergeGroup(cap);
  }
}
