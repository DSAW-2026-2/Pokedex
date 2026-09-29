import { describe, expect, it } from "vitest";
import {
  compareEvolutionPath,
  compareFormChangesPath,
  comparePokemonPath,
  generationExplorerPath,
  generationDetailPath,
  pokedexPath,
  pokemonCombatPath,
  pokemonOverviewPath,
  pokemonVariantsPath,
  shinyGalleryPath,
} from "./routes";

describe("pokemon routes", () => {
  it("builds an overview route from a pokemon name", () => {
    expect(pokemonOverviewPath("gengar")).toBe("/pokemon/gengar");
  });

  it("builds a variants route from a pokemon name", () => {
    expect(pokemonVariantsPath("zoroark-hisui")).toBe("/pokemon/zoroark-hisui/formas");
  });

  it("builds a combat route", () => {
    expect(pokemonCombatPath("gengar")).toBe("/pokemon/gengar/combate");
  });

  it("builds a comparison route", () => {
    expect(comparePokemonPath("Rillaboom", "Incineroar")).toBe("/comparar/rillaboom/incineroar");
  });

  it("normalizes spaces before writing a route", () => {
    expect(pokemonOverviewPath("Mr Mime")).toBe("/pokemon/mr-mime");
  });

  it("builds exploration routes", () => {
    expect(pokedexPath()).toBe("/pokedex");
    expect(generationExplorerPath()).toBe("/explorar/generaciones");
    expect(generationDetailPath("generation-iii")).toBe("/explorar/generaciones/generation-iii");
    expect(shinyGalleryPath("Eevee")).toBe("/pokemon/eevee/galeria");
  });

  it("builds descriptive comparison routes", () => {
    expect(compareEvolutionPath("eevee", "sylveon")).toBe("/evolucion/eevee/sylveon");
    expect(compareFormChangesPath("ninetales", "ninetales-alola")).toBe("/formas/comparar/ninetales/ninetales-alola");
  });
});
