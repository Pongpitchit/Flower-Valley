import fs from 'node:fs';
import * as T from 'three';
import {FBXLoader} from 'three/addons/loaders/FBXLoader.js';
T.TextureLoader.prototype.load=function(url){const t=new T.Texture();t.userData.source=url;return t;};
globalThis.window={URL:globalThis.URL,innerWidth:1024,innerHeight:768};
for(const file of ['assets/props-source/campfire/FBX/Campfire.fbx','assets/props-source/campfire/FBX/Campfire_anim.fbx',...fs.readdirSync('assets/props-source/logs-export',{recursive:true}).filter(f=>f.endsWith('.fbx')).map(f=>'assets/props-source/logs-export/'+f)]){
const bytes=fs.readFileSync(file),root=new FBXLoader().parse(bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength),'');root.updateMatrixWorld(true);console.log(file);
root.traverse(o=>{if(o.isMesh)console.log(JSON.stringify({name:o.name,vertices:o.geometry.attributes.position.count,min:new T.Box3().setFromObject(o).min.toArray(),max:new T.Box3().setFromObject(o).max.toArray(),material:(Array.isArray(o.material)?o.material:[o.material]).map(m=>({name:m.name,color:m.color?.getHexString(),map:m.map?.userData.source,alpha:m.alphaMap?.userData.source}))}));});}
