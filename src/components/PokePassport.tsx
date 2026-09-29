import type { PokemonBundle } from "../types/pokemon";
import { getOriginRegion, getVariantContext } from "../utils/pokemon";
import { generationRoman, titleCase } from "../utils/text";

interface PokePassportProps {
  bundle: PokemonBundle;
}

const DEBUT_GAMES: Record<string, string> = {
  "generation-i": "Rojo / Verde",
  "generation-ii": "Oro / Plata",
  "generation-iii": "Rubí / Zafiro",
  "generation-iv": "Diamante / Perla",
  "generation-v": "Negro / Blanco",
  "generation-vi": "X / Y",
  "generation-vii": "Sol / Luna",
  "generation-viii": "Espada / Escudo",
  "generation-ix": "Escarlata / Púrpura",
};


function debutGenerationForPokemon(bundle: PokemonBundle): string {
  const name = bundle.pokemon.name;
  if (name.includes("-mega") || name.includes("-primal") || name.includes("-cosplay") || name.includes("-rock-star") || name.includes("-belle") || name.includes("-pop-star") || name.includes("-phd") || name.includes("-libre") || name.includes("-eternal")) return "generation-vi";
  if (name.includes("-alola") || name.includes("-cap") || name.includes("-partner")) return "generation-vii";
  if (name.includes("-galar") || name.includes("-hisui") || name.includes("-gmax") || name.includes("-white-striped") || name.includes("-low-key")) return "generation-viii";
  if (name.includes("-paldea") || name.includes("-bloodmoon")) return "generation-ix";
  if (name.includes("-spiky-eared")) return "generation-iv";
  return bundle.species.generation?.name || "";
}

function debutGameForPokemon(bundle: PokemonBundle, generation: string): string {
  const name = bundle.pokemon.name;
  if (name.includes("-hisui") || name.includes("-white-striped")) return "Leyendas Pokémon: Arceus";
  if (name.includes("-partner")) return "Let's Go, Pikachu! / Let's Go, Eevee!";
  if (["-cosplay", "-rock-star", "-belle", "-pop-star", "-phd", "-libre"].some((marker) => name.includes(marker))) return "Rubí Omega / Zafiro Alfa";
  if (name.includes("-spiky-eared")) return "HeartGold / SoulSilver";
  return DEBUT_GAMES[generation] || "Sin datos";
}

function associatedRegions(bundle: PokemonBundle): string[] {
  const values = new Set<string>([getOriginRegion(bundle.species, bundle.pokemon.name)]);
  for (const variety of bundle.species.varieties || []) {
    const name = variety.pokemon.name;
    if (name.includes("-alola")) values.add("Alola");
    if (name.includes("-galar")) values.add("Galar");
    if (name.includes("-hisui")) values.add("Hisui");
    if (name.includes("-paldea")) values.add("Paldea");
    if (name.includes("-mega") || name.includes("-primal")) values.add("Kalos");
    if (name.includes("-gmax")) values.add("Galar");
  }
  return [...values];
}

export default function PokePassport({ bundle }: PokePassportProps) {
  const generation = debutGenerationForPokemon(bundle);
  const variants = (bundle.species.varieties || []).filter((entry) => !entry.is_default);
  const region = getOriginRegion(bundle.species, bundle.pokemon.name);

  return (
    <section className="poke-passport" aria-labelledby="poke-passport-title">
      <div className="passport-stamp" aria-hidden="true">PC</div>
      <div className="passport-heading">
        <span>REGISTRO DE ESPECIE</span>
        <h3 id="poke-passport-title">PokéPassport</h3>
        <p>Una vista rápida de procedencia, debut y variantes conocidas.</p>
      </div>
      <div className="passport-grid">
        <article><span>Región de origen</span><strong>{region}</strong></article>
        <article><span>Generación de debut</span><strong>{generationRoman(generation)}</strong></article>
        <article><span>Juego de debut</span><strong>{debutGameForPokemon(bundle, generation)}</strong></article>
        <article><span>Regiones asociadas</span><strong>{associatedRegions(bundle).join(" · ")}</strong></article>
      </div>
      <div className="passport-variants">
        <span>Variantes conocidas</span>
        {variants.length ? (
          <div>
            {variants.slice(0, 8).map((entry) => (
              <span key={entry.pokemon.name} title={getVariantContext(entry.pokemon.name)}>{titleCase(entry.pokemon.name)}</span>
            ))}
            {variants.length > 8 && <span>+{variants.length - 8} más</span>}
          </div>
        ) : <strong>Sin variantes registradas</strong>}
      </div>
    </section>
  );
}
