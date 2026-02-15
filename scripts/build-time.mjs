// Build time injection script
// Run this before build to generate .env with NEXT_PUBLIC_BUILD_TIME
import fs from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const buildTime = new Date().toISOString();
const envPath = path.join(__dirname, '..', '.env.buildtime');

fs.writeFileSync(envPath, `NEXT_PUBLIC_BUILD_TIME=${buildTime}\n`);

console.log(`Build time written to .env.buildtime: ${buildTime}`);
