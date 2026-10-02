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

- WASD: walk. Shift + movement: run without spending energy, including at zero energy.
- Click the world: capture the mouse. If pointer lock is unavailable, drag to look.
- E: interact with a nearby object/NPC; on plots, open the original seed-selection/crop panel. Choose a seed and explicitly press Plant. Space waters the targeted plot (also works inside its panel); Q opens plot details. I: inventory. M: map. B: flower encyclopedia.
- Escape: close a panel / pause / release mouse. Settings include quality and touch-control toggles.
- Phone/iPad: left joystick to walk, drag on the world to look, E touch button to interact.
- Fishing: Space casts/recasts; press the shown A/D sequence, or tap the corresponding buttons, within 14 seconds. A wrong input or timeout lets the fish escape; casting still costs energy.

## Game systems

Start with 500 coins, 100 energy and 3 empty plots. Buy seeds from Lily to the west, enter the garden from the south, plant and water. Watered crops grow once at the next day transition. Rain automatically waters planted crops; mature flowers stay ready until harvested. Growth takes 2/2/3/4/5 watered nights; flower sale values are 35/50/85/135/210 coins (seeds remain 10/15/25/40/60). Plots keep their original wooden borders and natural wet/dry soil; floating status labels were removed. Cosmos (20 seed / 75 sale / 3 days) and hydrangea (90 / 320 / 6 days) join the original five flowers.

Sell flowers to Mae, fish to Finn, and bouquets to Mae or the daily customer. A bouquet consumes exactly three flowers and sells for their combined value × 1.25 (rounded). A matching daily customer order adds 50 coins. Orders renew every morning.

The clock advances two game minutes per real second while exploring and pauses in menus/activities. Shops open 07:00–20:00. NPCs walk into/out of their work locations at opening/closing time. At midnight a dark transition takes the player to the next morning at 06:00 beside the bed, with 60% of maximum energy. Normal sleep at the bed after 20:00 restores full energy and uses the same transition. The bed offers a clearly labeled rest-until-evening action. Each new day rolls 30% rain. Resting on the log restores up to 20 energy and consumes 30 game minutes. Sitting down or standing up alone does not change time or energy. Resting across midnight triggers the same forced-sleep penalty.

Theo, the builder beside the cottage, expands the garden through 3 → 6 → 9 → 12 → 16 → 20 plots (120/220/360/600/900 coins), sells watering-can upgrades (250/650 coins; water up to 3/4 plots to the right in one row for 3 energy), three energy upgrades (+20 each, 300/600/900 coins), and six decorative flower pots (100 each). Heavy activities are blocked when energy is insufficient.

## Workshop — simplified after user feedback

- **Painting:** draw on a canvas with a brush, pick colors, name and save the image.
- **Paint a model:** choose a pictured cat, dog, rabbit, tortoise or guinea pig. Pick a color and tap the model or a named color region. Drag to orbit. Undo, restore original colors, rotate and zoom are available. There are no position/rotation/scale sliders to build an animal from scratch.
- Saving artwork costs 15 energy. Paintings sell for 80 coins and painted animal models for 110. A daily mood roll allows one artwork sale (60%) or two (40%), shared between paintings and models. Creating artwork does not consume the daily allowance; only successful sales do. The studio stores up to 24 unsold works. Mood/quota persist across reloads and reset on the next day. The gallery shows a thumbnail and the actual colored model appears inside the atelier.
- Previously saved primitive sculptures remain loadable, visible and sellable. The older sculpture editor is replaced by the simpler model-painting workflow.

## Visuals and assets

The cottage and atelier have modeled window/door openings, timber frames, plank floors, stone foundations, pitched tiled roofs and PBR plaster/roof/stone materials. The rest seat is a downloaded Three Logs model from CGTrader. The nearby Campfire model is used for grilling fish. Sky uses an HDRI; foliage and wildflower meadows are instanced and sway in the breeze. Butterflies, birds, nighttime fireflies and chimney smoke animate the village. NPCs blink, breathe, turn smoothly and show a short greeting when approached. High quality enables shadows; low quality reduces resolution and disables shadows. See `docs/ASSET_CREDITS.md` for exact sources/licenses.

Lily sells basic/good/premium fertilizer for 10/18/24 coins, advancing growth by 1/2/3 days, capped at maturity, once per planting. Shops offer sell-one or sell-all for each item. Bouquet previews show ingredients, remaining inventory and the extra sale value. Settings control synthesized original background music, effects/ambience and master volume; audio starts only after a user gesture and mutes when the tab is hidden.

The world combines detailed PBR surfaces with downloaded stylized NPCs, vegetation and terrain. It is not a photorealistic scanned environment. Physical iPad/Safari performance still needs device testing.

## Project structure

```text
src/
  components/    Game UI, fishing, grilling, painting and sleep
  game/          State, economy, catalogs, persistence and tests
  world/         A-Frame scene, movement, buildings, NPCs and nature
  dev/           Development-only QA controls (?qa)
  App.tsx        UI and interaction coordination
  main.tsx       Application entry
  styles.css     Game styles
public/
  models/        Only models and dependent textures used in the game
  textures/      Terrain, buildings and sky
  icons/         Pixel-art atlases with frame/provenance metadata
docs/
  ASSET_CREDITS.md   Asset sources and license information
  PROGRESS.md       Implementation and verification history
workflow.md      Original game specification
```

The QA controls use a separate save and are excluded from production. Tests remain next to the game rules in `src/game/engine.test.ts`. One-time download/conversion/inspection scripts and extracted source archives have been removed; the game loads its ready-to-use assets from `public/`. `dist/` and `node_modules/` are generated, ignored directories. The build checks for unused imports and parameters without creating TypeScript build-cache files in the root.

## Verification and limits

See `docs/PROGRESS.md`. Automated tests cover the economy/farming/time/energy/progression/save/model-painting rules. Browser checks cover the main gameplay loop, fishing, art creation and responsive layouts. No physical mobile device or VR headset has been tested. VR is not part of this implementation.

A-Frame 1.7.1's transitive development/color-palette chain still reports four moderate npm audit entries (`got` via `nice-color-palettes` / `three-bmfont-text`); the audited issue is a Node network utility, not gameplay input. No forced downgrade to obsolete A-Frame was applied. Vitest was upgraded to the patched 4.1.11 release.

## Pixel-art inventory assets

Fifteen icons across three transparent PNG atlases (five items each), used in shops, inventory, bouquet selection, planting, encyclopedia and fishing. See `public/icons/pixelart/README.md`, `atlas.json` and `prompts.json`.

## Requested NPC model pack

Maniacie’s “NPC for male and female” from the user-selected CGTrader link is downloaded and integrated. Lily uses G3, Mae G2, Emma G1, Finn B3, Oliver B2, and Theo the builder B1. Original static FBX meshes and PNG textures were converted to GLB with a small procedural rig. Arms stay in a relaxed fixed pose; subtle head movement, breathing and turning remain. No source animation is claimed. See docs/ASSET_CREDITS.md.

## Campfire and NPC services

Approach Oliver at the atelier and choose “ขายผลงานให้โอลิเวอร์” to sell art. Theo at (7, 8) handles the existing house/garden upgrades instead of the old box. Both follow shop hours (07:00–20:00).

At the campfire (7, -12), grilling one raw fish costs 5 energy and 10 game minutes. The short progress animation can be cancelled by closing the dialog, with no resources spent. Cooked fish are separate persistent inventory items sold to Finn for 60 / 90 / 225 coins (50% more); raw fish still sell for 40 / 60 / 150. Cooking is unavailable when it cannot finish before midnight.

The downloaded log at (7, -9.4) replaces the bench and uses the existing rest rules: +20 energy in 30 minutes, with no forced return home before midnight.

The fishing pier has a clear rock-free approach. The rest log faces the campfire. Finn's stand displays three trays of fish on ice instead of flowers.

## Save compatibility

Version-1 and version-2 saves migrate to version 3 under the same storage key. Existing 12/20-plot gardens, inventory, coins, art and historical bouquet sale values are retained. New games start with three plots. Named development fixtures (for example `?qa=farm-refresh`) have independent saves.

## Village revision (2026-09-29)

- Six fish: carp 40, goldfish 60, rare fish 150, trout 80, perch 30, catfish 55. All can be grilled for a rounded 50% premium. Catching may yield a tin can (3 coins) or old boot (5 coins), sold to Rowan at the western general-goods cart. Junk cannot be grilled and does not count as caught fish. Foraging collection is reserved for a later system.
- Finn sells two rod upgrades, costing 350 then 900. Rare-fish odds are 4% / 12% / 20%, junk odds stay at 10% for every rod (all fish together total 90%); remaining probability is distributed among five common fish. The fishing panel shows current odds and rod.
- Home pots are limited to six, grouped on the lawn beyond both sides of the front step, preserving the central doorway. Theo offers side-yard flower beds (200), a timber pergola (450), and a bench (800), purchased sequentially.
- All unsold artwork (up to 24) appears in distinct atelier gallery slots. Paintings face inward; small models sit on shelves. Selling removes the corresponding work. Workbench/easel and interaction/collision positions have been moved away from the display wall.
- Shops have different physical details: Lily's pitched potting-shed roof and seed shelf, Mae's striped flower canopy/trellis facing the village, Finn's blue ice counter/tackle, and Rowan's canvas cart and crates.
- Forest canopies use spacing checks. Distant hills start beyond the forest band so they do not intersect tree trunks. Warm Kenney lantern models and ceiling lights improve nighttime navigation. The western stone water basin and cart also use the free Kenney Fantasy Town Kit (CC0).
- Three additional transparent pixel-art atlases provide fifteen new icons: three fertilizers, two flowers, two seeds, three rods, three fish and two junk items. Exact prompts and frame coordinates are retained in `public/icons/pixelart/`.

Follow-up layout: the garden lantern is outside the west fence, clear of all twenty plots. Rowan’s cart is angled beside the relocated lantern, clear of the service point. Purchased home upgrades are entirely outside the house; pots are on the lawn beyond the porch.

### Home, backyard and ornamental pond

Talk to Theo to buy permanent house palettes (300 coins each, free switching after purchase), a ready-made backyard flower garden (650), or a side-yard pond (850). The original house palette remains free. The garden is decorative: no planting, watering or harvesting. Existing six front pots and side-yard upgrades remain available.

The pond holds up to six raw fish. Press E at its southern edge to transfer fish from inventory or return them one at a time. Fish remain saved and swim visibly in the pond; grilled fish and junk cannot be stocked. Saves migrate from versions 1–3 to version 4 without resetting progress.

Mountains and pond rocks use the locally downloaded 1K diffuse/OpenGL normal maps of **Rocky Terrain**, Amal Kumar / Poly Haven, CC0: https://polyhaven.com/a/rocky_terrain. Attribution and license are in `public/textures/landscape/LICENSE.txt`. No paid assets or new HDRI sky were added.

### Activity and visual fixes (2026-09-30)

Energy upgrades now reach 200 (five +20 levels). Watering upgrades cover the entire selected four-plot row, then two rows/eight plots; each use still costs 3 energy. Painting can save at zero energy, consuming up to 15 available energy; only daily artwork sales are limited. PNG export is available from the canvas and saved painting gallery. Canvas drafts persist locally between editor visits. Menus pause the world clock.

Shop notifications appear inside the active modal. Roses use layered petals, grass uses narrow curved blade clusters, and mountains have irregular ridges. Pond and lake fish face their direction of travel and use three downloaded Quaternius CC0 models: https://quaternius.com/packs/animatedfish.html. Original OBJ/MTL files and the license are in public/models/fish; runtime shader deformation supplies swimming movement.

### Balance revision (2026-10-02)
Each cast costs 10 energy and 15 game minutes, including failed minigames; casts that would reach midnight are rejected without charging. Grilled fish can be eaten from inventory or the campfire: perch +20, carp +25, goldfish/catfish +30, trout +35, rare koi +40. Full energy never consumes food; partial restoration is capped at maximum energy. Meals cost 35/50/65 coins for +20/+30/+40 energy. Fertilizer remains one bag per planting; higher tiers cost less per growth-day (10/9/8), with actual growth capped at maturity. Existing inventory and rod upgrades retain their benefits.
