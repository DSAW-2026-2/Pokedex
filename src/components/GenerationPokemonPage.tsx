import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getGeneration } from "../api/pokeApi";
import { GENERATION_CARDS, getGenerationDexRange } from "../data/generations";
import type { NamedAPIResource, PokemonGeneration } from "../types/pokemon";
import { generationExplorerPath, pokemonOverviewPath } from "../utils/routes";
import { padDex, titleCase } from "../utils/text";
import Header from "./Header";
import LoadingState from "./LoadingState";

function speciesId(resource: NamedAPIResource): number {
  const match = resource.url.match(/\/pokemon-species\/(\d+)\/?$/);
  return match ? Number(match[1]) : 0;
}

function spriteFor(id: number): string {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;
}

export default function GenerationPokemonPage() {
  const { generationName = "" } = useParams<{ generationName: string }>();
  const navigate = useNavigate();
  const card = GENERATION_CARDS.find((item) => item.apiName === generationName);
  const [data, setData] = useState<PokemonGeneration | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError("");
    setData(null);

    if (!card) {
      setLoading(false);
      setError("No encontramos esa generación.");
      return () => controller.abort();
    }

    getGeneration(card.apiName, controller.signal)
      .then((generation) => {
        if (!controller.signal.aborted) setData(generation);
      })
      .catch((reason) => {
        if (!controller.signal.aborted) setError(reason instanceof Error ? reason.message : "No fue posible cargar la generación.");
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [card?.apiName]);

  const pokemon = useMemo(() => {
    const rows = [...(data?.pokemon_species || [])]
      .map((species) => ({ species, id: speciesId(species) }))
      .filter((item) => item.id > 0)
      .sort((a, b) => a.id - b.id);

    const needle = filter.trim().toLowerCase().replace(/^#/, "");
    if (!needle) return rows;
    return rows.filter(({ species, id }) => species.name.includes(needle) || String(id).includes(needle));
  }, [data, filter]);

  const range = card ? getGenerationDexRange(card.id) : null;

  return (
    <div className="exploration-shell">
      <Header contextLabel="Explorar por generación" version="v19.1" />
      <main className="standalone-page generation-list-page">
        <header className="standalone-page-head generation-list-head">
          <div>
            <span>POKÉDEX POR GENERACIÓN</span>
            <h2>{card ? `${card.region} · Generación ${card.roman}` : "Generación"}</h2>
            <p>
              {card && range
                ? `${data?.pokemon_species.length ?? "…"} Pokémon introducidos · Pokédex ${range.label}`
                : "Explora las especies introducidas en esta generación."}
            </p>
          </div>
          <button type="button" onClick={() => navigate(generationExplorerPath())}>← Volver a generaciones</button>
        </header>

        {loading ? (
          <LoadingState message="Cargando Pokémon de la generación..." />
        ) : error ? (
          <section className="generation-list-error">
            <h3>No pudimos abrir esta generación</h3>
            <p>{error}</p>
            <button type="button" onClick={() => navigate(generationExplorerPath())}>Ver generaciones</button>
          </section>
        ) : (
          <>
            <section className="generation-list-toolbar">
              <div>
                <strong>{pokemon.length}</strong>
                <span>{filter.trim() ? "resultados" : "Pokémon"}</span>
              </div>
              <label>
                <span className="sr-only">Filtrar Pokémon de esta generación</span>
                <input
                  type="search"
                  value={filter}
                  onChange={(event) => setFilter(event.target.value.toLowerCase())}
                  placeholder="Filtrar por nombre o número..."
                />
              </label>
            </section>

            <section className="generation-pokemon-grid" aria-label={`Pokémon de ${card?.region || "la generación"}`}>
              {pokemon.map(({ species, id }) => (
                <article className="generation-pokemon-card" key={species.name}>
                  <span>{padDex(id)}</span>
                  <div className="generation-pokemon-art">
                    <img src={spriteFor(id)} alt={titleCase(species.name)} loading="lazy" />
                  </div>
                  <h3>{titleCase(species.name)}</h3>
                  <button type="button" onClick={() => navigate(pokemonOverviewPath(species.name))}>Ver ficha →</button>
                </article>
              ))}
            </section>

            {!pokemon.length && <p className="generation-no-results">No hay Pokémon que coincidan con ese filtro.</p>}
          </>
        )}
      </main>
      <footer className="app-footer">Datos: PokéAPI · Listado por generación</footer>
    </div>
  );
}
