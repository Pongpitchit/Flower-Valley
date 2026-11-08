# Flower Valley asset credits

All downloaded assets are included locally under `public/`. No asset account, remote runtime download, or paid asset is required to play.

## Poly Haven — CC0

License: https://polyhaven.com/license

| Asset | Use | Source |
| --- | --- | --- |
| Aerial Grass Rock (Rob Tuytel) | Ground color and normal maps, 1K | https://polyhaven.com/a/aerial_grass_rock |
| Forest Ground 01 (Rob Tuytel) | Garden soil and footpaths, 1K | https://polyhaven.com/a/forrest_ground_01 |
| Wood Planks Grey | Timber and floorboards, 1K | https://polyhaven.com/a/wood_planks_grey |
| Rock 01 | Lake rocks, 1K | https://polyhaven.com/a/rock_01 |
| Painted Plaster Wall (Amal Kumar) | Cottage and atelier plaster: color, normal, roughness, 1K | https://polyhaven.com/a/painted_plaster_wall |
| Roof Tiles (Stephan Seeliger) | Cottage and atelier roofs: color, normal, roughness, 1K | https://polyhaven.com/a/roof_tiles |
| Mossy Stone Wall | Foundations and sills: color, normal, roughness, 1K | https://polyhaven.com/a/mossy_stone_wall |
| Flower Gazania | Downloaded glTF model along the main path, 1K maps | https://polyhaven.com/a/flower_gazania |
| Kloofendal 48d Partly Cloudy Puresky | HDRI sky and image-based lighting, 1K | https://polyhaven.com/a/kloofendal_48d_partly_cloudy_puresky |

Downloads made through the official Poly Haven API. The original imports were checked against the supplied MD5 checksums. One-time import scripts have since been removed. The cottage and workshop architecture are original procedural geometry with downloaded PBR materials; they are not downloaded complete building models.

## 3DAssets.dev — CC0 1.0 Universal

Pack: https://3dassets.dev/packs/companion-animals-and-pet-home

License: https://creativecommons.org/publicdomain/zero/1.0/

The pack publisher marks these assets as AI generated. Included models and their real model preview images: sitting ginger cat, sitting retriever, sitting rabbit, tortoise, guinea pig. These are static stylized models used as paintable figurines, not realistic animated animals. Exact individual source URLs and license metadata are in `public/models/painting/SOURCES.json`.

## Original work and dependencies

Original: scene layout, building geometry, procedural trees/flowers/fallback NPCs/props, game rules, Thai UI, painting tools and synthesized ambient audio. A-Frame's underlying Three.js geometry is used inside an A-Frame component for batching and instancing.

A-Frame / Three.js, React, Vite, Lucide icons and other packages retain their respective open-source licenses in `node_modules`. UI fonts (DM Sans and Noto Sans Thai) are loaded from Google Fonts with system-font fallbacks; the game remains functional if those optional font requests fail.

## Generated pixel-art inventory images

`public/icons/pixelart/{flowers,seeds,fish-and-tools}.png` were generated for this project using the built-in image_gen tool. Fifteen icons total, five per image, with alpha transparency. Original prompts are in `public/icons/pixelart/prompts.json`; sprite coordinates are in `atlas.json`. These generated images are separate from the Poly Haven and 3DAssets.dev assets above.

## CGTrader models selected by the user

These assets are separate from the CC0 assets above. Original archives were downloaded using the signed-in CGTrader account, then converted locally. The NPC and Three Logs listings display “Royalty Free License (no AI)”. Retain the source license terms; these files are not relicensed as CC0.

| Asset | Author | Source | Local use |
| --- | --- | --- | --- |
| NPC for male and female | Maniacie | https://www.cgtrader.com/free-3d-models/character/fantasy-character/npc-for-male-and-female | Six NPCs in public/models/npc |
| three logs | maranovskijsolomon6 | https://www.cgtrader.com/free-3d-models/plant/other/three-logs | public/models/logs; log2 is the rest seat |
| Campfire | Zelad | https://www.cgtrader.com/items/2765262/download-page | public/models/campfire; original geometry, color map and flame atlas |

NPCs were converted locally from the source FBX files. Original files contain static meshes, without a skeleton; the game adds a gentle procedural rig. Arms remain stationary per the user’s request. G3=Lily, G2=Mae, G1=Emma, B3=Finn, B2=Oliver, B1=Theo.

Props were converted locally from the source FBX files. Logs are rotated horizontally, centered and scaled to 2.7 m long. The campfire is 1.8 m wide. Textures are resized to at most 1024 pixels for the game. Flame animation is added by the game using the author's atlas, not the original FBX animation. Only runtime-ready assets are retained in this project. One-time scripts, extracted source archives, the unused bench and unused log variants were removed during cleanup. Original downloaded ZIPs remain in the user's Downloads folder.


## Forest trees — added 2026-09-28

- User-selected [Low-Poly Forest Nature Set Free Trial](https://www.cgtrader.com/free-3d-models/exterior/landscape/low-poly-forest-nature-set-free-trial) by [flamazilla](https://www.cgtrader.com/designers/flamazilla).
- CGTrader Royalty Free License (listing marked No AI); not CC0. Use within the game, do not redistribute the source pack as a standalone asset library.
- Downloaded `forest_nature_set_separate_objects_fbx.zip` and `forest_nature_set_textures.zip` through the signed-in download page.
- Only `Tree_average_lush`, `Tree_average_regular`, and `Tree_Spruce_small_01` are shipped, converted to normalized GLB with the original `texture_gradient.png` palette. Runtime files: `public/models/forest/{oak-lush,oak,spruce}.glb` and `palette.png`.
- Meshes retain the supplied geometry and texture colors, rendered as instanced trees with a subtle vertex-shader breeze. Raw sources/conversion scripts stay outside the project.

## Game audio — added 2026-09-28

Original procedural Web Audio score, ambient wind/bird tones and activity cues in `src/game/audio.ts`. No external music recordings used.


## Kenney Fantasy Town Kit — added 2026-09-29

- Source: https://kenney.nl/assets/fantasy-town-kit (version 2.0), CC0. Downloaded free directly from Kenney.
- Selected only `lantern.glb`, `cart.glb`, `fountain-round.glb`, their shared `Textures/colormap.png`, and `LICENSE.txt`, in `public/models/village/`.
- Runtime changes: scale/orientation; lantern material tint to match village ironwork; fountain-water material; warm point lights. No paid models or textures added.
- Rowan reuses the previously downloaded Maniacie B2 NPC with an outfit tint; the original CGTrader terms still apply.

## Free options for later visual upgrades

- [Kenney Fantasy Town Kit](https://kenney.nl/assets/fantasy-town-kit): CC0 village buildings, stalls, lantern and fountain parts; selected props already integrated.
- [Kenney Nature Kit](https://kenney.nl/assets/nature-kit): CC0 rocks, foliage and trees; an alternative consistent low-poly environment pack.
- [Rocky Terrain / Poly Haven](https://polyhaven.com/a/rocky_terrain): CC0 rocky ground texture by Amal Kumar; suitable as a future distant-hill surface. Recommended, not downloaded or applied in this revision.

## Additional inventory art — 2026-09-29

Generated with built-in image_gen. Original generated alpha preserved; CSS selects fixed atlas cells without modifying the images. `garden-expansion.png`, `lake-expansion.png`, `seeds-and-rods.png`; prompt records in `public/icons/pixelart/expansion-prompts.json` and frame definitions in `atlas.json`.

### Food and species revision
- `public/icons/pixelart/food.png`: generated with built-in imagegen; exact prompt in `food-prompts.json`, atlas coordinates in `atlas.json`. No purchased stock assets.
- Goldfish, koi and catfish meshes and revised rose petals are original project geometry. Remaining fish use existing Quaternius CC0 Fish1.
- Botanical visual references only (not bundled): https://www.rhs.org.uk/plants/30717/cosmos-bipinnatus/details/ and https://plants.ces.ncsu.edu/plants/cosmos-bipinnatus/. Non-rose redraw was subsequently reverted at user request.

- `public/icons/pixelart/fish-species.png`: original builtin imagegen pixel-art atlas; five species, catfish excluded. Exact prompt in `fish-species-prompt.json`. Side-yard furniture is original procedural geometry using existing project wood materials; no paid assets.

## New scenes: Breezy Beach, Deep Woods, Skyhill Lookout (2026-10-25)

| Asset | Use | Source / license |
| --- | --- | --- |
| Coast Sand 01 (Poly Haven) | Beach sand color + OpenGL normal, 1K → `public/textures/scenes/sand-*.jpg` | https://polyhaven.com/a/coast_sand_01 — CC0 |
| Forest Leaves 02 (Poly Haven) | Deep Woods floor color + OpenGL normal, 1K → `public/textures/scenes/forest-floor-*.jpg` | https://polyhaven.com/a/forest_leaves_02 — CC0 |
| Kenney Nature Kit 2.1 | Woods trees, bushes, ferns, grass, flowers, mushrooms, stumps, logs, rocks, tent, fire ring, canoe; beach palms → `public/models/woods/`, `public/models/beach/tree_palm*.glb` | https://kenney.nl/assets/nature-kit — CC0 (license copied beside the models) |
| Kenney Pirate Kit 2.1 | Rowing boats, distant ship, barrel, crate, chest, sand rocks → `public/models/beach/` (+ `Textures/colormap.png`) | https://kenney.nl/assets/pirate-kit — CC0 (license copied beside the models) |

Kenney foliage/bark colours are re-tinted at load time to match the valley palette. The sea, waves, foam, pier, lighthouse, umbrellas, sandcastle, shells, gulls, leaping fish, brook, bridge, light shafts, mist, fireflies, forage spot props, hill, deck, telescope, benches, flag, kite and scene gates are original procedural geometry. Sea-fish and forage icons are original 16×16 pixel art drawn in code (`src/components/PixelIcon.tsx`). No paid assets.

## Pixel-art effects: pixelfx (2026-11-08)

| Asset | Use | Source / license |
| --- | --- | --- |
| pixelfx 0.3.0 by Patch (adapting Hugo Duprez's Sprite Fusion VFX) | Rain, fireflies, shooting stars, clouds, aurora, falling leaves, bird, butterfly, snake, slime, campfire, fish school, jellyfish, waterfall, rain splash, bubbles; drawn live into canvas textures | https://github.com/patch-gg/pixelfx — MIT (code, no images). Trimmed copy with its `LICENSE` and `NOTICE.md` in `src/vendor/pixelfx/` |

The copy keeps all of `core/` and only the effects used. Lines marked "Flower Valley" add a `bare: true` option that skips an effect's painted backdrop (haze, ground, grass, sky, moon, puddle, water body) so it can sit over the 3D world. Colour variants are palette options passed to the effects. The patched library's Patch Pixel font is not included.
