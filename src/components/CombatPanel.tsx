import { useEffect, useMemo, useState } from "react";
import { getLocalizedResourceName, getTypeRelations } from "../api/pokeApi";
import type { PokemonBundle, PokemonTypeResource } from "../types/pokemon";
import { baseStatTotal, calculateDefensiveProfile, getOffensiveAdvantages } from "../utils/combat";
import { abilityLabel, getDisplayName, generationRoman, padDex, statLabel, typeLabel } from "../utils/text";
import { sortTypes, spriteArtwork } from "../utils/pokemon";
import TypeIcon from "./TypeIcon";

interface CombatPanelProps {
  bundle: PokemonBundle;
  onCompare: () => void;
}

function EffectPills({ rows, mode }: { rows: Array<{ type: string; multiplier: number }>; mode: "weak" | "resist" | "immune" }) {
  if (!rows.length) return <span className="combat-none">Ninguna</span>;
  return (
    <div className="effect-pills">
      {rows.map((row) => (
        <span key={`${mode}-${row.type}`} className={`effect-pill type-${row.type}`}>
          <TypeIcon type={row.type} />
          {typeLabel(row.type)}{row.multiplier !== 2 && row.multiplier !== 0 ? ` (x${row.multiplier})` : ""}
        </span>
      ))}
    </div>
  );
}

export default function CombatPanel({ bundle, onCompare }: CombatPanelProps) {
  const { pokemon, species } = bundle;
  const typeNames = useMemo(() => sortTypes(pokemon.types).map((entry) => entry.type.name), [pokemon.types]);
  const [resources, setResources] = useState<PokemonTypeResource[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    getTypeRelations(typeNames, controller.signal)
      .then((rows) => setResources(rows))
      .catch(() => setResources([]))
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [typeNames.join("|")]);

  const profile = useMemo(() => calculateDefensiveProfile(typeNames, resources), [typeNames, resources]);
  const offensive = useMemo(() => getOffensiveAdvantages(typeNames, resources), [typeNames, resources]);
  const weaknesses = profile.filter((row) => row.multiplier > 1);
  const resistances = profile.filter((row) => row.multiplier > 0 && row.multiplier < 1);
  const immunities = profile.filter((row) => row.multiplier === 0);
  const displayName = getDisplayName(species, pokemon.name);
  const artwork = spriteArtwork(pokemon);
  const firstAbilityResource = [...pokemon.abilities].sort((a, b) => a.slot - b.slot)[0]?.ability;
  const [localizedAbility, setLocalizedAbility] = useState(firstAbilityResource ? abilityLabel(firstAbilityResource.name) : "Sin datos");

  useEffect(() => {
    if (!firstAbilityResource) { setLocalizedAbility("Sin datos"); return; }
    const controller = new AbortController();
    setLocalizedAbility(abilityLabel(firstAbilityResource.name));
    getLocalizedResourceName(firstAbilityResource, "ability", controller.signal)
      .then((name) => { if (!controller.signal.aborted) setLocalizedAbility(name); })
      .catch(() => {});
    return () => controller.abort();
  }, [firstAbilityResource?.name, firstAbilityResource?.url]);

  return (
    <section className="combat-panel" role="tabpanel">
      <div className="combat-hero">
        <div className="combat-art">
          {artwork ? <img src={artwork} alt={`Ilustración de ${displayName}`} /> : <span>Sin imagen</span>}
        </div>
        <div className="combat-identity">
          <span>{padDex(species.id)} · GENERACIÓN {generationRoman(species.generation?.name || "")}</span>
          <h2>{displayName} <small>(Combate)</small></h2>
          <div className="combat-type-row">
            {typeNames.map((type) => (
              <span key={type} className={`type-pill type-${type}`}><TypeIcon type={type} />{typeLabel(type)}</span>
            ))}
            <em>Habilidad: {localizedAbility}</em>
          </div>
        </div>
      </div>

      <div className="combat-divider" />

      <div className="combat-grid">
        <div className="combat-column">
          <h3>Estadísticas Base</h3>
          <div className="stats-card">
            {pokemon.stats.map((row) => (
              <div className="stat-row" key={row.stat.name}>
                <span>{statLabel(row.stat.name)}</span>
                <strong>{row.base_stat}</strong>
                <div className="stat-track"><i style={{ width: `${Math.min(100, (row.base_stat / 180) * 100)}%` }} /></div>
              </div>
            ))}
            <div className="bst-row"><span>Total de estadísticas base:</span><strong>{baseStatTotal(pokemon)} total</strong></div>
          </div>
        </div>

        <div className="combat-column">
          <h3>Tabla de Efectividades</h3>
          <div className="effectiveness-card">
            {loading ? <p className="combat-loading">Calculando efectividades...</p> : (
              <>
                <div className="effect-group weak"><strong>Debilidades (x2 o más)</strong><EffectPills rows={weaknesses} mode="weak" /></div>
                <div className="effect-group resist"><strong>Resistencias (x0.5 / x0.25)</strong><EffectPills rows={resistances} mode="resist" /></div>
                <div className="effect-group immune"><strong>Inmunidades (x0)</strong><EffectPills rows={immunities} mode="immune" /></div>
              </>
            )}
          </div>
        </div>
      </div>

      <section className="offensive-card">
        <h3>Ventajas Ofensivas por Tipo</h3>
        <p>Los ataques de los propios tipos de {displayName} son súper efectivos contra los siguientes tipos:</p>
        <div className="offensive-grid">
          {offensive.map((row) => (
            <article key={row.sourceType}>
              <strong>Como tipo {typeLabel(row.sourceType)}</strong>
              <div className="effect-pills">
                {row.strongAgainst.length ? row.strongAgainst.map((type) => (
                  <span key={`${row.sourceType}-${type}`} className={`effect-pill type-${type}`}><TypeIcon type={type} />{typeLabel(type)}</span>
                )) : <span className="combat-none">Sin ventajas x2</span>}
              </div>
            </article>
          ))}
        </div>
      </section>

      <div className="combat-compare-cta">
        <span>¿Quieres comparar a {displayName} con otro Pokémon?</span>
        <button type="button" onClick={onCompare}>Ir a Comparar / VS</button>
      </div>
    </section>
  );
}
