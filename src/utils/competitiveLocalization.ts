import { API_BASE, getLocalizedResourceName } from "../api/pokeApi";
import type { CompetitiveSet } from "../data/competitiveSets";
import type { NamedAPIResource, Pokemon } from "../types/pokemon";

export async function localizeCompetitiveSet(
  pokemon: Pokemon,
  set: CompetitiveSet,
  signal?: AbortSignal,
): Promise<CompetitiveSet> {
  const abilityResource = set.abilityKey
    ? pokemon.abilities.find((entry) => entry.ability.name === set.abilityKey)?.ability
    : undefined;

  const moveResources = (set.moveKeys || []).map((key) =>
    pokemon.moves?.find((entry) => entry.move.name === key)?.move,
  );

  const itemResource: NamedAPIResource | undefined = set.itemKey
    ? { name: set.itemKey, url: `${API_BASE}/item/${encodeURIComponent(set.itemKey)}/` }
    : undefined;

  const [ability, item, moveResults] = await Promise.all([
    abilityResource ? getLocalizedResourceName(abilityResource, "ability", signal) : Promise.resolve(set.ability),
    itemResource ? getLocalizedResourceName(itemResource, "generic", signal) : Promise.resolve(set.item),
    Promise.all(
      moveResources.map(async (resource, index) =>
        resource ? getLocalizedResourceName(resource, "move", signal) : set.moves[index],
      ),
    ),
  ]);

  const moves = [...moveResults];
  while (moves.length < set.moves.length) moves.push(set.moves[moves.length]);

  return { ...set, ability, item, moves };
}
