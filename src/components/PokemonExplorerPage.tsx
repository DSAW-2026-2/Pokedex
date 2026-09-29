import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getAbility,
  getAbilityIndex,
  getPokemon,
  getPokemonIndex,
  getSpeciesIndex,
  getSpecialIndex,
  searchByType,
} from "../api/pokeApi";
import type { NamedAPIResource, Pokemon, ResultItem, SearchIndexItem } from "../types/pokemon";
import {
  generationForNationalId,
  meetsStatMinimums,
  sortExplorerRows,
  type ExplorerSortKey,
  type ExplorerStatMinimums,
  type ExplorerStats,
} from "../utils/explorer";
import { pokemonOverviewPath } from "../utils/routes";
import { abilityLabel, extractId, normalizeText, padDex, titleCase, typeLabel } from "../utils/text";
import { sortTypes, spriteArtwork } from "../utils/pokemon";
import Header from "./Header";
import TypeIcon from "./TypeIcon";

const PAGE_SIZE = 24;
const TYPE_OPTIONS = [
  "normal", "fire", "water", "electric", "grass", "ice", "fighting", "poison", "ground",
  "flying", "psychic", "bug", "rock", "ghost", "dragon", "dark", "steel", "fairy",
];

type ExplorerCategory = "" | "normal" | "legendary" | "mythical" | "form";

interface ExplorerRow {
  id: number;
  name: string;
  pokemon: Pokemon;
  stats: ExplorerStats;
  bst: number;
  generation: number | null;
  isVariant: boolean;
}


function candidateNationalId(item: SearchIndexItem | ResultItem): number {
  if ("speciesId" in item && item.speciesId) return item.speciesId;
  return item.id || 0;
}

function statsFromPokemon(pokemon: Pokemon): ExplorerStats {
  const byName = new Map(pokemon.stats.map((row) => [row.stat.name, row.base_stat]));
  return {
    hp: byName.get("hp") || 0,
    attack: byName.get("attack") || 0,
    defense: byName.get("defense") || 0,
    specialAttack: byName.get("special-attack") || 0,
    specialDefense: byName.get("special-defense") || 0,
    speed: byName.get("speed") || 0,
  };
}

function rowFromPokemon(pokemon: Pokemon): ExplorerRow {
  const stats = statsFromPokemon(pokemon);
  const speciesId = extractId(pokemon.species.url) || (pokemon.id < 10000 ? pokemon.id : 0);
  return {
    id: pokemon.id,
    name: pokemon.name,
    pokemon,
    stats,
    bst: Object.values(stats).reduce((total, value) => total + value, 0),
    generation: generationForNationalId(speciesId),
    isVariant: pokemon.id >= 10000,
  };
}

async function loadPokemonRows(items: Array<SearchIndexItem | ResultItem>, signal: AbortSignal): Promise<ExplorerRow[]> {
  const output: ExplorerRow[] = [];
  const queue = [...items];
  const workers = Array.from({ length: Math.min(12, queue.length) }, async () => {
    while (queue.length && !signal.aborted) {
      const item = queue.shift();
      if (!item) break;
      try {
        const pokemon = await getPokemon(item.isVariant ? item.name : item.id || item.name, signal);
        output.push(rowFromPokemon(pokemon));
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") throw error;
      }
    }
  });
  await Promise.all(workers);
  return output;
}

function positiveNumber(value: string): number | undefined {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
}

export default function PokemonExplorerPage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [generation, setGeneration] = useState("");
  const [type, setType] = useState("");
  const [category, setCategory] = useState<ExplorerCategory>("");
  const [ability, setAbility] = useState("");
  const [sortKey, setSortKey] = useState<ExplorerSortKey>("id");
  const [minimums, setMinimums] = useState<Record<keyof ExplorerStats, string>>({
    hp: "", attack: "", defense: "", specialAttack: "", specialDefense: "", speed: "",
  });
  const [rows, setRows] = useState<ExplorerRow[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState("");
  const [abilityOptions, setAbilityOptions] = useState<NamedAPIResource[]>([]);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const numericMinimums = useMemo<ExplorerStatMinimums>(() => ({
    hp: positiveNumber(minimums.hp),
    attack: positiveNumber(minimums.attack),
    defense: positiveNumber(minimums.defense),
    specialAttack: positiveNumber(minimums.specialAttack),
    specialDefense: positiveNumber(minimums.specialDefense),
    speed: positiveNumber(minimums.speed),
  }), [minimums]);

  const hasStatFilter = Object.values(numericMinimums).some((value) => Boolean(value));
  const requiresFullDetails = hasStatFilter || !["id", "name"].includes(sortKey) || (category === "form" && Boolean(generation));

  useEffect(() => {
    const controller = new AbortController();
    getAbilityIndex(controller.signal)
      .then((items) => setAbilityOptions(items))
      .catch(() => setAbilityOptions([]));
    return () => controller.abort();
  }, []);

  useEffect(() => {
    setPage(1);
  }, [name, generation, type, category, ability, sortKey, minimums]);

  useEffect(() => {
    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      void (async () => {
        setBusy(true);
        setError("");
        try {
          let candidates: Array<SearchIndexItem | ResultItem>;
          if (category === "legendary" || category === "mythical") {
            candidates = getSpecialIndex(category);
          } else if (category === "form") {
            candidates = (await getPokemonIndex(controller.signal)).filter((item) => item.isVariant);
          } else {
            candidates = await getSpeciesIndex(controller.signal);
            if (category === "normal") {
              const specialIds = new Set([
                ...getSpecialIndex("legendary").map((item) => item.id),
                ...getSpecialIndex("mythical").map((item) => item.id),
              ]);
              candidates = candidates.filter((item) => !specialIds.has(item.id || 0));
            }
          }

          const q = normalizeText(name);
          if (q) candidates = candidates.filter((item) => normalizeText(item.name).includes(q));

          if (generation && category !== "form") {
            const targetGeneration = Number(generation);
            candidates = candidates.filter((item) => generationForNationalId(candidateNationalId(item)) === targetGeneration);
          }

          if (type) {
            const typeRows = await searchByType(type, controller.signal);
            const ids = new Set(typeRows.map((item) => item.speciesId || item.id));
            const names = new Set(typeRows.map((item) => item.name));
            candidates = candidates.filter((item) => ids.has(candidateNationalId(item)) || names.has(item.name));
          }

          if (ability.trim()) {
            const normalizedAbility = normalizeText(ability);
            const matchedOption = abilityOptions.find((option) =>
              normalizeText(option.name) === normalizedAbility || normalizeText(abilityLabel(option.name)) === normalizedAbility,
            );
            const abilityResource = await getAbility(matchedOption?.name || normalizedAbility, controller.signal);
            const ids = new Set(abilityResource.pokemon.map((entry) => extractId(entry.pokemon.url) || 0));
            const names = new Set(abilityResource.pokemon.map((entry) => entry.pokemon.name));
            candidates = candidates.filter((item) => ids.has(item.id || 0) || names.has(item.name));
          }

          if (requiresFullDetails) {
            let detailedRows = await loadPokemonRows(candidates, controller.signal);
            if (generation && category === "form") {
              detailedRows = detailedRows.filter((row) => row.generation === Number(generation));
            }
            detailedRows = detailedRows.filter((row) => meetsStatMinimums(row, numericMinimums));
            detailedRows = sortExplorerRows(detailedRows, sortKey);
            setTotal(detailedRows.length);
            const start = (page - 1) * PAGE_SIZE;
            setRows(detailedRows.slice(start, start + PAGE_SIZE));
          } else {
            const sortedCandidates = [...candidates].sort((a, b) => sortKey === "name"
              ? a.name.localeCompare(b.name)
              : (a.id || 99999) - (b.id || 99999));
            setTotal(sortedCandidates.length);
            const start = (page - 1) * PAGE_SIZE;
            const pageCandidates = sortedCandidates.slice(start, start + PAGE_SIZE);
            const detailedRows = await loadPokemonRows(pageCandidates, controller.signal);
            setRows(sortExplorerRows(detailedRows, sortKey));
          }
        } catch (reason) {
          if (controller.signal.aborted) return;
          setRows([]);
          setTotal(0);
          setError(reason instanceof Error ? reason.message : "No fue posible aplicar los filtros.");
        } finally {
          if (!controller.signal.aborted) setBusy(false);
        }
      })();
    }, 240);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [name, generation, type, category, ability, sortKey, numericMinimums, requiresFullDetails, page, abilityOptions]);

  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));

  function clearFilters() {
    setName("");
    setGeneration("");
    setType("");
    setCategory("");
    setAbility("");
    setSortKey("id");
    setMinimums({ hp: "", attack: "", defense: "", specialAttack: "", specialDefense: "", speed: "" });
  }

  const filterPanel = (
    <aside className={`explorer-filters ${mobileFiltersOpen ? "is-open" : ""}`}>
      <div className="explorer-filter-head">
        <div><span>FILTROS</span><strong>Acota tu búsqueda</strong></div>
        <button type="button" onClick={clearFilters}>Limpiar filtros</button>
      </div>

      <label>Nombre
        <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Ej. lucario" />
      </label>
      <label>Generación
        <select value={generation} onChange={(event) => setGeneration(event.target.value)}>
          <option value="">Todas</option>
          {Array.from({ length: 9 }, (_, index) => index + 1).map((value) => <option key={value} value={value}>Generación {value}</option>)}
        </select>
      </label>
      <label>Tipo
        <select value={type} onChange={(event) => setType(event.target.value)}>
          <option value="">Todos</option>
          {TYPE_OPTIONS.map((value) => <option key={value} value={value}>{typeLabel(value)}</option>)}
        </select>
      </label>
      <label>Categoría
        <select value={category} onChange={(event) => setCategory(event.target.value as ExplorerCategory)}>
          <option value="">Todos</option>
          <option value="normal">Normal</option>
          <option value="legendary">Legendario</option>
          <option value="mythical">Mítico</option>
          <option value="form">Variante / Forma</option>
        </select>
      </label>
      <label>Habilidad
        <input list="explorer-abilities" value={ability} onChange={(event) => setAbility(event.target.value)} placeholder="Ej. Intimidación" />
        <datalist id="explorer-abilities">
          {abilityOptions.map((option) => <option key={option.name} value={abilityLabel(option.name)}>{titleCase(option.name)}</option>)}
        </datalist>
      </label>

      <fieldset className="explorer-stat-filters">
        <legend>Estadísticas mínimas</legend>
        {([
          ["hp", "PS"], ["attack", "Ataque"], ["defense", "Defensa"],
          ["specialAttack", "At. Esp."], ["specialDefense", "Def. Esp."], ["speed", "Velocidad"],
        ] as Array<[keyof ExplorerStats, string]>).map(([key, label]) => (
          <label key={key}>{label}
            <input
              type="number"
              min="0"
              max="255"
              value={minimums[key]}
              onChange={(event) => setMinimums((current) => ({ ...current, [key]: event.target.value }))}
              placeholder="0"
            />
          </label>
        ))}
      </fieldset>

      <label>Ordenar por
        <select value={sortKey} onChange={(event) => setSortKey(event.target.value as ExplorerSortKey)}>
          <option value="id">N.º Pokédex</option>
          <option value="name">Nombre A-Z</option>
          <option value="hp">PS</option>
          <option value="attack">Ataque</option>
          <option value="defense">Defensa</option>
          <option value="specialAttack">Ataque Especial</option>
          <option value="specialDefense">Defensa Especial</option>
          <option value="speed">Velocidad</option>
          <option value="bst">BST</option>
        </select>
      </label>
      {hasStatFilter && <p className="explorer-filter-note">Los filtros por estadísticas revisan los candidatos completos y pueden tardar un poco la primera vez.</p>}
    </aside>
  );

  return (
    <div className="app-shell">
      <Header contextLabel="Explorador Pokémon" version="v19.1" />
      <main className="explorer-page">
        <header className="feature-page-head">
          <div><span>EXPLORACIÓN AVANZADA</span><h2>Explorador Pokémon</h2><p>Encuentra Pokémon según sus características.</p></div>
          <button className="mobile-filter-toggle" type="button" onClick={() => setMobileFiltersOpen((value) => !value)}>Filtros</button>
        </header>

        <div className="explorer-layout">
          {filterPanel}
          <section className="explorer-results" aria-live="polite">
            <div className="explorer-results-head">
              <div><strong>{busy ? "Buscando…" : `${total} Pokémon encontrados`}</strong><span>Página {Math.min(page, pageCount)} de {pageCount}</span></div>
              {requiresFullDetails && !busy && <small>Resultados calculados con estadísticas completas.</small>}
            </div>

            {error ? (
              <div className="feature-empty-state"><h3>No pudimos completar la búsqueda</h3><p>{error}</p><button type="button" onClick={clearFilters}>Limpiar filtros</button></div>
            ) : busy ? (
              <div className="feature-empty-state loading"><span className="status-spinner" /><h3>Preparando resultados</h3><p>PokéCheck está consultando y reutilizando datos guardados de PokéAPI.</p></div>
            ) : rows.length === 0 ? (
              <div className="feature-empty-state"><h3>No encontramos Pokémon con estos filtros.</h3><p>Prueba con menos condiciones o limpia los filtros.</p><button type="button" onClick={clearFilters}>Limpiar filtros</button></div>
            ) : (
              <div className="explorer-card-grid">
                {rows.map((row) => {
                  const art = spriteArtwork(row.pokemon);
                  return (
                    <article className="explorer-pokemon-card" key={row.pokemon.name}>
                      <span className="explorer-dex">{padDex(row.id < 10000 ? row.id : extractId(row.pokemon.species.url))}</span>
                      <div className="explorer-art">{art ? <img src={art} alt={titleCase(row.name)} /> : <span>Sin imagen</span>}</div>
                      <h3>{titleCase(row.name)}</h3>
                      <div className="explorer-types">
                        {sortTypes(row.pokemon.types).map((entry) => <span key={entry.type.name}><TypeIcon type={entry.type.name} />{typeLabel(entry.type.name)}</span>)}
                      </div>
                      <div className="explorer-meta"><span>Gen. {row.generation || "?"}</span><span>BST {row.bst}</span></div>
                      <div className="explorer-stats"><span>PS <b>{row.stats.hp}</b></span><span>ATQ <b>{row.stats.attack}</b></span><span>VEL <b>{row.stats.speed}</b></span></div>
                      <button type="button" onClick={() => navigate(pokemonOverviewPath(row.name))}>Ver ficha →</button>
                    </article>
                  );
                })}
              </div>
            )}

            {!busy && !error && total > PAGE_SIZE && (
              <nav className="feature-pagination" aria-label="Paginación del Explorador">
                <button type="button" disabled={page <= 1} onClick={() => setPage((value) => Math.max(1, value - 1))}>← Anterior</button>
                <span>{page} / {pageCount}</span>
                <button type="button" disabled={page >= pageCount} onClick={() => setPage((value) => Math.min(pageCount, value + 1))}>Siguiente →</button>
              </nav>
            )}
          </section>
        </div>
      </main>
      <footer className="app-footer">Datos: PokéAPI · Exploración avanzada con caché local</footer>
    </div>
  );
}
