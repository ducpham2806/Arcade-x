const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');

module.exports = function bundledGameIds(outDir = 'dist') {
  const filename = 'src/games/registry.ts';
  const source = ts.createSourceFile(filename, fs.readFileSync(filename, 'utf8'), ts.ScriptTarget.Latest);
  const registry = source.statements.filter(ts.isVariableStatement)
    .flatMap(statement => [...statement.declarationList.declarations])
    .find(declaration => declaration.name.getText(source) === 'GAME_REGISTRY').initializer;
  // Games without asset preloads are still part of the bundled launcher.
  const ids = registry.properties.filter(ts.isPropertyAssignment).map(property => property.name.text);
  // Snake's package is generated from its hashed release output.
  if (fs.existsSync(path.join(outDir, 'snake-offline-package.json'))) ids.push('snake-legend');
  return ids;
};
