import { useEffect, useMemo, useState } from "react";
import { getEvolutionChain, getLocalizedResourceName, getPokemon } from "../api/pokeApi";
import type { Pokemon, PokemonBundle } from "../types/pokemon";
import { buildEvolutionPaths, describeEvolution, type EvolutionRow } from "../utils/evolution";
import { evolutionArtworkForMode, evolutionShinyArtwork, sortTypes } from "../utils/pokemon";
import { padDex, titleCase, typeLabel } from "../utils/text";
import ErrorState from "./ErrorState";
import LoadingState from "./LoadingState";
import TypeIcon from "./TypeIcon";

interface EvolutionLineProps {
  bundle: PokemonBundle;
  onSelectPokemon: (name: string) => void;
  onCompareEvolution?: (fromName: string, toName: string) => void;
}

function EvolutionCard({ row, pokemon, onSelect }: { row: EvolutionRow; pokemon?: Pokemon; onSelect: () => void }) {
  const [showShiny, setShowShiny] = useState(false);
  const variocolor = evolutionShinyArtwork(pokemon);
  const artwork = evolutionArtworkForMode(pokemon, showShiny);

  return (
    <article className="evolution-card">
      <button type="button" className="evolution-card-open" onClick={onSelect}>
        <div className={`evolution-art ${showShiny ? "is-shiny" : ""}`}>
          {artwork.available ? (
            <img
              src={artwork.url}
              alt={`${titleCase(row.name)}${showShiny ? " variocolor" : ""}`}
              loading="lazy"
            />
          ) : (
            <span className="evolution-shiny-missing">Sin imagen disponible</span>
          )}
        </div>
        <div className="evolution-copy">
          <span>{padDex(row.id)}</span>
          <strong>{titleCase(row.name)}</strong>
          <div className="mini-types evolution-types">
            {(pokemon ? sortTypes(pokemon.types) : []).map((entry) => (
              <span key={`${row.name}-${entry.type.name}`} className="evolution-type-pill">
                <TypeIcon type={entry.type.name} />
                {typeLabel(entry.type.name)}
              </span>
            ))}
          </div>
        </div>
      </button>

      <button
        type="button"
        className={`evolution-shiny-toggle ${showShiny ? "active" : ""}`}
        onClick={() => setShowShiny((current) => !current)}
        aria-pressed={showShiny}
        aria-label={variocolor.available
          ? `${showShiny ? "Volver a normal" : "Mostrar variocolor"} de ${titleCase(row.name)}`
          : `Variocolor no disponible para ${titleCase(row.name)}`}
        disabled={!variocolor.available}
      >
        {!variocolor.available ? "Variocolor no disponible" : showShiny ? "↩ Normal" : "✨ Variocolor"}
      </button>
    </article>
  );
}

function EvolutionConnector({ row, localized, fromName, onCompare }: { row: EvolutionRow; localized: Record<string, string>; fromName?: string; onCompare?: (fromName: string, toName: string) => void }) {
  const text = row.details.length
    ? row.details.map((detail) => describeEvolution(detail, localized)).join(" / ")
    : "Evolución";
  return (
    <div className="evolution-connector" aria-label={text}>
      <span className="evolution-arrow" aria-hidden="true">→</span>
      <small>{text}</small>
      {fromName && onCompare && (
        <button type="button" className="evolution-compare-button" onClick={() => onCompare(fromName, row.name)}>Comparar evolución</button>
      )}
    </div>
  );
}

export default function EvolutionLine({ bundle, onSelectPokemon, onCompareEvolution }: EvolutionLineProps) {
  const [paths, setPaths] = useState<EvolutionRow[][]>([]);
  const [pokemonByName, setPokemonByName] = useState<Record<string, Pokemon>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [localizedEvolution, setLocalizedEvolution] = useState<Record<string, string>>({});

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError("");
    setPaths([]);
    setPokemonByName({});
    setLocalizedEvolution({});

    async function load() {
      try {
        const chain = await getEvolutionChain(bundle.species.evolution_chain?.url, controller.signal);
        if (controller.signal.aborted) return;
        if (!chain?.chain) {
          setPaths([]);
          return;
        }

        const nextPaths = buildEvolutionPaths(chain.chain);
        const uniqueNames = [...new Set(nextPaths.flat().map((row) => row.name))];
        const settled = await Promise.allSettled(uniqueNames.map((name) => getPokemon(name, controller.signal)));
        if (controller.signal.aborted) return;

        const map: Record<string, Pokemon> = {};
        settled.forEach((result, index) => {
          if (result.status === "fulfilled") map[uniqueNames[index]] = result.value;
        });
        setPokemonByName(map);
        setPaths(nextPaths);
      } catch (reason) {
        if (controller.signal.aborted || (reason instanceof Error && reason.name === "AbortError")) return;
        setError(reason instanceof Error ? reason.message : "No fue posible cargar la línea evolutiva.");
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    void load();
    return () => controller.abort();
  }, [bundle.species.id, bundle.species.evolution_chain?.url]);

  useEffect(() => {
    const controller = new AbortController();
    const resources = paths.flatMap((path) => path.flatMap((row) => row.details.flatMap((detail) => [
      detail.item ? { resource: detail.item, kind: "generic" as const } : null,
      detail.held_item ? { resource: detail.held_item, kind: "generic" as const } : null,
      detail.location ? { resource: detail.location, kind: "generic" as const } : null,
      detail.known_move ? { resource: detail.known_move, kind: "move" as const } : null,
      detail.party_species ? { resource: detail.party_species, kind: "generic" as const } : null,
    ].filter(Boolean))));

    const unique = new Map<string, { resource: { name: string; url: string }; kind: "generic" | "move" }>();
    resources.forEach((entry) => {
      if (!entry) return;
      const key = entry.resource.url || entry.resource.name;
      if (!unique.has(key)) unique.set(key, entry);
    });
    if (!unique.size) return () => controller.abort();

    Promise.all([...unique.entries()].map(async ([key, entry]) => [key, await getLocalizedResourceName(entry.resource, entry.kind, controller.signal)] as const))
      .then((entries) => { if (!controller.signal.aborted) setLocalizedEvolution(Object.fromEntries(entries)); })
      .catch(() => {});
    return () => controller.abort();
  }, [paths]);

  const hasEvolution = useMemo(
    () => paths.some((path) => path.length > 1),
    [paths],
  );

  return (
    <section className="evolution-section" aria-labelledby="evolution-title">
      <div className="evolution-divider" />
      <div className="evolution-title-row">
        <div>
          <h2 id="evolution-title">Línea Evolutiva</h2>
          <p>Activa el Variocolor solo en la evolución que quieras comparar.</p>
        </div>
      </div>

      {loading ? (
        <LoadingState message="Cargando línea evolutiva..." />
      ) : error ? (
        <ErrorState message={error} />
      ) : !hasEvolution ? (
        <div className="evolution-empty">Este Pokémon no tiene línea evolutiva.</div>
      ) : (
        <div className="evolution-paths">
          {paths.map((path, pathIndex) => (
            <div className="evolution-path" key={`${path.map((row) => row.name).join("-")}-${pathIndex}`}>
              {path.map((row, index) => (
                <div className="evolution-step" key={`${row.name}-${index}`}>
                  {index > 0 && <EvolutionConnector row={row} localized={localizedEvolution} fromName={path[index - 1]?.name} onCompare={onCompareEvolution} />}
                  <EvolutionCard
                    row={row}
                    pokemon={pokemonByName[row.name]}
                    onSelect={() => onSelectPokemon(row.name)}
                  />
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
