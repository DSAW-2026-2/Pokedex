import { describe, expect, it } from "vitest";
import { acceptableTypo, isDexNumber, levenshtein, parseDexNumber, resolveSearchQuery } from "./search";
import type { SearchIndexItem } from "../types/pokemon";

const index: SearchIndexItem[] = [
  { id: 25, name: "pikachu", url: "pokemon-species/25", kind: "species", isVariant: false },
  { id: 10170, name: "zoroark-hisui", url: "pokemon/10170", kind: "pokemon", isVariant: true },
];

describe("search utilities", () => {
  it("calcula distancia Levenshtein", () => {
    expect(levenshtein("Picachu", "Pikachu")).toBe(1);
  });

  it("acepta los formatos numéricos del proyecto original", () => {
    expect(isDexNumber("# 25")).toBe(true);
    expect(isDexNumber("2 5")).toBe(true);
    expect(parseDexNumber("# 25")).toBe(25);
  });

  it("resuelve coincidencia exacta ignorando espacios", () => {
    expect(resolveSearchQuery("Pika chu", index).identifier).toBe("pikachu");
  });

  it("propone un typo seguro sin redirigir automáticamente", () => {
    const result = resolveSearchQuery("Picachu", index);
    expect(result.identifier).toBeNull();
    expect(result.correction).toBe("pikachu");
    expect(result.suggestions[0]?.name).toBe("pikachu");
  });

  it("reconoce una coincidencia fuzzy aceptable", () => {
    expect(acceptableTypo("Picachu", { ...index[0], distance: 1, score: 0.86 })).toBe(true);
  });
});
