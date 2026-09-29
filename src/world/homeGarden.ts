import { HOME_STYLES } from '../game/home';
import type { GameState } from '../game/engine';
import { createLakeFish } from './livingDetails';
import { colliders } from './bridge';

export function landscapeMaterial(T:any) {
  const loader=new T.TextureLoader();
  const map=loader.load('/textures/landscape/rocky-color.jpg');
  map.colorSpace=T.SRGBColorSpace;
  const normalMap=loader.load('/textures/landscape/rocky-normal.jpg');
  for(const t of [map,normalMap]) {t.wrapS=t.wrapT=T.RepeatWrapping;t.repeat.set(3,2);}
  return new T.MeshStandardMaterial({map,normalMap,roughness:1,color:'#bbc7a8',normalScale:new T.Vector2(.5,.5)});
}
export function refreshHomeGarden(w:any,s:GameState,makeFlower:(id:string)=>any) {
  const T=window.AFRAME.THREE;
  const style=HOME_STYLES.find(x=>x.id===s.home.style)!;
  w.homeWall?.color.set(style.wall);w.homeRoof?.color.set(style.roof);
  const sig=JSON.stringify(s.home);
  if(w.homeGardenSig===sig)return;
  w.homeGardenSig=sig;
  if(!w.homeGardenGroup){w.homeGardenGroup=new T.Group();w.world.add(w.homeGardenGroup);}
  w.disposeGroup(w.homeGardenGroup);
  w.pondFish=[];
  const group=w.homeGardenGroup;
  const mesh=(geo:any,mat:any,x:number,y:number,z:number)=>{
    geo.userData.owned=true;const o=new T.Mesh(geo,mat);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;group.add(o);return o;
  };
  const material=(color:string)=>new T.MeshStandardMaterial({color,roughness:.9});
  if(s.home.garden){
    // Two ornamental beds and a clear central gravel walk, behind the north wall.
    mesh(new T.BoxGeometry(2,.06,6),material('#b7ad94'),13,.02,-4.6);
    for(const x of [10.3,15.7]){
      mesh(new T.BoxGeometry(2.8,.16,5.5),material('#5b4835'),x,.07,-4.6);
      for(let i=0;i<24;i++){
        const f=makeFlower(['cosmos','lavender','hydrangea','rose'][i%4]);
        f.scale.setScalar(.55+(i%3)*.07);f.position.set(x-1+(i%4)*.67,.15,-6.8+Math.floor(i/4)*.86);group.add(f);
      }
      for(const dx of [-1.45,1.45])mesh(new T.BoxGeometry(.12,.23,5.7),material('#8c8575'),x+dx,.12,-4.6);
    }
  }
  if(s.home.pond){
    if(!w.pondCollider){w.pondCollider={x:24,z:2,w:5.3,d:4.1};colliders.push(w.pondCollider);w.targets.push({id:"home-pond",kind:"pond",name:"บ่อปลาของฉัน",hint:"ปล่อยปลา / นำปลากลับ",x:24,z:4.4});}
    if(!w.pondStone)w.pondStone=landscapeMaterial(T);
    const stone=w.pondStone;stone.map.repeat.set(1,1);stone.normalMap.repeat.set(1,1);
    w.m.pondStone=stone;
    const bed=mesh(new T.CylinderGeometry(1,1,.25,48),material('#466a66'),24,.2,2);bed.scale.set(2.4,1,1.75);
    for(let i=0;i<22;i++){
      const a=i/22*Math.PI*2;
      const rock=mesh(new T.DodecahedronGeometry(.42,0),stone,24+Math.cos(a)*2.45,.43,2+Math.sin(a)*1.85);
      rock.scale.set(1,.8+(i%3)*.12,.8);rock.rotation.set(i*.3,i*.8,0);
    }
    const water=mesh(new T.CircleGeometry(1,48),new T.MeshStandardMaterial({color:'#69a6ad',transparent:true,opacity:.35,roughness:.16,metalness:.12,depthWrite:false,side:T.DoubleSide}),24,.48,2);
    water.rotation.x=-Math.PI/2;water.scale.set(2.4,1.75,1);w.pondWater=water;
    const species=['carp','goldfish','rare','trout','perch','catfish'];
    s.home.fish.forEach(id=>{
      const index=species.indexOf(id),f=createLakeFish(w,index);
      f.scale.setScalar(.7);f.userData.species=id;
      if(index>=3)f.traverse((o:any)=>{if(o.isMesh && o.material.color.getHexString()!=='131e22')o.material.color.set(['#789a9b','#8f9959','#626b74'][index-3]);});
      group.add(f);w.pondFish.push(f);
    });
  } else w.pondWater=null;
}
export function animateHomePond(w:any,time:number){
  w.pondFish?.forEach((f:any,i:number)=>{
    const a=time*.00022+i*1.9,r=1+(i%3)*.3;
    f.position.set(24+Math.cos(a)*r,.39,2+Math.sin(a)*r*.65);
    f.rotation.y=Math.atan2(Math.cos(a)*.65,Math.sin(a));
    f.userData.tail.rotation.y=Math.sin(time*.007+i)*.3;
  });
  if(w.pondWater)w.pondWater.position.y=.48+Math.sin(time*.001)*.008;
}
