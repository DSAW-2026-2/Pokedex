import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getMove, getPokemon, searchByType } from "../api/pokeApi";
import type { NamedAPIResource, Pokemon, PokemonMoveResource } from "../types/pokemon";
import { generationForNationalId } from "../utils/explorer";
import { moveDexPath, pokemonOverviewPath } from "../utils/routes";
import { extractId, generationRoman, normalizeText, padDex, titleCase, typeLabel } from "../utils/text";
import { localizedMoveName, moveDamageClassLabel, moveDescription } from "../utils/moves";
import { sortTypes, spriteArtwork } from "../utils/pokemon";
import Header from "./Header";
import TypeIcon from "./TypeIcon";

const PAGE_SIZE = 24;
const TYPE_OPTIONS = [
  "normal", "fire", "water", "electric", "grass", "ice", "fighting", "poison", "ground",
  "flying", "psychic", "bug", "rock", "ghost", "dragon", "dark", "steel", "fairy",
];

export default function MoveDetailPage() {
  const navigate = useNavigate();
  const { moveName = "" } = useParams<{ moveName: string }>();
  const [move, setMove] = useState<PokemonMoveResource | null>(null);
  const [pokemonRows, setPokemonRows] = useState<Record<string, Pokemon>>({});
  const [query, setQuery] = useState("");
  const [generation, setGeneration] = useState("");
  const [type, setType] = useState("");
  const [typeNames, setTypeNames] = useState<Set<string> | null>(null);
  const [page, setPage] = useState(1);
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    setBusy(true);
    setError("");
    getMove(moveName, controller.signal)
      .then((data) => setMove(data))
      .catch((reason) => {
        if (!controller.signal.aborted) setError(reason instanceof Error ? reason.message : "No fue posible cargar el movimiento.");
      })
      .finally(() => { if (!controller.signal.aborted) setBusy(false); });
    return () => controller.abort();
  }, [moveName]);

  useEffect(() => {
    const controller = new AbortController();
    if (!type) {
      setTypeNames(null);
      return () => controller.abort();
    }
    searchByType(type, controller.signal)
      .then((items) => setTypeNames(new Set(items.map((item) => item.name))))
      .catch(() => setTypeNames(new Set()));
    return () => controller.abort();
  }, [type]);

  useEffect(() => setPage(1), [query, generation, type, moveName]);

  const filteredPokemon = useMemo<NamedAPIResource[]>(() => {
    if (!move) return [];
    const q = normalizeText(query);
    return move.learned_by_pokemon.filter((resource) => {
      const id = extractId(resource.url) || 0;
      if (q && !normalizeText(resource.name).includes(q)) return false;
      if (generation && generationForNationalId(id) !== Number(generation)) return false;
      if (typeNames && !typeNames.has(resource.name)) return false;
      return true;
    });
  }, [move, query, generation, typeNames]);

  const pageCount = Math.max(1, Math.ceil(filteredPokemon.length / PAGE_SIZE));
  const visiblePokemon = filteredPokemon.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => {
    const controller = new AbortController();
    const missing = visiblePokemon.filter((resource) => !pokemonRows[resource.name]);
    if (!missing.length) return () => controller.abort();
    void Promise.allSettled(missing.map((resource) => getPokemon(resource.name, controller.signal))).then((settled) => {
      if (controller.signal.aborted) return;
      setPokemonRows((current) => {
        const next = { ...current };
        settled.forEach((result) => {
          if (result.status === "fulfilled") next[result.value.name] = result.value;
        });
        return next;
      });
    });
    return () => controller.abort();
  }, [visiblePokemon.map((resource) => resource.name).join("|")]);

  if (busy) {
    return <div className="app-shell"><Header contextLabel="Ficha de movimiento" version="v19.1" /><div className="feature-empty-state loading"><span className="status-spinner" /><h3>Cargando movimiento</h3></div></div>;
  }
  if (error || !move) {
    return <div className="app-shell"><Header contextLabel="Ficha de movimiento" version="v19.1" /><div className="feature-empty-state"><h3>No pudimos abrir el movimiento</h3><p>{error || "Movimiento no encontrado."}</p><button type="button" onClick={() => navigate(moveDexPath())}>Volver a Movepedia</button></div></div>;
  }

  const displayName = localizedMoveName(move);

  return (
    <div className="app-shell">
      <Header contextLabel="Ficha de movimiento" version="v19.1" />
      <main className="move-detail-page">
        <button className="feature-back-button" type="button" onClick={() => navigate(moveDexPath())}>← Volver a Movepedia</button>

        <section className="move-detail-hero">
          <div>
            <span className="feature-kicker">MOVIMIENTO #{move.id}</span>
            <h2>{displayName}</h2>
            <div className="move-detail-tags">
              <span className={`move-type-chip type-${move.type.name}`}><TypeIcon type={move.type.name} />{typeLabel(move.type.name)}</span>
              <span>{moveDamageClassLabel(move.damage_class.name)}</span>
              <span>Generación {generationRoman(move.generation.name)}</span>
            </div>
            <p>{moveDescription(move)}</p>
          </div>
          <div className="move-metric-grid">
            <article><span>Potencia</span><strong>{move.power ?? "—"}</strong></article>
            <article><span>Precisión</span><strong>{move.accuracy ?? "—"}</strong></article>
            <article><span>PP</span><strong>{move.pp ?? "—"}</strong></article>
            <article><span>Prioridad</span><strong>{move.priority}</strong></article>
            <article><span>Prob. efecto</span><strong>{move.effect_chance !== null ? `${move.effect_chance}%` : "—"}</strong></article>
          </div>
        </section>

        <section className="move-learners-section">
          <div className="move-learners-head">
            <div><span>COMPATIBILIDAD</span><h3>Pokémon que pueden aprenderlo</h3><p>{filteredPokemon.length} resultados con los filtros actuales.</p></div>
            <div className="move-learner-filters">
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar Pokémon" />
              <select value={generation} onChange={(event) => setGeneration(event.target.value)}>
                <option value="">Todas las generaciones</option>
                {Array.from({ length: 9 }, (_, index) => index + 1).map((value) => <option key={value} value={value}>Generación {value}</option>)}
              </select>
              <select value={type} onChange={(event) => setType(event.target.value)}>
                <option value="">Todos los tipos</option>
                {TYPE_OPTIONS.map((value) => <option key={value} value={value}>{typeLabel(value)}</option>)}
              </select>
            </div>
          </div>

          {filteredPokemon.length === 0 ? (
            <div className="feature-empty-state"><h3>No hay Pokémon con esos filtros.</h3><p>Prueba con otra generación, tipo o nombre.</p></div>
          ) : (
            <div className="move-learner-grid">
              {visiblePokemon.map((resource) => {
                const pokemon = pokemonRows[resource.name];
                const art = pokemon ? spriteArtwork(pokemon) : null;
                const dexId = pokemon ? extractId(pokemon.species.url) || pokemon.id : extractId(resource.url);
                return (
                  <article key={resource.name} className="move-learner-card">
                    <span>{padDex(dexId)}</span>
                    <div>{art ? <img src={art} alt={titleCase(resource.name)} /> : <span className="mini-loading">…</span>}</div>
                    <h4>{titleCase(resource.name)}</h4>
                    {pokemon && <div className="explorer-types">{sortTypes(pokemon.types).map((entry) => <span key={entry.type.name}><TypeIcon type={entry.type.name} />{typeLabel(entry.type.name)}</span>)}</div>}
                    <button type="button" onClick={() => navigate(pokemonOverviewPath(resource.name))}>Ver ficha →</button>
                  </article>
                );
              })}
            </div>
          )}

          {filteredPokemon.length > PAGE_SIZE && (
            <nav className="feature-pagination" aria-label="Paginación de Pokémon compatibles">
              <button type="button" disabled={page <= 1} onClick={() => setPage((value) => Math.max(1, value - 1))}>← Anterior</button>
              <span>{page} / {pageCount}</span>
              <button type="button" disabled={page >= pageCount} onClick={() => setPage((value) => Math.min(pageCount, value + 1))}>Siguiente →</button>
            </nav>
          )}
        </section>
      </main>
      <footer className="app-footer">Datos: PokéAPI · La compatibilidad puede variar según juego y reglamento</footer>
    </div>
  );
}
