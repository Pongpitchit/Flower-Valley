import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import type {PaintModelId} from '../game/models';
const cache=new Map<string,Promise<any>>();
export async function loadPaintModel(id:PaintModelId,colors:Record<string,string>={}){
 const T=window.AFRAME.THREE;
 if(!cache.has(id))cache.set(id,new GLTFLoader().loadAsync(`/models/painting/${id}.glb`).catch(e=>{cache.delete(id);throw e;}));
 const gltf=await cache.get(id)!,model=gltf.scene.clone(true);let index=0;
 model.traverse((o:any)=>{if(!o.isMesh)return;o.material=o.material.clone();o.userData.paintId=String(index++);o.userData.originalColor='#'+o.material.color.getHexString();if(colors[o.userData.paintId])o.material.color.set(colors[o.userData.paintId]);o.material.roughness=.6;o.castShadow=true;o.receiveShadow=true;});
 const bounds=new T.Box3().setFromObject(model),size=bounds.getSize(new T.Vector3()),center=bounds.getCenter(new T.Vector3()),scale=2/Math.max(size.y,size.x,size.z);
 model.scale.setScalar(scale);model.position.set(-center.x*scale,-bounds.min.y*scale,-center.z*scale);
 const root=new T.Group();root.add(model);return root;
}
export function paintModel(model:any,colors:Record<string,string>){model.traverse((o:any)=>{if(o.isMesh&&o.userData.paintId!==undefined)o.material.color.set(colors[o.userData.paintId]??o.userData.originalColor);});}
export function disposePaintModel(model:any){model.traverse((o:any)=>{if(o.isMesh)o.material.dispose();});}
