#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Bypass npx and run node natively using the tsx loader
spawnSync('node', ['--import', 'tsx', path.join(__dirname, 'src/index.ts')], {
    stdio: 'inherit',
    cwd: __dirname, // Forces it to use the dependencies inside the auto-committer folder
    shell: true
});