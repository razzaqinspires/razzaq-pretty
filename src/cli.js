import { Worker } from 'worker_threads';
import os from 'os';
import path from 'path';
import fs from 'fs/promises';
import { glob } from 'glob';
import { createHash } from 'crypto';
import { loadConfig } from './config.js';

const CACHE_PATH = path.join(process.cwd(), '.razzaqcache');

async function initializeConfiguration() {
  const configPath = path.join(process.cwd(), '.razzaqrc');
  console.log('[INIT] Checking for .razzaqrc...');
  try {
    await fs.access(configPath);
    console.log('[INIT] .razzaqrc already exists.');
  } catch (error) {
    console.log('[INIT] Creating default .razzaqrc...');
    const defaultConfig = {
      "plugins": ["removeExtraBlankLines", "disallowConsoleLog"]
    };
    await fs.writeFile(configPath, JSON.stringify(defaultConfig, null, 2), 'utf8');
    console.log('[INIT] .razzaqrc created successfully.');
  }
  process.exit(0);
}

async function main() {
  if (process.argv.includes('--init')) {
    await initializeConfiguration();
    return;
  }

  let fileCache = {};
  try {
    fileCache = JSON.parse(await fs.readFile(CACHE_PATH, 'utf8'));
  } catch (e) {}

  const config = await loadConfig();
  const patterns = process.argv.slice(2).filter(a => !a.startsWith('--'));
  const allMatches = await glob(patterns.length ? patterns : ['**/*.js'], { ignore: 'node_modules/**' });

  const filesToProcess = [];
  let filesSkipped = 0;
  for (const file of allMatches) {
    const filePath = path.resolve(file);
    const content = await fs.readFile(filePath, 'utf8');
    const hash = createHash('sha256').update(content).digest('hex');
    if (fileCache[filePath] !== hash) {
      filesToProcess.push(filePath);
      fileCache[filePath] = hash;
    } else {
      filesSkipped++;
    }
  }

  if (!filesToProcess.length) {
    console.log(`[ANALYSIS] All ${allMatches.length} files are up-to-date.`);
    return;
  }
  console.log(`[ANALYSIS] To Process: ${filesToProcess.length}, Cached: ${filesSkipped}`);

  const numWorkers = Math.min(filesToProcess.length, config.workers);
  const chunkSize = Math.ceil(filesToProcess.length / numWorkers);
  const chunks = Array.from({ length: numWorkers }, (_, i) => filesToProcess.slice(i * chunkSize, (i + 1) * chunkSize)).filter(c => c.length > 0);

  const workerPromises = chunks.map(chunk => new Promise((resolve, reject) => {
    const worker = new Worker(new URL('./worker.js', import.meta.url));
    worker.on('message', (msg) => resolve(msg.results));
    worker.on('error', reject);
    worker.on('exit', (code) => { if (code !== 0) reject(new Error(`Worker exit code ${code}`)); });
    worker.postMessage({ files: chunk, options: config });
  }));

  const results = (await Promise.all(workerPromises)).flat();
  const summary = results.reduce((acc, r) => ({ ...acc, [r.status]: (acc[r.status] || 0) + 1 }), {});
  
  console.log("\n--- [ SUMMARY ] ---");
  Object.entries(summary).forEach(([status, count]) => console.log(`  - ${status.charAt(0).toUpperCase() + status.slice(1)}: ${count}`));
  console.log("-------------------\n");
  
  await fs.writeFile(CACHE_PATH, JSON.stringify(fileCache, null, 2));
}

main().catch(err => {
  console.error('[FATAL]', err);
  process.exit(1);
});
