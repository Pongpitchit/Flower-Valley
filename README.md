# 🌷 Flower Valley

An interactive A-Frame world with React + TypeScript UI, based on `workflow.md`. Desktop keyboard/mouse and touch controls are implemented. Single-player progress is stored in this browser's localStorage.

## Run

Node.js 20.19+ or 22.12+ recommended (built here with Node 24).

```sh
npm install
npm run dev
```

Open the localhost address printed by Vite. To play on an iPad/phone on the same Wi-Fi, use the Network address printed by Vite. Internet is needed for installing packages and optional UI fonts; all game models and material textures are included locally. This task has not published the game to a public server.

```sh
npm test
npm run build
npm run preview
```

## Controls

- WASD: walk. Shift + movement: run, costing one energy per active second.
- Click the world: capture the mouse. If pointer lock is unavailable, drag to look.
- E: interact with a nearby object/NPC. I: inventory. M: map. B: flower encyclopedia.
- Escape: close a panel / pause / release mouse. Settings include quality and touch-control toggles.
- Phone/iPad: left joystick to walk, drag on the world to look, E touch button to interact.
- Fishing: press the shown A/D sequence, or tap the corresponding buttons, within 14 seconds. A wrong input or timeout lets the fish escape; casting still costs energy.

## Game systems

Start with 500 coins, 100 energy and 12 empty plots. Buy seeds from Lily to the west, enter the garden from the south, plant and water. Watered crops grow once at the next day transition. Rain automatically waters planted crops; mature flowers stay ready until harvested. Flower prices and growth times follow the workflow.

Sell flowers to Mae, fish to Finn, and bouquets to Mae or the daily customer. A bouquet consumes exactly three flowers and sells for their combined value × 1.25 (rounded). A matching daily customer order adds 50 coins. Orders renew every morning.

The clock advances two game minutes per real second while exploring and pauses in menus/activities. Shops open 07:00–20:00. NPCs walk into/out of their work locations at opening/closing time. At midnight a dark transition takes the player to the next morning at 06:00 beside the bed, with 60% of maximum energy. Normal sleep at the bed after 20:00 restores full energy and uses the same transition. The bed offers a clearly labeled rest-until-evening action. Each new day rolls 30% rain. Resting on the log restores up to 20 energy and consumes 30 game minutes. Sitting down or standing up alone does not change time or energy. Resting across midnight triggers the same forced-sleep penalty.

Theo, the builder beside the cottage, sells an eight-plot expansion (400 coins), three energy upgrades (+20 each, 300/600/900 coins), and six decorative flower pots (100 each). Heavy activities are blocked when energy is insufficient.

## Workshop — simplified after user feedback

- **Painting:** draw on a canvas with a brush, pick colors, name and save the image.
- **Paint a model:** choose a pictured cat, dog, rabbit, tortoise or guinea pig. Pick a color and tap the model or a named color region. Drag to orbit. Undo, restore original colors, rotate and zoom are available. There are no position/rotation/scale sliders to build an animal from scratch.
- Saving artwork costs 15 energy. Painted animal models sell for 140 coins. The gallery shows a thumbnail and the actual colored model appears inside the atelier.
- Previously saved primitive sculptures remain loadable, visible and sellable. The older sculpture editor is replaced by the simpler model-painting workflow.

## Visuals and assets

The cottage and atelier have modeled window/door openings, timber frames, plank floors, stone foundations, pitched tiled roofs and PBR plaster/roof/stone materials. The rest seat is a downloaded Three Logs model from CGTrader. The nearby Campfire model is used for grilling fish. Sky uses an HDRI; foliage and wildflower meadows are instanced and sway in the breeze. Butterflies, birds, nighttime fireflies and chimney smoke animate the village. NPCs blink, breathe, turn smoothly and show a short greeting when approached. High quality enables shadows; low quality reduces resolution and disables shadows. See `ASSET_CREDITS.md` for exact sources/licenses.

The world combines detailed PBR surfaces with downloaded stylized NPCs, vegetation and terrain. It is not a photorealistic scanned environment. Physical iPad/Safari performance still needs device testing.

## Code map

- `src/game/engine.ts`: validated state, all resource-changing actions, day transitions and save/load.
- `src/game/data.ts`: flowers, fish, map zones and plot positions.
- `src/game/models.ts`: paintable-model catalog and saved-color validation.
- `src/world/scene.ts`: A-Frame component, lighting, weather, movement, interactions and world rendering.
- `src/world/buildings.ts`: cottage/atelier geometry, materials and collisions.
- `src/world/paintModels.ts`: cached glTF loading, normalization and per-region colors.
- `src/components/ModelPainting.tsx`: easy animal-painting UI and raycast painting.
- `src/components/Workshop.tsx`: 2D canvas painting.
- `src/components/Fishing.tsx`: fishing state machine and timed A/D input.
- `src/qa.tsx`: development-only landmark controls (`?qa`), isolated from the player's normal save. Not included in production.

## Verification and limits

See `PROGRESS.md`. Automated tests cover the economy/farming/time/energy/progression/save/model-painting rules. Browser checks cover the main gameplay loop, fishing, art creation and responsive layouts. No physical mobile device or VR headset has been tested. VR is not part of this implementation.

A-Frame 1.7.1's transitive development/color-palette chain still reports four moderate npm audit entries (`got` via `nice-color-palettes` / `three-bmfont-text`); the audited issue is a Node network utility, not gameplay input. No forced downgrade to obsolete A-Frame was applied. Vitest was upgraded to the patched 4.1.11 release.

## Pixel-art inventory assets

Fifteen icons across three transparent PNG atlases (five items each), used in shops, inventory, bouquet selection, planting, encyclopedia and fishing. See `public/icons/pixelart/README.md`, `atlas.json` and `prompts.json`.

## Requested NPC model pack

Maniacie’s “NPC for male and female” from the user-selected CGTrader link is downloaded and integrated. Lily uses G3, Mae G2, Emma G1, Finn B3, Oliver B2, and Theo the builder B1. Original static FBX meshes and PNG textures were converted to GLB with a small procedural rig. Arms stay in a relaxed fixed pose; subtle head movement, breathing and turning remain. No source animation is claimed. See ASSET_CREDITS.md.

## Campfire and NPC services

Approach Oliver at the atelier and choose “ขายผลงานให้โอลิเวอร์” to sell art. Theo at (7, 8) handles the existing house/garden upgrades instead of the old box. Both follow shop hours (07:00–20:00).

At the campfire (7, -12), grilling one raw fish costs 5 energy and 10 game minutes. The short progress animation can be cancelled by closing the dialog, with no resources spent. Cooked fish are separate persistent inventory items sold to Finn for 60 / 90 / 225 coins (50% more); raw fish still sell for 40 / 60 / 150. Cooking is unavailable when it cannot finish before midnight.

The downloaded log at (7, -9.4) replaces the bench and uses the existing rest rules: +20 energy in 30 minutes, with no forced return home before midnight.

The fishing pier has a clear rock-free approach. The rest log faces the campfire. Finn's stand displays three trays of fish on ice instead of flowers.
