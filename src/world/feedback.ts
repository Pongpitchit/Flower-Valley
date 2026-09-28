import { onActivity } from '../game/engine';
import { plotPosition } from '../game/data';
import { bridge } from './bridge';
export function plotMarker(text: string, color: string) {
  const T=window.AFRAME.THREE, canvas=document.createElement('canvas');canvas.width=256;canvas.height=80;
  const c=canvas.getContext('2d')!;c.fillStyle='#283a30';c.beginPath();c.roundRect(2,2,252,76,18);c.fill();c.strokeStyle=color;c.lineWidth=5;c.stroke();c.fillStyle=color;c.font='bold 32px sans-serif';c.textAlign='center';c.textBaseline='middle';c.fillText(text,128,40);
  const texture=new T.CanvasTexture(canvas);texture.colorSpace=T.SRGBColorSpace;
  const sprite=new T.Sprite(new T.SpriteMaterial({map:texture,transparent:true,depthWrite:false}));sprite.scale.set(.85,.265,1);return sprite;
}
export function buildActivityFeedback(world:any) {
  const effects:{sprite:any;age:number;base:number}[]=[];
  const labels:Record<string,string>={plant:'ปลูกแล้ว',water:'ชุ่มน้ำ',harvest:'+1 ดอกไม้',fertilize:'โต +1 วัน',catch:'+1 ปลา',grill:'ย่างเสร็จ',bouquet:'ช่อพร้อมแล้ว',art:'สร้างงานแล้ว',sell:'ขายแล้ว',sellArt:'ขายแล้ว',sellBouquet:'ขายแล้ว',order:'ส่งช่อแล้ว',buy:'ได้เมล็ด',buyFertilizer:'ได้ปุ๋ย',upgradeFarm:'สวนขยายแล้ว',upgradeWatering:'อัปเกรดแล้ว'};
  function dispose(sprite:any){world.remove(sprite);sprite.material.map?.dispose();sprite.material.dispose();}
  const stop=onActivity(a=>{
    const label=labels[a.type];if(!label)return;
    const point=a.index!==undefined?plotPosition(a.index):(bridge.target??bridge.position);
    const sprite=plotMarker(label,a.type==='water'?'#8bdded':'#ffe3a0');const base=a.index!==undefined?.9:2.2;
    sprite.position.set(point.x,base,point.z);world.add(sprite);effects.push({sprite,age:0,base});
  });
  return {update(dt:number){for(let i=effects.length-1;i>=0;i--){const e=effects[i];e.age+=Math.min(dt,100)/1000;e.sprite.position.y=e.base+e.age*.25;e.sprite.material.opacity=Math.min(1,3-e.age);if(e.age>=3){dispose(e.sprite);effects.splice(i,1);}}},dispose(){stop();effects.forEach(e=>dispose(e.sprite));}};
}
