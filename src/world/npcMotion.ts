/** Imported NPCs face +Z. Turn first and suppress backward translation. */
export function npcStep(x:number,z:number,yaw:number,goalX:number,goalZ:number,idleYaw:number,delta:number) {
  const dx=goalX-x,dz=goalZ-z,moving=Math.hypot(dx,dz)>.008;
  const target=moving?Math.atan2(dx,dz):idleYaw;
  const turn=Math.atan2(Math.sin(target-yaw),Math.cos(target-yaw));
  const heading=yaw+Math.max(-delta*4,Math.min(delta*4,turn));
  const facing=Math.max(0,Math.cos(target-heading));
  const amount=moving?(1-Math.exp(-delta*3))*facing:0;
  return {x:x+dx*amount,z:z+dz*amount,yaw:heading,walking:moving&&facing>.2};
}
