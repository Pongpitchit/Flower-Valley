import fs from "node:fs/promises";
import path from "node:path";
import { createHash } from "node:crypto";
for (const [alias, id] of [
  ["bench", "painted_wooden_bench"],
  ["flower", "flower_gazania"],
]) {
  const info = JSON.parse(
    await fs.readFile("/private/tmp/flower-" + alias + ".json", "utf8"),
  ).gltf["1k"].gltf;
  const root = path.resolve("public/models", id);
  await fs.mkdir(root, { recursive: true });
  for (const [name, item] of [
    [id + ".gltf", info],
    ...Object.entries(info.include),
  ]) {
    const dest = path.join(root, name);
    await fs.mkdir(path.dirname(dest), { recursive: true });
    const response = await fetch(item.url);
    if (!response.ok) throw Error(response.status + " " + item.url);
    const data = Buffer.from(await response.arrayBuffer());
    if (createHash("md5").update(data).digest("hex") !== item.md5)
      throw Error("Checksum mismatch " + name);
    await fs.writeFile(dest, data);
    console.log(name, data.length);
  }
}
