import dog from './demo-dog/character.ts';
import cat from './demo-cat/character.ts';
import husky from './husky/character.ts';
import type { CharacterDefinition } from '../src/types.ts';

/** Import/register your character here; the renderer does not need to change. */
export const characters: Readonly<Record<string, CharacterDefinition>> = {
  [dog.id]: dog,
  [cat.id]: cat,
  [husky.id]: husky,
};
