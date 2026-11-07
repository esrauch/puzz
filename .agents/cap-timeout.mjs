import fs from 'node:fs';

try {
  const raw = fs.readFileSync(0, 'utf8');
  const input = raw ? JSON.parse(raw) : {};
  const cmd = input?.toolCall?.args?.CommandLine ?? '';
  const isDaemon = input?.toolCall?.args?.IsDaemon === true;

  if (!isDaemon && /\b(npx|tsx)\b/.test(cmd) && !/^\s*timeout\b/.test(cmd)) {
    process.stdout.write(
      JSON.stringify({
        decision: 'allow',
        overwrite: {
          CommandLine: `timeout --kill-after=5s 30s bash -c ${JSON.stringify(cmd)}`,
        },
      }),
    );
  } else {
    process.stdout.write(JSON.stringify({ decision: 'allow' }));
  }
} catch {
  process.stdout.write(JSON.stringify({ decision: 'allow' }));
}
