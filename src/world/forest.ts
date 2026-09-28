import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { addBreeze } from './atmosphere';
import { colliders, bridge } from './bridge';
export function buildForest(w: any, random: () => number) {
  const T = window.AFRAME.THREE;
  const matrices: any[][] = [[],[],[]];
  for(let i=0;i<76;i++) {
    let x:number,z:number;
    if(i<48) { const a=i/48*Math.PI*2; x=Math.sin(a)*(41+random()*12);z=Math.cos(a)*(42+random()*12); }
    else { x=(random()-.5)*76;z=(random()-.5)*75; if(Math.abs(x)<22 && z>-24 && z<32)continue; if(x*x/220+(z+31)**2/130<1.5)continue; }
    const o=new T.Object3D();o.position.set(x,0,z);o.scale.setScalar(7+random()*5);o.rotation.y=random()*Math.PI*2;o.updateMatrix();matrices[i%3].push(o.matrix.clone());
    if(Math.abs(x)<43 && Math.abs(z)<43)colliders.push({x,z,w:.65,d:.65});
  }
  ['oak-lush','oak','spruce'].forEach((name,i)=>new GLTFLoader().load(`/models/forest/${name}.glb`,gltf=>{
    gltf.scene.traverse((node:any)=>{
      if(!node.isMesh)return;
      const materials=Array.isArray(node.material)?node.material:[node.material];
      materials.forEach((m:any)=>{m.roughness=.9;addBreeze(m,w.breezeClock,.018);});
      const mesh=new T.InstancedMesh(node.geometry,node.material,matrices[i].length);
      matrices[i].forEach((matrix,j)=>mesh.setMatrixAt(j,matrix));mesh.castShadow=true;mesh.receiveShadow=true;w.world.add(mesh);
    });
  },undefined,()=>bridge.onError('โหลดต้นไม้ไม่สำเร็จ ลองรีเฟรชเกม')));
}
