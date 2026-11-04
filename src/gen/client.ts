/**
 * Generating in the browser: ask the worker (worker.ts) for a panel and get a
 * promise back. One worker is kept warm; cancelling ends it (a new one starts
 * next time). Without Worker support it runs on the page instead.
 */
import type { Made, Spec } from './core/spec';
import type { Panel, WebTwist } from './webs';

export interface GenRequest {
  id: number;
  genre: 'webs';
  spec: Spec<WebTwist>;
  seconds: number;
  seed: number;
}

export interface GenReply {
  id: number;
  made: Made<Panel> | null;
  ms: number;
  /** Why attempts were thrown away (for "nothing found"). */
  rejected: string;
}

let worker: Worker | null = null;
let nextId = 1;
const waiting = new Map<number, (reply: GenReply) => void>();

function start(): Worker {
  const w = new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' });
  w.addEventListener('message', (e: MessageEvent<GenReply>) => {
    waiting.get(e.data.id)?.(e.data);
    waiting.delete(e.data.id);
  });
  return w;
}

export async function generateInBrowser(o: Omit<GenRequest, 'id'>): Promise<GenReply> {
  const req: GenRequest = { ...o, id: nextId++ };
  if (typeof Worker === 'undefined') {
    const { run } = await import('./worker');
    return run(req);
  }
  worker ??= start();
  const w = worker;
  return new Promise((resolve) => {
    waiting.set(req.id, resolve);
    w.postMessage(req);
  });
}

/** Stop whatever's generating (its promise never settles). */
export function cancelGenerating(): void {
  worker?.terminate();
  worker = null;
  waiting.clear();
}
