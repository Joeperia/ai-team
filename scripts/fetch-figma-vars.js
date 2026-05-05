// Pulls variables from Figma and writes figma-variable.json.
// Run with: npm run tokens:pull
//
// Requires a .env at the repo root containing:
//   FIGMA_PAT=<personal-access-token>
//   FIGMA_FILE_KEY=<file-key>

import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { config } from 'dotenv';
import { loadFigmaEnv } from './lib/figma-env.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
config({ path: path.resolve(__dirname, '../.env') });

const { FIGMA_PAT, FILE_KEY } = loadFigmaEnv();

const res = await fetch(
  `https://api.figma.com/v1/files/${FILE_KEY}/variables/local`,
  { headers: { 'X-Figma-Token': FIGMA_PAT } }
);

if (!res.ok) {
  const body = await res.text();
  throw new Error(`Figma API ${res.status} ${res.statusText}\n${body}`);
}

const data = await res.json();
const outputPath = path.resolve(__dirname, '../figma-variable.json');
fs.writeFileSync(outputPath, JSON.stringify(data, null, 2));

const variables = Object.keys(data.meta?.variables ?? {}).length;
const collections = Object.keys(data.meta?.variableCollections ?? {}).length;
console.log(`✓ Wrote ${outputPath} (${variables} variables, ${collections} collections)`);
