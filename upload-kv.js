#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);
const distDir = './frontend/dist';

async function uploadFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const relativePath = '/' + path.relative(distDir, filePath).replace(/\\/g, '/');
  
  console.log(`Uploading ${relativePath}...`);
  
  try {
    const command = `wrangler kv:key put --binding=drive_manager --path="${filePath}" "${relativePath}" --env production`;
    await execPromise(command);
    console.log(`✓ Uploaded ${relativePath}`);
  } catch (error) {
    console.error(`✗ Failed to upload ${relativePath}:`, error.message);
  }
}

async function uploadDirectory(dir) {
  const files = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const file of files) {
    const fullPath = path.join(dir, file.name);
    
    if (file.isDirectory()) {
      await uploadDirectory(fullPath);
    } else {
      await uploadFile(fullPath);
    }
  }
}

async function main() {
  if (!fs.existsSync(distDir)) {
    console.error(`Error: ${distDir} does not exist`);
    console.log('Please run: npm run build (in frontend directory)');
    process.exit(1);
  }
  
  console.log(`Uploading files from ${distDir}...`);
  await uploadDirectory(distDir);
  console.log('✅ Upload complete!');
}

main().catch(error => {
  console.error('Error:', error);
  process.exit(1);
});
