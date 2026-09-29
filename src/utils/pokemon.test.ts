import { describe, expect, it } from "vitest";
import type { Pokemon, PokemonSpecies } from "../types/pokemon";
import { evolutionArtworkForMode, evolutionShinyArtwork, getOriginRegion, getVariantContext, hasAbilityChange, hasMovePoolChange, hasTypeChange, isMeaningfulVariant } from "./pokemon";

function makePokemon(name: string, types: string[], stats: number[] = [50, 50, 50, 50, 50, 50], id = 1): Pokemon {
  return {
    id,
    name,
    height: 10,
    weight: 10,
    abilities: [],
    forms: [],
    species: { name: name.split("-")[0], url: "https://pokeapi.co/api/v2/pokemon-species/1/" },
    sprites: {},
    stats: stats.map((base_stat, index) => ({ base_stat, effort: 0, stat: { name: String(index), url: "" } })),
    types: types.map((type, index) => ({ slot: index + 1, type: { name: type, url: "" } })),
  };
}

function makeSpecies(generation = "generation-i"): PokemonSpecies {
  return {
    id: 1,
    name: "test",
    is_baby: false,
    is_legendary: false,
    is_mythical: false,
    has_gender_differences: false,
    generation: { name: generation, url: "" },
    flavor_text_entries: [],
    genera: [],
    names: [],
    varieties: [],
  };
}

describe("presentación PokéCheck", () => {
  it("determina la región de origen y respeta formas regionales", () => {
    expect(getOriginRegion(makeSpecies("generation-i"), "gengar")).toBe("Kanto");
    expect(getOriginRegion(makeSpecies("generation-v"), "zoroark-hisui")).toBe("Hisui");
    expect(getOriginRegion(makeSpecies("generation-i"), "raichu-alola")).toBe("Alola");
    expect(getOriginRegion(makeSpecies("generation-i"), "tauros-paldea-aqua-breed")).toBe("Paldea");
  });

  it("marca el cambio de tipo entre una forma base y una variante", () => {
    expect(hasTypeChange(makePokemon("zoroark", ["normal"]), makePokemon("zoroark-hisui", ["normal", "ghost"], undefined, 10238))).toBe(true);
    expect(hasTypeChange(makePokemon("gengar", ["ghost", "poison"]), makePokemon("gengar-mega", ["ghost", "poison"], undefined, 10038))).toBe(false);
  });

  it("detecta cambios de habilidad y los considera relevantes", () => {
    const base = makePokemon("testmon", ["normal"], undefined, 10);
    base.abilities = [{ is_hidden: false, slot: 1, ability: { name: "pressure", url: "" } }];
    const variant = makePokemon("testmon-special", ["normal"], undefined, 10010);
    variant.abilities = [{ is_hidden: false, slot: 1, ability: { name: "levitate", url: "" } }];
    expect(hasAbilityChange(base, variant)).toBe(true);
    expect(isMeaningfulVariant(base, variant)).toBe(true);
  });

  it("filtra variantes cosméticas y conserva variantes relevantes", () => {
    const pikachu = makePokemon("pikachu", ["electric"], [35, 55, 40, 50, 50, 90], 25);
    const cap = makePokemon("pikachu-original-cap", ["electric"], [35, 55, 40, 50, 50, 90], 10080);
    const gengar = makePokemon("gengar", ["ghost", "poison"], [60, 65, 60, 130, 75, 110], 94);
    const mega = makePokemon("gengar-mega", ["ghost", "poison"], [60, 65, 80, 170, 95, 130], 10038);
    expect(isMeaningfulVariant(pikachu, cap)).toBe(true);
    expect(isMeaningfulVariant(gengar, mega)).toBe(true);
  });

  it("considera relevante una forma con movepool distinto", () => {
    const base = makePokemon("testmon", ["normal"], undefined, 20);
    base.moves = [{ move: { name: "tackle", url: "" }, version_group_details: [] }];
    const variant = makePokemon("testmon-special", ["normal"], undefined, 10020);
    variant.moves = [
      { move: { name: "tackle", url: "" }, version_group_details: [] },
      { move: { name: "surf", url: "" }, version_group_details: [] },
    ];
    expect(hasMovePoolChange(base, variant)).toBe(true);
    expect(isMeaningfulVariant(base, variant)).toBe(true);
  });

  it("describe el contexto de la forma", () => {
    expect(getVariantContext("zoroark-hisui")).toBe("Forma regional · Hisui");
    expect(getVariantContext("gengar-mega")).toBe("Mega Evolución");
    expect(getVariantContext("gengar-gmax")).toBe("Gigamax · Galar");
  });
  it("usa el variocolor propio de cada evolución y no sustituye con la imagen normal", () => {
    const sylveon = makePokemon("sylveon", ["fairy"], undefined, 700);
    sylveon.sprites = {
      front_default: "sylveon-normal.png",
      front_shiny: "sylveon-shiny.png",
      other: {
        "official-artwork": { front_default: "sylveon-art.png", front_shiny: "sylveon-art-shiny.png" },
      },
    };
    expect(evolutionShinyArtwork(sylveon)).toEqual({ url: "sylveon-art-shiny.png", available: true });

    const missing = makePokemon("missing", ["normal"], undefined, 9999);
    missing.sprites = { front_default: "normal-only.png" };
    expect(evolutionShinyArtwork(missing)).toEqual({ url: "", available: false });
  });

  it("muestra normal por defecto y permite variocolor por evolución", () => {
    const umbreon = makePokemon("umbreon", ["dark"], undefined, 197);
    umbreon.sprites = {
      front_default: "umbreon-normal.png",
      front_shiny: "umbreon-shiny.png",
      other: {
        "official-artwork": { front_default: "umbreon-art.png", front_shiny: "umbreon-art-shiny.png" },
      },
    };

    expect(evolutionArtworkForMode(umbreon, false)).toEqual({ url: "umbreon-art.png", available: true, shiny: false });
    expect(evolutionArtworkForMode(umbreon, true)).toEqual({ url: "umbreon-art-shiny.png", available: true, shiny: true });
  });

});
