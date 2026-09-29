import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getLocalizedResourceNames, getPokemonBundle } from "../api/pokeApi";
import type { PokemonBundle } from "../types/pokemon";
import { getOriginRegion, hasAbilityChange, hasMovePoolChange, hasStatChange, hasTypeChange, sortTypes, spriteArtwork } from "../utils/pokemon";
import { comparePokemonPath, pokemonOverviewPath } from "../utils/routes";
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

export default function FormChangesPage() {
  const { baseName = "", variantName = "" } = useParams();
  const navigate = useNavigate();
  const [base, setBase] = useState<PokemonBundle | null>(null);
  const [variant, setVariant] = useState<PokemonBundle | null>(null);
  const [abilityNames, setAbilityNames] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true); setError("");
    Promise.all([getPokemonBundle(baseName, controller.signal), getPokemonBundle(variantName, controller.signal)])
      .then(async ([a, b]) => {
        if (controller.signal.aborted) return;
        setBase(a); setVariant(b);
        const resources = [...a.pokemon.abilities, ...b.pokemon.abilities].map((entry) => entry.ability);
        const localized = await getLocalizedResourceNames(resources, "ability", controller.signal);
        if (!controller.signal.aborted) setAbilityNames(localized);
      })
      .catch((reason: unknown) => {
        if (reason instanceof Error && reason.name === "AbortError") return;
        setError(reason instanceof Error ? reason.message : "No fue posible comparar las formas.");
      })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [baseName, variantName]);

  const stats = useMemo(() => base && variant ? statRows(base, variant) : [], [base, variant]);

  if (loading) return <div className="app-shell"><Header contextLabel="Cambios de forma" version="v19.1" /><LoadingState message="Analizando la forma..." /></div>;
  if (error || !base || !variant) return <div className="app-shell"><Header contextLabel="Cambios de forma" version="v19.1" /><ErrorState message={error || "No se encontraron ambas formas."} /></div>;

  const baseDisplay = getDisplayName(base.species, base.pokemon.name);
  const variantDisplay = getDisplayName(variant.species, variant.pokemon.name);
  const baseMoveCount = new Set((base.pokemon.moves || []).map((row) => row.move.name)).size;
  const variantMoveCount = new Set((variant.pokemon.moves || []).map((row) => row.move.name)).size;
  const changes = [
    ["Tipo", hasTypeChange(base.pokemon, variant.pokemon)],
    ["Estadísticas", hasStatChange(base.pokemon, variant.pokemon)],
    ["Habilidades", hasAbilityChange(base.pokemon, variant.pokemon)],
    ["Movimientos", hasMovePoolChange(base.pokemon, variant.pokemon)],
    ["Región", getOriginRegion(base.species, base.pokemon.name) !== getOriginRegion(variant.species, variant.pokemon.name)],
  ] as const;

  return (
    <div className="app-shell exploration-shell">
      <Header contextLabel="Cambios de forma" version="v19.1" />
      <main className="standalone-page form-changes-page">
        <div className="standalone-page-head">
          <div>
            <span>BASE VS FORMA</span>
            <h2>Cambios de forma</h2>
            <p>No es una comparación competitiva. Esta vista responde únicamente qué cambia entre la forma base y la variante.</p>
          </div>
          <div className="standalone-head-actions">
            <button onClick={() => navigate(pokemonOverviewPath(variant.pokemon.name))}>Ver ficha</button>
            <button className="primary" onClick={() => navigate(comparePokemonPath(base.pokemon.name, variant.pokemon.name))}>Ir a Comparar / VS</button>
          </div>
        </div>

        <section className="form-change-hero">
          {[base, variant].map((bundle, index) => {
            const display = getDisplayName(bundle.species, bundle.pokemon.name);
            return <article key={bundle.pokemon.name}>
              <span>{index === 0 ? "FORMA BASE" : "FORMA ALTERNATIVA"}</span>
              <div className="form-change-art">{spriteArtwork(bundle.pokemon) && <img src={spriteArtwork(bundle.pokemon)} alt={display} />}</div>
              <h3>{display}</h3>
              <div className="type-pills compact">{sortTypes(bundle.pokemon.types).map((entry) => <span key={entry.type.name} className={`type-pill type-${entry.type.name}`}><TypeIcon type={entry.type.name} />{typeLabel(entry.type.name)}</span>)}</div>
              <small>{getOriginRegion(bundle.species, bundle.pokemon.name)}</small>
            </article>;
          })}
          <div className="evolution-big-arrow" aria-hidden="true">⇄</div>
        </section>

        <section className="change-summary-card">
          <div><span>RESUMEN</span><h3>Qué cambió</h3></div>
          <div className="change-chip-grid">{changes.map(([label, changed]) => <span key={label} className={changed ? "changed" : "same"}>{changed ? "✓" : "•"} {label}: {changed ? "cambia" : "se mantiene"}</span>)}</div>
        </section>

        <div className="form-change-columns">
          <section className="evolution-stat-comparison">
            <h3>Estadísticas base</h3>
            <div className="evolution-stat-list">{stats.map((row) => <article key={row.name}><span>{statLabel(row.name)}</span><strong>{row.before}</strong><div className="evolution-stat-arrow">→</div><strong>{row.after}</strong><b className={row.delta > 0 ? "positive" : row.delta < 0 ? "negative" : "neutral"}>{row.delta > 0 ? `+${row.delta}` : row.delta}</b></article>)}</div>
          </section>

          <section className="form-change-details">
            <article><span>Habilidades · {baseDisplay}</span><strong>{base.pokemon.abilities.map((entry) => abilityNames[entry.ability.name] || abilityLabel(entry.ability.name)).join(" · ") || "Sin datos"}</strong></article>
            <article><span>Habilidades · {variantDisplay}</span><strong>{variant.pokemon.abilities.map((entry) => abilityNames[entry.ability.name] || abilityLabel(entry.ability.name)).join(" · ") || "Sin datos"}</strong></article>
            <article><span>Movimientos registrados</span><strong>{baseMoveCount} → {variantMoveCount}</strong><small>Cuenta de movimientos disponibles en los datos de PokéAPI, no una recomendación competitiva.</small></article>
            <article><span>Región asociada</span><strong>{getOriginRegion(base.species, base.pokemon.name)} → {getOriginRegion(variant.species, variant.pokemon.name)}</strong></article>
          </section>
        </div>
      </main>
    </div>
  );
}
