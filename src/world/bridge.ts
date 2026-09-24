export type Target = {
  id: string;
  name: string;
  hint: string;
  kind: string;
  index?: number;
  x: number;
  z: number;
};
export const bridge = {
  paused: true,
  keys: new Set<string>(),
  move: { x: 0, y: 0 },
  look: { x: 0, y: 0 },
  target: null as Target | null,
  zone: "FLOWER VALLEY",
  position: { x: 0, z: 20, yaw: 0 },
  quality: "high",
  sitting: false,
  onTarget: (_: Target | null) => {},
  onZone: (_: string) => {},
  onReady: () => {},
  onError: (_: string) => {},
  teleport: null as null | { x: number; z: number; yaw?: number },
};
export type Collider = { x: number; z: number; w: number; d: number };
export const colliders: Collider[] = [];
export function canMove(x: number, z: number) {
  if (Math.abs(x) > 43 || Math.abs(z) > 43) return false;
  if ((x / 12.7) ** 2 + ((z + 31) / 10.7) ** 2 < 1) return false;
  return !colliders.some(
    (c) =>
      Math.abs(x - c.x) < c.w / 2 + 0.28 && Math.abs(z - c.z) < c.d / 2 + 0.28,
  );
}
