#!/usr/bin/env node

import { spawn } from 'child_process';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const frontendDir = path.join(__dirname, 'frontend');
const isWindows = os.platform() === 'win32';

const npm = isWindows ? 'npm.cmd' : 'npm';

const child = spawn(npm, ['run', 'preview'], {
  cwd: frontendDir,
  stdio: 'inherit',
  shell: isWindows
});

process.on('SIGTERM', () => {
  child.kill('SIGTERM');
  process.exit(0);
});

process.on('SIGINT', () => {
  child.kill('SIGINT');
  process.exit(0);
});

child.on('exit', (code) => {
  process.exit(code);
});
