/** Every puzzle prototype, in the order the page lists them (by room). */
import type { Proto } from '../kit';
import { bow } from './bow';
import { eggtree } from './eggtree';
import { finale } from './finale';
import { flag } from './flag';
import { chocolates, cobwebs, starlights, web } from './halloween';
import { fairylights, goldenegg, pumpkinpie, tree } from './christmas';
import { parade } from './parade';
import { breadboard, feast, hotdog, stocking } from './thanksgiving';
import { tuesday } from './tuesday';
import { basket, jack, lovenotes, mailbox } from './valentines';
import { weave } from './weave';

export const PROTOS: Proto[] = [
  // Valentine's
  lovenotes,
  jack,
  basket,
  mailbox,
  // Easter
  flag,
  weave,
  eggtree,
  // Fourth of July
  bow,
  parade,
  finale,
  // Halloween
  cobwebs,
  chocolates,
  starlights,
  web,
  // Thanksgiving
  breadboard,
  hotdog,
  stocking,
  feast,
  // Christmas
  fairylights,
  goldenegg,
  pumpkinpie,
  tree,
  // The final puzzle
  tuesday,
];
