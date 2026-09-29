import { describe, expect, it } from "vitest";
import type { Pokemon } from "../types/pokemon";
import {
  findSimilarCompetitivePresets,
  getCompetitivePreset,
  suggestCompetitiveSet,
} from "./competitiveSets";

function pokemonFixture(overrides: Partial<Pokemon> = {}): Pokemon {
  return {
    id: 445,
    name: "garchomp",
    height: 19,
    weight: 950,
    abilities: [{ is_hidden: false, slot: 1, ability: { name: "sand-veil", url: "" } }],
    forms: [],
    species: { name: "garchomp", url: "" },
    sprites: {},
    stats: [
      { base_stat: 108, effort: 0, stat: { name: "hp", url: "" } },
      { base_stat: 130, effort: 0, stat: { name: "attack", url: "" } },
      { base_stat: 95, effort: 0, stat: { name: "defense", url: "" } },
      { base_stat: 80, effort: 0, stat: { name: "special-attack", url: "" } },
      { base_stat: 85, effort: 0, stat: { name: "special-defense", url: "" } },
      { base_stat: 102, effort: 0, stat: { name: "speed", url: "" } },
    ],
    types: [
      { slot: 1, type: { name: "dragon", url: "" } },
      { slot: 2, type: { name: "ground", url: "" } },
    ],
    moves: [
      { move: { name: "protect", url: "" }, version_group_details: [] },
      { move: { name: "earthquake", url: "" }, version_group_details: [] },
      { move: { name: "dragon-claw", url: "" }, version_group_details: [] },
      { move: { name: "rock-slide", url: "" }, version_group_details: [] },
      { move: { name: "swords-dance", url: "" }, version_group_details: [] },
    ],
    ...overrides,
  };
}

describe("competitive presets", () => {
  it("returns curated presets with an explicit curated source", () => {
    expect(getCompetitivePreset("rillaboom")?.source).toBe("curated");
    expect(getCompetitivePreset("incineroar")?.ability).toBe("Intimidación");
  });

  it("returns undefined for Pokémon without a curated preset", () => {
    expect(getCompetitivePreset("gengar")).toBeUndefined();
  });

  it("suggests competitive presets with shared role tags", () => {
    const suggestions = findSimilarCompetitivePresets("rillaboom");
    expect(suggestions[0]?.name).toBe("incineroar");
    expect(suggestions[0]?.sharedTags).toContain("pivot");
    expect(suggestions[0]?.sharedTags).toContain("control-turno");
  });

  it("generates a four-move physical suggestion from real learnable move names", () => {
    const suggestion = suggestCompetitiveSet(pokemonFixture());
    expect(suggestion.source).toBe("suggested");
    expect(suggestion.role).toContain("físico");
    expect(suggestion.moves).toHaveLength(4);
    expect(suggestion.moves).toContain("Terremoto");
    expect(suggestion.moves).toContain("Garra Dragón");
  });

  it("still produces four move slots when the learnset is sparse", () => {
    const suggestion = suggestCompetitiveSet(pokemonFixture({
      moves: [{ move: { name: "tackle", url: "" }, version_group_details: [] }],
    }));
    expect(suggestion.moves).toHaveLength(4);
    expect(suggestion.moves[0]).toBe("Placaje");
  });
});
