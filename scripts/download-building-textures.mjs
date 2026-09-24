import fs from "node:fs/promises";
import { createHash } from "node:crypto";
await fs.mkdir("public/textures/buildings", { recursive: true });
for (const [alias, id] of [
  ["plaster", "painted_plaster_wall"],
  ["roof", "roof_tiles"],
  ["masonry", "mossy_stone_wall"],
]) {
  const data = JSON.parse(
    await fs.readFile("/private/tmp/flower-" + alias + ".json", "utf8"),
  );
  for (const [key, suffix] of [
    ["Diffuse", "color"],
    ["nor_gl", "normal"],
    ["Rough", "roughness"],
  ]) {
    const file = data[key]?.["1k"]?.jpg;
    if (!file) throw Error("Missing map " + alias + key);
    const response = await fetch(file.url);
    if (!response.ok) throw Error(response.status + " " + file.url);
    const bytes = Buffer.from(await response.arrayBuffer());
    if (createHash("md5").update(bytes).digest("hex") !== file.md5)
      throw Error("Checksum mismatch");
    await fs.writeFile(
      "public/textures/buildings/" + alias + "-" + suffix + ".jpg",
      bytes,
    );
    console.log(alias, suffix, bytes.length);
  }
}
