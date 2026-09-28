import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { bridge } from './bridge';
const loader = new GLTFLoader();
const sources = new Map<string, Promise<any>>();
export function villageProp(w:any,id:string,x:number,y:number,z:number,height:number,yaw=0) {
  if(!sources.has(id))sources.set(id,loader.loadAsync(`/models/village/${id}.glb`).then(g=>g.scene));
  void sources.get(id)!.then(source=>{
    if(w.removed)return;
    const T=window.AFRAME.THREE, model=source.clone(true),box=new T.Box3().setFromObject(model),size=box.getSize(new T.Vector3()),center=box.getCenter(new T.Vector3());
    const holder=new T.Group(); model.position.set(-center.x,-box.min.y,-center.z);holder.add(model);holder.scale.setScalar(height/size.y);holder.rotation.y=yaw;holder.position.set(x,y,z);
    model.traverse((o:any)=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;
      if(id==="lantern"){o.material=o.material.clone();o.material.color.set("#5f695c");o.material.roughness=.82;}
      if(id==="fountain-round" && o.name.includes("ignore")){o.material=new T.MeshStandardMaterial({color:"#6fadb8",roughness:.2,metalness:.25,transparent:true,opacity:.8});}
    }});w.world.add(holder);
  }).catch(()=>bridge.onError('โหลดของตกแต่งหมู่บ้านไม่สำเร็จ'));
}
