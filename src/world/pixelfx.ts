// Live pixelfx effects (MIT, see src/vendor/pixelfx) drawn into canvas textures for the 3D world.
import { clearFrame, composite, createFrame, createFx } from "../vendor/pixelfx/core/index.js";

const MODULES = import.meta.glob("../vendor/pixelfx/fx/*/*.js", { eager: true }) as Record<string, any>;

export type PixelTexture = {
  texture: any;
  width: number;
  height: number;
  /** Set each frame by whoever shows it; hidden effects skip their redraw. */
  active: boolean;
  setOptions(options: Record<string, unknown>): void;
  draw(dt: number): void;
};

/**
 * One looping effect drawn into its own texture. `crop` keeps part of the effect's canvas
 * ([x, y, w, h] in canvas pixels), e.g. the sky above a weather effect's ground strip.
 */
export function pixelTexture(id: string, options: Record<string, unknown> = {}, crop?: [number, number, number, number]): PixelTexture {
  const T = window.AFRAME.THREE,
    mod = MODULES[`../vendor/pixelfx/fx/${id}.js`];
  if (!mod) throw new Error(`Unknown pixel effect ${id}`);
  const [W, H] = mod.meta.size,
    [ox, oy] = mod.meta.origin,
    [cx, cy, cw, ch] = crop ?? [0, 0, W, H];
  const frame = createFrame(cw, ch, cx, cy),
    canvas = document.createElement("canvas");
  canvas.width = cw;
  canvas.height = ch;
  const ctx = canvas.getContext("2d")!,
    image = ctx.createImageData(cw, ch);
  const texture = new T.CanvasTexture(canvas);
  texture.colorSpace = T.SRGBColorSpace;
  texture.magFilter = T.NearestFilter;
  texture.minFilter = T.LinearFilter;
  texture.generateMipmaps = false;
  let current = options,
    fx = createFx(mod, { ...current, x: ox, y: oy }),
    elapsed = 0;
  const result: PixelTexture = {
    texture,
    width: cw,
    height: ch,
    active: false,
    setOptions(next) {
      current = { ...current, ...next };
      fx = createFx(mod, { ...current, x: ox, y: oy });
      fx.update(elapsed);
    },
    draw(dt) {
      elapsed += dt;
      fx.update(dt);
      clearFrame(frame);
      fx.draw(frame);
      composite(frame, image.data, null);
      ctx.putImageData(image, 0, 0);
      texture.needsUpdate = true;
    },
  };
  result.draw(0);
  return result;
}

/** Plane geometry for a pixel texture, `height` metres tall, anchored at its origin row or centre. */
export function pixelPlane(px: PixelTexture, height: number, anchorRow = px.height / 2, mirrored = false) {
  const T = window.AFRAME.THREE,
    width = (height * px.width) / px.height,
    geo = new T.PlaneGeometry(width, height);
  geo.translate(0, height / 2 - (height * (px.height - anchorRow)) / px.height, 0);
  if (mirrored) {
    const uv = geo.attributes.uv;
    for (let i = 0; i < uv.count; i++) uv.setX(i, 1 - uv.getX(i));
  }
  geo.userData.owned = true;
  return geo;
}

export function pixelMaterial(px: PixelTexture, extra: Record<string, unknown> = {}) {
  const T = window.AFRAME.THREE;
  return new T.MeshBasicMaterial({
    map: px.texture,
    transparent: true,
    alphaTest: 0.04,
    depthWrite: false,
    side: T.DoubleSide,
    toneMapped: false,
    ...extra,
  });
}
