// Register SWC transform hook for .js files (supports parameter decorators)
// This MUST run before any other imports
const swc = require('@swc/core');
const pirates = require('pirates');
const compilerOptions = {
  jsc: {
    parser: { syntax: 'typescript', decorators: true },
    transform: { legacyDecorator: true },
    target: 'es2022',
  },
  module: { type: 'commonjs' },
};
function addJsExtensionToImports(code) {
  const importRegex = /from\s+['"](\.[^'"]+)['"]/g;
  return code.replace(importRegex, (match, path) => {
    if (path.endsWith('.js') || path.endsWith('.json') || path.endsWith('.node')) {
      return match;
    }
    return match.replace(path, path + '.js');
  });
}
pirates.addHook(
  (code, filename) => {
    if (filename.endsWith('.js')) {
      const transformed = swc.transformSync(code, Object.assign({}, compilerOptions, { filename })).code;
      return addJsExtensionToImports(transformed);
    }
    return code;
  },
  { exts: ['.js'] },
);

require('./src/main');
