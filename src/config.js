import fs from 'fs';
import path from 'path';
import os from 'os';
import url from 'url';

const QUOTE_TYPES = { SINGLE: '\'', DOUBLE: '"' };

const CONFIG_SCHEMA = {
  indent: { type: 'number', default: 2 },
  quote: { type: 'string', default: QUOTE_TYPES.SINGLE, enum: Object.values(QUOTE_TYPES) },
  lineWidth: { type: 'number', default: 80 },
  semi: { type: 'boolean', default: true },
  workers: { type: 'number', default: Math.max(1, os.cpus().length - 1) },
  watermark: { type: 'boolean', default: true },
  stripComments: { type: 'boolean', default: true },
  plugins: { type: 'array', default: [] }
};

function validateAndSanitizeConfig(userConfig) {
  const validatedConfig = {};
  for (const key in CONFIG_SCHEMA) {
    const schema = CONFIG_SCHEMA[key];
    const userValue = userConfig[key];

    if (userValue === undefined || (schema.type === 'array' ? !Array.isArray(userValue) : typeof userValue !== schema.type)) {
      validatedConfig[key] = schema.default;
      continue;
    }
    if (schema.enum && !schema.enum.includes(userValue)) {
      validatedConfig[key] = schema.default;
      continue;
    }
    validatedConfig[key] = userValue;
  }
  return validatedConfig;
}

export async function loadConfig(cliOptions = {}) {
  const cwd = process.cwd();
  const defaultConfig = Object.fromEntries(Object.entries(CONFIG_SCHEMA).map(([k, v]) => [k, v.default]));
  const jsConfigPath = path.join(cwd, 'razzaq.config.js');
  const rcJsonPath = path.join(cwd, '.razzaqrc');
  let fileConfig = {};

  try {
    if (fs.existsSync(jsConfigPath)) {
      fileConfig = (await import(url.pathToFileURL(jsConfigPath).href)).default || {};
    } else if (fs.existsSync(rcJsonPath)) {
      fileConfig = JSON.parse(fs.readFileSync(rcJsonPath, 'utf8'));
    }
  } catch (e) {
    console.error(`[Config Error] Failed to load config: ${e.message}`);
  }

  const mergedConfig = { ...defaultConfig, ...fileConfig, ...cliOptions };
  return validateAndSanitizeConfig(mergedConfig);
}
