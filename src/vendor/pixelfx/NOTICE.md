# Notices

**Hugo Duprez.** `src/core/sim.js` and the effects that say so at the top of their file adapt Sprite Fusion's
open-source pixel art VFX (https://www.spritefusion.com/pixel-art-vfx), Copyright (c) 2026 Hugo Duprez, MIT License.

**Hollow Crown.** `src/core/act.js` adapts how Hollow Crown plays its skills (poses on 12 fps steps, hit-stops, the springy
straw target), from
https://github.com/rehan-remade/hollow-crown, Copyright (c) 2026 rehan-remade, MIT License.

**Patch Pixel.** The font in `gallery/fonts` is Patch's own and is not covered by this repository's MIT license. See
`gallery/fonts/NOTICE.md`.

**Flower Valley.** This folder is a trimmed copy of pixelfx 0.3.0 (https://github.com/patch-gg/pixelfx, MIT, see
LICENSE): all of `core/` and only the effects the game uses. The weather effects, `water/rain-splash` and
`water/bubbles` take one extra option, `bare: true`, which skips their painted backdrop (haze, ground, grass, sky,
moon, puddle, water body) so they can sit on top of the 3D world. Lines marked "Flower Valley" are the only changes.
