import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { bridge, colliders } from "./bridge";

export function buildCampProps(w: any) {
  const T = window.AFRAME.THREE,
    loader = new GLTFLoader();
  const load = (url: string, x: number, z: number) =>
    loader.load(
      url,
      (gltf) => {
        const model = gltf.scene;
        model.position.set(x, 0.01, z);
        model.traverse((o: any) => {
          if (o.isMesh) {
            o.castShadow = true;
            o.receiveShadow = true;
          }
        });
        w.world.add(model);
      },
      undefined,
      () => bridge.onError("โหลดโมเดลมุมกองไฟไม่สำเร็จ"),
    );
  load("/models/logs/log2.glb", 7, -9.4);
  load("/models/campfire/campfire.glb", 7, -12);
  colliders.push({ x: 7, z: -12, w: 1.8, d: 1.8 });
  const tex = new T.TextureLoader().load("/models/campfire/flame.png");
  tex.colorSpace = T.SRGBColorSpace;
  // Sample one isolated flame from the author's alpha atlas.
  tex.repeat.set(0.18, 0.46);
  tex.offset.set(0.56, 0.52);
  const flames = new T.Group();
  flames.position.set(7, 0.32, -12);
  for (let i = 0; i < 3; i++) {
    const plane = new T.Mesh(
      new T.PlaneGeometry(0.65, 1),
      new T.MeshBasicMaterial({
        map: tex,
        transparent: true,
        alphaTest: 0.025,
        depthWrite: false,
        side: T.DoubleSide,
        toneMapped: false,
      }),
    );
    plane.position.y = 0.5;
    plane.rotation.y = (i * Math.PI) / 3;
    flames.add(plane);
  }
  w.world.add(flames);
  const light = new T.PointLight("#ffc178", 1.8, 7, 2);
  light.position.set(7, 0.8, -12);
  w.world.add(light);
  w.campfireUpdate = (time: number) => {
    const flutter =
      Math.sin(time * 0.009) * 0.04 + Math.sin(time * 0.016) * 0.035;
    flames.scale.y = 1 + flutter;
    light.intensity = 1.8 + flutter * 3;
  };
}
