// 16×16 pixel-art sprites for the sea fish and forage items, drawn as crisp SVG rects.
type Sprite = { palette: Record<string, string>; rows: string[] };

// Fish share one silhouette (tail left, head right); each species recolours and patterns it.
function fish(back: string, belly: string, pattern: (x: number, y: number) => string | null, tall = 0): Sprite {
  const rows: string[] = [];
  for (let y = 0; y < 16; y++) {
    let row = "";
    for (let x = 0; x < 16; x++) {
      const inBody = (px: number, py: number) => ((px - 8.6) / 5.9) ** 2 + ((py - 8) / (3.1 + tall)) ** 2 <= 1;
      const inTail = (px: number, py: number) => px >= 0.5 && px <= 3.2 && Math.abs(py - 8) <= (3.4 - px) * 1.15 + 0.6 && Math.abs(py - 8) >= 0.4 * (px - 0.5);
      const solid = (px: number, py: number) => inBody(px, py) || inTail(px, py);
      if (!solid(x, y)) {
        row += [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => solid(x + dx, y + dy)) ? "k" : ".";
        continue;
      }
      if (x === 12 && y === 7) row += "e";
      else row += pattern(x, y) ?? (inTail(x, y) && !inBody(x, y) ? "t" : y < 8 ? "b" : "s");
    }
    rows.push(row);
  }
  return { palette: { k: "#22303a", e: "#111111", b: back, s: belly, t: back, d: "#1f4a63", w: "#fbfbf6", y: "#f2c94c", o: "#ef7d2d" }, rows };
}
const SPRITES: Record<string, Sprite> = {
  mackerel: fish("#3f8aa6", "#d5e1e6", (x, y) => (y < 8 && y > 4 && (x + y * 2) % 3 === 0 && x > 3 ? "d" : null)),
  seabass: fish("#6d8070", "#e3e6dc", (x, y) => (y === 5 && x > 5 && x < 11 && x % 2 ? "k" : null), 0.4),
  clownfish: fish("#ef7d2d", "#f39a52", (x, y) => (x === 6 || x === 10 || x === 2 ? (y > 4 && y < 12 ? "w" : null) : null), 0.3),
  tuna: fish("#25476a", "#cfd8de", (x, y) => (y === 8 && x > 3 && x < 13 ? "y" : null), 0.7),
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
