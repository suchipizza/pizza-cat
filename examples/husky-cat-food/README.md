# Husky + cat + food

A complete 20-second scene with an original black-and-white husky, the smaller black cat, and five independently spinning flights of pizza, maki, and nigiri. The husky has pointed black ears, charcoal crown markings, a white face and muzzle, blue eyes, and a curled tail. It chases the food, looks up, and walks home. The cat blinks, flicks its tail, and hops toward passing sushi.

All character design lives in `characters/husky/`; the cat keeps its existing sprites. Paths, timing, and reactions live in this configuration. The character renderer needs no species-specific changes.

Generate into a separate folder:

```sh
npm run generate -- --config examples/husky-cat-food/profile.config.ts --out /tmp/pizza-cat-example
```

Open the generated `scene.svg` in your browser. To make it your default scene, copy this config into `profile.config.ts`, change the source imports to `./src/…`, and replace the demo import with `./examples/demo/profile.config.ts`. Then run `npm run preview`.

For a working personal profile, see [Noémie’s scene](../noemie-profile).
