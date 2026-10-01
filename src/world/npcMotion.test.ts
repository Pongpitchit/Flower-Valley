import {it,expect} from 'vitest';
import {npcStep} from './npcMotion';
for(const [x,z] of [[0,-4],[4,0],[-4,0],[0,4]])it(`faces travel toward ${x},${z} without backward steps`,()=>{
  let p={x:0,z:0,yaw:0};
  for(let i=0;i<180;i++){
    const n=npcStep(p.x,p.z,p.yaw,x,z,Math.PI,1/60);
    expect((n.x-p.x)*Math.sin(n.yaw)+(n.z-p.z)*Math.cos(n.yaw)).toBeGreaterThanOrEqual(-1e-10);
    p=n;
  }
  expect(Math.hypot(p.x-x,p.z-z)).toBeLessThan(.02);
});
it('turns in place at rest without playing the walking animation',()=>{
  const n=npcStep(3,4,0,3,4,Math.PI/2,.1);
  expect(n).toMatchObject({x:3,z:4,walking:false});expect(n.yaw).toBeGreaterThan(0);
});
