import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getEvolutionChain, getPokemon, getPokemonBundle } from "../api/pokeApi";
import type { Pokemon } from "../types/pokemon";
import { buildEvolutionPaths } from "../utils/evolution";
import { shinyArtwork, sortTypes, spriteArtwork } from "../utils/pokemon";
import { pokemonVariantsPath } from "../utils/routes";
import { padDex, titleCase, typeLabel } from "../utils/text";
import Header from "./Header";
import LoadingState from "./LoadingState";
import ErrorState from "./ErrorState";
import TypeIcon from "./TypeIcon";

export default function ShinyGalleryPage() {
  const { pokemonName = "" } = useParams();
  const navigate = useNavigate();
  const [pokemon, setPokemon] = useState<Pokemon[]>([]);
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true); setError(""); setPokemon([]);
    getPokemonBundle(pokemonName, controller.signal)
      .then(async (bundle) => {
        if (controller.signal.aborted) return;
        setTitle(titleCase(bundle.species.name));
        const chain = await getEvolutionChain(bundle.species.evolution_chain?.url, controller.signal);
        const names = chain?.chain
          ? [...new Set(buildEvolutionPaths(chain.chain).flat().map((row) => row.name))]
          : [bundle.pokemon.name];
        const settled = await Promise.allSettled(names.map((name) => getPokemon(name, controller.signal)));
        if (controller.signal.aborted) return;
        setPokemon(settled.filter((item): item is PromiseFulfilledResult<Pokemon> => item.status === "fulfilled").map((item) => item.value));
      })
      .catch((reason: unknown) => {
        if (reason instanceof Error && reason.name === "AbortError") return;
        setError(reason instanceof Error ? reason.message : "No fue posible preparar la galería.");
      })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [pokemonName]);

  if (loading) return <div className="app-shell"><Header contextLabel="Galería Normal y Variocolor" version="v19.1" /><LoadingState message="Preparando familia evolutiva..." /></div>;
  if (error) return <div className="app-shell"><Header contextLabel="Galería Normal y Variocolor" version="v19.1" /><ErrorState message={error} /></div>;

  return (
    <div className="app-shell exploration-shell">
      <Header contextLabel="Galería Normal y Variocolor" version="v19.1" />
      <main className="standalone-page shiny-gallery-page">
        <div className="standalone-page-head">
          <div>
            <span>FAMILIA EVOLUTIVA</span>
            <h2>Galería Normal y Variocolor</h2>
            <p>{title ? `${title}: ` : ""}compara cada etapa normal con su versión Variocolor sin alterar las demás.</p>
          </div>
          <button onClick={() => navigate(pokemonVariantsPath(pokemonName))}>Volver a Formas</button>
        </div>

        <div className="shiny-gallery-grid">
          {pokemon.map((entry) => {
            const normal = spriteArtwork(entry);
            const shiny = shinyArtwork(entry);
            return (
              <article className="shiny-gallery-card" key={entry.name}>
                <div className="shiny-gallery-identity">
                  <div><span>{padDex(entry.id)}</span><h3>{titleCase(entry.name)}</h3></div>
                  <div className="mini-types">{sortTypes(entry.types).map((type) => <span key={type.type.name} className={`mini-type type-${type.type.name}`}><TypeIcon type={type.type.name} />{typeLabel(type.type.name)}</span>)}</div>
                </div>
                <div className="shiny-state-grid">
                  <div className="shiny-state-card">
                    <div>{normal ? <img src={normal} alt={`${titleCase(entry.name)} normal`} /> : <span>Sin imagen</span>}</div>
                    <strong>Normal</strong>
                  </div>
                  <div className="shiny-state-card variocolor-state">
                    <div>{shiny ? <img src={shiny} alt={`${titleCase(entry.name)} variocolor`} /> : <span>Variocolor no disponible</span>}</div>
                    <strong>✨ Variocolor</strong>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </main>
    </div>
  );
}
