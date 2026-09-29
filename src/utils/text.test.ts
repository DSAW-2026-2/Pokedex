import { describe, expect, it } from "vitest";
import type { PokemonSpecies } from "../types/pokemon";
import { compactText, formatGenderRatio, getFlavorEntriesByVersion, normalizeText, titleCase, versionLabel } from "./text";

function species(overrides: Partial<PokemonSpecies> = {}): PokemonSpecies {
  return {
    id: 1,
    name: "test",
    is_baby: false,
    is_legendary: false,
    is_mythical: false,
    has_gender_differences: false,
    gender_rate: 4,
    flavor_text_entries: [],
    genera: [],
    names: [],
    varieties: [],
    ...overrides,
  };
}

describe("text utilities", () => {
  it("normaliza espacios, tildes y apóstrofes", () => {
    expect(compactText("Pika chu")).toBe("pikachu");
    expect(compactText("Flabébé")).toBe("flabebe");
    expect(compactText("Farfetch'd")).toBe("farfetchd");
    expect(compactText("Mr Mime")).toBe("mrmime");
  });

  it("normaliza nombres a slug", () => {
    expect(normalizeText("  Mr  Mime  ")).toBe("mr-mime");
  });

  it("presenta nombres con guiones en formato legible", () => {
    expect(titleCase("zoroark-hisui")).toBe("Zoroark Hisui");
  });

  it("formatea proporciones de género y especies sin género", () => {
    expect(formatGenderRatio(species({ gender_rate: 4 }))).toBe("♂ 50% · ♀ 50%");
    expect(formatGenderRatio(species({ gender_rate: -1 }))).toBe("Sin género");
    expect(formatGenderRatio(species({ gender_rate: 8 }))).toBe("♀ 100%");
  });

  it("muestra los nombres de las versiones principales en castellano", () => {
    expect(versionLabel("red")).toBe("Rojo");
    expect(versionLabel("blue")).toBe("Azul");
    expect(versionLabel("alpha-sapphire")).toBe("Zafiro Alfa");
    expect(versionLabel("scarlet")).toBe("Escarlata");
    expect(versionLabel("violet")).toBe("Púrpura");
  });

  it("usa únicamente entradas de Pokédex en castellano", () => {
    const entries = getFlavorEntriesByVersion(species({
      flavor_text_entries: [
        { flavor_text: "English Red", language: { name: "en", url: "" }, version: { name: "red", url: "" } },
        { flavor_text: "Rojo ES", language: { name: "es", url: "" }, version: { name: "red", url: "" } },
        { flavor_text: "English Blue", language: { name: "en", url: "" }, version: { name: "blue", url: "" } },
      ],
    }));
    expect(entries).toEqual([
      { version: "red", text: "Rojo ES", language: "es" },
    ]);
  });
});
