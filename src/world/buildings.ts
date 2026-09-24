import {colliders} from './bridge';
export function buildingMaterials(T:any){
 const loader=new T.TextureLoader();const map=(file:string,color=false)=>{const tex=loader.load('/textures/buildings/'+file+'.jpg');tex.wrapS=tex.wrapT=T.RepeatWrapping;tex.anisotropy=8;if(color)tex.colorSpace=T.SRGBColorSpace;return tex;};
 const surface=(id:string,tint:string,tile:number)=>{const m=new T.MeshStandardMaterial({color:tint,map:map(id+'-color',true),normalMap:map(id+'-normal'),roughnessMap:map(id+'-roughness'),normalScale:new T.Vector2(.7,.7),roughness:1});m.userData.worldTile=tile;return m;};
 return {plaster:surface('plaster','#ede1c9',2),masonry:surface('masonry','#a9a493',2),tiles:surface('roof','#a99a82',2),studioWall:surface('plaster','#dce0cc',2)};
}
export function buildHome(w:any,makeFlower:(id:string)=>any){const T=window.AFRAME.THREE,m=w.m;const wall=m.plaster,wood=m.wood,dark=m.darkWood,stone=m.masonry;
 w.box(stone,13,.14,3,8.2,.3,7.2);w.box(wood,13,.3,3,7.8,.12,6.8);
 // Front wall: actual openings for door and two windows.
 for(const x of [10.4,15.6]){w.box(wall,x,.75,6.5,2.8,.9,.24);w.box(wall,x,3,6.5,2.8,1,.24);for(const dx of [-1.1,1.1])w.box(wall,x+dx,1.9,6.5,.6,1.4,.24);windowFrame(w,x,1.9,6.56,1.55,1.5);}
 w.box(wood,13,3.3,6.5,2.4,.4,.3);
 for(const x of [9,17]){w.box(wall,x,.75,3,.24,.9,7);w.box(wall,x,3,3,.24,1,7);for(const z of [.1,5.9])w.box(wall,x,1.9,z,.24,1.4,1.2);w.box(wall,x,1.9,3,.24,1.4,1.2);for(const z of [1.5,4.5])windowFrame(w,x+(x===9?-.15:.15),1.9,z,1.6,1.45,Math.PI/2);}
 w.box(wall,13,1.95,-.5,8,3.3,.24);
 // Real timber baseboards, stone footings and corner posts.
 for(const x of [9,17]){w.box(stone,x,.46,3,.3,.6,7.2);w.box(dark,x,3.4,3,.21,.18,7.3);}for(const x of [10.4,15.6])w.box(stone,x,.46,6.55,2.8,.6,.3);
 for(const x of [9,11.8,14.2,17])w.box(dark,x,1.9,6.7,.13,3.5,.18);
 for(const x of [9,17])w.box(dark,x,1.9,-.55,.18,3.5,.18);
 gableRoof(w,13,3,9,8.4,3.6,5.35,wall);
 // Porch with individual boards and slim support columns.
 for(let i=0;i<24;i++)w.box(wood,8.7+i*.37,.2,7.5,.34,.15,1.6);
 for(const x of [9.1,16.9]){w.box(stone,x,.3,8.2,.4,.6,.4);w.box(dark,x,1.7,8.2,.15,2.7,.15);}
 w.box(dark,13,3.1,8.2,8.4,.15,.18);w.box(wood,13,.08,8.6,2.7,.12,.7);
 // Shutters have modeled slats; windows reveal a furnished interior.
 const shutter=new T.MeshStandardMaterial({color:'#627864',map:m.wood.map,roughness:.8});shutter.userData.worldTile=1;
 for(const x of [9.4,11.4,14.6,16.6]){w.box(shutter,x,1.9,6.88,.35,1.65,.08);for(let j=0;j<7;j++)w.box(dark,x,1.3+j*.2,6.94,.3,.04,.04);}
 for(const x of [10.4,15.6]){w.box(wood,x,.93,6.94,1.9,.28,.5);w.box(m.soil,x,1.09,6.94,1.72,.06,.35);}
 w.box(stone,15.8,4.8,.4,.8,2.7,.9);w.box(dark,15.8,6.2,.4,1,.13,1.1);
 const bedding=new T.MeshStandardMaterial({color:'#c4bdaa',roughness:1});w.box(dark,15,.48,2,1.8,.7,2.6);w.box(bedding,15,.9,2,1.7,.3,2.5);w.box(m.white,15,1.09,1.25,1.25,.18,.55);w.box(dark,15,1.3,.68,1.95,1.1,.12);w.box(wood,16.3,.6,.8,.6,1.1,.65);
 buildFlowerTable(w,makeFlower);
 w.sign('HOME, SWEET HOME',13,3.12,8.35,2.6);
 for(const [x,z,width,depth] of [[9,3,.3,7],[17,3,.3,7],[13,-.5,8,.3],[10.4,6.5,2.8,.3],[15.6,6.5,2.8,.3],[15,2,1.8,2.6],[16.3,.8,.6,.65]])colliders.push({x,z,w:width,d:depth});
}
function buildFlowerTable(w:any,makeFlower:(id:string)=>any){
 const T=window.AFRAME.THREE,m=w.m,x=10.55,z=2.6;
 // Keep the central route from the doorway to the bed clear.
 w.box(m.wood,x,1.2,z,2.1,.15,1.15);
 for(const dx of [-.86,.86])for(const dz of [-.4,.4])w.box(m.darkWood,x+dx,.75,z+dz,.12,.9,.12);
 w.box(m.wood,x,.53,z,1.85,.09,.9);
 w.box(m.darkWood,x,1.04,z+.49,1.95,.22,.1);
 const paper=new T.MeshStandardMaterial({color:'#ceb48a',roughness:1});
 const ribbon=new T.MeshStandardMaterial({color:'#bd8796',roughness:.8});
 const ceramic=new T.MeshStandardMaterial({color:'#ced7c3',roughness:.45});
 w.box(paper,x+.22,1.284,z+.14,.75,.012,.65);
 w.box(ribbon,x+.22,1.294,z+.14,.05,.008,.65);
 // A vase of sample flowers, wrapping paper, twine and florist scissors.
 w.mesh(new T.CylinderGeometry(.18,.13,.35,20),ceramic,x-.62,1.46,z-.25,1,1,1);
 for(const [id,dx,dz] of [['daisy',-.08,0],['tulip',.08,-.03],['rose',0,.07]] as const){
  const bloom=makeFlower(id);bloom.scale.setScalar(.58);bloom.position.set(x-.62+dx,1.56,z-.25+dz);w.mergeGroup(bloom);
 }
 w.mesh(new T.CylinderGeometry(.09,.09,.17,16),paper,x+.78,1.37,z-.3,1,1,1);
 const steel=new T.MeshStandardMaterial({color:'#b9c0bb',metalness:.65,roughness:.3});
 for(const dx of [-.05,.05]){
  w.mesh(new T.TorusGeometry(.048,.013,6,16).rotateX(Math.PI/2),ribbon,x+.6+dx,1.3,z+.28,1,1,1);
  w.box(steel,x+.6+dx,1.3,z+.08,.018,.015,.23);
 }
 w.sign('FLOWER ARRANGING',x,1.02,z+.56,1.15);
 colliders.push({x,z,w:2.1,d:1.15});
 w.targets.push({id:'home-bouquet',kind:'bouquet',name:'โต๊ะจัดดอกไม้ในบ้าน',hint:'จัดดอกไม้ 3 ดอกเป็นช่อ',x,z});
}
export function buildAtelier(w:any){const T=window.AFRAME.THREE,m=w.m,wall=m.studioWall;
 w.box(m.masonry,15,.1,26,7.4,.2,7.4);w.box(m.wood,15,.25,26,7,.12,7);
 w.box(wall,15,1.9,29.5,7,3.4,.24);
 // Wide doorway faces the village, windows bring daylight onto the workbenches.
 for(const x of [12.25,17.75]){w.box(wall,x,.85,22.5,1.5,1.1,.22);w.box(wall,x,3.15,22.5,1.5,.9,.22);windowFrame(w,x,2,22.35,1.1,1.3);}
 for(const x of [11.5,18.5]){w.box(wall,x,.78,26,.24,1,7);w.box(wall,x,3.1,26,.24,1,7);for(const z of [23.05,26,28.95])w.box(wall,x,1.95,z,.24,1.4,1.1);for(const z of [24.5,27.5])windowFrame(w,x+(x<15?-.15:.15),1.95,z,1.75,1.45,Math.PI/2);w.box(m.masonry,x,.48,26,.3,.7,7.3);}
 for(const x of [11.5,13,17,18.5])w.box(m.darkWood,x,1.95,22.3,.16,3.6,.18);
 for(const x of [11.5,18.5])w.box(m.darkWood,x,1.95,29.6,.18,3.6,.18);
 w.box(m.darkWood,15,3.45,22.4,7.5,.18,.18);gableRoof(w,15,26,8.1,8,3.6,5.1,wall);
 // Double workshop doors held open against the front wall.
 w.box(m.wood,12,1.55,22.05,1.35,2.7,.12);w.box(m.wood,18,1.55,22.05,1.35,2.7,.12);
 for(const x of [12,18])for(const y of [.65,2.4])w.box(m.darkWood,x,y,21.96,1.3,.12,.08);
 const sign=w.sign('THE LITTLE ATELIER',15,3.38,22.1,3.5);sign.rotation.y=Math.PI;
 // Trestle workbench, easel, shelves and visible studio tools.
 w.box(m.wood,17,1,27,2,.13,1.2);for(const x of [16.3,17.7]){w.box(m.darkWood,x,.55,27,.1,.9,.8);w.box(m.darkWood,x,.2,27,.65,.1,1);}
 w.box(m.white,13,1.65,27,1.4,1.2,.09);w.box(m.wood,13,.8,27,.09,1.6,.14);w.box(m.wood,13,1.01,26.9,1.6,.08,.2);w.box(m.wood,13,2.3,27,.2,.13,.15);
 w.box(m.wood,17,.9,23,1.5,.13,.7);for(const x of [16.4,17.6])w.box(m.darkWood,x,.5,23,.1,.8,.6);
 for(const y of [.55,1.25,2])w.box(m.wood,15,y,29.15,6.2,.08,.5);
 for(const x of [12,18])w.box(m.darkWood,x,1.25,29.1,.1,2.5,.55);
 for(let i=0;i<7;i++){const c=new T.MeshStandardMaterial({color:['#927561','#9ba27e','#bc8c75'][i%3],roughness:.85});w.mesh(new T.CylinderGeometry(.11,.09,.25,16),c,12.4+i*.3,1.42,29.1,1,1,1);}
 for(const [x,z,width,depth] of [[11.5,26,.25,7],[18.5,26,.25,7],[15,29.5,7,.25],[12.25,22.5,1.5,.25],[17.75,22.5,1.5,.25],[17,27,2,1.2]])colliders.push({x,z,w:width,d:depth});
}
function windowFrame(w:any,x:number,y:number,z:number,width:number,height:number,rotation=0){const T=window.AFRAME.THREE,g=new T.Group(),m=w.m;
 const box=(material:any,px:number,py:number,pz:number,sw:number,sh:number,sd:number)=>w.box(material,px,py,pz,sw,sh,sd,g);
 const glass=new T.MeshPhysicalMaterial({color:'#bbd3c9',transparent:true,opacity:.26,roughness:.08,metalness:.05,side:T.DoubleSide});box(glass,0,0,0,width,height,.025);
 for(const dx of [-width/2,width/2])box(m.darkWood,dx,0,.025,.11,height+.17,.14);for(const dy of [-height/2,height/2])box(m.darkWood,0,dy,.025,width+.16,.11,.14);box(m.white,0,0,.07,.045,height,.06);box(m.white,0,0,.07,width,.045,.06);box(m.masonry,0,-height/2-.13,.09,width+.32,.16,.32);
 g.position.set(x,y,z);g.rotation.y=rotation;w.mergeGroup(g);
}
function gableRoof(w:any,x:number,z:number,width:number,depth:number,eave:number,ridge:number,wall:any){const T=window.AFRAME.THREE,l=x-width/2,r=x+width/2,f=z+depth/2,b=z-depth/2;
 const geometry=new T.BufferGeometry();geometry.setAttribute('position',new T.Float32BufferAttribute([l,eave,b,x,ridge,b,x,ridge,f,l,eave,b,x,ridge,f,l,eave,f,x,ridge,b,r,eave,b,r,eave,f,x,ridge,b,r,eave,f,x,ridge,f],3));const u=Math.hypot(width/2,ridge-eave)/2,v=depth/2;geometry.setAttribute('uv',new T.Float32BufferAttribute([0,0,u,0,u,v,0,0,u,v,0,v,0,0,u,0,u,v,0,0,u,v,0,v],2));geometry.computeVertexNormals();const material=w.m.tiles.clone();material.side=T.DoubleSide;const roof=new T.Mesh(geometry,material);roof.castShadow=true;roof.receiveShadow=true;w.world.add(roof);
 for(const zz of [z-depth/2+.4,z+depth/2-.4]){const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute([l+.4,eave,zz,r-.4,eave,zz,x,ridge-.1,zz],3));g.setAttribute('uv',new T.Float32BufferAttribute([0,0,(width-.8)/2,0,(width-.8)/4,(ridge-eave)/2],2));g.computeVertexNormals();const m=wall.clone();m.side=T.DoubleSide;const triangle=new T.Mesh(g,m);triangle.castShadow=true;w.world.add(triangle);w.branch(new T.Vector3(l,eave,zz),new T.Vector3(x,ridge,zz),.075,w.m.darkWood);w.branch(new T.Vector3(x,ridge,zz),new T.Vector3(r,eave,zz),.075,w.m.darkWood);w.box(w.m.darkWood,x,eave,zz,width,.14,.16);}
 for(const xx of [l,r])w.box(w.m.darkWood,xx,eave,z,.14,.2,depth+.1);
 for(let i=0;i<Math.ceil(depth/.4);i++){const cap=new T.Mesh(new T.CylinderGeometry(.12,.12,.41,12,1,false,0,Math.PI),w.m.tiles);cap.rotation.z=Math.PI/2;cap.rotation.y=Math.PI/2;cap.position.set(x,ridge,z-depth/2+i*.4);w.mergeGroup(cap);}
}
