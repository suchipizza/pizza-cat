# Husky + cat + food: a palette study

This example demonstrates white-and-charcoal dog colors, a smaller black cat, independent flying food, and a sushi prop that switches between maki and nigiri mid-flight.

It reuses the original demo sprites. The demo dog is a floppy-eared dog, **not a finished Siberian husky**. A husky with crown markings, pointed ears, a white muzzle, and a curled tail should be a new character asset. The renderer already supports it.

Generate the example into its own folder:

```sh
npm run generate -- --config examples/husky-cat-food/profile.config.ts --out /tmp/pizza-cat-example
```

Open the generated `scene.svg` in your browser. To use this as your starting scene, copy its configuration into `profile.config.ts`, adjust the relative imports, and run `npm run preview`.

The point of the example is composition: a new appearance and a second sushi frame require configuration changes, not renderer changes.
