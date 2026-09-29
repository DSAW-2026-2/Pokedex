import { describe, expect, it, vi } from "vitest";
import { filterTypeResultsBySpecial } from "./pokeApi";

function pokemonResponse(name: string, speciesName: string, speciesId: number) {
  return {
    ok: true,
    status: 200,
    json: async () => ({
      id: 10000,
      name,
      height: 1,
      weight: 1,
      abilities: [],
      forms: [],
      stats: [],
      types: [],
      sprites: {},
      species: { name: speciesName, url: `https://pokeapi.co/api/v2/pokemon-species/${speciesId}/` },
    }),
  } as Response;
}

describe("combined type + rarity filtering", () => {
  it("mantiene una forma regional legendaria aunque su pokemon ID sea alto", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(pokemonResponse("articuno-galar", "articuno", 144));
    const result = await filterTypeResultsBySpecial(
      [{ id: 10169, name: "articuno-galar", isVariant: true }],
      "legendary",
    );
    expect(result).toHaveLength(1);
    expect(result[0].speciesId).toBe(144);
    fetchMock.mockRestore();
  });
});
