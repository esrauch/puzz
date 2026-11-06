/**
 * Generation off the main thread: a Web Worker that runs a genre's generator
 * and posts back the panel, so the page never freezes on a slow search.
 * (The offline tool calls the same generators directly.)
 */
import { type Spec, Rejections } from './core/spec';
import type { GenReply, GenRequest } from './client';
import { type CarveTwist, generate as generateCarving } from './carving';
import { type HopTwist, generate as generateHops } from './hops';
import { type LightTwist, generate as generateLights } from './lights';
import { type WebTwist, generate as generateWebs } from './webs';
import { type WordTwist, generate as generateWords } from './words';

interface Scope {
  addEventListener(type: 'message', f: (e: MessageEvent<GenRequest>) => void): void;
  postMessage(message: GenReply): void;
}
const scope = self as unknown as Scope;

scope.addEventListener('message', (e) => scope.postMessage(run(e.data)));

export function run(req: GenRequest): GenReply {
  const why = new Rejections();
  const start = performance.now();
  const [made] =
    req.genre === 'carving'
      ? generateCarving(req.spec as Spec<CarveTwist>, 1, req.seconds, req.seed, why)
      : req.genre === 'words'
        ? generateWords(req.spec as Spec<WordTwist>, 1, req.seconds, req.seed, why)
        : req.genre === 'hops'
          ? generateHops(req.spec as Spec<HopTwist>, 1, req.seconds, req.seed, why)
          : req.genre === 'lights'
            ? generateLights(req.spec as Spec<LightTwist>, 1, req.seconds, req.seed, why)
            : generateWebs(req.spec as Spec<WebTwist>, 1, req.seconds, req.seed, why);
  return {
    id: req.id,
    made: made ?? null,
    ms: Math.round(performance.now() - start),
    rejected: why.toString(),
  };
}
