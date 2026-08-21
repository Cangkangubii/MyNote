const swc = require('@swc/core');
const code = 'import x from "./mod"';
const out = swc.transformSync(code, {
  jsc: { parser: { syntax: 'typescript' }, target: 'es2022' },
  module: { type: 'commonjs' }
});
console.log('CODE:');
console.log(out.code);
console.log('END');