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
| Painted Wooden Bench | Downloaded glTF model with color, normal and packed material maps, 1K | https://polyhaven.com/a/painted_wooden_bench |
| Flower Gazania | Downloaded glTF model along the main path, 1K maps | https://polyhaven.com/a/flower_gazania |
| Kloofendal 48d Partly Cloudy Puresky | HDRI sky and image-based lighting, 1K | https://polyhaven.com/a/kloofendal_48d_partly_cloudy_puresky |

Downloads made through the official Poly Haven API. Material/model download scripts validate supplied MD5 checksums. The cottage and workshop architecture are original procedural geometry with downloaded PBR materials; they are not downloaded complete building models.

## 3DAssets.dev — CC0 1.0 Universal

Pack: https://3dassets.dev/packs/companion-animals-and-pet-home

License: https://creativecommons.org/publicdomain/zero/1.0/

The pack publisher marks these assets as AI generated. Included models and their real model preview images: sitting ginger cat, sitting retriever, sitting rabbit, tortoise, guinea pig. These are static stylized models used as paintable figurines, not realistic animated animals. Exact individual source URLs and license metadata are in `public/models/painting/SOURCES.json`.

## Original work and dependencies

Original: scene layout, building geometry, procedural trees/flowers/NPCs/props, game rules, Thai UI, painting tools and synthesized ambient audio. A-Frame's underlying Three.js geometry is used inside an A-Frame component for batching and instancing.

A-Frame / Three.js, React, Vite, Lucide icons and other packages retain their respective open-source licenses in `node_modules`. UI fonts (DM Sans and Noto Sans Thai) are loaded from Google Fonts with system-font fallbacks; the game remains functional if those optional font requests fail.

## Generated pixel-art inventory images

`public/icons/pixelart/{flowers,seeds,fish-and-tools}.png` were generated for this project using the built-in image_gen tool. Fifteen icons total, five per image, with alpha transparency. Original prompts are in `public/icons/pixelart/prompts.json`; sprite coordinates are in `atlas.json`. These generated images are separate from the Poly Haven and 3DAssets.dev assets above.

The user-requested CGTrader NPC pack has **not** been downloaded or integrated: the download requires account login. Its license is not CC0 and no license claim is made for unavailable files.
