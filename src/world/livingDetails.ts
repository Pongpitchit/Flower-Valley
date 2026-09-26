import { addBreeze } from './atmosphere';
import { FLOWERS } from '../game/data';
import { canMove } from './bridge';

export function buildMeadows(w: any, makeFlower: (id: string) => any, random: () => number) {
  const T = window.AFRAME.THREE;
  const matrices: any[][] = FLOWERS.map(() => []);
  // Meadow bands and small village beds, with clear roads, crop plots and buildings.
  const patches = [[-26, 6, 6, 25, 260], [26, 5, 6, 25, 260], [-13, 35, 10, 5, 180],
    [14, 35, 10, 5, 180], [-12, -13, 6, 3, 120], [13, -9, 7, 3, 120],
    [-5, 9, 2, 3, 60], [5, 2, 2, 3, 60], [21, 12, 2, 7, 90]];
  const dummy = new T.Object3D();
  for (const [cx, cz, rx, rz, count] of patches) {
    for (let i = 0; i < count; i++) {
      const angle = random() * Math.PI * 2, radius = Math.sqrt(random());
      const x = cx + Math.cos(angle) * rx * radius, z = cz + Math.sin(angle) * rz * radius;
      if (!canMove(x, z) || Math.abs(x) < 2.8 ||
        (x > -18 && x < -4 && z > -7 && z < 8) ||
        (Math.abs(z - 15) < 2.3 && x > -20 && x < 1) ||
        (Math.abs(z - 6) < 2 && x > 0 && x < 20) ||
        (Math.abs(z - 23) < 2 && x > 0 && x < 20) ||
        (Math.abs(z + 16) < 2 && x > -2 && x < 18) ||
        (x / 14.5) ** 2 + ((z + 31) / 12.5) ** 2 < 1) continue;
      dummy.position.set(x, .025, z);
      dummy.rotation.set(0, random() * Math.PI * 2, (random() - .5) * .14);
      dummy.scale.setScalar(.5 + random() * .5);
      dummy.updateMatrix();
      matrices[Math.floor(random() * FLOWERS.length)].push(dummy.matrix.clone());
    }
  }
  for (let i = 0; i < FLOWERS.length; i++) {
    const template = makeFlower(FLOWERS[i].id);
    for (const part of template.children) {
      addBreeze(part.material,w.breezeClock,.13);
      const batch = new T.InstancedMesh(part.geometry, part.material, matrices[i].length);
      matrices[i].forEach((matrix, index) => batch.setMatrixAt(index, matrix));
      batch.receiveShadow = true;
      batch.computeBoundingSphere();
      w.world.add(batch);
    }
  }
}

export function addNpcFace(w: any, g: any, name: string, skin: any) {
  const T = window.AFRAME.THREE;
  const surface = (color: string) => new T.MeshStandardMaterial({ color, roughness: .85 });
  const hair = surface(({Lily:'#62452f',Mae:'#42302a',Finn:'#74614b',Oliver:'#a56b3e',Emma:'#53392f'} as Record<string,string>)[name]);
  const dark = surface('#322922'), white = surface('#fff2dd'), iris = surface(name === 'Finn' ? '#527d82' : '#5a704a');
  const cheek = surface('#cf8c78');
  const eyes:any[]=[];
  const ball = (material:any,x:number,y:number,z:number,sx:number,sy:number,sz:number) =>
    w.mesh(new T.SphereGeometry(1,16,12),material,x,y,z,sx,sy,sz,g);
  const curve = (points:number[][],radius:number,material:any) => {
    const path = new T.CatmullRomCurve3(points.map(p => new T.Vector3(...p)));
    const mesh = new T.Mesh(new T.TubeGeometry(path,12,radius,6,false),material);g.add(mesh);return mesh;
  };
  ball(hair,0,1.59,-.045,.208,.21,.19);
  for (const side of [-1,1]) {
    ball(skin,side*.194,1.52,0,.038,.061,.035);
    ball(cheek,side*.117,1.49,.162,.041,.019,.013);
    eyes.push(ball(white,side*.074,1.565,.177,.039,.041,.023));
    eyes.push(ball(iris,side*.072,1.565,.198,.021,.026,.009));
    eyes.push(ball(dark,side*.072,1.565,.205,.012,.018,.006));
    eyes.push(ball(white,side*.072-.006,1.574,.211,.006,.007,.004));
    curve([[side*.108,1.622,.168],[side*.075,1.634,.181],[side*.041,1.623,.187]],.009,hair);
    ball(hair,side*.177,1.62,.023,.035,.12,.12);
    if (name === 'Mae' || name === 'Emma') ball(hair,side*.175,1.42,-.09,.075,.18,.09);
  }
  for(let i=0;i<5;i++)ball(hair,-.14+i*.07,1.712-Math.abs(i-2)*.01,.092,.066,.065,.1);
  ball(skin,0,1.514,.203,.033,.045,.036);
  curve([[-.055,1.457,.169],[0,1.44,.186],[.055,1.457,.169]],.008,surface('#8a4e43'));
  if(name === 'Oliver'){
    for(const x of [-.074,.074])w.mesh(new T.TorusGeometry(.052,.005,6,24),dark,x,1.565,.213,1,1,1,g);
    curve([[-.024,1.575,.218],[0,1.583,.22],[.024,1.575,.218]],.004,dark);
  }
  if(name === 'Finn')for(const x of [-.031,.031])ball(hair,x,1.477,.204,.036,.013,.018);
  if(name === 'Lily'){
    ball(surface('#d77f92'),-.18,1.72,.15,.055,.046,.02);
    ball(surface('#e0b659'),-.18,1.72,.172,.018,.018,.008);
  }
  if(name === 'Mae' || name === 'Oliver'){
    w.box(surface(name === 'Mae' ? '#e8d5b4' : '#899a84'),0,1.015,.166,.34,.48,.04,g);
    w.box(hair,0,.96,.193,.16,.13,.025,g);
  }
  eyes.forEach(eye=>eye.userData.openY=eye.scale.y);return eyes;
}

export function createLakeFish(w: any, index: number) {
  const T = window.AFRAME.THREE, fish = new T.Group();
  const palette = [['#8b7139','#bd904d'],['#e7771a','#f0b13d'],['#307f9b','#ac79c4']][index % 3];
  const material = (color:string) => new T.MeshStandardMaterial({color,roughness:.78,emissive:color,emissiveIntensity:.12});
  const body=material(palette[0]), fin=material(palette[1]), eye=material('#131e22');
  const sphere=new T.SphereGeometry(1,16,10);
  w.mesh(sphere,body,0,0,0,.34,.13,.12,fish);
  const tail=w.mesh(new T.ConeGeometry(1,1,3),fin,-.38,0,0,.19,.28,.1,fish);tail.rotation.z=-Math.PI/2;
  for(const side of [-1,1]){
    w.mesh(sphere,eye,.24,.048,side*.08,.027,.027,.018,fish);
    const pectoral=w.mesh(sphere,fin,-.05,-.015,side*.135,.13,.018,.08,fish);pectoral.rotation.y=side*.5;
  }
  w.mesh(new T.ConeGeometry(1,1,3),fin,-.035,.115,0,.13,.2,.04,fish);
  fish.userData.tail=tail;
  return fish;
}
