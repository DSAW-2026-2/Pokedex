import { describe, expect, it } from "vitest";
import type { SearchIndexItem } from "../types/pokemon";
import { getComparisonSuggestions, resolveComparisonName } from "./comparisonSearch";

const index: SearchIndexItem[] = [
  { id: 727, name: "incineroar", url: "pokemon/727", kind: "species", isVariant: false },
  { id: 812, name: "rillaboom", url: "pokemon/812", kind: "species", isVariant: false },
  { id: 392, name: "infernape", url: "pokemon/392", kind: "species", isVariant: false },
];

describe("comparison search", () => {
  it("suggests Pokémon while the user types a partial name", () => {
    expect(getComparisonSuggestions("inci", index)[0]?.name).toBe("incineroar");
  });

  it("accepts a close misspelling instead of requiring an exact name", () => {
    expect(resolveComparisonName("inceneroar", index).name).toBe("incineroar");
  });

  it("returns suggestions when no safe automatic correction exists", () => {
    const result = resolveComparisonName("infer", index);
    expect(result.suggestions.some((item) => item.name === "infernape")).toBe(true);
  });

  it("accepts a Pokédex number and resolves it to a route-safe name", () => {
    expect(resolveComparisonName("#727", index).name).toBe("incineroar");
  });
});
