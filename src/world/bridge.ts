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
  npcModels: {} as Record<string, string>,
  keys: new Set<string>(),
  move: { x: 0, y: 0 },
  look: { x: 0, y: 0 },
  target: null as Target | null,
  zone: "FLOWER VALLEY",
  position: { x: 0, z: 20, yaw: 0 },
  quality: "high",
  sitting: false,
  zoom: false,
  onTarget: (_: Target | null) => {},
  onZone: (_: string) => {},
  onReady: () => {},
  onError: (_: string) => {},
  teleport: null as null | { x: number; z: number; yaw?: number; pitch?: number },
};
export type Collider = { x: number; z: number; w: number; d: number };
export const colliders: Collider[] = [];
// Walkable land beyond the original valley: corridors lead east to the beach and pier,
// west to the Deep Woods and south up Skyhill.
const inside = (x: number, z: number, x0: number, x1: number, z0: number, z1: number) =>
  x >= x0 && x <= x1 && z >= z0 && z <= z1;
export const PIER = { x0: 56, x1: 75.5, z: -16, half: 1.15, height: 0.45 };
export const HILL = { x: 0, z: 66, top: 5, radius: 21, height: 6 };
export function walkable(x: number, z: number) {
  return (
    (Math.abs(x) <= 43 && Math.abs(z) <= 43) ||
    inside(x, z, 43, 47.5, -19, -13) ||
    inside(x, z, 47, 61.5, -40, 10) ||
    inside(x, z, PIER.x0, PIER.x1, PIER.z - PIER.half, PIER.z + PIER.half) ||
    inside(x, z, -48.5, -43, 12, 18) ||
    inside(x, z, -82, -48, -12, 40) ||
    inside(x, z, -3.5, 3.5, 43, 47) ||
    Math.hypot(x - HILL.x, z - HILL.z) < HILL.radius - 0.5
  );
}
export function groundHeight(x: number, z: number) {
  const d = Math.hypot(x - HILL.x, z - HILL.z);
  if (d < HILL.radius) {
    const t = Math.min(1, (HILL.radius - d) / (HILL.radius - HILL.top));
    return HILL.height * t * t * (3 - 2 * t);
  }
  if (inside(x, z, PIER.x0, PIER.x1 + 0.5, PIER.z - PIER.half - 0.1, PIER.z + PIER.half + 0.1))
    return Math.min(PIER.height, (x - PIER.x0) * 0.12);
  return 0;
}
export function canMove(x: number, z: number) {
  if (!walkable(x, z)) return false;
  if ((x / 12.7) ** 2 + ((z + 31) / 10.7) ** 2 < 1) return false;
  return !colliders.some(
    (c) =>
      Math.abs(x - c.x) < c.w / 2 + 0.28 && Math.abs(z - c.z) < c.d / 2 + 0.28,
  );
}
