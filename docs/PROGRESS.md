# Flower Valley — implementation and verification

Source specification: workflow.md. Latest user change (2026-09-25): replace manual primitive sculpting with pictured animal models for easy coloring; improve cottage, bench and workshop materials/models.

## Implemented, in priority order

1. React/TypeScript + A-Frame foundation; desktop/touch camera controls, movement and world/structure/lake collision boundaries.
2. Nearby E/touch interactions; seed purchase, planting, watering, multi-day growth, harvest, inventory, sales and energy.
3. Game clock, day/night lighting/stars, rainy days, automatic watering, rest, sleep, daily NPC schedule and local saves.
4. Fishing cast/wait/bite/A-D mini-game, catches and fish buyer.
5. Bouquets, daily customer requests, encyclopedia, farm/energy upgrades and decorations.
6. 2D canvas art, gallery/sales, and the revised five-animal model painting system with thumbnails, tap-to-paint, named regions, orbit, zoom, undo and original-color reset. Older primitive artwork remains compatible.
7. Downloaded PBR materials, HDRI sky, scanned bench/gazania models, detailed cottage/atelier geometry, synthesized ambient sound and graphics-quality controls.

## Automated verification

- 28 tests pass (`npm test`): all five flower lifecycles and prices; insufficient resources; invalid actions; drought/rain; maturity; rest time cost; normal sleep/full energy; forced midnight/60% energy; running; duplicate bouquet ingredients; orders/rewards; upgrade caps; three fish rarities; artwork creation/sales; save validation; movement boundaries; five animal model IDs and saved-color compatibility.
- Production TypeScript/Vite build passes. A-Frame's main rendering bundle is large (roughly 1.7 MB before gzip); models are cached locally and loaded as needed.

## Browser verification performed

- Seed purchase: 500 → 490 coins; planting/watering: 100 → 92 energy.
- Slept through two days; observed rain watering automatically and 1/2 then 2/2 flower growth; harvested a daisy.
- Completed a live seven-input A/D fishing sequence and received a carp.
- Created an old primitive sculpture, adjusted controls, saved it; drew a canvas image and saved/sold it.
- New model editor: all five model choices and image previews load; painted cat via region button and dog via a direct model click; saved colored cat, observed the thumbnail and 140-coin sale option in the gallery, and observed the colored model in the atelier.
- Reload retained saved day, inventory, energy, upgraded farm and old/new artwork.
- Visually inspected the new cottage facade, atelier interior, HDRI and scanned wooden bench.
- Inspected model-painting layout at a 390×844 viewport. Physical iPad/touch hardware and Safari performance are not yet verified.

## Remaining limitations

- Art style is a mix of PBR architecture/props and stylized NPCs, vegetation and animals. Not a fully photoreal environment.
- Full device performance profiling and physical mobile/VR testing were not performed; VR is outside current controls scope.
- No external deployment, backend, shared multiplayer state or cloud save was requested or configured.

## Home flower-arranging table (2026-09-25)

- Added a wooden arranging table beside the left window, with sample flowers, wrapping paper, ribbon and scissors. Includes collision bounds and a dedicated interaction target connected to the existing bouquet system. The central doorway-to-bed route stays clear.
- Browser verified the indoor table and its E prompt, opened the bouquet dialog and selected an inventory flower; unavailable flowers and incomplete bouquets remain disabled. Existing 25 rule tests pass.

## Living world, pixel art and sleep update (2026-09-26)

- Mirror Lake and The Garden now have solid wooden backing, two posts extending into the ground, caps and collision bounds. Both remain in their original positions.
- Generated three transparent 1536×1024 pixel-art sheets, five items each; saved exact prompts and a frame manifest. Integrated all five flowers, five seed packets, three fish, bouquets and watering cans into the existing item UI. Confirmed the user wants existing prices retained.
- Added instanced meadow flowers around the village, wind-driven grass/flowers/leaves, butterflies, birds, nighttime fireflies, smoke and animated fish. Quality mode lowers creature counts; reduced-motion preference stops ambient flight/wind animation.
- Improved procedural NPC facial details, blinking, breathing, smooth turning, greetings and waving; Emma wanders near her regular spot. The requested CGTrader pack was subsequently downloaded and integrated; see the NPC services update below.
- Rest now costs 30 in-game minutes for up to +20 energy and stays at the bench. Normal sleep restores full energy at 06:00. Reaching midnight, including during rest, forces sleep and restores only 60% of maximum energy. Full-screen dark transition covers the day change; waking occurs next to the bed.
- Fixed the solid terrain/bank underneath the lake that obscured fish. The lake now has a terrain opening, a lower bed, and translucent water with visibly distinct colored fish.
- Browser verified rest 06:24→06:54 and energy 60→80 without changing day or saved standing position. Observed forced-sleep dark screen, 06:00 wake-up and 60/100 energy. Observed normal-sleep transition. Inspected generated seed/fish icons in their real shops, meadow density, NPC faces and colored fish. No rendering errors observed after the animation changes.

## NPC services and campfire update (2026-09-28)

- Integrated all six original Maniacie NPC models with their matching textures. Removed procedural arm waving/swinging; retained subtle head movement, breathing and smooth turning.
- Oliver now buys art through his dialogue; removed the old gallery interaction table. Theo (B1) stands beside the cottage and handles upgrades, replacing the upgrade box.
- Downloaded the exact user-selected Three Logs and Campfire assets, converted FBX geometry to local GLB, matched original textures and placed them in the rest area. The log replaces the bench; the campfire has subtle alpha-textured flames and light.
- Grilling consumes one raw fish, 5 energy and 10 game minutes. Cooked fish save separately and sell for 60/90/225. Cancellation is free; invalid recipes, insufficient resources and cooking across midnight are rejected atomically.
- 33 tests pass. Browser verified cooking 14:56→15:06, energy 23→18, cooked carp +1; selling to Finn increased coins 650→710. Verified log rest energy 18→38, Theo’s upgrade dialogue, and Oliver’s art buyer menu. No browser rendering errors.

- Follow-up: removed shoreline rock intersecting the fishing pier, moved the rest log/interaction/collider/seated camera to (7, -9.4) facing the fire, and replaced fish-stall flower props with three fish trays on ice. Browser visually verified all three changes.

## Project cleanup (2026-09-28)

- Removed 86 unused files (90,390,010 bytes): seven one-time asset scripts, extracted FBX/Blender source copies and unused textures/previews, the replaced bench, unused log variants, NPC conversion debug report and TypeScript build cache.
- Preserved all runtime models, their referenced textures, item atlas metadata, asset provenance, game rules and backward-compatible save handling.
- Moved QA controls to src/dev/qa.tsx and project records to docs/. Updated imports and documentation.
- Removed the unused Playwright test dependency and its two dependent packages. Existing tests use Vitest; browser verification uses the app browser.
- Enabled TypeScript unused-import/parameter checks. Build now uses tsc --noEmit to avoid root-level cache output.

## Gameplay and village revision (2026-09-29)

- Added daily mood-based art quotas, a three-plot starting garden with expansion upgrades, watering upgrades, three fertilizer grades, additional flowers/fish, fishing rods, junk catches and Rowan's buying service. Shops sell one item or all of that type; E opens seed selection and Space waters. Removed floating plot status labels.
- Added transparent pixel-art expansion atlases, distinct shop displays, free Kenney village props, nighttime lighting and an atelier display for unsold art. Asset provenance and generation prompts are stored with the assets.
- Follow-up catch balance: fish total 90%, junk 10%, with no empty outcome. Rare fish remain 4% / 8% / 14% of all successful catches according to rod level, included within the 90% fish total.
- Moved the garden lantern outside the western fence, clear of all 20 plots. Angled Rowan's cart beside its lantern and adjusted its collision bounds and QA approach point.
- Moved all six purchased pots onto the front lawn, leaving the central entrance clear. House upgrades now add outdoor flower boxes, a side-yard pergola and a bench; excluded trees from this side yard.
- Browser verified the fully upgraded side yard, clear cottage entrance with six pots, and accessible Rowan interaction after moving the cart. The complete garden/nighttime layout was not visually rechecked in this follow-up. Earlier checks covered seed selection, Space watering, rod purchases and junk sales.
- Validation: 48 rule tests pass, including deterministic catch distributions for all three rods. Production build passes with the existing large-bundle warning.

## House palettes, backyard and pond (2026-09-29)

- Added four house color palettes; the three optional palettes cost 300 once and can then be switched freely. Materials are isolated to the player's house, including roof caps and gables.
- Added a 650-coin ornamental backyard with 48 flowers and a central walk. It has no farming/harvesting interaction. Added an 850-coin stone-edged pond beside the house, clear of the pergola and entrance.
- Pond stores six raw fish, with animated species colors and one-at-a-time inventory transfers through Theo or the pond's E interaction. Junk/cooked fish, over-capacity transfers and missing inventory are rejected atomically.
- Downloaded and applied Poly Haven Rocky Terrain CC0 1K diffuse/normal maps to the existing mountain geometry and custom pond rocks. Cleared random grass/flowers from the pond footprint and ornamental beds.
- Save version 4 migrates versions 1–3 and validates purchased palettes, garden/pond flags and fish contents. Added four rule tests; all 52 pass.
- Browser verified purchases (5000→3200), sage house/back garden appearance, textured hills, clear pond surface, swimming carp, direct pond E menu, fish transfer (inventory 3→2→3) and persistence through development reloads. Production build passes; existing large-bundle warning remains.

## Activity and visual fixes (2026-09-30)

- Removed sprint energy drain and the zero-energy speed restriction. Raised energy upgrades/validation/UI to five levels and 200 maximum energy.
- Watering upgrades now cover four plots in the selected row, then eight across two rows, including when targeting a middle plot. Updated rule tests.
- Painting saves at zero energy without going negative; daily quota remains enforced. Added PNG export in editor/gallery and local canvas draft recovery. Browser verified close/reopen draft recovery, export button execution and saving with energy 0 (artworks 0→1, quota 1→0).
- Moved action notices into a sticky region inside open modals; success text remains in front of the shop/editor.
- Downloaded three Quaternius CC0 fish OBJ/MTL models and license. Added normalized forward orientation and swimming deformation; corrected pond/lake tangent headings. Browser visually verified the imported pond fish with head facing its path and no console errors.
- Rebuilt rose heads as layered petals, grass as seven curved narrow blades per tuft, and distant mountains with irregular ridges using existing free terrain maps. Browser visually inspected the revised landscape.
- Validation: 55 tests pass; production build passes with the existing bundle-size warning. No paid assets added.

## Food shop and species revision (2026-09-30)

- Added Nora’s Kitchen with three inventory foods: bread +20/35 coins, soup +30/55, omurice +40/75. Eating caps at maximum energy and cannot consume food at full energy. Generated transparent pixel art atlas and recorded its prompt.
- Compact two-column upgrade cards with spaced buttons and clearer disabled states. Moved path lamps to verges and added pole collision.
- Original species geometry for orange fancy goldfish, white/red koi (rare), and dark whiskered catfish; other fish retain the existing free CC0 mesh.
- Per latest user correction, restored all non-rose flower geometry from 52083a3. Only roses retain the new overlapping rounded petals.
- Verified food purchase/eating in browser (500→465 coins, energy 0→20, bread 1→0), food icons, fish display and upgrade layout. 59 tests passed; production build passed (existing bundle-size warning).
