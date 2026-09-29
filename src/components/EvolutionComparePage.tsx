import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getLocalizedResourceNames, getPokemonBundle } from "../api/pokeApi";
import type { PokemonBundle } from "../types/pokemon";
import { hasAbilityChange, hasMovePoolChange, hasStatChange, hasTypeChange, sortTypes, spriteArtwork } from "../utils/pokemon";
import { pokemonOverviewPath } from "../utils/routes";
import { abilityLabel, getDisplayName, statLabel, typeLabel } from "../utils/text";
import Header from "./Header";
import LoadingState from "./LoadingState";
import ErrorState from "./ErrorState";
import TypeIcon from "./TypeIcon";

function statRows(a: PokemonBundle, b: PokemonBundle) {
  const bMap = new Map(b.pokemon.stats.map((row) => [row.stat.name, row.base_stat]));
  return a.pokemon.stats.map((row) => ({
    name: row.stat.name,
    before: row.base_stat,
    after: bMap.get(row.stat.name) ?? 0,
    delta: (bMap.get(row.stat.name) ?? 0) - row.base_stat,
  }));
}

export default function EvolutionComparePage() {
  const { pokemonA = "", pokemonB = "" } = useParams();
  const navigate = useNavigate();
  const [left, setLeft] = useState<PokemonBundle | null>(null);
  const [right, setRight] = useState<PokemonBundle | null>(null);
  const [abilityNames, setAbilityNames] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true); setError("");
    Promise.all([getPokemonBundle(pokemonA, controller.signal), getPokemonBundle(pokemonB, controller.signal)])
      .then(async ([a, b]) => {
        if (controller.signal.aborted) return;
        setLeft(a); setRight(b);
        const abilities = [...a.pokemon.abilities, ...b.pokemon.abilities].map((entry) => entry.ability);
        const localized = await getLocalizedResourceNames(abilities, "ability", controller.signal);
        if (!controller.signal.aborted) setAbilityNames(localized);
      })
      .catch((reason: unknown) => {
        if (reason instanceof Error && reason.name === "AbortError") return;
        setError(reason instanceof Error ? reason.message : "No fue posible comparar la evolución.");
      })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [pokemonA, pokemonB]);

  const stats = useMemo(() => left && right ? statRows(left, right) : [], [left, right]);

  if (loading) return <div className="app-shell"><Header contextLabel="Comparar evolución" version="v19.1" /><LoadingState message="Comparando etapas evolutivas..." /></div>;
  if (error || !left || !right) return <div className="app-shell"><Header contextLabel="Comparar evolución" version="v19.1" /><ErrorState message={error || "No se encontraron ambas etapas."} /></div>;

  const leftName = getDisplayName(left.species, left.pokemon.name);
  const rightName = getDisplayName(right.species, right.pokemon.name);
  const changes = [
    ["Tipos", hasTypeChange(left.pokemon, right.pokemon)],
    ["Estadísticas", hasStatChange(left.pokemon, right.pokemon)],
    ["Habilidades", hasAbilityChange(left.pokemon, right.pokemon)],
    ["Movimientos", hasMovePoolChange(left.pokemon, right.pokemon)],
    ["Altura", left.pokemon.height !== right.pokemon.height],
    ["Peso", left.pokemon.weight !== right.pokemon.weight],
  ] as const;

  return (
    <div className="app-shell exploration-shell">
      <Header contextLabel="Comparar evolución" version="v19.1" />
      <main className="standalone-page evolution-compare-page">
        <div className="standalone-page-head">
          <div><span>ANÁLISIS DE EVOLUCIÓN</span><h2>Comparar evolución</h2><p>Qué cambia entre dos etapas de una misma familia. No evalúa cuál es mejor en combate.</p></div>
          <button onClick={() => navigate(pokemonOverviewPath(right.pokemon.name))}>Volver a la ficha</button>
        </div>

        <section className="compare-evolution-hero">
          {[left, right].map((bundle, index) => {
            const display = getDisplayName(bundle.species, bundle.pokemon.name);
            return <article key={bundle.pokemon.name}>
              <span>{index === 0 ? "ANTES" : "DESPUÉS"}</span>
              <div className="compare-evolution-art">{spriteArtwork(bundle.pokemon) && <img src={spriteArtwork(bundle.pokemon)} alt={display} />}</div>
              <h3>{display}</h3>
              <div className="type-pills compact">{sortTypes(bundle.pokemon.types).map((entry) => <span key={entry.type.name} className={`type-pill type-${entry.type.name}`}><TypeIcon type={entry.type.name} />{typeLabel(entry.type.name)}</span>)}</div>
            </article>;
          })}
          <div className="evolution-big-arrow" aria-hidden="true">→</div>
        </section>

        <section className="change-summary-card">
          <div><span>RESUMEN</span><h3>Qué cambió</h3></div>
          <div className="change-chip-grid">{changes.map(([label, changed]) => <span key={label} className={changed ? "changed" : "same"}>{changed ? "✓" : "•"} {label}: {changed ? "cambia" : "se mantiene"}</span>)}</div>
        </section>

        <section className="evolution-stat-comparison">
          <h3>Estadísticas base</h3>
          <div className="evolution-stat-list">{stats.map((row) => <article key={row.name}><span>{statLabel(row.name)}</span><strong>{row.before}</strong><div className="evolution-stat-arrow">→</div><strong>{row.after}</strong><b className={row.delta > 0 ? "positive" : row.delta < 0 ? "negative" : "neutral"}>{row.delta > 0 ? `+${row.delta}` : row.delta}</b></article>)}</div>
        </section>

        <section className="evolution-ability-compare">
          <article><span>Habilidades de {leftName}</span><strong>{left.pokemon.abilities.map((entry) => abilityNames[entry.ability.name] || abilityLabel(entry.ability.name)).join(" · ") || "Sin datos"}</strong></article>
          <article><span>Habilidades de {rightName}</span><strong>{right.pokemon.abilities.map((entry) => abilityNames[entry.ability.name] || abilityLabel(entry.ability.name)).join(" · ") || "Sin datos"}</strong></article>
        </section>
      </main>
    </div>
  );
}
