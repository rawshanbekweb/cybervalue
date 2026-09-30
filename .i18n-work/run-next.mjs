import { spawnSync } from 'node:child_process';
const result = spawnSync(process.execPath, ['node_modules/next/dist/bin/next', process.argv[2] || 'dev', ...(process.argv[2] === 'start' ? [] : ['--webpack'])], { stdio: 'inherit', env: { ...process.env, DATABASE_URL: '' } });
process.exit(result.status ?? 1);
