# The engine under the roommates

The project has no production dependencies. TypeScript, its runner, Node types, and an XML parser used in tests are development tools. Generation targets Node 22 or newer; playback is a standalone SVG image.

## Boundaries

```text
profile.config.ts + characters/index.ts + props/index.ts
                          ↓
                  validateProfile()
                          ↓
           flatten() → compileTimeline()
                          ↓
              renderSprite() + renderScene()
                          ↓
          animated / still × dark / light SVG
```

`src/types.ts` defines generic characters, props, instances, animation trees, and compiled tracks. Characters expose dimensions, palette, sprites, animation presets, and a default frame. Props use the same visual contract. Neither has species-specific renderer fields.

The asset registry is explicit. Adding an asset requires an import and registry entry; no directory scanning, plugin loader, or renderer edits. A definition can have one frame and no animations.

`src/validation.ts` checks configuration, appearance roles, colors, sprite dimensions/symbols, motion paths, frame references, timing, and collisions between channels. It bounds actor count, sprite dimensions, animation depth, and expanded clips. Malformed authored data should fail before output is written.

`src/timeline.ts` flattens sequences and parallel groups into timestamped clips and merges each actor's clips into one track per channel. Finite repetitions are expanded at generation time. Empty portions hold the last value. All tracks have the scene's duration and begin at zero; delays do not create independent clocks that drift between loops.

`src/sprites.ts` merges instance colors without mutating definitions and combines adjacent same-color horizontal cells. `src/renderer.ts` stores referenced frames in SVG definitions and displays them with local `<use>` elements. It writes discrete opacity tracks for frame swapping and nested groups for transforms, avoiding SMIL transform replacement conflicts. Actor position and static sprite scale are separate from canvas-space movement.

`src/scene.ts` provides static theme-driven scenery. It can evolve independently of character and animation logic. For the default typography, a canvas around 900 pixels wide is recommended; custom narrow scenes may need simpler scenery.

`src/generator.ts` renders all four variants before writing. Output is deterministic: no random seed, date, remote request, browser render, or JavaScript timer affects generated files. A one-megabyte output cap catches oversized scenes.

## Image-mode playback

The final SVG contains `<animate>`, `<animateTransform>`, and `<animateMotion>`, plus local sprite references. It has a responsive `viewBox`, title, description, system fonts, and no scripts, remote assets, or `foreignObject`. GitHub serves it as a README image; the browser interprets the SVG's animation declaratively.

GitHub's image proxy may cache an older revision. Raw file URLs are appropriate for embedding; changing a query-string version or using a commit SHA can refresh/pin the displayed image. GitHub page markup is not the SVG runtime, so testing only the local inline preview is insufficient: verify the generated SVG through an `<img>` too.

The interactive preview's JavaScript is local development tooling. It never becomes part of `dist/`. It honors reduced motion by starting paused; still SVGs provide a dependable embedding option because reduced-motion behavior inside GitHub image rendering cannot be promised across clients.

## Deliberate v1 limits

- Explicit timed scenes; no physics, hosted editor, accounts, or GitHub activity state machine.
- One motion path per actor. Multiple curve segments and key-point timing cover the demo and common flight paths.
- Linear numeric interpolation and discrete switches. No easing curves yet.
- Palette roles are arbitrary, and colors are hex values. Custom drawing uses pixel grids rather than raw SVG snippets.
- The husky example is a palette study using the demo dog. A distinctive husky is a future asset, not a renderer feature.

The code and artwork were created for this project. The general README-animation concept is inspired by YourTomo; its implementation and assets are not used.
