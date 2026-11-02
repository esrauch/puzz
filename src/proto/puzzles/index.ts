/** Every puzzle prototype, in the order the page lists them (by room). */
import type { Proto } from '../kit';
import { admirers } from './admirers';
import { bow } from './bow';
import { eggtree } from './eggtree';
import { feast } from './feast';
import { finale } from './finale';
import { flag } from './flag';
import { jack } from './jack';
import { mailbox } from './mailbox';
import { ornaments } from './ornaments';
import { parade } from './parade';
import { pietin } from './pietin';
import { platterProto } from './platter';
import { shadows } from './shadows';
import { stocking } from './stocking';
import { trade } from './trade';
import { tree } from './tree';
import { tuesday } from './tuesday';
import { weave } from './weave';
import { web } from './web';

export const PROTOS: Proto[] = [
  // Valentine's
  jack,
  admirers,
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
  trade,
  shadows,
  web,
  // Thanksgiving
  platterProto,
  stocking,
  feast,
  // Christmas
  ornaments,
  pietin,
  tree,
  // The final puzzle
  tuesday,
];
