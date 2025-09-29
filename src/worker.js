import { parentPort } from 'worker_threads';
import fs from 'fs/promises';
import { formatCode } from './formatter.js';

if (!parentPort) { process.exit(1); }

parentPort.on('message', async (msg) => {
  const { files, options } = msg;
  const results = [];
  for (const f of files) {
    try {
      const source = await fs.readFile(f, 'utf8');
      const output = await formatCode(source, options, f);
      
      if (source === output) {
        results.push({ file: f, status: 'unchanged' });
      } else if (options.write) {
        await fs.writeFile(f, output, 'utf8');
        results.push({ file: f, status: 'formatted' });
      } else {
        results.push({ file: f, status: 'changed' });
      }
    } catch (err) {
      results.push({ file: f, status: 'error', error: String(err) });
    }
  }
  parentPort.postMessage({ results });
});
