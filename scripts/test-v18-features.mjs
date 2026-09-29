import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = (rel) => fs.readFileSync(new URL(`../${rel}`, import.meta.url), 'utf8');
const exists = (rel) => fs.existsSync(new URL(`../${rel}`, import.meta.url));

const pkg = JSON.parse(read('package.json'));
const app = read('src/App.tsx');
const routes = read('src/utils/routes.ts');
const home = read('src/components/HomePage.tsx');
const header = read('src/components/Header.tsx');
const overview = read('src/components/OverviewPanel.tsx');

assert.ok(Number(pkg.version.split('.')[0]) >= 18, 'El paquete debe conservar las funciones introducidas en v18.');
assert.equal(exists('src/components/PokemonExplorerPage.tsx'), true, 'Debe existir el Explorador Pokémon.');
assert.equal(exists('src/components/MoveDexPage.tsx'), true, 'Debe existir Movepedia.');
assert.equal(exists('src/components/MoveDetailPage.tsx'), true, 'Debe existir la ficha de movimiento.');
assert.equal(exists('src/utils/explorer.ts'), true, 'Debe existir la lógica reusable del Explorador.');
assert.match(routes, /\/explorar\/pokemon/, 'Debe existir la ruta del Explorador.');
assert.match(routes, /\/movimientos/, 'Debe existir la ruta de Movepedia.');
assert.match(app, /PokemonExplorerPage/, 'App debe montar el Explorador.');
assert.match(app, /MoveDexPage/, 'App debe montar Movepedia.');
assert.match(app, /MoveDetailPage/, 'App debe montar la ficha de movimiento.');
assert.match(home, /Explorador Pokémon/, 'Home debe enlazar al Explorador.');
assert.match(home, /Movepedia/, 'Home debe enlazar a Movepedia.');
assert.match(header, /Explorador/, 'Header debe incluir navegación al Explorador.');
assert.match(header, /Movepedia/, 'Header debe incluir navegación a Movepedia.');
assert.match(overview, /Ver movimientos disponibles/, 'La ficha Pokémon debe enlazar a sus movimientos.');

const explorer = await import('../src/utils/explorer.ts').catch(() => null);
assert.ok(explorer, 'La lógica del Explorador debe poder importarse.');
assert.equal(explorer.generationForNationalId(25), 1);
assert.equal(explorer.generationForNationalId(252), 3);
assert.equal(explorer.generationForNationalId(1025), 9);
assert.equal(explorer.generationForNationalId(10001), null);

const sample = [
  { id: 6, name: 'charizard', bst: 534, stats: { hp: 78, attack: 84, defense: 78, specialAttack: 109, specialDefense: 85, speed: 100 } },
  { id: 445, name: 'garchomp', bst: 600, stats: { hp: 108, attack: 130, defense: 95, specialAttack: 80, specialDefense: 85, speed: 102 } },
];
assert.deepEqual(explorer.sortExplorerRows(sample, 'attack').map((row) => row.name), ['garchomp', 'charizard']);
assert.equal(explorer.meetsStatMinimums(sample[0], { speed: 100 }), true);
assert.equal(explorer.meetsStatMinimums(sample[0], { speed: 101 }), false);

console.log('v18 feature tests: OK');
