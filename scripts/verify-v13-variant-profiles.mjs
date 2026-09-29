import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { createRequire } from 'node:module';

const root = new URL('..', import.meta.url).pathname;
const outDir = '/tmp/pokecheck-v13-logic';
rmSync(outDir, { recursive: true, force: true });
execFileSync('tsc', [
  join(root, 'src/types/pokemon.ts'),
  join(root, 'src/utils/text.ts'),
  join(root, 'src/utils/pokemon.ts'),
  '--module', 'commonjs',
  '--target', 'es2022',
  '--moduleResolution', 'node',
  '--skipLibCheck',
  '--outDir', outDir,
], { stdio: 'inherit' });

const require = createRequire(import.meta.url);
const pokemonUtils = require(join(outDir, 'utils/pokemon.js'));

function makePokemon(name, abilities, stats = [50, 50, 50, 50, 50, 50], types = ['normal'], id = 1) {
  return {
    id,
    name,
    height: 10,
    weight: 10,
    abilities: abilities.map((ability, index) => ({ is_hidden: false, slot: index + 1, ability: { name: ability, url: '' } })),
    forms: [],
    species: { name: name.split('-')[0], url: 'https://pokeapi.co/api/v2/pokemon-species/1/' },
    sprites: {},
    stats: stats.map((base_stat, index) => ({ base_stat, effort: 0, stat: { name: String(index), url: '' } })),
    types: types.map((type, index) => ({ slot: index + 1, type: { name: type, url: '' } })),
  };
}

assert.equal(typeof pokemonUtils.hasAbilityChange, 'function', 'v13 debe detectar cambios de habilidad entre forma base y variante');
const base = makePokemon('testmon', ['pressure'], undefined, ['normal'], 10);
const abilityVariant = makePokemon('testmon-special', ['levitate'], undefined, ['normal'], 10010);
assert.equal(pokemonUtils.hasAbilityChange(base, abilityVariant), true);
assert.equal(pokemonUtils.isMeaningfulVariant(base, abilityVariant), true, 'una forma con habilidad distinta merece ficha propia');

const variantsSource = readFileSync(join(root, 'src/components/VariantsPanel.tsx'), 'utf8');
assert.match(variantsSource, /Ver ficha/, 'las tarjetas relevantes deben ofrecer Ver ficha');
assert.match(variantsSource, /Comparar/, 'las tarjetas relevantes deben ofrecer Comparar');
assert.match(variantsSource, /onCompareVariant/, 'VariantsPanel debe exponer acción de comparación');

const overviewSource = readFileSync(join(root, 'src/components/OverviewPanel.tsx'), 'utf8');
assert.match(overviewSource, /variant-profile-banner/, 'la ficha propia de una forma debe explicar su relación con la forma base');
assert.match(overviewSource, /Ver forma base/, 'la ficha propia debe permitir volver a la forma base');
assert.match(overviewSource, /Comparar con la base/, 'la ficha propia debe permitir comparar contra la forma base');

console.log('v13 variant profile checks: PASS');
