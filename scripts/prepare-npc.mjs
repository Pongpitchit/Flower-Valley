import fs from 'node:fs';
import path from 'node:path';
import * as T from 'three';
import {FBXLoader} from 'three/addons/loaders/FBXLoader.js';
import {GLTFExporter} from 'three/addons/exporters/GLTFExporter.js';
import {mergeVertices} from 'three/addons/utils/BufferGeometryUtils.js';
const source='assets/npc-source/NPC_by and girl',out='public/models/npc';
fs.mkdirSync(path.join(out,'textures'),{recursive:true});
T.TextureLoader.prototype.load=function(url){return new T.Texture();};
globalThis.window={URL:globalThis.URL,innerWidth:1024,innerHeight:768};
globalThis.FileReader=class{readAsArrayBuffer(blob){blob.arrayBuffer().then(data=>{this.result=data;this.onloadend?.();});}readAsDataURL(blob){blob.arrayBuffer().then(data=>{this.result='data:application/octet-stream;base64,'+Buffer.from(data).toString('base64');this.onloadend?.();});}};
const bytes=fs.readFileSync(path.join(source,'NPC_boy and girl.fbx'));
const root=new FBXLoader().parse(bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength),'');root.updateMatrixWorld(true);
const report=[];
for(const code of ['G1','G2','G3','B1','B2','B3']){
 const original=root.children.find(o=>o.name.startsWith('NPC_'+code+'_'));
 const bounds=new T.Box3().setFromObject(original),center=bounds.getCenter(new T.Vector3()),height=bounds.getSize(new T.Vector3()).y,scale=1.72/height;
 const eyes=[];original.traverse(o=>{if(o.isMesh&&/eye(?!brow)/i.test(o.name))eyes.push(new T.Box3().setFromObject(o).getCenter(new T.Vector3()));});
 const flip=eyes[0].z<center.z;
 const normalize=new T.Matrix4().makeScale(scale,scale,scale).multiply(new T.Matrix4().makeTranslation(-center.x,-bounds.min.y,-center.z));
 if(flip)normalize.premultiply(new T.Matrix4().makeRotationY(Math.PI));
 const scene=new T.Group();scene.name=code;const mats=new Map();
 original.traverse(o=>{if(!o.isMesh)return;
  const role=/eyebrow|hair/i.test(o.name)?'hair':/eye/i.test(o.name)?'eye':/skin/i.test(o.name)?'skin':'outfit';
  const materialName=code+'_'+role;
  if(!mats.has(role)){const material=new T.MeshStandardMaterial({name:materialName,color:'#ffffff',roughness:role==='eye'?.4:.88});mats.set(role,material);}
  const geo=mergeVertices(o.geometry.clone().applyMatrix4(new T.Matrix4().multiplyMatrices(normalize,o.matrixWorld)),.00001);
  const uv=geo.attributes.uv;if(uv)for(let i=0;i<uv.count;i++)uv.setY(i,1-uv.getY(i));
  geo.computeBoundingBox();
  if(role==='eye'){const blink=geo.attributes.position.clone(),cy=geo.boundingBox.getCenter(new T.Vector3()).y;for(let i=0;i<blink.count;i++)blink.setY(i,cy+(blink.getY(i)-cy)*.06);geo.morphAttributes.position=[blink];}
  const mesh=new T.Mesh(geo,mats.get(role));mesh.name=code+'_'+o.name;mesh.userData.role=role;scene.add(mesh);
 });
 const gltf=await new GLTFExporter().parseAsync(scene,{binary:false,onlyVisible:true});
 gltf.images=[];gltf.textures=[];gltf.samplers=[{magFilter:9729,minFilter:9987,wrapS:10497,wrapT:10497}];
 for(const material of gltf.materials){const role=material.name.slice(3);const folder=path.join(source,'NPC_'+code+'_Texture');const file=fs.readdirSync(folder).find(f=>f.toLowerCase().includes(role.toLowerCase()));if(!file)throw new Error('Missing '+material.name);
  const name=code+'_'+role+'.png';fs.copyFileSync(path.join(folder,file),path.join(out,'textures',name));
  const index=gltf.images.length;gltf.images.push({uri:'textures/'+name});gltf.textures.push({source:index,sampler:0});material.pbrMetallicRoughness.baseColorTexture={index};material.pbrMetallicRoughness.baseColorFactor=[1,1,1,1];material.pbrMetallicRoughness.metallicFactor=0;
 }
 const binary=Buffer.from(gltf.buffers[0].uri.split(',')[1],'base64');delete gltf.buffers[0].uri;
 const json=Buffer.from(JSON.stringify(gltf));const jp=Buffer.alloc(Math.ceil(json.length/4)*4,0x20);json.copy(jp);const bp=Buffer.alloc(Math.ceil(binary.length/4)*4);binary.copy(bp);
 const header=Buffer.alloc(12);header.writeUInt32LE(0x46546c67);header.writeUInt32LE(2,4);header.writeUInt32LE(12+8+jp.length+8+bp.length,8);
 const jc=Buffer.alloc(8);jc.writeUInt32LE(jp.length);jc.writeUInt32LE(0x4e4f534a,4);const bc=Buffer.alloc(8);bc.writeUInt32LE(bp.length);bc.writeUInt32LE(0x004e4942,4);
 fs.writeFileSync(path.join(out,code+'.glb'),Buffer.concat([header,jc,jp,bc,bp]));
 report.push({code,flip,height:1.72,meshes:scene.children.map(o=>({name:o.name,role:o.userData.role,vertices:o.geometry.attributes.position.count,min:o.geometry.boundingBox.min.toArray(),max:o.geometry.boundingBox.max.toArray()})),bytes:header.readUInt32LE(8)});
}
fs.writeFileSync(path.join(out,'conversion.json'),JSON.stringify(report,null,2));console.log(report.map(r=>({code:r.code,flip:r.flip,bytes:r.bytes,vertices:r.meshes.reduce((n,m)=>n+m.vertices,0)})));
