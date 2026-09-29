/**
 * Variantes funcionales que PokéAPI no siempre devuelve de forma consistente
 * dentro de species.varieties. Se usan como candidatos extra y se consultan
 * por /pokemon; si un nombre no existe en PokéAPI, simplemente se descarta.
 */
const FUNCTIONAL_VARIANT_FALLBACKS: Record<string, string[]> = {
  pikachu: [
    "pikachu-cosplay",
    "pikachu-rock-star",
    "pikachu-belle",
    "pikachu-pop-star",
    "pikachu-phd",
    "pikachu-libre",
    "pikachu-original-cap",
    "pikachu-hoenn-cap",
    "pikachu-sinnoh-cap",
    "pikachu-unova-cap",
    "pikachu-kalos-cap",
    "pikachu-alola-cap",
    "pikachu-partner-cap",
    "pikachu-world-cap",
    "pikachu-partner",
  ],
  eevee: ["eevee-partner"],
  pichu: ["pichu-spiky-eared"],
  floette: ["floette-eternal"],
  tatsugiri: ["tatsugiri-curly", "tatsugiri-droopy", "tatsugiri-stretchy"],
  squawkabilly: [
    "squawkabilly-green-plumage",
    "squawkabilly-blue-plumage",
    "squawkabilly-yellow-plumage",
    "squawkabilly-white-plumage",
  ],
  sinistea: ["sinistea-antique"],
  polteageist: ["polteageist-antique"],
  poltchageist: ["poltchageist-artisan"],
  sinistcha: ["sinistcha-masterpiece"],
  basculin: ["basculin-white-striped"],
  toxtricity: ["toxtricity-amped", "toxtricity-low-key"],
  genesect: ["genesect-douse", "genesect-shock", "genesect-burn", "genesect-chill"],
  meowstic: ["meowstic-male", "meowstic-female"],
  indeedee: ["indeedee-male", "indeedee-female"],
  oinkologne: ["oinkologne-male", "oinkologne-female"],
  basculegion: ["basculegion-male", "basculegion-female"],
  pumpkaboo: ["pumpkaboo-small", "pumpkaboo-average", "pumpkaboo-large", "pumpkaboo-super"],
  gourgeist: ["gourgeist-small", "gourgeist-average", "gourgeist-large", "gourgeist-super"],
  morpeko: ["morpeko-full-belly", "morpeko-hangry"],
  minior: [
    "minior-red-meteor", "minior-orange-meteor", "minior-yellow-meteor", "minior-green-meteor",
    "minior-blue-meteor", "minior-indigo-meteor", "minior-violet-meteor",
    "minior-red", "minior-orange", "minior-yellow", "minior-green", "minior-blue", "minior-indigo", "minior-violet",
  ],
  castform: ["castform-sunny", "castform-rainy", "castform-snowy"],
  cherrim: ["cherrim-overcast", "cherrim-sunshine"],
  cramorant: ["cramorant-gulping", "cramorant-gorging"],
  eiscue: ["eiscue-ice", "eiscue-noice"],
};

export function getFunctionalVariantFallbacks(speciesName: string): string[] {
  return [...(FUNCTIONAL_VARIANT_FALLBACKS[speciesName.trim().toLowerCase()] || [])];
}
