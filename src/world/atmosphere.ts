export function addBreeze(
  material: any,
  clock: { value: number },
  strength = 0.12,
) {
  material.onBeforeCompile = (shader: any) => {
    shader.uniforms.valleyTime = clock;
    shader.vertexShader = "uniform float valleyTime;\n" + shader.vertexShader;
    shader.vertexShader = shader.vertexShader.replace(
      "#include <begin_vertex>",
      `
      #include <begin_vertex>
      vec3 breezeAnchor = modelMatrix[3].xyz;
      #ifdef USE_INSTANCING
        breezeAnchor = (modelMatrix * instanceMatrix[3]).xyz;
      #endif
      float bend = pow(max(position.y, 0.0), 1.4);
      float breeze = sin(valleyTime * 1.5 + breezeAnchor.x * .48 + breezeAnchor.z * .32);
      transformed.x += breeze * bend * ${strength.toFixed(3)};
      transformed.z += cos(valleyTime * 1.1 + breezeAnchor.z * .5) * bend * ${(strength * 0.45).toFixed(3)};
    `,
    );
  };
  material.customProgramCacheKey = () => `valley-breeze-${strength}`;
}

// Birds, butterflies and fireflies are pixel art now (pixelLife.ts); this keeps the chimney smoke.
export function buildAtmosphere(w: any) {
  const T = window.AFRAME.THREE,
    group = new T.Group();
  w.world.add(group);
  const smokeCanvas=document.createElement("canvas");smokeCanvas.width=smokeCanvas.height=64;
  const ctx=smokeCanvas.getContext("2d")!;
  const gradient=ctx.createRadialGradient(32,32,0,32,32,32);
  gradient.addColorStop(0,"rgba(216,216,203,.65)");gradient.addColorStop(.45,"rgba(216,216,203,.3)");gradient.addColorStop(1,"rgba(216,216,203,0)");
  ctx.fillStyle=gradient;ctx.fillRect(0,0,64,64);
  const smokeMap=new T.CanvasTexture(smokeCanvas);
  smokeMap.colorSpace=T.SRGBColorSpace;
  const smoke:any[]=[];
  for(let i=0;i<7;i++){
    const puff=new T.Sprite(new T.SpriteMaterial({map:smokeMap,transparent:true,opacity:.12,depthWrite:false}));
    puff.name="Chimney smoke";group.add(puff);smoke.push(puff);
  }
  return (time: number, rain: boolean) => {
    const t = time * 0.001;
    smoke.forEach((puff, i) => {
      const phase = (t * 0.11 + i / 7) % 1;
      puff.visible = !rain;
      puff.position.set(
        15.8 + phase * 0.85,
        6.28 + phase * 2.2,
        0.4 + Math.sin(t * 0.3 + phase) * phase * 0.3,
      );
      puff.scale.setScalar(0.26 + phase * 0.7);
      puff.material.opacity = (1 - phase) * 0.14;
    });
  };
}

export function greetingBubble(text: string) {
  const T = window.AFRAME.THREE,
    c = document.createElement("canvas");
  c.width = 640;
  c.height = 128;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = "#fff9e9";
  ctx.beginPath();
  ctx.roundRect(4, 4, 632, 108, 28);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(300, 105);
  ctx.lineTo(320, 126);
  ctx.lineTo(340, 105);
  ctx.fill();
  ctx.fillStyle = "#53634b";
  ctx.font = '28px "Noto Sans Thai", sans-serif';
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, 320, 61, 600);
  const texture = new T.CanvasTexture(c);
  texture.colorSpace = T.SRGBColorSpace;
  const material = new T.SpriteMaterial({
    map: texture,
    transparent: true,
    depthWrite: false,
  });
  const sprite = new T.Sprite(material);
  sprite.position.set(0, 2.22, 0);
  sprite.scale.set(2, 0.4, 1);
  sprite.visible = false;
  return sprite;
}
