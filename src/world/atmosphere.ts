export function addBreeze(material: any, clock: { value: number }, strength = .12) {
  material.onBeforeCompile = (shader: any) => {
    shader.uniforms.valleyTime = clock;
    shader.vertexShader = 'uniform float valleyTime;\n' + shader.vertexShader;
    shader.vertexShader = shader.vertexShader.replace('#include <begin_vertex>', `
      #include <begin_vertex>
      vec3 breezeAnchor = modelMatrix[3].xyz;
      #ifdef USE_INSTANCING
        breezeAnchor = (modelMatrix * instanceMatrix[3]).xyz;
      #endif
      float bend = pow(max(position.y, 0.0), 1.4);
      float breeze = sin(valleyTime * 1.5 + breezeAnchor.x * .48 + breezeAnchor.z * .32);
      transformed.x += breeze * bend * ${strength.toFixed(3)};
      transformed.z += cos(valleyTime * 1.1 + breezeAnchor.z * .5) * bend * ${(strength*.45).toFixed(3)};
    `);
  };
  material.customProgramCacheKey = () => `valley-breeze-${strength}`;
}

export function buildAtmosphere(w: any) {
  const T = window.AFRAME.THREE, group = new T.Group();
  w.world.add(group);
  const wingGeometry = new T.SphereGeometry(1,10,6);
  const dark = new T.MeshStandardMaterial({color:'#514d3b',roughness:.9});
  const butterflies:any[] = [], birds:any[] = [], motes:any[] = [];
  const centers = [[22,10],[-24,4],[5,1],[-6,10],[23,24],[-24,23]];
  for(let i=0;i<18;i++){
    const b = new T.Group(), wings:any[] = [];
    const color = new T.MeshStandardMaterial({color:['#e8b954','#b390cf','#e88da4','#7dbfc8'][i%4],roughness:.8,side:T.DoubleSide});
    for(const side of [-1,1]){
      const hinge = new T.Group();
      const wing = new T.Mesh(wingGeometry,color);wing.scale.set(.12,.012,.16);wing.position.set(side*.09,0,0);hinge.add(wing);b.add(hinge);wings.push(hinge);
      const dot = new T.Mesh(wingGeometry,dark);dot.scale.set(.023,.014,.03);dot.position.set(side*.13,.006,-.035);hinge.add(dot);
    }
    const body = new T.Mesh(wingGeometry,dark);body.scale.set(.02,.025,.11);b.add(body);group.add(b);
    butterflies.push({g:b,wings,center:centers[i%centers.length],phase:i*2.39});
  }
  const birdGeometry=new T.BufferGeometry();birdGeometry.setAttribute('position',new T.Float32BufferAttribute([0,0,0,.8,.04,-.12,.28,0,.22],3));birdGeometry.computeVertexNormals();
  const birdMaterial=new T.MeshStandardMaterial({color:'#687789',roughness:.9,side:T.DoubleSide});
  for(let i=0;i<6;i++){
    const b=new T.Group(), wings:any[]=[];
    for(const side of [-1,1]){const wing=new T.Mesh(birdGeometry,birdMaterial);wing.scale.x=side;b.add(wing);wings.push(wing);}
    const body=new T.Mesh(wingGeometry,dark);body.scale.set(.09,.09,.35);b.add(body);group.add(b);birds.push({g:b,wings});
  }
  const glowGeometry=new T.SphereGeometry(.025,6,4),glowMaterial=new T.MeshBasicMaterial({color:'#e6f09a',transparent:true,opacity:.85,toneMapped:false});
  for(let i=0;i<32;i++){const glow=new T.Mesh(glowGeometry,glowMaterial);group.add(glow);motes.push(glow);}
  const smokeGeometry=new T.SphereGeometry(1,10,6), smoke:any[]=[];
  for(let i=0;i<7;i++){
    const puff=new T.Mesh(smokeGeometry,new T.MeshBasicMaterial({color:'#d8d8cb',transparent:true,opacity:.12,depthWrite:false}));group.add(puff);smoke.push(puff);
  }
  return (time:number,night:boolean,rain:boolean,low:boolean) => {
    const t=time*.001;
    butterflies.forEach((b,i)=>{
      b.g.visible=!night&&!rain&&(!low||i<8);
      if(!b.g.visible)return;
      const a=t*.55+b.phase;
      b.g.position.set(b.center[0]+Math.sin(a)*1.6,.8+Math.sin(a*1.8)*.32,b.center[1]+Math.cos(a*.8)*1.5);
      b.g.rotation.y=-a;b.g.rotation.z=Math.sin(a*2)*.2;
      b.wings.forEach((wing:any,j:number)=>wing.rotation.z=Math.sin(t*22+i)*(j?1:-1)*1.0);
    });
    birds.forEach((b,i)=>{
      b.g.visible=!night&&!rain&&(!low||i<3);
      const a=t*.065+i*.5;
      b.g.position.set(Math.cos(a)*31,12+i*.65+Math.sin(a*3)*.8,Math.sin(a)*24+2);b.g.rotation.y=-a;
      b.wings.forEach((wing:any,j:number)=>wing.rotation.z=Math.sin(t*5+i)*(j?1:-1)*.45);
    });
    motes.forEach((glow,i)=>{
      glow.visible=night&&!rain&&(!low||i<12);
      const c=centers[i%centers.length],a=i*2.39;
      glow.position.set(c[0]+Math.sin(t*.28+a)*2,.55+Math.sin(t*.7+a)*.35,c[1]+Math.cos(t*.22+a)*2);
      glow.scale.setScalar(.45+Math.max(0,Math.sin(t*1.7+a))*.9);
    });
    smoke.forEach((puff,i)=>{
      const phase=(t*.11+i/7)%1;
      puff.visible=!rain;puff.position.set(15.8+phase*.85,6.28+phase*2.2,.4+Math.sin(t*.3+phase)*phase*.3);
      puff.scale.setScalar(.13+phase*.35);puff.material.opacity=(1-phase)*.14;
    });
  };
}

export function greetingBubble(text: string) {
  const T = window.AFRAME.THREE,c=document.createElement('canvas');c.width=640;c.height=128;
  const ctx=c.getContext('2d')!;ctx.fillStyle='#fff9e9';ctx.beginPath();ctx.roundRect(4,4,632,108,28);ctx.fill();
  ctx.beginPath();ctx.moveTo(300,105);ctx.lineTo(320,126);ctx.lineTo(340,105);ctx.fill();
  ctx.fillStyle='#53634b';ctx.font='28px "Noto Sans Thai", sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(text,320,61,600);
  const texture=new T.CanvasTexture(c);texture.colorSpace=T.SRGBColorSpace;
  const material=new T.SpriteMaterial({map:texture,transparent:true,depthWrite:false});
  const sprite=new T.Sprite(material);sprite.position.set(0,2.22,0);sprite.scale.set(2,.4,1);sprite.visible=false;return sprite;
}
