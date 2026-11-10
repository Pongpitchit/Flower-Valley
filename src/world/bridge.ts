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
// Walkable land: the valley plus the beach, Deep Woods and Skyhill. Fences keep the areas apart, so each
// one is entered through its gate corridor; the beach stops at the waterline.
const inside = (x: number, z: number, x0: number, x1: number, z0: number, z1: number) =>
  x >= x0 && x <= x1 && z >= z0 && z <= z1;
export const PIER = { x0: 56, x1: 75.5, z: -16, half: 1.15, height: 0.45 };
export const HILL = { x: 0, z: 66, top: 5, radius: 21, height: 6 };
export const SHORE = 59.2;
export function walkable(x: number, z: number) {
  return (
    inside(x, z, -45, 45, -45, 43.8) ||
    inside(x, z, 45, 47, -18.4, -13.6) ||
    inside(x, z, 46.8, SHORE, -52, 40) ||
    inside(x, z, PIER.x0, PIER.x1, PIER.z - PIER.half, PIER.z + PIER.half) ||
    inside(x, z, -48, -45, 12.6, 17.4) ||
    inside(x, z, -82.5, -47.5, -12.5, 40.5) ||
    inside(x, z, -2.4, 2.4, 43.8, 47) ||
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
