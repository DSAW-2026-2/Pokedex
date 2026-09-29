import { getFunctionalVariantFallbacks } from "../src/data/functionalVariants";

function assert(condition: unknown, message: string) {
  if (!condition) throw new Error(message);
}

const pikachu = getFunctionalVariantFallbacks("pikachu");
assert(pikachu.includes("pikachu-rock-star"), "Pikachu Coqueta Rock Star debe incluirse");
assert(pikachu.includes("pikachu-belle"), "Pikachu Coqueta Belle debe incluirse");
assert(pikachu.includes("pikachu-original-cap"), "Pikachu con gorra debe incluirse");
assert(pikachu.includes("pikachu-partner"), "Pikachu compañero debe incluirse");
assert(getFunctionalVariantFallbacks("basculin").includes("basculin-white-striped"), "Basculin raya blanca debe incluirse");
assert(getFunctionalVariantFallbacks("floette").includes("floette-eternal"), "Floette Flor Eterna debe incluirse");
assert(getFunctionalVariantFallbacks("tatsugiri").includes("tatsugiri-droopy"), "Tatsugiri Droopy debe incluirse");
assert(getFunctionalVariantFallbacks("genesect").includes("genesect-douse"), "Genesect con ROM debe incluirse cuando PokéAPI lo exponga como Pokémon");
console.log("PASS v14 functional variant fallbacks");
