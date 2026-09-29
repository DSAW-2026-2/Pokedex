import { describe, expect, it } from "vitest";
import type { EvolutionNode } from "../types/pokemon";
import { buildEvolutionPaths, describeEvolution, flattenEvolution } from "./evolution";

describe("describeEvolution", () => {
  it("describes a level requirement", () => {
    expect(describeEvolution({ min_level: 25, trigger: { name: "level-up", url: "" } })).toBe("Nivel 25");
  });

  it("describes a trade requirement", () => {
    expect(describeEvolution({ trigger: { name: "trade", url: "" } })).toBe("Intercambio");
  });

  it("describes item evolution in readable Spanish", () => {
    expect(describeEvolution({ item: { name: "fire-stone", url: "" }, trigger: { name: "use-item", url: "" } })).toBe("Usar Fire Stone");
  });
});

describe("flattenEvolution", () => {
  it("keeps parent relationships for a simple chain", () => {
    const chain: EvolutionNode = {
      species: { name: "gastly", url: "https://pokeapi.co/api/v2/pokemon-species/92/" },
      evolution_details: [],
      evolves_to: [{
        species: { name: "haunter", url: "https://pokeapi.co/api/v2/pokemon-species/93/" },
        evolution_details: [{ min_level: 25 }],
        evolves_to: [{
          species: { name: "gengar", url: "https://pokeapi.co/api/v2/pokemon-species/94/" },
          evolution_details: [{ trigger: { name: "trade", url: "" } }],
          evolves_to: [],
        }],
      }],
    };

    expect(flattenEvolution(chain)).toEqual([
      expect.objectContaining({ id: 92, name: "gastly", parent: null }),
      expect.objectContaining({ id: 93, name: "haunter", parent: "gastly" }),
      expect.objectContaining({ id: 94, name: "gengar", parent: "haunter" }),
    ]);
  });
});


describe("buildEvolutionPaths", () => {
  it("keeps branching evolutions as separate valid paths", () => {
    const chain: EvolutionNode = {
      species: { name: "eevee", url: "https://pokeapi.co/api/v2/pokemon-species/133/" },
      evolution_details: [],
      evolves_to: [
        { species: { name: "vaporeon", url: "https://pokeapi.co/api/v2/pokemon-species/134/" }, evolution_details: [{ item: { name: "water-stone", url: "" } }], evolves_to: [] },
        { species: { name: "jolteon", url: "https://pokeapi.co/api/v2/pokemon-species/135/" }, evolution_details: [{ item: { name: "thunder-stone", url: "" } }], evolves_to: [] },
      ],
    };

    expect(buildEvolutionPaths(chain).map((path) => path.map((row) => row.name))).toEqual([
      ["eevee", "vaporeon"],
      ["eevee", "jolteon"],
    ]);
  });
});
