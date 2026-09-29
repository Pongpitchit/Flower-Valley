import { attachFishModel } from "./fishModels";
import { addBreeze } from "./atmosphere";
import { FLOWERS } from "../game/data";
import { canMove } from "./bridge";

export function buildMeadows(
  w: any,
  makeFlower: (id: string) => any,
  random: () => number,
) {
  const T = window.AFRAME.THREE;
  const matrices: any[][] = FLOWERS.map(() => []);
  // Meadow bands and small village beds, with clear roads, crop plots and buildings.
  const patches = [
    [-26, 6, 6, 25, 260],
    [26, 5, 6, 25, 260],
    [-13, 35, 10, 5, 180],
    [14, 35, 10, 5, 180],
    [-12, -13, 6, 3, 120],
    [13, -9, 7, 3, 120],
    [-5, 9, 2, 3, 60],
    [5, 2, 2, 3, 60],
    [21, 12, 2, 7, 90],
  ];
  const dummy = new T.Object3D();
  for (const [cx, cz, rx, rz, count] of patches) {
    for (let i = 0; i < count; i++) {
      const angle = random() * Math.PI * 2,
        radius = Math.sqrt(random());
      const x = cx + Math.cos(angle) * rx * radius,
        z = cz + Math.sin(angle) * rz * radius;
      if (
        !canMove(x, z) ||
        (x>20.8 && x<27.2 && z>-.8 && z<4.8) ||
        (x>8.5 && x<17.5 && z>-8 && z<-.8) ||
        Math.abs(x) < 2.8 ||
        (x > 4.8 && x < 9.2 && z > -13.5 && z < -7) ||
        (x > -18 && x < -4 && z > -7 && z < 8) ||
        (Math.abs(z - 15) < 2.3 && x > -20 && x < 1) ||
        (Math.abs(z - 6) < 2 && x > 0 && x < 20) ||
        (Math.abs(z - 23) < 2 && x > 0 && x < 20) ||
        (Math.abs(z + 16) < 2 && x > -2 && x < 18) ||
        (x / 14.5) ** 2 + ((z + 31) / 12.5) ** 2 < 1
      )
        continue;
      dummy.position.set(x, 0.025, z);
      dummy.rotation.set(0, random() * Math.PI * 2, (random() - 0.5) * 0.14);
      dummy.scale.setScalar(0.5 + random() * 0.5);
      dummy.updateMatrix();
      matrices[Math.floor(random() * FLOWERS.length)].push(
        dummy.matrix.clone(),
      );
    }
  }
  for (let i = 0; i < FLOWERS.length; i++) {
    const template = makeFlower(FLOWERS[i].id);
    for (const part of template.children) {
      addBreeze(part.material, w.breezeClock, 0.13);
      const batch = new T.InstancedMesh(
        part.geometry,
        part.material,
        matrices[i].length,
      );
      matrices[i].forEach((matrix, index) => batch.setMatrixAt(index, matrix));
      batch.receiveShadow = true;
      batch.computeBoundingSphere();
      w.world.add(batch);
    }
  }
}

export function addNpcFace(w: any, g: any, name: string, skin: any) {
  const T = window.AFRAME.THREE;
  const surface = (color: string) =>
    new T.MeshStandardMaterial({ color, roughness: 0.85 });
  const hair = surface(
    (
      {
        Lily: "#62452f",
        Mae: "#42302a",
        Finn: "#74614b",
        Oliver: "#a56b3e",
        Emma: "#53392f",
      } as Record<string, string>
    )[name],
  );
  const dark = surface("#322922"),
    white = surface("#fff2dd"),
    iris = surface(name === "Finn" ? "#527d82" : "#5a704a");
  const cheek = surface("#cf8c78");
  const eyes: any[] = [];
  const ball = (
    material: any,
    x: number,
    y: number,
    z: number,
    sx: number,
    sy: number,
    sz: number,
  ) =>
    w.mesh(new T.SphereGeometry(1, 16, 12), material, x, y, z, sx, sy, sz, g);
  const curve = (points: number[][], radius: number, material: any) => {
    const path = new T.CatmullRomCurve3(points.map((p) => new T.Vector3(...p)));
    const mesh = new T.Mesh(
      new T.TubeGeometry(path, 12, radius, 6, false),
      material,
    );
    g.add(mesh);
    return mesh;
  };
  ball(hair, 0, 1.59, -0.045, 0.208, 0.21, 0.19);
  for (const side of [-1, 1]) {
    ball(skin, side * 0.194, 1.52, 0, 0.038, 0.061, 0.035);
    ball(cheek, side * 0.117, 1.49, 0.162, 0.041, 0.019, 0.013);
    eyes.push(ball(white, side * 0.074, 1.565, 0.177, 0.039, 0.041, 0.023));
    eyes.push(ball(iris, side * 0.072, 1.565, 0.198, 0.021, 0.026, 0.009));
    eyes.push(ball(dark, side * 0.072, 1.565, 0.205, 0.012, 0.018, 0.006));
    eyes.push(
      ball(white, side * 0.072 - 0.006, 1.574, 0.211, 0.006, 0.007, 0.004),
    );
    curve(
      [
        [side * 0.108, 1.622, 0.168],
        [side * 0.075, 1.634, 0.181],
        [side * 0.041, 1.623, 0.187],
      ],
      0.009,
      hair,
    );
    ball(hair, side * 0.177, 1.62, 0.023, 0.035, 0.12, 0.12);
    if (name === "Mae" || name === "Emma")
      ball(hair, side * 0.175, 1.42, -0.09, 0.075, 0.18, 0.09);
  }
  for (let i = 0; i < 5; i++)
    ball(
      hair,
      -0.14 + i * 0.07,
      1.712 - Math.abs(i - 2) * 0.01,
      0.092,
      0.066,
      0.065,
      0.1,
    );
  ball(skin, 0, 1.514, 0.203, 0.033, 0.045, 0.036);
  curve(
    [
      [-0.055, 1.457, 0.169],
      [0, 1.44, 0.186],
      [0.055, 1.457, 0.169],
    ],
    0.008,
    surface("#8a4e43"),
  );
  if (name === "Oliver") {
    for (const x of [-0.074, 0.074])
      w.mesh(
        new T.TorusGeometry(0.052, 0.005, 6, 24),
        dark,
        x,
        1.565,
        0.213,
        1,
        1,
        1,
        g,
      );
    curve(
      [
        [-0.024, 1.575, 0.218],
        [0, 1.583, 0.22],
        [0.024, 1.575, 0.218],
      ],
      0.004,
      dark,
    );
  }
  if (name === "Finn")
    for (const x of [-0.031, 0.031])
      ball(hair, x, 1.477, 0.204, 0.036, 0.013, 0.018);
  if (name === "Lily") {
    ball(surface("#d77f92"), -0.18, 1.72, 0.15, 0.055, 0.046, 0.02);
    ball(surface("#e0b659"), -0.18, 1.72, 0.172, 0.018, 0.018, 0.008);
  }
  if (name === "Mae" || name === "Oliver") {
    w.box(
      surface(name === "Mae" ? "#e8d5b4" : "#899a84"),
      0,
      1.015,
      0.166,
      0.34,
      0.48,
      0.04,
      g,
    );
    w.box(hair, 0, 0.96, 0.193, 0.16, 0.13, 0.025, g);
  }
  eyes.forEach((eye) => (eye.userData.openY = eye.scale.y));
  return eyes;
}

export function createLakeFish(w: any, index: number) {
  const T = window.AFRAME.THREE,
    fish = new T.Group();
  const palette = [
    ["#8b7139", "#bd904d"],
    ["#e7771a", "#f0b13d"],
    ["#307f9b", "#ac79c4"],
  ][index % 3];
  const material = (color: string) =>
    new T.MeshStandardMaterial({
      color,
      roughness: 0.78,
      emissive: color,
      emissiveIntensity: 0.12,
    });
  const body = material(palette[0]),
    fin = material(palette[1]),
    eye = material("#131e22");
  const sphere = new T.SphereGeometry(1, 16, 10);
  w.mesh(sphere, body, 0, 0, 0, 0.34, 0.13, 0.12, fish);
  const tail = w.mesh(
    new T.ConeGeometry(1, 1, 3),
    fin,
    -0.38,
    0,
    0,
    0.19,
    0.28,
    0.1,
    fish,
  );
  tail.rotation.z = -Math.PI / 2;
  for (const side of [-1, 1]) {
    w.mesh(sphere, eye, 0.24, 0.048, side * 0.08, 0.027, 0.027, 0.018, fish);
    const pectoral = w.mesh(
      sphere,
      fin,
      -0.05,
      -0.015,
      side * 0.135,
      0.13,
      0.018,
      0.08,
      fish,
    );
    pectoral.rotation.y = side * 0.5;
  }
  w.mesh(
    new T.ConeGeometry(1, 1, 3),
    fin,
    -0.035,
    0.115,
    0,
    0.13,
    0.2,
    0.04,
    fish,
  );
  fish.userData.tail = tail;
  attachFishModel(w,fish,index);
  return fish;
}
