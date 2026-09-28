import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

export const NPC_MODELS: Record<string, { code: string; outfit: string }> = {
  Rowan: { code:"B2", outfit:"เสื้อเขียว ผู้รับซื้อของจิปาถะ" },
  Theo: { code: "B1", outfit: "เสื้อแดง ช่างประจำหมู่บ้าน" },
  Lily: { code: "G3", outfit: "ชุดสีเขียว ร้านเมล็ดพันธุ์" },
  Mae: { code: "G2", outfit: "ชุดผ้ากันเปื้อน ร้านดอกไม้" },
  Finn: { code: "B3", outfit: "เสื้อแขนสีมัสตาร์ดและผมสีเทา คนขายปลา" },
  Oliver: { code: "B2", outfit: "เสื้อสีอ่อน ศิลปินประจำสตูดิโอ" },
  Emma: { code: "G1", outfit: "ชุดสีครีม ลูกค้าช่อดอกไม้" },
};
const loader = new GLTFLoader();
const smooth = (a: number, b: number, value: number) => {
  const t = Math.max(0, Math.min(1, (value - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

export async function loadNpcModel(name: string) {
  const T = window.AFRAME.THREE,
    choice = NPC_MODELS[name];
  const source = await loader.loadAsync(`/models/npc/${choice.code}.glb`);
  const model = new T.Group();
  model.name = `Maniacie_${choice.code}_${name}`;
  const bones = [
    "root",
    "head",
    "leftArm",
    "rightArm",
    "leftLeg",
    "rightLeg",
  ].map((label) => {
    const b = new T.Bone();
    b.name = label;
    return b;
  });
  const positions = [
    [0, 0, 0],
    [0, 1.05, 0],
    [-0.19, 1.03, 0],
    [0.19, 1.03, 0],
    [-0.12, 0.55, 0],
    [0.12, 0.55, 0],
  ];
  bones.forEach((b: any, i: number) => {
    b.position.set(...positions[i]);
    if (i) bones[0].add(b);
  });
  model.add(bones[0]);
  model.updateMatrixWorld(true);
  const skeleton = new T.Skeleton(bones),
    eyes: any[] = [];
  const female = choice.code.startsWith("G");
  source.scene.traverse((original: any) => {
    if (!original.isMesh) return;
    const geometry = original.geometry,
      role = original.userData.role;
    const p = geometry.attributes.position,
      indices: number[] = [],
      weights: number[] = [];
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i),
        y = p.getY(i),
        side = x < 0 ? 0 : 1;
      const head =
        role === "hair" || role === "eye" ? 1 : smooth(1.015, 1.115, y);
      const arm =
        (1 - head) *
        smooth(0.17, 0.285, Math.abs(x)) *
        smooth(0.53, 0.72, y) *
        (1 - smooth(1.03, 1.13, y));
      const leg =
        (1 - head - arm) *
        (1 - smooth(female ? 0.14 : 0.48, female ? 0.2 : 0.66, y));
      indices.push(0, 1, 2 + side, 4 + side);
      weights.push(1 - head - arm - leg, head, arm, leg);
    }
    geometry.setAttribute("skinIndex", new T.Uint16BufferAttribute(indices, 4));
    geometry.setAttribute(
      "skinWeight",
      new T.Float32BufferAttribute(weights, 4),
    );
    const mesh = new T.SkinnedMesh(geometry, original.material);
    mesh.name = original.name;
    mesh.userData.role = role;
    if(name === "Rowan" && role === "outfit") mesh.material.color.set("#729f81");
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.frustumCulled = false;
    model.add(mesh);
    mesh.bind(skeleton);
    if (role === "eye") eyes.push(mesh);
  });
  // The author's files are static. This gentle procedural rig is added by the game.
  const animate = (
    time: number,
    walking: boolean,
    _waving: boolean,
    blink: boolean,
  ) => {
    bones[1].rotation.set(
      Math.sin(time * 0.0013) * 0.025,
      Math.sin(time * 0.0008) * 0.035,
      Math.sin(time * 0.001) * 0.02,
    );
    bones[2].rotation.set(0, 0, 0.38);
    bones[3].rotation.set(0, 0, -0.38);
    bones[4].rotation.x = walking
      ? Math.sin(time * 0.008) * (female ? 0.045 : 0.18)
      : 0;
    bones[5].rotation.x = walking
      ? -Math.sin(time * 0.008) * (female ? 0.045 : 0.18)
      : 0;
    eyes.forEach((mesh) => {
      if (mesh.morphTargetInfluences)
        mesh.morphTargetInfluences[0] = blink ? 1 : 0;
    });
  };
  animate(0, false, false, false);
  return { model, animate, code: choice.code };
}
