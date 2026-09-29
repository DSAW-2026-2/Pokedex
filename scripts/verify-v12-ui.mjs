import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';

const root = path.resolve(new URL('..', import.meta.url).pathname);
const read = (rel) => fs.readFileSync(path.join(root, rel), 'utf8');
const compare = read('src/components/ComparePage.tsx');
const evolution = read('src/components/EvolutionLine.tsx');
const app = read('src/App.tsx');
const css = read('src/index.css');
const pkg = JSON.parse(read('package.json'));

assert.equal(pkg.version, '12.0.0');
assert.match(compare, /version="v12"/);
assert.match(app, /"v12"/);
assert.match(evolution, /import TypeIcon from "\.\/TypeIcon"/);
assert.match(evolution, /disabled=\{!variocolor\.available\}/);
assert.match(evolution, /Variocolor no disponible/);
assert.match(evolution, /showShiny \? "↩ Normal" : "✨ Variocolor"/);
assert.match(evolution, /<TypeIcon type=\{entry\.type\.name\}/);
assert.match(css, /\.evolution-shiny-toggle:disabled/);
const shinyRule = css.match(/\.evolution-shiny-toggle\s*\{[^}]*\}/s)?.[0] ?? '';
assert.doesNotMatch(shinyRule, /position:\s*absolute/);
assert.match(css, /\.evolution-type-pill/);

console.log('V12_FIGMA_EVOLUTION_UI: PASS');
