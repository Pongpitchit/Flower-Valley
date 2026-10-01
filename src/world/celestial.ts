// Original procedural sky artwork: no external or paid assets.
export function buildCelestial(w: any) {
  const T=window.AFRAME.THREE;
  function disc(moon: boolean) {
    const canvas=document.createElement('canvas');canvas.width=canvas.height=256;
    const c=canvas.getContext('2d')!;
    if(!moon){const halo=c.createRadialGradient(128,128,65,128,128,126);halo.addColorStop(0,'rgba(255,209,104,.38)');halo.addColorStop(1,'rgba(255,209,104,0)');c.fillStyle=halo;c.fillRect(0,0,256,256);}
    c.beginPath();c.arc(128,128,moon?88:70,0,Math.PI*2);c.fillStyle=moon?'#ecebdd':'#fff4bf';c.fill();
    if(moon){c.save();c.clip();for(const [x,y,r] of [[90,90,17],[151,101,24],[112,160,21],[168,165,12],[66,134,10]]){const shade=c.createRadialGradient(x,y,0,x,y,r);shade.addColorStop(0,'rgba(122,139,151,.28)');shade.addColorStop(1,'rgba(122,139,151,0)');c.fillStyle=shade;c.fillRect(x-r,y-r,r*2,r*2);}c.restore();}
    const map=new T.CanvasTexture(canvas);map.colorSpace=T.SRGBColorSpace;
    const sprite=new T.Sprite(new T.SpriteMaterial({map,transparent:true,depthWrite:false,fog:false,toneMapped:false}));
    sprite.name=moon?'Moon disc':'Sun disc';sprite.scale.setScalar(moon?16:22);w.world.add(sprite);return sprite;
  }
  const sun=disc(false),moon=disc(true);
  return {
    update(hours:number,rain:boolean) {
      const day=hours>=6&&hours<20;
      sun.visible=day;moon.visible=!day;
      const a=(day?(hours-6)/14:((hours+4)%24)/10)*Math.PI;
      const body=day?sun:moon;
      // World direction depends on the clock, never on the mouse or camera rotation.
      body.position.set(Math.cos(a)*145,Math.sin(a)*130,45);
      body.material.opacity=rain?.45:1;
      sun.material.color.set(hours>=17?'#ffc075':'#ffffff');
    },
    dispose(){sun.material.map.dispose();moon.material.map.dispose();}
  };
}
