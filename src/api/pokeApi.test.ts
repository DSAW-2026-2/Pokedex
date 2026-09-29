import { describe, expect, it, vi } from "vitest";
import { getVarietyDetails } from "./pokeApi";
import type { PokemonSpecies } from "../types/pokemon";

describe("variedades", () => {
  it("usa species.varieties y no confunde Porygon-Z con una forma de Porygon", async () => {
    const species = {
      id: 137,
      name: "porygon",
      varieties: [
        { is_default: true, pokemon: { name: "porygon", url: "https://pokeapi.co/api/v2/pokemon/137/" } },
      ],
    } as PokemonSpecies;

    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        id: 137,
        name: "porygon",
        species: { name: "porygon", url: "https://pokeapi.co/api/v2/pokemon-species/137/" },
        abilities: [], forms: [], height: 8, weight: 365, stats: [], types: [], sprites: {},
      }),
    } as Response);

    const varieties = await getVarietyDetails(species);
    expect(varieties.map((item) => item.name)).toEqual(["porygon"]);
    expect(varieties.map((item) => item.name)).not.toContain("porygon-z");
    fetchMock.mockRestore();
  });
});
