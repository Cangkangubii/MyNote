const swc = require('@swc/core');
const code = 'import { something } from "./mod"';
const out = swc.transformSync(code, {
  jsc: { parser: { syntax: 'typescript' }, target: 'es2022' },
  module: { type: 'commonjs' }
});
console.log(out.code);