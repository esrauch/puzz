/**
 * Generation off the main thread: a Web Worker that runs a genre's generator
 * and posts back the panel, so the page never freezes on a slow search.
 * (The offline tool calls the same generators directly.)
 */
import { Rejections } from './core/spec';
import type { GenReply, GenRequest } from './client';
import { generate as generateWebs } from './webs';

interface Scope {
  addEventListener(type: 'message', f: (e: MessageEvent<GenRequest>) => void): void;
  postMessage(message: GenReply): void;
}
const scope = self as unknown as Scope;

scope.addEventListener('message', (e) => scope.postMessage(run(e.data)));

export function run(req: GenRequest): GenReply {
  const why = new Rejections();
  const start = performance.now();
  const [made] = generateWebs(req.spec, 1, req.seconds, req.seed, why);
  return {
    id: req.id,
    made: made ?? null,
    ms: Math.round(performance.now() - start),
    rejected: why.toString(),
  };
}
