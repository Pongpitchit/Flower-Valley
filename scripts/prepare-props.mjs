import fs from 'node:fs';
import path from 'node:path';
import * as T from 'three';
import {FBXLoader} from 'three/addons/loaders/FBXLoader.js';
import {GLTFExporter} from 'three/addons/exporters/GLTFExporter.js';
import {mergeVertices} from 'three/addons/utils/BufferGeometryUtils.js';
T.TextureLoader.prototype.load=function(url){const t=new T.Texture();t.userData.source=url;return t;};
globalThis.window={URL:globalThis.URL};
globalThis.FileReader=class{readAsArrayBuffer(blob){blob.arrayBuffer().then(data=>{this.result=data;this.onloadend?.();});}readAsDataURL(blob){blob.arrayBuffer().then(data=>{this.result='data:application/octet-stream;base64,'+Buffer.from(data).toString('base64');this.onloadend?.();});}};
function read(file){const b=fs.readFileSync(file);const root=new FBXLoader().parse(b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength),'');root.updateMatrixWorld(true);return root;}
async function exportMesh(original,dir,name,width,rotation,texture){
 fs.mkdirSync(dir,{recursive:true});
 const geometry=original.geometry.clone().applyMatrix4(original.matrixWorld);
 if(rotation)geometry.rotateZ(rotation);geometry.computeBoundingBox();const bounds=geometry.boundingBox,center=bounds.getCenter(new T.Vector3()),scale=width/bounds.getSize(new T.Vector3()).x;
 geometry.translate(-center.x,-bounds.min.y,-center.z);geometry.scale(scale,scale,scale);const uv=geometry.attributes.uv;for(let i=0;i<uv.count;i++)uv.setY(i,1-uv.getY(i));
 const mesh=new T.Mesh(mergeVertices(geometry,.00001),new T.MeshStandardMaterial({color:'white',roughness:.88}));mesh.name=name;
 const gltf=await new GLTFExporter().parseAsync(mesh,{binary:false});
 const textureName=name+path.extname(texture);fs.copyFileSync(texture,path.join(dir,textureName));
 gltf.images=[{uri:textureName}];gltf.textures=[{source:0}];gltf.materials[0].pbrMetallicRoughness.baseColorTexture={index:0};
 const binary=Buffer.from(gltf.buffers[0].uri.split(',')[1],'base64');delete gltf.buffers[0].uri;
 const json=Buffer.from(JSON.stringify(gltf)),jp=Buffer.alloc(Math.ceil(json.length/4)*4,32),bp=Buffer.alloc(Math.ceil(binary.length/4)*4);json.copy(jp);binary.copy(bp);
 const h=Buffer.alloc(12),j=Buffer.alloc(8),b=Buffer.alloc(8);h.writeUInt32LE(0x46546c67);h.writeUInt32LE(2,4);h.writeUInt32LE(28+jp.length+bp.length,8);j.writeUInt32LE(jp.length);j.writeUInt32LE(0x4e4f534a,4);b.writeUInt32LE(bp.length);b.writeUInt32LE(0x004e4942,4);
 fs.writeFileSync(path.join(dir,name+'.glb'),Buffer.concat([h,j,jp,b,bp]));console.log(name,new T.Box3().setFromObject(mesh).getSize(new T.Vector3()).toArray());
}
const camp=read('assets/props-source/campfire/FBX/Campfire.fbx');
await exportMesh(camp.children.find(o=>o.isMesh),'public/models/campfire','campfire',1.8,0,'assets/props-source/campfire/Textures/Optimized/Campfire_MAT_BaseColor_00.jpg');
fs.copyFileSync('assets/props-source/campfire/Textures/Optimized/Campfire_fire_MAT_BaseColor_Alpha.png','public/models/campfire/flame.png');
const logFile=fs.readdirSync('assets/props-source/logs-export',{recursive:true}).find(f=>f.endsWith('.fbx')),root=read('assets/props-source/logs-export/'+logFile);
let i=0;for(const mesh of root.children.filter(o=>o.isMesh)){const map=mesh.material.map.userData.source;await exportMesh(mesh,'public/models/logs','log'+(++i),2.7,Math.PI/2,path.join('assets/props-source/logs-export',path.dirname(logFile),map));}
