/**
 * Every search runs under a budget: a step limit and a wall-clock deadline.
 * Running out throws OverBudget, which callers read as "too many to count"
 * or "try the next seed", never as "wait longer".
 */
export class OverBudget extends Error {
  constructor() {
    super('over budget');
  }
}

export class Budget {
  private steps = 0;
  constructor(
    readonly limit = Infinity,
    readonly deadline = Infinity,
  ) {}

  /** Count `n` steps of work; throws OverBudget past the limit or the deadline. */
  tick(n = 1): void {
    this.steps += n;
    if (this.steps > this.limit) throw new OverBudget();
    if ((this.steps & 1023) === 0 && Date.now() > this.deadline) throw new OverBudget();
  }

  get used(): number {
    return this.steps;
  }

  /** A budget of this many seconds from now (and at most `limit` steps). */
  static seconds(seconds: number, limit = Infinity): Budget {
    return new Budget(limit, Date.now() + seconds * 1000);
  }
}

/** Run `f`; null if it went over budget. */
export function within<T>(f: () => T): T | null {
  try {
    return f();
  } catch (e) {
    if (e instanceof OverBudget) return null;
    throw e;
  }
}
