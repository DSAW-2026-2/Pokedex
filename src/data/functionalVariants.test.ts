import { describe, expect, it } from "vitest";
import { getFunctionalVariantFallbacks } from "./functionalVariants";

describe("catálogo de variantes funcionales", () => {
  it("incluye las variantes funcionales especiales de Pikachu", () => {
    const variants = getFunctionalVariantFallbacks("pikachu");
    expect(variants).toContain("pikachu-rock-star");
    expect(variants).toContain("pikachu-belle");
    expect(variants).toContain("pikachu-original-cap");
    expect(variants).toContain("pikachu-partner");
  });

  it("incluye otros casos funcionales que pueden escapar de species.varieties", () => {
    expect(getFunctionalVariantFallbacks("basculin")).toContain("basculin-white-striped");
    expect(getFunctionalVariantFallbacks("floette")).toContain("floette-eternal");
    expect(getFunctionalVariantFallbacks("genesect")).toContain("genesect-douse");
  });
});
