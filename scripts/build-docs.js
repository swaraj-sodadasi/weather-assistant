/**
 * @file build-docs.js
 * @brief Cross-platform builder script for Doxygen documentation.
 * @details Executes Doxygen generation using system binary or npm package fallback.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const doxyfilePath = path.join(rootDir, 'docs', 'Doxyfile');

console.log('🚀 Starting Doxygen documentation generation...');

if (!fs.existsSync(doxyfilePath)) {
  console.error(`❌ Doxyfile not found at ${doxyfilePath}`);
  process.exit(1);
}

let success = false;

// 1. Try system doxygen (e.g. /usr/bin/doxygen or system PATH without node_modules/.bin override)
const systemDoxygenPath = process.platform === 'win32' ? 'doxygen' : (fs.existsSync('/usr/bin/doxygen') ? '/usr/bin/doxygen' : 'doxygen');

try {
  console.log(`📌 Attempting Doxygen generation using binary: ${systemDoxygenPath}`);
  
  // Clean PATH to prefer system binaries over node_modules/.bin wrappers if needed
  const cleanEnv = { ...process.env };
  if (cleanEnv.PATH) {
    cleanEnv.PATH = cleanEnv.PATH.split(path.delimiter)
      .filter(p => !p.includes('node_modules'))
      .join(path.delimiter);
  }

  execSync(`"${systemDoxygenPath}" "${doxyfilePath}"`, {
    cwd: rootDir,
    stdio: 'inherit',
    env: cleanEnv
  });
  console.log('✅ Documentation generated successfully in docs/html/');
  success = true;
} catch (err) {
  console.warn('⚠️  System Doxygen command execution failed. Trying npm module fallback...');
}

// 2. Fallback to npx doxygen wrapper
if (!success) {
  try {
    console.log('📌 Attempting npx doxygen fallback...');
    execSync(`npx doxygen "${doxyfilePath}"`, {
      cwd: rootDir,
      stdio: 'inherit',
      env: process.env
    });
    console.log('✅ Documentation generated successfully via npx doxygen in docs/html/');
    success = true;
  } catch (npxErr) {
    console.error('❌ Failed to generate documentation with Doxygen:', npxErr.message);
    process.exit(1);
  }
}
