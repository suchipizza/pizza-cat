# A character starts here

Eight pixels wide. Unlimited potential for questionable decisions.

1. Copy this folder from the repository root:

   ```sh
   cp -R characters/_template characters/my-pet
   ```

2. In `characters/my-pet/character.ts`, set `id: 'my-pet'` and give your character a name. Pick a palette. `appearance` maps friendly color names to your palette symbols; you may invent your own roles.

3. Draw the frames in `sprites.ts`. A dot is transparent. Every other symbol must exist in your palette. Every row must have the same width, and every frame must match the dimensions in `character.ts`. Update those dimensions when you resize the artwork.

4. Edit `animations.ts`. The starter waits two seconds and blinks. Keep an `idle` frame; everything else is optional. Frames referenced in animations must exist.

5. Register the character in `characters/index.ts`:

   ```ts
   import myPet from './my-pet/character.ts';

   export const characters = {
     [dog.id]: dog,
     [cat.id]: cat,
     [myPet.id]: myPet,
   };
   ```

   Keep the existing imports and entries. This is the only registration step; no renderer edits are needed.

6. Add an instance to the `characters` array in `profile.config.ts`:

   ```ts
   {
     id: 'my-roommate',
     preset: 'my-pet',
     name: 'Captain Crumb',
     position: { x: 480, y: 244 },
     scale: 6,
     appearance: { primary: '#c3b1e1', eyes: '#26384a' },
     animation: 'idle',
   }
   ```

   `position` anchors the bottom center of the sprite. `scale: 6` means one authored pixel becomes six scene pixels. Named animations run once per scene cycle; use `loop()` in a custom sequence for repeated blinking or walking.

7. Run `npm run preview`, open the printed URL, and save your changes. The preview regenerates the scene and shows errors as you work. Run `npm run check` before committing.

See the [main README](../../README.md#character-format) for the complete format and [animation guide](../../docs/animation.md) for choreography.
