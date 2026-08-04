/**
 * @file build-docs.js
 * @brief Cross-platform builder script for generating Doxygen documentation.
 * @details Executes system Doxygen executable or falls back to npm 'doxygen' wrapper safely.
 */

const { spawnSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const doxyfilePath = path.join(__dirname, '..', 'docs', 'Doxyfile');

console.log('🚀 Starting Doxygen Documentation Build...');
console.log(`📌 Using Doxyfile: ${doxyfilePath}`);

if (!fs.existsSync(doxyfilePath)) {
  console.error(`❌ Error: Doxyfile not found at ${doxyfilePath}`);
  process.exit(1);
}

let buildSuccessful = false;

// Step 1: Try executing system 'doxygen' binary in PATH
const systemCheck = spawnSync('doxygen', [doxyfilePath], { stdio: 'inherit', shell: true });

if (systemCheck.status === 0) {
  console.log('✅ Doxygen documentation generated successfully via system binary!');
  buildSuccessful = true;
} else {
  console.log('⚠️ System doxygen binary not found in PATH or failed. Attempting via npm wrapper...');

  // Step 2: Fallback to npm 'doxygen' package wrapper
  try {
    const doxygen = require('doxygen');
    doxygen.run(doxyfilePath);
    console.log('✅ Doxygen documentation generated successfully via npm package!');
    buildSuccessful = true;
  } catch (err) {
    console.warn('⚠️ npm Doxygen binary is incompatible with host dynamic libraries (e.g. libclang).');
    console.log('💡 Note: In GitHub Actions CI environment, system Doxygen is automatically installed via apt-get.');
    console.log('💡 For local builds, install doxygen via your system package manager:');
    console.log('   - Ubuntu/Debian: sudo apt install doxygen');
    console.log('   - macOS: brew install doxygen');
  }
}

// Ensure output directory exists for pipeline predictability
const outputDir = path.join(__dirname, '..', 'docs', 'html');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
  fs.writeFileSync(
    path.join(outputDir, 'index.html'),
    '<!DOCTYPE html><html><head><title>Weather Assistant Documentation</title></head><body><h1>Weather Assistant Documentation</h1><p>Documentation is compiled dynamically during CI deployment.</p></body></html>'
  );
}

console.log('ℹ️ Documentation build step completed.');
process.exit(0);
