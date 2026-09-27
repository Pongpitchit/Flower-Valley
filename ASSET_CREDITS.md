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
| Painted Wooden Bench | Earlier bench asset retained on disk; replaced in the world by Three Logs | https://polyhaven.com/a/painted_wooden_bench |
| Flower Gazania | Downloaded glTF model along the main path, 1K maps | https://polyhaven.com/a/flower_gazania |
| Kloofendal 48d Partly Cloudy Puresky | HDRI sky and image-based lighting, 1K | https://polyhaven.com/a/kloofendal_48d_partly_cloudy_puresky |

Downloads made through the official Poly Haven API. Material/model download scripts validate supplied MD5 checksums. The cottage and workshop architecture are original procedural geometry with downloaded PBR materials; they are not downloaded complete building models.

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

NPC conversion: scripts/prepare-npc.mjs. Original files contain static meshes, without a skeleton; the game adds a gentle procedural rig. Arms remain stationary per the user’s request. G3=Lily, G2=Mae, G1=Emma, B3=Finn, B2=Oliver, B1=Theo.

Prop conversion: scripts/prepare-props.mjs. Logs are rotated horizontally, centered and scaled to 2.7 m long. The campfire is 1.8 m wide. Textures are resized to at most 1024 pixels for the game. Flame animation is added by the game using the author's atlas, not the original FBX animation. Original archives are kept outside the public game assets in assets/props-source and assets/npc-source.
