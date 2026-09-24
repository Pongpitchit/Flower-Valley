import "aframe";
import {buildingMaterials,buildHome,buildAtelier} from "./buildings";
import {loadPaintModel,disposePaintModel} from "./paintModels";
import { RGBELoader } from "three/addons/loaders/RGBELoader.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { bridge, colliders, canMove, type Target } from "./bridge";
import { getState, updatePosition, type GameState } from "../game/engine";
import { flower, FLOWERS, plotPosition, ZONES } from "../game/data";
const T = window.AFRAME.THREE;
let randomSeed = 7042;
const random = () => {
  randomSeed = (randomSeed * 16807) % 2147483647;
  return (randomSeed - 1) / 2147483646;
};
const mat = (color: string, extra = {}) =>
  new T.MeshStandardMaterial({ color, roughness: 0.85, ...extra });
const geometries = {
  box: new T.BoxGeometry(1, 1, 1),
  sphere: new T.SphereGeometry(1, 12, 8),
  cylinder: new T.CylinderGeometry(1, 1, 1, 10),
  cone: new T.ConeGeometry(1, 1, 12),
};
export function createFlower(id: string, age = 1) {
  const f = flower(id),
    g = new T.Group(),
    stemMat = mat("#497140"),
    leafMat = mat("#608a46"),
    petalMat = mat(f.color, { roughness: 0.65, side: T.DoubleSide });
  const h = id === "sunflower" ? 1.15 : id === "lavender" ? 0.72 : 0.6;
  function part(
    geo: any,
    m: any,
    x: number,
    y: number,
    z: number,
    sx: number,
    sy: number,
    sz: number,
  ) {
    const o = new T.Mesh(geo, m);
    o.position.set(x, y, z);
    o.scale.set(sx, sy, sz);
    g.add(o);
    return o;
  }
  part(geometries.cylinder, stemMat, 0, h / 2, 0, 0.018, h, 0.018);
  for (let i = 0; i < 3; i++) {
    const leaf = part(
      geometries.sphere,
      leafMat,
      (i % 2 ? 1 : -1) * 0.1,
      h * (0.2 + i * 0.18),
      0,
      0.15,
      0.035,
      0.07,
    );
    leaf.rotation.z = (i % 2 ? 1 : -1) * 0.5;
  }
  if (age >= 0.99) {
    if (id === "lavender") {
      for (let i = 0; i < 12; i++)
        part(
          geometries.sphere,
          petalMat,
          Math.sin(i * 2.4) * 0.05,
          h - 0.04 + i * 0.025,
          Math.cos(i * 2.4) * 0.05,
          0.045,
          0.06,
          0.045,
        );
    } else {
      const n = id === "rose" ? 14 : id === "tulip" ? 6 : 10;
      for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2;
        const r = id === "rose" ? 0.08 : id === "tulip" ? 0.07 : 0.13;
        const p = part(
          geometries.sphere,
          petalMat,
          Math.cos(a) * r,
          h,
          Math.sin(a) * r,
          id === "tulip" ? 0.06 : 0.11,
          id === "tulip" ? 0.13 : 0.04,
          0.055,
        );
        p.rotation.y = -a;
        p.rotation.z = id === "rose" ? i * 0.2 : 0;
      }
      part(
        geometries.sphere,
        mat(id === "sunflower" ? "#68442c" : "#ddb851"),
        0,
        h + 0.025,
        0,
        0.065,
        0.04,
        0.065,
      );
    }
  } else part(geometries.sphere, leafMat, 0, h, 0, 0.05, 0.09, 0.05);
  const merged=new T.Group(),buckets=new Map<any,any[]>();g.updateMatrixWorld(true);g.traverse((o:any)=>{if(o.isMesh){if(!buckets.has(o.material))buckets.set(o.material,[]);buckets.get(o.material)!.push(o.geometry.clone().applyMatrix4(o.matrixWorld));}});buckets.forEach((gs,m)=>{const geometry=mergeGeometries(gs,false)!;geometry.userData.owned=true;const mesh=new T.Mesh(geometry,m);mesh.castShadow=true;mesh.receiveShadow=true;merged.add(mesh);gs.forEach(g=>g.dispose());});merged.scale.setScalar(.35+age*.65);return merged;
}
// A-Frame keeps a global registry across Vite updates; rebuild the scene on reload.
if (import.meta.hot) import.meta.hot.accept(() => window.location.reload());
if (!window.AFRAME.components["flower-world"]) window.AFRAME.registerComponent("flower-world", {
  init(this: any) {
    this.world = new T.Group();
    this.el.setObject3D("valley", this.world);
    this.staticBuckets = new Map();
    this.dynamic = new T.Group();
    this.world.add(this.dynamic);
    this.flowerGroup = new T.Group();
    this.world.add(this.flowerGroup);
    this.artGroup = new T.Group();
    this.world.add(this.artGroup);
    this.decorGroup = new T.Group();
    this.world.add(this.decorGroup);
    this.npcs = [];
    this.targets = [];
    this.lastFarm = "";
    this.lastArt = "";
    this.lastDecor = -1;
    this.elapsed = 0;
    this.targetCheck = 0;
    this.lastDay = getState().day;
    this.yaw = getState().position.yaw;
    this.pitch = 0;
    this.pos = new T.Vector3(getState().position.x, 1.7, getState().position.z);
    this.lamps = [];
    this.sways = [];
    colliders.length = 0;
    randomSeed = 7042;
    const texture = (url: string, repeat: number) => {
      const t = new T.TextureLoader().load(url, undefined, undefined, () =>
        bridge.onError("โหลดวัสดุบางรายการไม่สำเร็จ"),
      );
      t.wrapS = t.wrapT = T.RepeatWrapping;
      t.repeat.set(repeat, repeat);
      t.anisotropy = 4;
      return t;
    };
    const grass = texture("/textures/grass-color.jpg", 28);
    grass.colorSpace = T.SRGBColorSpace;
    const normal = texture("/textures/grass-normal.jpg", 28);
    const wood = texture("/textures/wood-color.jpg", 1);
    wood.colorSpace = T.SRGBColorSpace;
    const rock = texture("/textures/rock-color.jpg", 1);
    rock.colorSpace = T.SRGBColorSpace;
    const soil = texture("/textures/soil-color.jpg", 1);
    soil.colorSpace = T.SRGBColorSpace;
 const pathTex=texture("/textures/soil-color.jpg",1);pathTex.colorSpace=T.SRGBColorSpace;
    this.m = {
      grass: mat("#a1ac7c", {
        map: grass,
        normalMap: normal,
        normalScale: new T.Vector2(0.7, 0.7),
      }),
      wood: mat("#e0c69e", { map: wood }),
      darkWood: mat("#baa58a", { map: wood }),
      white: mat("#f2e7d1"),
      roof: mat("#676f63"),
      stone: mat("#9c9b8a", { map: rock }),
      soil: mat("#73604a", { map: soil }),
      path: mat("#c2b798", { map: pathTex }),
      leaf: mat("#4f6a39"),
      metal: mat("#323e33", { roughness: 0.45, metalness: 0.5 }),
      glass: mat("#b7c8ba", { roughness: 0.1, metalness: 0.35 }),
      warm: mat("#fbe4ae", { emissive: "#f2c673", emissiveIntensity: 0.65 }),
    };
    Object.assign(this.m,buildingMaterials(T));
    this.m.wood.userData.worldTile=1;this.m.darkWood.userData.worldTile=1;
    this.box = (
      m: any,
      x: number,
      y: number,
      z: number,
      w: number,
      h: number,
      d: number,
      parent?: any,
    ) => this.mesh(geometries.box, m, x, y, z, w, h, d, parent);
    this.box(this.m.grass, 0, -0.28, 0, 160, 0.5, 160);
    this.box(this.m.path, 0, 0.008, 10, 3.5, 0.04, 61);
    this.box(this.m.path, -9, 0.012, 15, 18, 0.05, 3);
    this.box(this.m.path, 8, 0.012, 23, 18, 0.05, 3);
    this.box(this.m.path, 8, 0.012, 6, 18, 0.05, 3);
    this.box(this.m.path, 8, 0.012, -16, 16, 0.05, 2.5);
    // Low rolling hills create a continuous horizon.
    for (let i = 0; i < 20; i++) {
      const a = (i / 20) * Math.PI * 2,
        r = 72 + random() * 25;
      this.mesh(
        geometries.sphere,
        mat(["#4e6d47", "#607a50", "#6f875d"][i % 3]),
        Math.sin(a) * r,
        -1,
        Math.cos(a) * r,
        18 + random() * 16,
        10 + random() * 12,
        16 + random() * 12,
      );
    }
    this.buildLake();
    this.buildHouse();
    this.loadModels();
    this.buildStall(-17, 14, "SEEDS & LITTLE THINGS", "#a7b291");
    this.buildStall(-8, 26, "FLOWER MARKET", "#be9192");
    this.buildStall(15, -18, "FRESH FROM THE LAKE", "#8fa9a6");
    this.buildWorkshop();
    for(const [id,x] of [['cat',16.55],['dog',17.35]] as const){loadPaintModel(id).then(model=>{model.scale.setScalar(.2);model.position.set(x,1.08,27);model.rotation.y=Math.PI;this.world.add(model);}).catch(()=>bridge.onError('โหลดโมเดลตัวอย่างไม่สำเร็จ'));}
    this.buildFarm();
    this.buildRest();
    this.npc(-17, 15.5, "Lily", "#8d9c71", "seed");
    this.npc(-8, 24, "Mae", "#ae8185", "sell");
    this.npc(14, -16, "Finn", "#6d8b9a", "fish");
    this.npc(14, 23, "Oliver", "#b99c6f", "workshop");
    this.npc(-5, 20, "Emma", "#c6a46b", "customer");
    this.targets.push(
      {
        id: "sleep",
        kind: "sleep",
        name: "เตียงนุ่ม ๆ",
        hint: "พักผ่อน / ข้ามวัน",
        x: 15,
        z: 2,
      },
      {
        id: "rest",
        kind: "rest",
        name: "ม้านั่งใต้ร่มไม้",
        hint: "นั่งพัก • พลังงาน +20",
        x: 3,
        z: -10,
      },
      {
        id: "fishing",
        kind: "fishing",
        name: "ท่าตกปลาทะเลสาบ",
        hint: "ตกปลา • พลังงาน −10",
        x: 0,
        z: -20.2,
      },
      {
        id: "bouquet",
        kind: "bouquet",
        name: "โต๊ะจัดช่อดอกไม้",
        hint: "จัดดอกไม้ 3 ดอกเป็นช่อ",
        x: -5,
        z: 25,
      },
      {
        id: "upgrades",
        kind: "upgrades",
        name: "กล่องปรับปรุงสวน",
        hint: "ขยายสวนและเพิ่มพลังงาน",
        x: 9,
        z: 8,
      },
      {
        id: "painting",
        kind: "painting",
        name: "มุมวาดภาพ",
        hint: "สร้างภาพด้วยสีของคุณ",
        x: 13,
        z: 27,
      },
      {
        id: "sculpture",
        kind: "sculpture",
        name: "โต๊ะระบายสีโมเดล",
        hint: "เลือกสัตว์ตัวโปรดแล้วระบายสี",
        x: 17,
        z: 27,
      },
      {
        id: "gallery",
        kind: "gallery",
        name: "ชั้นแสดงผลงาน",
        hint: "ชมและขายงานศิลปะ",
        x: 17,
        z: 23,
      },
    );
    this.box(this.m.wood, -5, 0.75, 25, 1.8, 0.15, 1);
    for (const x of [-5.7, -4.3])
      this.box(this.m.darkWood, x, 0.38, 25, 0.12, 0.75, 0.7);
    this.box(this.m.wood, 9, 0.55, 8, 0.8, 1.1, 0.8);
    this.sign("FLOWER VALLEY", 0, 3.3, 32, 4.2);
    for (const x of [-2.4, 2.4])
      this.box(this.m.wood, x, 1.7, 32, 0.22, 3.4, 0.22);
    this.standingSign("MIRROR LAKE", -2, -15, 2.2);
    this.standingSign("THE GARDEN", -10, 7.2, 2.4);
    // Trees, grasses, flowers and stone boundaries.
    const leafMatrices: any[] = [],
      trunkMat = mat("#74644b", { map: wood });
    for (let i = 0; i < 76; i++) {
      let x, z;
      if (i < 48) {
        const a = (i / 48) * Math.PI * 2;
        x = Math.sin(a) * (41 + random() * 12);
        z = Math.cos(a) * (42 + random() * 12);
      } else {
        x = (random() - 0.5) * 76;
        z = (random() - 0.5) * 75;
        if (Math.abs(x) < 22 && z > -24 && z < 32) continue;
        if ((x * x) / 220 + (z + 31) ** 2 / 130 < 1.5) continue;
      }
      const h = 6 + random() * 5;
      this.mesh(geometries.cylinder, trunkMat, x, h / 2, z, 0.18, h, 0.22);
      if (Math.abs(x) < 43 && Math.abs(z) < 43)
        colliders.push({ x, z, w: 0.6, d: 0.6 });
      for (let b = 0; b < 8; b++) {
        const a = b * 2.399,
          by = h * (0.46 + b * 0.05),
          spread = 1 + random() * 1.6;
        const end = new T.Vector3(
          x + Math.cos(a) * spread,
          by + 1.3,
          z + Math.sin(a) * spread,
        );
        this.branch(new T.Vector3(x, by, z), end, 0.08, trunkMat);
        for (let j = 0; j < 240; j++) {
          const o = new T.Object3D();
          o.position.set(
            end.x + (random() - 0.5) * 2.5,
            end.y + (random() - 0.5) * 2.3,
            end.z + (random() - 0.5) * 2.5,
          );
          o.rotation.set(random() * Math.PI, random() * 6.28, random() * 6.28);
          o.scale.set(0.28 + random() * 0.4, 0.18 + random() * 0.3, 1);
          o.updateMatrix();
          leafMatrices.push(o.matrix.clone());
        }
      }
    }
    const leafCanvas = document.createElement("canvas");
    leafCanvas.width = 64;
    leafCanvas.height = 64;
    const lc = leafCanvas.getContext("2d")!;
    lc.fillStyle = "#fff";
    lc.beginPath();
    lc.moveTo(3, 32);
    lc.bezierCurveTo(24, 0, 53, 7, 62, 32);
    lc.bezierCurveTo(41, 60, 22, 61, 3, 32);
    lc.fill();
    const leafTex = new T.CanvasTexture(leafCanvas);
    const leafMaterial = mat("#adc28b", {
      alphaMap: leafTex,
      alphaTest: 0.5,
      side: T.DoubleSide,
    });
    leafMaterial.onBeforeCompile = (shader: any) => {
      shader.uniforms.uWind = { value: 0 };
      this.windShader = shader;
      shader.vertexShader = "uniform float uWind;\n" + shader.vertexShader;
      shader.vertexShader = shader.vertexShader.replace(
        "#include <begin_vertex>",
        "#include <begin_vertex>\n transformed.x += sin(uWind + instanceMatrix[3].x * 0.4 + instanceMatrix[3].z) * 0.08 * position.y;",
      );
    };
    const leaves = new T.InstancedMesh(
      new T.PlaneGeometry(1, 1),
      leafMaterial,
      leafMatrices.length,
    );
    leafMatrices.forEach((m, i) => {
      leaves.setMatrixAt(i, m);
      leaves.setColorAt(
        i,
        new T.Color().setHSL(
          0.2 + random() * 0.08,
          0.25 + random() * 0.22,
          0.26 + random() * 0.18,
        ),
      );
    });
    leaves.receiveShadow = true;
    this.world.add(leaves);
    const grassMatrices = [];
    for (let i = 0; i < 11000; i++) {
      const x = (random() - 0.5) * 86,
        z = (random() - 0.5) * 86;
      if (
        Math.abs(x) < 2.3 ||
        (Math.abs(z - 15) < 2 && x < 1 && x > -21) ||
        (Math.abs(z - 23) < 2 && x > 0 && x < 20) ||
        (Math.abs(z - 6) < 2 && x > 0 && x < 20) ||
        (x > -19 && x < 20 && z > -9 && z < 30) ||
        (x * x) / 200 + (z + 31) ** 2 / 150 < 1.4
      )
        continue;
      const o = new T.Object3D();
      o.position.set(x, 0.15, z);
      o.rotation.y = random() * Math.PI;
      o.scale.set(0.07 + random() * 0.09, 0.18 + random() * 0.3, 1);
      o.updateMatrix();
      grassMatrices.push(o.matrix.clone());
    }
    const blade = new T.BufferGeometry();
    blade.setAttribute(
      "position",
      new T.Float32BufferAttribute([-0.5, 0, 0, 0.5, 0, 0, 0.15, 1, 0], 3),
    );
    blade.computeVertexNormals();
    const grassMesh = new T.InstancedMesh(
      blade,
      mat("#667d3b", { side: T.DoubleSide }),
      grassMatrices.length,
    );
    grassMatrices.forEach((m, i) => grassMesh.setMatrixAt(i, m));
    this.world.add(grassMesh);
    for (let i = 0; i < 95; i++) {
      const x = (random() - 0.5) * 64,
        z = (random() - 0.5) * 66;
      if (
        (Math.abs(x) < 21 && z > -12 && z < 32) ||
        (x * x) / 190 + (z + 31) ** 2 / 130 < 1.4
      )
        continue;
      const f = createFlower(FLOWERS[i % 5].id);
      f.position.set(x, 0.05, z);
      f.scale.multiplyScalar(0.8 + random() * 0.7);
      this.mergeGroup(f);
    }
    for (let i = 0; i < 18; i++) {
      const a = (i / 18) * Math.PI * 2;
      this.mesh(
        geometries.sphere,
        this.m.stone,
        Math.sin(a) * 13.5,
        0.2,
        -31 + Math.cos(a) * 11.5,
        0.5 + random(),
        0.4 + random() * 0.6,
        0.6 + random(),
      );
    }
    for (const [x, z] of [
      [-2, 18],
      [2, 8],
      [-2, -7],
      [7, 23],
      [-18, 9],
      [19, 20],
    ])
      this.lamp(x, z);
    this.flush();
    this.hemisphere = new T.HemisphereLight("#e5edf2", "#737849", 2);
    this.world.add(this.hemisphere);
    this.sun = new T.DirectionalLight("#fff0ce", 2.6);
    this.sun.position.set(-25, 40, 20);
    this.sun.castShadow = true;
    this.sun.shadow.mapSize.set(2048, 2048);
    Object.assign(this.sun.shadow.camera, {
      left: -38,
      right: 38,
      top: 38,
      bottom: -38,
      near: 1,
      far: 120,
    });
    this.sun.shadow.bias = -0.0004;
    this.sun.shadow.normalBias = 0.05;
    this.world.add(this.sun);
    this.sky = new T.Mesh(
      new T.SphereGeometry(230, 32, 16),
      new T.ShaderMaterial({
        side: T.BackSide,
        depthWrite: false,
        uniforms: {
          top: { value: new T.Color("#94bcc4") },
          bottom: { value: new T.Color("#e5d9b6") },
        },
        vertexShader:
          "varying vec3 v;void main(){v=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}",
        fragmentShader:
          "varying vec3 v;uniform vec3 top;uniform vec3 bottom;void main(){float h=clamp(normalize(v).y*1.5,0.,1.);gl_FragColor=vec4(mix(bottom,top,pow(h,.55)),1.);}",
      }),
    );
    this.world.add(this.sky);
    new RGBELoader().load('/textures/sky.hdr',(texture:any)=>{texture.mapping=T.EquirectangularReflectionMapping;this.cloudSky=new T.Mesh(new T.SphereGeometry(220,40,24),new T.MeshBasicMaterial({map:texture,fog:false,side:T.BackSide,transparent:true,opacity:1,depthWrite:false}));this.cloudSky.renderOrder=-1;this.world.add(this.cloudSky);const renderer=this.el.sceneEl.renderer;if(renderer){const pmrem=new T.PMREMGenerator(renderer);this.envTarget=pmrem.fromEquirectangular(texture);this.el.sceneEl.object3D.environment=this.envTarget.texture;this.el.sceneEl.object3D.environmentIntensity=.24;pmrem.dispose();}},undefined,()=>bridge.onError('โหลดท้องฟ้าธรรมชาติไม่สำเร็จ'));

    this.el.sceneEl.object3D.fog = new T.FogExp2("#d6dec5", 0.0105);
    const rainGeo = new T.BufferGeometry(),
      rainPos = new Float32Array(1200 * 3);
    for (let i = 0; i < 1200; i++) {
      rainPos[i * 3] = (random() - 0.5) * 60;
      rainPos[i * 3 + 1] = random() * 20;
      rainPos[i * 3 + 2] = (random() - 0.5) * 60;
    }
    rainGeo.setAttribute("position", new T.BufferAttribute(rainPos, 3));
    this.rain = new T.Points(
      rainGeo,
      new T.PointsMaterial({
        color: "#cadfe2",
        size: 0.09,
        transparent: true,
        opacity: 0.6,
      }),
    );
    this.world.add(this.rain);
    const starsGeo = new T.BufferGeometry(),
      starPos = [];
    for (let i = 0; i < 650; i++) {
      const a = random() * Math.PI * 2,
        b = random() * Math.PI * 0.45;
      starPos.push(
        Math.cos(a) * Math.sin(b) * 180,
        Math.cos(b) * 180,
        Math.sin(a) * Math.sin(b) * 180,
      );
    }
    starsGeo.setAttribute("position", new T.Float32BufferAttribute(starPos, 3));
    this.stars = new T.Points(
      starsGeo,
      new T.PointsMaterial({ color: "#fff3dc", size: 0.4, transparent: true }),
    );
    this.world.add(this.stars);
    this.refresh(getState());
    bridge.onReady();
  },
  mesh(
    this: any,
    geo: any,
    m: any,
    x: number,
    y: number,
    z: number,
    sx: number,
    sy: number,
    sz: number,
    parent?: any,
  ) {
    const o = new T.Mesh(geo, m);
    o.position.set(x, y, z);
    o.scale.set(sx, sy, sz);
    o.castShadow = true;
    o.receiveShadow = true;
    if (parent) parent.add(o);
    else {
      o.updateMatrix();
      const g = geo.clone().applyMatrix4(o.matrix);
      if(m.userData.worldTile){const uv=g.attributes.uv,p=g.attributes.position,n=g.attributes.normal,t=m.userData.worldTile;for(let i=0;i<uv.count;i++){const nx=Math.abs(n.getX(i)),ny=Math.abs(n.getY(i));uv.setXY(i,(nx>.5?p.getZ(i):p.getX(i))/t,(ny>.5?p.getZ(i):p.getY(i))/t);}}
      if(m===this.m.path){const uv=g.attributes.uv,p=g.attributes.position;for(let i=0;i<uv.count;i++)uv.setXY(i,p.getX(i)/3,p.getZ(i)/3);}
      if (!this.staticBuckets.has(m)) this.staticBuckets.set(m, []);
      this.staticBuckets.get(m).push(g);
    }
    return o;
  },
  mergeGroup(this: any, g: any) {
    g.updateMatrixWorld(true);
    g.traverse((o: any) => {
      if (o.isMesh) {
        if (!this.staticBuckets.has(o.material))
          this.staticBuckets.set(o.material, []);
        this.staticBuckets
          .get(o.material)
          .push(o.geometry.clone().applyMatrix4(o.matrixWorld));
      }
    });
  },
  flush(this: any) {
    this.staticBuckets.forEach((gs: any[], m: any) => {
      const geo = mergeGeometries(gs, false);
      if (geo) {
        const mesh = new T.Mesh(geo, m);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        this.world.add(mesh);
      }
      gs.forEach((g) => g.dispose());
    });
    this.staticBuckets.clear();
  },
  branch(this: any, start: any, end: any, r: number, m: any, parent?: any) {
    const d = end.clone().sub(start),
      o = new T.Mesh(geometries.cylinder, m);
    o.position.copy(start.clone().add(end).multiplyScalar(0.5));
    o.scale.set(r, d.length(), r);
    o.quaternion.setFromUnitVectors(new T.Vector3(0, 1, 0), d.normalize());
    if (parent) parent.add(o);
    else this.mergeGroup(o);
  },
  standingSign(this: any, text: string, x: number, z: number, width: number) {
    // Give the sign a solid timber back and posts sunk slightly into the terrain.
    this.box(this.m.wood, x, 1.5, z - 0.08, width + 0.14, width / 4 + 0.14, 0.12);
    for (const dx of [-width * 0.34, width * 0.34]) {
      this.box(this.m.darkWood, x + dx, 0.915, z - 0.16, 0.16, 1.95, 0.18);
      this.box(this.m.wood, x + dx, 1.92, z - 0.16, 0.22, 0.08, 0.24);
    }
    colliders.push({ x, z: z - 0.1, w: width + 0.14, d: 0.3 });
    this.sign(text, x, 1.5, z, width);
  },
  sign(this: any, text: string, x: number, y: number, z: number, w: number) {
    const c = document.createElement("canvas");
    c.width = 768;
    c.height = 192;
    const ctx = c.getContext("2d")!;
    ctx.fillStyle = "#334c3d";
    ctx.fillRect(0, 0, 768, 192);
    ctx.strokeStyle = "#b1b596";
    ctx.lineWidth = 3;
    ctx.strokeRect(12, 12, 744, 168);
    ctx.fillStyle = "#f2ead2";
    ctx.textAlign = "center";
    ctx.font = "40px Georgia";
    ctx.fillText(text, 384, 110);
    const tex = new T.CanvasTexture(c);
    tex.colorSpace = T.SRGBColorSpace;
    const s = new T.Mesh(
      new T.PlaneGeometry(w, w / 4),
      new T.MeshBasicMaterial({ map: tex }),
    );
    s.position.set(x, y, z);
    this.world.add(s);return s;
  },
  buildLake(this: any) {
    const bank = this.mesh(
      new T.CircleGeometry(1, 64),
      this.m.path,
      0,
      -0.025,
      -31,
      13.4,
      11.4,
      1,
      this.world,
    );
    bank.rotation.x = -Math.PI / 2;
    const waterGeo = new T.CircleGeometry(1, 96);
    this.water = new T.Mesh(
      waterGeo,
      new T.MeshStandardMaterial({
        color: "#719d96",
        roughness: 0.18,
        metalness: 0.45,
        transparent: true,
        opacity: 0.9,
        side: T.DoubleSide,
      }),
    );
    this.water.rotation.x = -Math.PI / 2;
    this.water.scale.set(12.6, 10.6, 1);
    this.water.position.set(0, 0.035, -31);
    this.world.add(this.water);
    this.ripples = [];
    for (let i = 0; i < 14; i++) {
      const ring = new T.Mesh(
        new T.RingGeometry(0.98, 1, 64),
        new T.MeshBasicMaterial({
          color: "#c3d7bb",
          transparent: true,
          opacity: 0.12,
          side: T.DoubleSide,
          depthWrite: false,
        }),
      );
      ring.rotation.x = -Math.PI / 2;
      ring.position.set(
        (random() - 0.5) * 15,
        0.065,
        -31 + (random() - 0.5) * 12,
      );
      this.world.add(ring);
      this.ripples.push(ring);
    }
    for (let i = 0; i < 15; i++)
      this.box(this.m.wood, 0, 0.23, -16.5 - i * 0.38, 2.4, 0.15, 0.34);
    for (const x of [-1.1, 1.1])
      for (const z of [-17, -20.9])
        this.box(this.m.darkWood, x, 0.05, z, 0.16, 0.8, 0.16);
    this.fishes = [];
    for (let i = 0; i < 7; i++) {
      const fish = new T.Group();
      this.mesh(
        geometries.sphere,
        mat(i % 2 ? "#a5a67e" : "#d4a963"),
        0,
        0,
        0,
        0.25,
        0.075,
        0.1,
        fish,
      );
      const tail = this.mesh(
        geometries.cone,
        mat("#b39b68"),
        -0.27,
        0,
        0,
        0.13,
        0.24,
        0.05,
        fish,
      );
      tail.rotation.z = Math.PI / 2;
      this.world.add(fish);
      this.fishes.push(fish);
    }
    // Fishing rod is a modeled prop visible at the pier.
    this.branch(
      new T.Vector3(0.7, 0.4, -20),
      new T.Vector3(0.8, 2.5, -22),
      0.026,
      this.m.wood,
    );
    this.branch(
      new T.Vector3(0.8, 2.5, -22),
      new T.Vector3(0.8, 0.1, -23),
      0.004,
      this.m.white,
    );
  },
  buildHouse(this:any){buildHome(this,createFlower);},
  buildStall(this: any, x: number, z: number, title: string, color: string) {
    const m = this.m;
    this.box(m.stone, x, 0.08, z, 5.1, 0.15, 3.6);
    this.box(m.wood, x, 1, z, 4.4, 0.25, 1.2);
    this.box(m.wood, x, 0.5, z + 0.5, 4.4, 0.8, 0.15);
    for (const dx of [-2.2, 2.2])
      for (const dz of [-1.2, 1.2])
        this.box(m.darkWood, x + dx, 1.5, z + dz, 0.12, 3, 0.12);
    this.box(mat(color), x, 2.8, z, 4.9, 0.15, 3.1);
    this.sign(title, x, 2.25, z + 1.26, 3.7);
    colliders.push({ x, z, w: 4.4, d: 1.2 });
    for (let i = 0; i < 5; i++) {
      this.box(m.wood, x - 1.6 + i * 0.8, 1.23, z, 0.65, 0.25, 0.65);
      const f = createFlower(i % 2 ? "daisy" : "tulip");
      f.scale.setScalar(0.7);
      f.position.set(x - 1.6 + i * 0.8, 1.35, z);
      this.mergeGroup(f);
    }
  },
  buildFarm(this: any) {
    const m = this.m;
    for (let z = -6; z <= 7; z += 2.5) {
      for (const x of [-17, -3]) this.box(m.wood, x, 0.5, z, 0.12, 1, 0.12);
    }
    for (const x of [-17, -3])
      for (const y of [0.35, 0.7])
        this.box(m.wood, x, y, 0.5, 0.08, 0.09, 13.5);
    for (let x = -17; x <= -3; x += 2.5)
      this.box(m.wood, x, 0.5, -6, 0.12, 1, 0.12);
    for (const y of [0.35, 0.7]) this.box(m.wood, -10, y, -6, 14, 0.09, 0.08);
    colliders.push(
      { x: -17, z: 0.5, w: 0.1, d: 13.5 },
      { x: -3, z: 0.5, w: 0.1, d: 13.5 },
      { x: -10, z: -6, w: 14, d: 0.1 },
    );
  },
  buildRest(this:any){colliders.push({x:3,z:-10,w:2.4,d:.8});},
  loadModels(this:any){const loader=new GLTFLoader();loader.load('/models/painted_wooden_bench/painted_wooden_bench.gltf',(gltf:any)=>{const model=gltf.scene;model.rotation.y=Math.PI;const bounds=new T.Box3().setFromObject(model),size=bounds.getSize(new T.Vector3()),center=bounds.getCenter(new T.Vector3());model.scale.setScalar(2.2/size.x);model.position.set(3-center.x*model.scale.x,-bounds.min.y*model.scale.x,-10-center.z*model.scale.x);model.traverse((o:any)=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;}});this.world.add(model);},undefined,()=>bridge.onError('โหลดโมเดลม้านั่งไม่สำเร็จ'));
    loader.load('/models/flower_gazania/flower_gazania.gltf',(gltf:any)=>{const source=gltf.scene,bounds=new T.Box3().setFromObject(source),size=bounds.getSize(new T.Vector3());for(let i=0;i<12;i++){const model=source.clone();model.scale.setScalar(.7/size.y);model.position.set(i<6?-2.8:2.8,.05,10+(i%6)*1.8);model.rotation.y=i*1.4;model.traverse((o:any)=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;}});this.world.add(model);}},undefined,()=>bridge.onError('โหลดโมเดลดอกไม้ไม่สำเร็จ'));
  },
  buildWorkshop(this:any){buildAtelier(this);},
  npc(
    this: any,
    x: number,
    z: number,
    name: string,
    color: string,
    kind: string,
  ) {
    const g = new T.Group();
    const skin = mat("#d1a885"),
      cloth = mat(color),
      pants = mat("#4d594d");
    this.mesh(geometries.sphere, skin, 0, 1.53, 0, 0.2, 0.25, 0.2, g);
    this.mesh(geometries.cylinder, cloth, 0, 1.05, 0, 0.25, 0.62, 0.16, g);
    this.mesh(
      geometries.cylinder,
      mat("#cab68b"),
      0,
      1.76,
      0,
      0.32,
      0.08,
      0.3,
      g,
    );
    this.mesh(
      geometries.sphere,
      mat("#b3a078"),
      0,
      1.79,
      0,
      0.22,
      0.13,
      0.2,
      g,
    );
    const legs = [];
    for (const dx of [-0.12, 0.12]) {
      const leg = this.mesh(
        geometries.cylinder,
        pants,
        dx,
        0.39,
        0,
        0.085,
        0.75,
        0.09,
        g,
      );
      legs.push(leg);
      const arm = this.mesh(
        geometries.cylinder,
        skin,
        dx * 2.4,
        1.01,
        0,
        0.063,
        0.52,
        0.065,
        g,
      );
      arm.rotation.z = dx > 0 ? 0.12 : -0.12;
      this.mesh(
        geometries.sphere,
        mat("#463e32"),
        dx,
        0.08,
        0.07,
        0.105,
        0.09,
        0.18,
        g,
      );
    }
    for (const dx of [-0.07, 0.07])
      this.mesh(
        geometries.sphere,
        mat("#34332d"),
        dx,
        1.56,
        0.18,
        0.023,
        0.025,
        0.015,
        g,
      );
    g.position.set(x, 0, z);
    this.dynamic.add(g);
    this.npcs.push({ g, legs, x, z, name, kind });
  },
  lamp(this: any, x: number, z: number) {
    this.box(this.m.metal, x, 1.25, z, 0.07, 2.5, 0.07);
    this.box(this.m.warm, x, 2.5, z, 0.25, 0.35, 0.25);
    this.box(this.m.metal, x, 2.7, z, 0.4, 0.05, 0.4);
    const light = new T.PointLight("#ffdba3", 0, 7, 2);
    light.position.set(x, 2.3, z);
    this.world.add(light);
    this.lamps.push(light);
  },
  refresh(this: any, s: GameState) {
    const sig = JSON.stringify(s.farm);
    if (sig !== this.lastFarm) {
      this.lastFarm = sig;
      this.disposeGroup(this.flowerGroup);
      s.farm.forEach((p, i) => {
        const { x, z } = plotPosition(i);
        this.box(
          p.watered ? mat("#514837", { map: this.m.soil.map }) : this.m.soil,
          x,
          0.1,
          z,
          2,
          0.17,
          2,
          this.flowerGroup,
        );
        for (const dx of [-1, 1])
          this.box(
            this.m.wood,
            x + dx,
            0.18,
            z,
            0.1,
            0.26,
            2.1,
            this.flowerGroup,
          );
        for (const dz of [-1, 1])
          this.box(
            this.m.wood,
            x,
            0.18,
            z + dz,
            2.1,
            0.26,
            0.1,
            this.flowerGroup,
          );
        if (p.seed) {
          for (let j = 0; j < 4; j++) {
            const f = createFlower(p.seed, p.age / flower(p.seed).days);
            f.position.set(
              x + ((j % 2) - 0.5) * 0.65,
              0.18,
              z + (Math.floor(j / 2) - 0.5) * 0.65,
            );
            this.flowerGroup.add(f);
          }
        }
      });
    }
    if (this.lastDecor !== s.decorations) {
      this.lastDecor = s.decorations;
      this.disposeGroup(this.decorGroup);
      for (let i = 0; i < s.decorations; i++) {
        const x = 9.8 + i * 1.3;
        this.mesh(
          geometries.cylinder,
          mat("#ab775b"),
          x,
          0.28,
          8.5,
          0.25,
          0.55,
          0.25,
          this.decorGroup,
        );
        const f = createFlower(FLOWERS[i % 5].id);
        f.position.set(x, 0.55, 8.5);
        this.decorGroup.add(f);
      }
    }
    const artSig = s.artworks.map((a) => a.id).join();
    if (artSig !== this.lastArt) {
      this.lastArt = artSig;
      this.disposeGroup(this.artGroup);
      s.artworks.slice(-6).forEach((a, i) => {
        if (a.kind === "painting") {
          const tex = new T.TextureLoader().load(a.image!);
          tex.colorSpace = T.SRGBColorSpace;
          const m = new T.Mesh(
            new T.PlaneGeometry(1.4, 1.4),
            new T.MeshBasicMaterial({ map: tex }),
          );
          m.position.set(
            12.3 + (i % 3) * 2,
            1.7 + Math.floor(i / 3) * 1.5,
            29.38,
          );
          this.artGroup.add(m);
        } else if(a.kind==='model' && a.modelId){
          const slot=new T.Group();slot.position.set(12.3+(i%4)*1.55,.62,28.2);slot.scale.setScalar(.5);slot.rotation.y=Math.PI;this.artGroup.add(slot);
          loadPaintModel(a.modelId,a.colors).then(model=>{if(slot.parent){slot.add(model);}else disposePaintModel(model);}).catch(()=>bridge.onError('โหลดโมเดลผลงานไม่สำเร็จ'));
        } else {
          const g = new T.Group();
          a.parts?.forEach((p) => {
            const o = new T.Mesh(
              geometries[p.type],
              mat(p.color, {
                roughness: p.material === "gloss" ? 0.15 : 0.7,
                metalness: p.material === "metal" ? 0.8 : 0,
              }),
            );
            o.position.set(p.x, p.y, p.z);
            o.rotation.set(
              (p.rx * Math.PI) / 180,
              (p.ry * Math.PI) / 180,
              (p.rz * Math.PI) / 180,
            );
            o.scale.setScalar(p.scale * (p.type === "box" ? 1 : 0.5));
            g.add(o);
          });
          g.scale.setScalar(0.3);
          g.position.set(12 + (i % 4) * 1.5, 0.3, 28.2);
          this.artGroup.add(g);
        }
      });
    }
  },
  disposeGroup(this: any, g: any) {
    const keep = new Set(Object.values(this.m));
    g.traverse((o: any) => {
      if(o.geometry?.userData.owned)o.geometry.dispose();
      if (o.isMesh && !keep.has(o.material)) {
        o.material.map?.isCanvasTexture && o.material.map.dispose();
        o.material.dispose();
      }
    });
    g.clear();
  },
  tick(this: any, time: number, dt: number) {
    if (!this.sky) return;
    const delta = Math.min(dt / 1000, 0.05),
      s = getState();
    this.elapsed += delta;
    this.refresh(s);
    if (s.day !== this.lastDay) {
      this.lastDay = s.day;
      bridge.teleport = s.position;
    }
    if (bridge.teleport) {
      this.pos.set(bridge.teleport.x, 1.7, bridge.teleport.z);
      this.yaw = bridge.teleport.yaw ?? this.yaw;
      bridge.teleport = null;
    }
    const camera = this.el.sceneEl.camera;
    if (camera) {
      if (!bridge.paused && !bridge.sitting) {
        this.yaw -= bridge.look.x * 0.0025;
        this.pitch = Math.max(
          -1.2,
          Math.min(1.2, this.pitch - bridge.look.y * 0.0025),
        );
        let dx =
          (bridge.keys.has("KeyD") ? 1 : 0) -
          (bridge.keys.has("KeyA") ? 1 : 0) +
          bridge.move.x;
        let dz =
          (bridge.keys.has("KeyS") ? 1 : 0) -
          (bridge.keys.has("KeyW") ? 1 : 0) +
          bridge.move.y;
        const len = Math.hypot(dx, dz);
        if (len > 1) {
          dx /= len;
          dz /= len;
        }
        const speed =
          (bridge.keys.has("ShiftLeft") && s.energy > 0 ? 5.3 : 3.1) * delta;
        const nx =
            this.pos.x +
            (dx * Math.cos(this.yaw) + dz * Math.sin(this.yaw)) * speed,
          nz =
            this.pos.z +
            (-dx * Math.sin(this.yaw) + dz * Math.cos(this.yaw)) * speed;
        if (canMove(nx, this.pos.z)) this.pos.x = nx;
        if (canMove(this.pos.x, nz)) this.pos.z = nz;
        this.pos.y = 1.7 + (len > 0 ? Math.sin(time * 0.01) * 0.025 : 0);
      }
      bridge.look.x = bridge.look.y = 0;
      camera.position.copy(this.pos);
      if (bridge.sitting) camera.position.y = 1.3;
      camera.rotation.set(this.pitch, this.yaw, 0, "YXZ");
      bridge.position = { x: this.pos.x, z: this.pos.z, yaw: this.yaw };
      if (!bridge.sitting) updatePosition(this.pos.x, this.pos.z, this.yaw);
    }
    const hours = s.time / 60,
      daylight = Math.max(0, Math.sin(((hours - 6) / 14) * Math.PI));
    const night = hours < 6 || hours >= 20;
    const sunset = hours >= 17 && hours < 20;
    this.sun.intensity =
      (night ? 0.1 : 0.4 + daylight * 1.6) * (s.weather === "rain" ? 0.4 : 1);
    this.hemisphere.intensity = night ? 0.45 : s.weather === "rain" ? 1.1 : 1.45;
    this.sun.color.set(sunset ? "#ffc18b" : "#fff1d6");
    this.sun.position.set(
      Math.cos(((hours - 6) / 14) * Math.PI) * 35,
      Math.max(5, daylight * 45),
      15,
    );
    const top = night
        ? "#162737"
        : s.weather === "rain"
          ? "#778c92"
          : sunset
            ? "#9d8fa0"
            : "#8ab8c5",
      bottom = night
        ? "#35484d"
        : s.weather === "rain"
          ? "#b2b9b4"
          : sunset
            ? "#e7bd91"
            : "#dce0be";
    this.sky.material.uniforms.top.value.set(top);
    this.sky.material.uniforms.bottom.value.set(bottom);
    this.el.sceneEl.object3D.fog.color.set(bottom);
    this.stars.visible = night;
    if(this.cloudSky){this.cloudSky.visible=!night;this.cloudSky.material.opacity=s.weather==='rain'?.22:sunset?.45:1;this.cloudSky.rotation.y=time*.000003;}
    this.flowerGroup.children.forEach((o:any,i:number)=>{if(o.isGroup)o.rotation.z=Math.sin(time*.0015+i)*.035;});
    this.lamps.forEach((l: any) => (l.intensity = night || sunset ? 5 : 0));
    this.rain.visible = s.weather === "rain";
    if (this.rain.visible) {
      const p = this.rain.geometry.attributes.position;
      for (let i = 0; i < p.count; i++) {
        p.array[i * 3 + 1] -= delta * 11;
        if (p.array[i * 3 + 1] < 0) p.array[i * 3 + 1] = 20;
      }
      p.needsUpdate = true;
      this.rain.position.set(this.pos.x, 0, this.pos.z);
    }
    if (this.windShader) this.windShader.uniforms.uWind.value = time * 0.001;
    this.water.position.y = 0.035 + Math.sin(time * 0.0007) * 0.012;
    this.ripples.forEach((r: any, i: number) => {
      const phase = (time * 0.00015 + i * 0.11) % 1;
      r.scale.setScalar(0.5 + phase * 3);
      r.material.opacity = (1 - phase) * 0.17;
    });
    this.fishes.forEach((f: any, i: number) => {
      const a = time * 0.0002 + i;
      f.position.set(Math.sin(a) * 5, 0.015, -30 + Math.cos(a * 0.8) * 5);
      f.rotation.y = -a;
    });
    this.npcs.forEach((n: any, i: number) => {
      const open = hours >= 7 && hours < 20;
      const travel=hours>=6&&hours<7 || hours>=20&&hours<21;
      n.g.visible = open||travel;
      const t=hours<7 ? Math.max(0,Math.min(1,hours-6)) : hours>=20 ? Math.max(0,Math.min(1,21-hours)) : 1;
      n.g.position.z=n.z+(1-t)*4;
      n.open=open;
      n.g.position.x = n.x + Math.sin(time * 0.0003 + i) * 0.18;
      n.g.position.y = Math.sin(time * 0.002 + i) * 0.015;
      n.g.rotation.y = Math.atan2(
        this.pos.x - n.g.position.x,
        this.pos.z - n.g.position.z,
      );
      n.legs.forEach(
        (l: any, j: number) =>
          (l.rotation.x = Math.sin(time * (travel?.008:.002) + j * Math.PI) * (travel?.5:.025)),
      );
    });
    this.targetCheck += delta;
    if (this.targetCheck > 0.16) {
      this.targetCheck = 0;
      const targets = [
        ...this.targets,
        ...s.farm.map((p, i) => ({
          id: "plot" + i,
          kind: "plot",
          index: i,
          name: p.seed ? flower(p.seed).name : "แปลงว่าง",
          hint: p.seed
            ? p.age >= flower(p.seed).days
              ? "เก็บดอกไม้"
              : p.watered
                ? "ดูการเติบโต"
                : "รดน้ำ"
            : "เลือกเมล็ดพันธุ์",
          ...plotPosition(i),
        })),
        ...this.npcs
          .filter((n: any) => n.open)
          .map((n: any) => ({
            id: n.kind,
            kind: n.kind,
            name: n.name,
            hint:
              n.kind === "customer"
                ? "ออร์เดอร์ช่อดอกไม้"
                : n.kind === "workshop"
                  ? "พูดคุยกับศิลปิน"
                  : "พูดคุย / เปิดร้าน",
            x: n.g.position.x,
            z: n.g.position.z,
          })),
      ];
      let nearest: Target | null = null,
        best = 2.8;
      for (const t of targets) {
        const d = Math.hypot(t.x - this.pos.x, t.z - this.pos.z);
        const angle = Math.atan2(t.x - this.pos.x, t.z - this.pos.z);
        const facing = Math.cos(angle - this.yaw - Math.PI);
        if (d < best && (facing > -0.1 || d < 1.1)) {
          best = d;
          nearest = t;
        }
      }
      if (
        nearest?.id !== bridge.target?.id ||
        nearest?.hint !== bridge.target?.hint
      ) {
        bridge.target = nearest;
        bridge.onTarget(nearest);
      }
      const zone = ZONES.reduce((a, b) =>
        Math.hypot(a.x - this.pos.x, a.z - this.pos.z) <
        Math.hypot(b.x - this.pos.x, b.z - this.pos.z)
          ? a
          : b,
      ).en;
      if (zone !== bridge.zone) {
        bridge.zone = zone;
        bridge.onZone(zone);
      }
    }
    if (this.lastQuality !== bridge.quality) {
      this.lastQuality = bridge.quality;
      const renderer = this.el.sceneEl.renderer;
      if (renderer) {
        renderer.setPixelRatio(
          Math.min(devicePixelRatio, bridge.quality === "high" ? 1.5 : 1),
        );
        renderer.shadowMap.enabled = bridge.quality === "high";
      }
    }
  },
  remove(this: any) {
    this.world?.traverse((o: any) => {
      o.geometry?.dispose();
      if (o.material) {
        for (const m of Array.isArray(o.material) ? o.material : [o.material])
          m.dispose();
      }
    });
    this.el.removeObject3D("valley");
  },
});
