#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');
const os = require('os');

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
