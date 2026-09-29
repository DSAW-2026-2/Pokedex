import assert from 'node:assert/strict';
import { getLocalBattleForms, mergeBattleFormOptions, applyLocalBattleForm } from '../src/data/battleForms.ts';

const mega = getLocalBattleForms('staraptor').find((form) => form.id === 'staraptor-mega');
assert.ok(mega, 'Staraptor debe ofrecer Mega-Staraptor como forma competitiva local.');
assert.deepEqual(mega.types, ['fighting', 'flying']);
assert.equal(mega.ability, 'contrary');
assert.equal(mega.stats.attack, 140);
assert.equal(mega.stats.speed, 110);

const options = mergeBattleFormOptions(
  'staraptor',
  [{ is_default: true, pokemon: { name: 'staraptor', url: 'https://pokeapi.co/api/v2/pokemon/398/' } }],
);
assert.equal(options[0].id, 'staraptor');
assert.ok(options.some((option) => option.id === 'staraptor-mega'));

const basePokemon = {
  id: 398,
  name: 'staraptor',
  height: 12,
  weight: 249,
  abilities: [{ is_hidden: false, slot: 1, ability: { name: 'intimidate', url: '' } }],
  forms: [],
  species: { name: 'staraptor', url: '' },
  sprites: { front_default: null },
  stats: [
    { base_stat: 85, effort: 0, stat: { name: 'hp', url: '' } },
    { base_stat: 120, effort: 0, stat: { name: 'attack', url: '' } },
    { base_stat: 70, effort: 0, stat: { name: 'defense', url: '' } },
    { base_stat: 50, effort: 0, stat: { name: 'special-attack', url: '' } },
    { base_stat: 60, effort: 0, stat: { name: 'special-defense', url: '' } },
    { base_stat: 100, effort: 0, stat: { name: 'speed', url: '' } },
  ],
  types: [
    { slot: 1, type: { name: 'normal', url: '' } },
    { slot: 2, type: { name: 'flying', url: '' } },
  ],
};
const transformed = applyLocalBattleForm(basePokemon, mega);
assert.equal(transformed.name, 'staraptor-mega');
assert.deepEqual(transformed.types.map((entry) => entry.type.name), ['fighting', 'flying']);
assert.equal(transformed.stats.find((entry) => entry.stat.name === 'attack')?.base_stat, 140);
assert.equal(transformed.abilities[0].ability.name, 'contrary');

console.log('v19.1 Team Builder forms tests: OK');
