// The slice of the pixelfx core API that Flower Valley calls; the library itself is plain JavaScript.
export type Frame = { w: number; h: number; ox: number; oy: number; color: Uint32Array; light: Uint32Array };
export type Fx = { meta: any; options: any; update(dt: number): void; draw(frame: Frame, layer?: "back" | "front"): void };
export function createFrame(w: number, h: number, ox?: number, oy?: number): Frame;
export function clearFrame(frame: Frame): Frame;
export function createFx(mod: any, options?: Record<string, unknown>): Fx;
export function composite(frame: Frame, out: Uint8ClampedArray, bg?: number | null, lightK?: number): Uint8ClampedArray;
