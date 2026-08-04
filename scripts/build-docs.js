/**
 * @file build-docs.js
 * @brief Cross-platform builder script for generating Doxygen documentation.
 * @details Executes system Doxygen executable or falls back to npm 'doxygen' wrapper.
 */

const { spawnSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const docsDir = path.join(__dirname, '..', 'docs');
const doxyfilePath = path.join(docsDir, 'Doxyfile');

console.log('🚀 Starting Doxygen Documentation Build...');
console.log(`📌 Using Doxyfile: ${doxyfilePath}`);

if (!fs.existsSync(doxyfilePath)) {
  console.error(`❌ Error: Doxyfile not found at ${doxyfilePath}`);
  process.exit(1);
}

// Step 1: Execute system 'doxygen' binary inside docs directory
const result = spawnSync('doxygen', ['Doxyfile'], { cwd: docsDir, stdio: 'inherit', shell: true });

if (result.status === 0) {
  console.log('✅ Real Doxygen documentation generated successfully in docs/html/!');
  process.exit(0);
}

console.log('⚠️ System doxygen binary not found in PATH or failed. Attempting via npm wrapper...');

// Step 2: Fallback attempt via npm 'doxygen' package
try {
  const doxygen = require('doxygen');
  doxygen.run(doxyfilePath);
} catch (err) {
  // npm doxygen wrapper failure fallback message
}

const generatedIndex = path.join(docsDir, 'html', 'index.html');
if (fs.existsSync(generatedIndex)) {
  console.log(`✅ Doxygen HTML documentation verified at ${generatedIndex}`);
  process.exit(0);
} else {
  console.error('❌ Doxygen execution failed. System doxygen is required.');
  console.error('   Ubuntu/Debian: sudo apt install doxygen');
  console.error('   macOS: brew install doxygen');
  process.exit(1);
}
