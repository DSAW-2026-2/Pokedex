import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = (rel) => fs.readFileSync(new URL(`../${rel}`, import.meta.url), 'utf8');
const exists = (rel) => fs.existsSync(new URL(`../${rel}`, import.meta.url));

const pkg = JSON.parse(read('package.json'));
assert.match(pkg.version, /^19\./, 'La versión debe mantenerse dentro de la familia v19.');
assert.equal(exists('src/components/TeamBuilderPage.tsx'), true, 'Debe existir Team Builder funcional.');
assert.equal(exists('src/components/PokeDetectivePage.tsx'), true, 'Debe existir PokéDetective funcional.');
assert.equal(exists('src/utils/teamBuilder.ts'), true, 'Debe existir lógica reusable de Team Builder.');
assert.equal(exists('src/utils/detective.ts'), true, 'Debe existir lógica reusable de PokéDetective.');

const routes = read('src/utils/routes.ts');
const home = read('src/components/HomePage.tsx');
const app = read('src/App.tsx');
assert.match(routes, /\/team-builder/, 'Debe existir ruta de Team Builder.');
assert.match(routes, /\/pokedetective/, 'Debe existir ruta de PokéDetective.');
assert.match(app, /TeamBuilderPage/, 'App debe montar Team Builder.');
assert.match(app, /PokeDetectivePage/, 'App debe montar PokéDetective.');
assert.doesNotMatch(home, /comingSoon:\s*true/, 'Team Builder y PokéDetective ya no deben quedar como Próximamente.');

const team = await import('../src/utils/teamBuilder.ts');
const analysis = team.analyzeTeamBasics([
  { name: 'garchomp', role: 'Atacante físico', stats: { attack: 130, specialAttack: 80, speed: 102 }, types: ['dragon', 'ground'] },
  { name: 'gardevoir', role: 'Atacante especial', stats: { attack: 65, specialAttack: 125, speed: 80 }, types: ['psychic', 'fairy'] },
  { name: 'rotom-wash', role: 'Pivote', stats: { attack: 65, specialAttack: 105, speed: 86 }, types: ['electric', 'water'] },
]);
assert.deepEqual(analysis.orientation, { physical: 1, special: 2, mixed: 0 });
assert.equal(analysis.averageSpeed, 89);
assert.equal(analysis.speedBand, 'Media');
assert.ok(analysis.roleGaps.includes('Soporte'));

const repeated = team.rankRepeatedWeaknesses([
  { pokemon: 'a', weaknesses: [{ type: 'ice', multiplier: 4 }, { type: 'fairy', multiplier: 2 }] },
  { pokemon: 'b', weaknesses: [{ type: 'ice', multiplier: 2 }] },
  { pokemon: 'c', weaknesses: [{ type: 'fire', multiplier: 2 }] },
]);
assert.deepEqual(repeated.slice(0, 2), [
  { type: 'ice', count: 2, severe: 1 },
  { type: 'fairy', count: 1, severe: 0 },
]);

const detective = await import('../src/utils/detective.ts');
assert.equal(detective.getDetectiveConfig('easy').attempts, 6);
assert.equal(detective.getDetectiveConfig('medium').attempts, 5);
assert.equal(detective.getDetectiveConfig('hard').attempts, 4);
const clues = detective.buildDetectiveClues({
  generation: 'IV',
  types: ['Dragón', 'Tierra'],
  heightM: 1.9,
  weightKg: 95,
  ability: 'Velo Arena',
  topStat: 'Ataque',
  topStatValue: 130,
});
assert.equal(clues.length, 6);
assert.equal(detective.visibleClueCount('hard', 0), 2);
assert.equal(detective.visibleClueCount('hard', 2), 4);
assert.equal(detective.isCorrectGuess('Garchomp', 'garchomp'), true);
assert.equal(detective.isCorrectGuess('Garchonp', 'garchomp'), false);

console.log('v19 Team Builder + PokéDetective tests: OK');
