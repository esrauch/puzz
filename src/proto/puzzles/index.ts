/** Every puzzle prototype, in the order the page lists them (by room). */
import type { Proto } from '../kit';
import { cornucopia, eggtree, flag, hutch } from './easter';
import { bow, broom, finale, sparklers } from './fourth';
import { chocolates, cobwebs, starlights, web } from './halloween';
import { fairylights, goldenegg, pumpkinpie, tree } from './christmas';
import { breadboard, feast, hotdog, stocking } from './thanksgiving';
import { tuesday } from './tuesday';
import { basket, jack, lovenotes, mailbox } from './valentines';
import { webWorkshop } from './workshop';

export const PROTOS: Proto[] = [
  // Valentine's
  lovenotes,
  jack,
  basket,
  mailbox,
  // Easter
  hutch,
  flag,
  cornucopia,
  eggtree,
  // Fourth of July
  sparklers,
  bow,
  broom,
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
  // Generated in the browser
  webWorkshop,
];
