import pizza from './pizza.ts';
import sushi from './sushi.ts';
import coffee from './coffee.ts';
import type { PropDefinition } from '../src/types.ts';
export const props: Readonly<Record<string, PropDefinition>> = { pizza, sushi, coffee };
