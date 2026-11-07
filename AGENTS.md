# Agent Guidelines (`puzz`)

## Preventing Infinite Loops & Hanging Commands

1. **Always cap one-off CLI commands with `timeout`**:
   - Prefix one-off `npx`, `tsx`, or `node` commands with `timeout --kill-after=5s 30s` (e.g., `timeout --kill-after=5s 30s npx tsx ...`).
   - Never run an unbounded search or generation script from `run_command` without a wall-clock timeout.

2. **Never write unbounded `while (true)` loops**:
   - In generators, helpers, tests, and scratch scripts, always use a bounded loop (`for (let tries = 0; tries < maxTries; tries++)`) and throw an error if `maxTries` is exhausted.
   - When calling `generate(spec, count, seconds, seed)`, never assume `generate(...)` returned a non-empty array in a loop without checking `if (!res) break;` and advancing the seed or stopping after a fixed number of attempts.
   - Always pass a `Budget` when calling `solve()` or `countSolutions()` inside generation or search loops.
