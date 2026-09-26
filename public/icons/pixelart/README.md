# Flower Valley pixel-art item pack

Three transparent RGBA PNG sprite sheets, generated with the built-in image_gen tool and already used by the game. Each image is 1536 × 1024, laid out as 3 columns × 2 rows of 512 × 512 cells. Read left to right, top to bottom. The sixth cell is intentionally empty: exactly five items per image.

- `flowers.png`: Daisy, Tulip, Sunflower, Rose, Lavender.
- `seeds.png`: Daisy seeds, Tulip seeds, Sunflower seeds, Rose seeds, Lavender seeds.
- `fish-and-tools.png`: Carp, Goldfish, Rare Fish, bouquet, watering can.

Use `atlas.json` for exact frame coordinates. Preserve the alpha channel. No prices or labels are baked into the images, so UI text remains readable and prices stay linked to game rules. `src/components/ItemIcon.tsx` uses CSS background positioning to display an individual cell without making another image file.

Original economy is unchanged: seed prices 10/15/25/40/60; flower sale prices 25/30/50/80/120; fish sale prices 40/60/150. The full generation prompts are saved in `prompts.json`.
