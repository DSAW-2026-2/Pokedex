function slugifyPokemonName(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[._\s]+/g, "-")
    .replace(/-+/g, "-");
}

export function pokemonOverviewPath(name: string): string {
  return `/pokemon/${encodeURIComponent(slugifyPokemonName(name))}`;
}

export function pokemonVariantsPath(name: string): string {
  return `${pokemonOverviewPath(name)}/formas`;
}

export function pokemonCombatPath(name: string): string {
  return `${pokemonOverviewPath(name)}/combate`;
}

export function comparePokemonPath(a: string, b: string): string {
  return `/comparar/${encodeURIComponent(slugifyPokemonName(a))}/${encodeURIComponent(slugifyPokemonName(b))}`;
}

export function compareEvolutionPath(a: string, b: string): string {
  return `/evolucion/${encodeURIComponent(slugifyPokemonName(a))}/${encodeURIComponent(slugifyPokemonName(b))}`;
}

export function compareFormChangesPath(baseName: string, variantName: string): string {
  return `/formas/comparar/${encodeURIComponent(slugifyPokemonName(baseName))}/${encodeURIComponent(slugifyPokemonName(variantName))}`;
}

export function generationExplorerPath(): string {
  return "/explorar/generaciones";
}

export function shinyGalleryPath(name: string): string {
  return `${pokemonOverviewPath(name)}/galeria`;
}


export function pokedexPath(): string {
  return "/pokedex";
}

export function generationDetailPath(generationName: string): string {
  return `/explorar/generaciones/${encodeURIComponent(generationName.trim().toLowerCase())}`;
}

export function pokemonExplorerPath(): string {
  return "/explorar/pokemon";
}

export function moveDexPath(pokemonName?: string): string {
  const base = "/movimientos";
  return pokemonName ? `${base}?pokemon=${encodeURIComponent(slugifyPokemonName(pokemonName))}` : base;
}

export function moveDetailPath(moveName: string): string {
  return `/movimientos/${encodeURIComponent(slugifyPokemonName(moveName))}`;
}

export function teamBuilderPath(): string {
  return "/team-builder";
}

export function pokeDetectivePath(): string {
  return "/pokedetective";
}
