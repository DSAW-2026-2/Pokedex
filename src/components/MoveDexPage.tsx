import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getMove, getMoveIndex, getPokemon } from "../api/pokeApi";
import type { NamedAPIResource, PokemonMoveResource, SearchIndexItem } from "../types/pokemon";
import { getFuzzyMatches } from "../utils/search";
import { moveDetailPath } from "../utils/routes";
import { compactText, moveLabel, titleCase, typeLabel } from "../utils/text";
import { localizedMoveName, moveDamageClassLabel } from "../utils/moves";
import Header from "./Header";
import TypeIcon from "./TypeIcon";

const PAGE_SIZE = 24;

function asSearchIndex(resources: NamedAPIResource[]): SearchIndexItem[] {
  return resources.map((item) => ({ id: null, name: item.name, url: item.url, kind: "pokemon" as const, isVariant: false }));
}

export default function MoveDexPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const pokemonFilter = new URLSearchParams(location.search).get("pokemon")?.trim().toLowerCase() || "";
  const [resources, setResources] = useState<NamedAPIResource[]>([]);
  const [details, setDetails] = useState<Record<string, PokemonMoveResource>>({});
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState("");
  const [pokemonName, setPokemonName] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    setBusy(true);
    setError("");
    void (async () => {
      try {
        if (pokemonFilter) {
          const pokemon = await getPokemon(pokemonFilter, controller.signal);
          setPokemonName(titleCase(pokemon.name));
          setResources((pokemon.moves || []).map((entry) => entry.move));
        } else {
          setPokemonName("");
          setResources(await getMoveIndex(controller.signal));
        }
      } catch (reason) {
        if (!controller.signal.aborted) setError(reason instanceof Error ? reason.message : "No fue posible cargar los movimientos.");
      } finally {
        if (!controller.signal.aborted) setBusy(false);
      }
    })();
    return () => controller.abort();
  }, [pokemonFilter]);

  useEffect(() => setPage(1), [query, pokemonFilter]);

  const filtered = useMemo(() => {
    const q = compactText(query);
    if (!q) return resources;
    return resources.filter((item) => compactText(item.name).includes(q) || compactText(moveLabel(item.name)).includes(q));
  }, [resources, query]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const visible = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => {
    const controller = new AbortController();
    const missing = visible.filter((item) => !details[item.name]);
    if (!missing.length) return () => controller.abort();
    void Promise.allSettled(missing.map((item) => getMove(item.name, controller.signal))).then((settled) => {
      if (controller.signal.aborted) return;
      setDetails((current) => {
        const next = { ...current };
        settled.forEach((result) => {
          if (result.status === "fulfilled") next[result.value.name] = result.value;
        });
        return next;
      });
    });
    return () => controller.abort();
  }, [visible.map((item) => item.name).join("|")]);

  const fuzzySuggestion = useMemo(() => {
    if (!query.trim() || filtered.length) return null;
    const match = getFuzzyMatches(query, asSearchIndex(resources), 1)[0];
    return match && match.score >= 0.5 ? match.name : null;
  }, [query, filtered.length, resources]);

  return (
    <div className="app-shell">
      <Header contextLabel="Movepedia" version="v19.1" />
      <main className="move-page">
        <header className="feature-page-head move-head">
          <div>
            <span>BASE DE MOVIMIENTOS</span>
            <h2>Movepedia</h2>
            <p>{pokemonName ? `Movimientos disponibles para ${pokemonName}.` : "Consulta movimientos y descubre qué Pokémon pueden aprenderlos."}</p>
          </div>
          {pokemonFilter && <button type="button" onClick={() => navigate("/movimientos")}>Ver todos los movimientos</button>}
        </header>

        <section className="move-search-panel">
          <label htmlFor="move-search">Buscar movimiento</label>
          <input id="move-search" type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Ej. Terremoto, Rayo Solar..." />
          <span>{busy ? "Cargando…" : `${filtered.length} movimientos`}</span>
        </section>

        {error ? (
          <div className="feature-empty-state"><h3>No pudimos cargar Movepedia</h3><p>{error}</p></div>
        ) : busy ? (
          <div className="feature-empty-state loading"><span className="status-spinner" /><h3>Cargando movimientos</h3></div>
        ) : visible.length === 0 ? (
          <div className="feature-empty-state">
            <h3>No encontramos ese movimiento.</h3>
            {fuzzySuggestion ? <button type="button" onClick={() => setQuery(moveLabel(fuzzySuggestion))}>¿Quisiste decir {moveLabel(fuzzySuggestion)}?</button> : <p>Revisa cómo está escrito o prueba otro término.</p>}
          </div>
        ) : (
          <div className="move-card-grid">
            {visible.map((resource) => {
              const move = details[resource.name];
              const displayName = move ? localizedMoveName(move) : moveLabel(resource.name);
              return (
                <article className="move-card" key={resource.name}>
                  <div className="move-card-top">
                    <div>
                      <span>MOVIMIENTO</span>
                      <h3>{displayName}</h3>
                    </div>
                    {move && <span className={`move-type-chip type-${move.type.name}`}><TypeIcon type={move.type.name} />{typeLabel(move.type.name)}</span>}
                  </div>
                  <div className="move-card-stats">
                    <span>Categoría <b>{move ? moveDamageClassLabel(move.damage_class.name) : "…"}</b></span>
                    <span>Potencia <b>{move?.power ?? "—"}</b></span>
                    <span>Precisión <b>{move?.accuracy ?? "—"}</b></span>
                    <span>PP <b>{move?.pp ?? "—"}</b></span>
                  </div>
                  <button type="button" onClick={() => navigate(moveDetailPath(resource.name))}>Ver movimiento →</button>
                </article>
              );
            })}
          </div>
        )}

        {!busy && !error && filtered.length > PAGE_SIZE && (
          <nav className="feature-pagination" aria-label="Paginación de movimientos">
            <button type="button" disabled={page <= 1} onClick={() => setPage((value) => Math.max(1, value - 1))}>← Anterior</button>
            <span>{page} / {pageCount}</span>
            <button type="button" disabled={page >= pageCount} onClick={() => setPage((value) => Math.min(pageCount, value + 1))}>Siguiente →</button>
          </nav>
        )}
      </main>
      <footer className="app-footer">Datos de movimientos: PokéAPI</footer>
    </div>
  );
}
