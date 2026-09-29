import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';

const root = path.resolve(new URL('..', import.meta.url).pathname);
const read = (rel) => fs.readFileSync(path.join(root, rel), 'utf8');
const compare = read('src/components/ComparePage.tsx');
const evolution = read('src/components/EvolutionLine.tsx');
const variants = read('src/components/VariantsPanel.tsx');
const overview = read('src/components/OverviewPanel.tsx');
const app = read('src/App.tsx');
const css = read('src/index.css');
const pkg = JSON.parse(read('package.json'));

assert.equal(pkg.version, '13.0.0');
assert.match(compare, /version="v13"/);
assert.match(app, /"v13"/);
assert.match(evolution, /import TypeIcon from "\.\/TypeIcon"/);
assert.match(evolution, /disabled=\{!variocolor\.available\}/);
assert.match(evolution, /Variocolor no disponible/);
assert.match(evolution, /showShiny \? "↩ Normal" : "✨ Variocolor"/);
assert.match(evolution, /<TypeIcon type=\{entry\.type\.name\}/);
assert.match(variants, /Ver ficha/);
assert.match(variants, /Comparar/);
assert.match(overview, /variant-profile-banner/);
assert.match(overview, /Comparar con la base/);
assert.match(css, /\.evolution-shiny-toggle:disabled/);
assert.match(css, /\.variant-profile-banner/);
assert.match(css, /\.variant-card-actions/);
const shinyRule = css.match(/\.evolution-shiny-toggle\s*\{[^}]*\}/s)?.[0] ?? '';
assert.doesNotMatch(shinyRule, /position:\s*absolute/);
assert.match(css, /\.evolution-type-pill/);

console.log('V13_UI_CHECK: PASS');
