// Build time injection script
// Run this before build to generate .env with NEXT_PUBLIC_BUILD_TIME
const fs = require('fs');
const path = require('path');

const buildTime = new Date().toISOString();
const envPath = path.join(__dirname, '.env.buildtime');

fs.writeFileSync(envPath, `NEXT_PUBLIC_BUILD_TIME=${buildTime}\n`);

console.log(`Build time written to .env.buildtime: ${buildTime}`);
