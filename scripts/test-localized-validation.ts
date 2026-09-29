import assert from 'node:assert/strict';
import type { NamedAPIResource, Pokemon } from '../src/types/pokemon.ts';
import { resolveAbilityKey, resolveItemKey, resolveMoveKey, validateMoveForVersion } from '../src/utils/setValidation.ts';

const pokemon: Pokemon = {
  id: 6,
  name: 'charizard',
  height: 17,
  weight: 905,
  abilities: [
    { is_hidden: false, slot: 1, ability: { name: 'blaze', url: '' } },
    { is_hidden: true, slot: 3, ability: { name: 'solar-power', url: '' } },
  ],
  forms: [],
  species: { name: 'charizard', url: '' },
  sprites: {},
  stats: [],
  types: [],
  moves: [
    {
      move: { name: 'solar-beam', url: '' },
      version_group_details: [{ version_group: { name: 'scarlet-violet', url: '' } }],
    },
  ],
};

const abilityLabels = { 'solar-power': 'Poder Solar', blaze: 'Mar Llamas' };
const moveLabels = { 'solar-beam': 'Rayo Solar' };
const items: NamedAPIResource[] = [{ name: 'light-clay', url: '' }];
const itemLabels = { 'light-clay': 'Refleluz' };

assert.equal(resolveAbilityKey(pokemon, 'Poder Solar', abilityLabels), 'solar-power');
assert.equal(resolveMoveKey(pokemon, 'Rayo Solar', moveLabels), 'solar-beam');
assert.equal(validateMoveForVersion(pokemon, 'Rayo Solar', 'scarlet-violet', moveLabels), true);
assert.equal(resolveItemKey(items, 'Refleluz', itemLabels), 'light-clay');

console.log('OK: la validación acepta etiquetas españolas localizadas.');
