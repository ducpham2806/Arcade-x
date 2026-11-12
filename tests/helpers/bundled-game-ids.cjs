const fs = require('node:fs');
const path = require('node:path');

module.exports = function bundledGameIds(outDir = 'dist') {
  const ids = Object.keys(JSON.parse(fs.readFileSync('src/games/packageAssets.json')));
  // Snake's package is generated from its hashed release output.
  if (fs.existsSync(path.join(outDir, 'snake-offline-package.json'))) ids.push('snake-legend');
  return ids;
};
