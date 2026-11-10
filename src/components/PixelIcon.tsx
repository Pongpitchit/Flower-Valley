// 16×16 pixel-art sprites for the forage items, drawn as crisp SVG rects.
type Sprite = { palette: Record<string, string>; rows: string[] };

const SPRITES: Record<string, Sprite> = {
  "forage:mushroom": {
    palette: { k: "#3a2a24", r: "#d8453b", w: "#fbefe3", c: "#efe3cf", s: "#cdb894" },
    rows: [
      "................",
      "................",
      ".....kkkkkk.....",
      "...kkrrrrrrkk...",
      "..krrwrrrrwrrk..",
      ".krrrrrrwrrrrrk.",
      ".krwwrrrrrrrwrk.",
      ".krrrrrrrrrrrrk.",
      "..kkkkkkkkkkkk..",
      ".....kcccck.....",
      ".....kccsck.....",
      ".....kcccck.....",
      ".....kcscck.....",
      "....kkcccckk....",
      "....kkkkkkkk....",
      "................",
    ],
  },
  "forage:rare-mushroom": {
    palette: { k: "#2b2140", p: "#9b6cf0", l: "#e3d1ff", c: "#eef0ff", s: "#c9cdf2", y: "#fff6a8" },
    rows: [
      "..y..........y..",
      ".yyy...........y",
      "..y..kkkkkk.....",
      "...kkppppppkk...",
      "..kpplppppplpk..",
      ".kpppppplpppppk.",
      ".kplpppppppplpk.",
      ".kppppppppppppk.",
      "..kkkkkkkkkkkk..",
      ".....kcccck...y.",
      ".....kccsck..yyy",
      ".y...kcccck...y.",
      "yyy..kcscck.....",
      ".y..kkcccckk....",
      "....kkkkkkkk....",
      "................",
    ],
  },
  "forage:berry": {
    palette: { k: "#1f2a44", g: "#5c9a43", h: "#3f7a33", b: "#3d4f9d", w: "#b7c4ff", r: "#c43a4a" },
    rows: [
      "................",
      ".......gg.......",
      "......gggg..g...",
      ".....ghggggg....",
      "........kk......",
      "....kkk.kk.kkk..",
      "...kbbbkkkkrrrk.",
      "...kbwbbkkkrwrk.",
      "...kbbbkbbkrrrk.",
      "....kkkbbbbkkk..",
      "......kbwbbk....",
      "......kbbbbk....",
      ".......kkkk.....",
      "................",
      "................",
      "................",
    ],
  },
  "forage:herb": {
    palette: { k: "#203421", g: "#6fae52", h: "#4b8a3a", f: "#f5f1e0", t: "#b98a5a" },
    rows: [
      "......f....f....",
      ".....fkf..fkf...",
      "..f...k.k..k....",
      ".fkf.kgk.kgk.f..",
      "..k.kghgkkghkfkf",
      ".kgkkgggk.kgk.k.",
      "kghgk.kgk..k.kgk",
      ".kgk..kgk...kghk",
      "..kk...k...kgk..",
      "...kk..k..kk....",
      ".....kkkkk......",
      "......ktk.......",
      ".....kttk.......",
      "......kk........",
      "................",
      "................",
    ],
  },
};
export const hasPixelIcon = (id: string) => id in SPRITES;
export function PixelIcon({ id, size, name, grilled }: { id: string; size: number; name: string; grilled?: boolean }) {
  const sprite = SPRITES[id];
  return (
    <svg
      className="item-icon pixel-icon"
      role="img"
      aria-label={name}
      width={size}
      height={size}
      viewBox="0 0 16 16"
      shapeRendering="crispEdges"
      style={{ filter: grilled ? "sepia(.8) saturate(1.8) brightness(.8)" : undefined }}
    >
      {sprite.rows.flatMap((row, y) =>
        [...row].map((c, x) => (c === "." ? null : <rect key={x + "-" + y} x={x} y={y} width={1} height={1} fill={sprite.palette[c]} />)),
      )}
    </svg>
  );
}
