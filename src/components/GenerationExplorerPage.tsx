import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getGeneration } from "../api/pokeApi";
import { GENERATION_CARDS, getGenerationDexRange } from "../data/generations";
import { generationDetailPath, pokedexPath } from "../utils/routes";
import Header from "./Header";

export default function GenerationExplorerPage() {
  const navigate = useNavigate();
  const [counts, setCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    const controller = new AbortController();
    Promise.all(
      GENERATION_CARDS.map(async (item) => {
        const generation = await getGeneration(item.apiName, controller.signal);
        return [item.apiName, generation.pokemon_species?.length || 0] as const;
      }),
    )
      .then((rows) => setCounts(Object.fromEntries(rows)))
      .catch(() => undefined);
    return () => controller.abort();
  }, []);

  return (
    <div className="exploration-shell">
      <Header contextLabel="Explorar por generación" version="v19.1" />
      <main className="standalone-page generation-explorer-page">
        <header className="standalone-page-head">
          <div>
            <span>EXPLORACIÓN</span>
            <h2>Explorar por generación</h2>
            <p>Elige una generación para abrir su Pokédex. Cada tarjeta te dice cuántos Pokémon introdujo y qué rango ocupa en la Pokédex Nacional.</p>
          </div>
          <button type="button" onClick={() => navigate(pokedexPath())}>Ir a la Pokédex</button>
        </header>

        <div className="generation-grid">
          {GENERATION_CARDS.map((generation) => {
            const range = getGenerationDexRange(generation.id);
            return (
              <article className="generation-card" key={generation.apiName}>
                <div className="generation-card-head">
                  <span>GENERACIÓN {generation.roman}</span>
                  <strong>{generation.region}</strong>
                </div>

                <div className="generation-metric">
                  <span>Pokémon introducidos</span>
                  <strong>{counts[generation.apiName] ?? "…"}</strong>
                </div>

                <div className="generation-range-block">
                  <span>POKÉDEX NACIONAL</span>
                  <strong>Pokémon {range.label}</strong>
                </div>

                <button
                  className="generation-open-button"
                  type="button"
                  onClick={() => navigate(generationDetailPath(generation.apiName))}
                >
                  Ver Pokémon de esta generación →
                </button>

              </article>
            );
          })}
        </div>
      </main>
      <footer className="app-footer">Datos: PokéAPI · Proyecto educativo en React + TypeScript</footer>
    </div>
  );
}
