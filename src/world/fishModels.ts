import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { MTLLoader } from 'three/addons/loaders/MTLLoader.js';
const sources = new Map<number,Promise<any>>();
// Quaternius CC0 fish: source forward is +Z; game fish face +X.
export function attachFishModel(w:any,fish:any,index:number) {
  const T=window.AFRAME.THREE,id=1;
  if(!sources.has(id))sources.set(id,new MTLLoader().loadAsync(`/models/fish/Fish${id}.mtl`).then(materials=>new OBJLoader().setMaterials(materials).loadAsync(`/models/fish/Fish${id}.obj`)));
  const fallback=[...fish.children];
  void sources.get(id)!.then(source=>{
    if(w.removed || fish.userData.disposed)return;
    const model=source.clone(true),bounds=new T.Box3().setFromObject(model),center=bounds.getCenter(new T.Vector3()),size=bounds.getSize(new T.Vector3());
    model.position.copy(center).multiplyScalar(-1);
    const normalized=new T.Group();normalized.add(model);normalized.scale.setScalar(.85/size.z);normalized.rotation.y=Math.PI/2;
    fish.add(normalized);fallback.forEach(o=>o.visible=false);
    normalized.traverse((o:any)=>{if(o.isMesh){
      o.geometry=o.geometry.clone();o.geometry.userData.owned=true;
      const convert=(m:any)=>{const result=new T.MeshStandardMaterial({color:(index===3 ? (m.name==="Bottom"?"#c4b5b0":"#7a9290") : index===4 ? (m.name==="Bottom"?"#ddd3a0":"#6c8050") : (m.name==="Bottom"?"#b5a57b":"#8d744b")),roughness:.72,side:T.DoubleSide});
        result.onBeforeCompile=(shader:any)=>{shader.uniforms.fishTime=w.breezeClock;shader.vertexShader='uniform float fishTime;\n'+shader.vertexShader;shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\n transformed.x += sin(fishTime * 4.0 + position.z * 1.5) * 0.12 * max(0.0, -position.z);');};return result;};
      o.material=Array.isArray(o.material)?o.material.map(convert):convert(o.material);o.castShadow=true;
    }});
  }).catch(()=>{/* Keep the procedural fish visible if a local asset fails. */});
}
