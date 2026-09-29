import { useEffect, useMemo, useState } from "react";
import type { ChangeEvent } from "react";
import type { PokemonBundle } from "../types/pokemon";
import { getLocalizedResourceName } from "../api/pokeApi";
import {
  abilityLabel,
  formatGenderRatio,
  generationRoman,
  getCategory,
  getDisplayName,
  getFlavorEntriesByVersion,
  padDex,
  statLabel,
  typeLabel,
  versionLabel,
} from "../utils/text";
import { getOriginRegion, getVariantContext, shinyArtwork, sortTypes, spriteArtwork } from "../utils/pokemon";
import TypeIcon from "./TypeIcon";
import PokePassport from "./PokePassport";
import PokemonHistory from "./PokemonHistory";

interface OverviewPanelProps {
  bundle: PokemonBundle;
  favorite: boolean;
  onToggleFavorite: () => void;
  onOpenBase?: (name: string) => void;
  onCompareBase?: (baseName: string, variantName: string) => void;
  onOpenRelatedVariant?: (name: string) => void;
  onOpenMoves?: (name: string) => void;
}

function abilities(bundle: PokemonBundle, localized: Record<string, string>): string {
  const values = [...bundle.pokemon.abilities]
    .sort((a, b) => a.slot - b.slot)
    .map((entry) => `${localized[entry.ability.name] || abilityLabel(entry.ability.name)}${entry.is_hidden ? " (Oculta)" : ""}`);
  return values.join(", ") || "Sin datos";
}

export default function OverviewPanel({
  bundle,
  favorite,
  onToggleFavorite,
  onOpenBase,
  onCompareBase,
  onOpenRelatedVariant,
  onOpenMoves,
}: OverviewPanelProps) {
  const { pokemon, species } = bundle;
  const [showShiny, setShowShiny] = useState(false);
  const flavorEntries = useMemo(() => getFlavorEntriesByVersion(species), [species]);
  const [flavorIndex, setFlavorIndex] = useState(0);
  const [localizedAbilities, setLocalizedAbilities] = useState<Record<string, string>>({});

  useEffect(() => {
    setShowShiny(false);
    setFlavorIndex(0);
  }, [pokemon.name]);

  useEffect(() => {
    const controller = new AbortController();
    const resources = pokemon.abilities.map((entry) => entry.ability);
    Promise.all(resources.map(async (resource) => [resource.name, await getLocalizedResourceName(resource, "ability", controller.signal)] as const))
      .then((entries) => { if (!controller.signal.aborted) setLocalizedAbilities(Object.fromEntries(entries)); })
      .catch(() => { if (!controller.signal.aborted) setLocalizedAbilities({}); });
    return () => controller.abort();
  }, [pokemon.name]);

  const normalArt = spriteArtwork(pokemon);
  const shinyArt = shinyArtwork(pokemon);
  const artwork = showShiny && shinyArt ? shinyArt : normalArt;
  const displayName = getDisplayName(species, pokemon.name);
  const activeFlavor = flavorEntries[flavorIndex] || null;
  const baseName = species.varieties?.find((entry) => entry.is_default)?.pokemon?.name || species.name;
  const isVariantProfile = pokemon.name !== baseName;
  const relatedVarieties = species.varieties || [];

  const data = [
    ["Altura", `${(pokemon.height / 10).toFixed(1)} m`],
    ["Peso", `${(pokemon.weight / 10).toFixed(1)} kg`],
    ["Habilidades", abilities(bundle, localizedAbilities)],
    ["Generación", generationRoman(species.generation?.name || "")],
    ["Región", getOriginRegion(species, pokemon.name)],
  ];

  function nextCuriosity() {
    if (!flavorEntries.length) return;
    setFlavorIndex((current) => (current + 1) % flavorEntries.length);
  }

  return (
    <section className="overview-panel" role="tabpanel">
      {isVariantProfile && (
        <div className="variant-profile-banner">
          <div className="variant-profile-copy">
            <span>{getVariantContext(pokemon.name)}</span>
            <strong>Ficha propia de {displayName}</strong>
            <p>Esta forma comparte especie con {getDisplayName(species, baseName)}, pero conserva sus propios tipos, habilidades, estadísticas, altura, peso e imagen.</p>
          </div>
          <div className="variant-profile-controls">
            {relatedVarieties.length > 1 && (
              <label>
                Forma relacionada
                <select
                  value={pokemon.name}
                  onChange={(event: ChangeEvent<HTMLSelectElement>) => onOpenRelatedVariant?.(event.target.value)}
                >
                  {relatedVarieties.map((entry) => (
                    <option key={entry.pokemon.name} value={entry.pokemon.name}>
                      {getDisplayName(species, entry.pokemon.name)}
                    </option>
                  ))}
                </select>
              </label>
            )}
            <div className="variant-profile-actions">
              <button type="button" onClick={() => onOpenBase?.(baseName)}>← Ver forma base</button>
              <button type="button" className="primary" onClick={() => onCompareBase?.(baseName, pokemon.name)}>Comparar con la base</button>
            </div>
          </div>
        </div>
      )}

      <div className="overview-hero-row enriched">
        <div className="pokemon-illustration-column">
          <div className={`pokemon-illustration-frame ${showShiny ? "is-shiny" : ""}`}>
            {artwork ? <img src={artwork} alt={`${showShiny ? "Variocolor" : "Ilustración"} de ${displayName}`} /> : <span>Sin imagen</span>}
          </div>
          <div className="shiny-toggle" aria-label="Alternar imagen normal y variocolor">
            <button className={!showShiny ? "active" : ""} type="button" onClick={() => setShowShiny(false)}>Normal</button>
            <button className={showShiny ? "active" : ""} type="button" onClick={() => setShowShiny(true)} disabled={!shinyArt}>Variocolor ✨</button>
          </div>
        </div>

        <div className="overview-identity enriched">
          <span className="dex-number">{padDex(species.id)}</span>
          <h2>{displayName}</h2>
          <div className="type-pills">
            {sortTypes(pokemon.types).map((entry) => (
              <span key={entry.type.name} className={`type-pill type-${entry.type.name}`}>
                <TypeIcon type={entry.type.name} />
                {typeLabel(entry.type.name)}
              </span>
            ))}
          </div>

          <p className="overview-flavor">{activeFlavor?.text || "PokéAPI no tiene una descripción disponible para esta especie."}</p>

          <div className="overview-quick-actions">
            <button className={`favorite-button ${favorite ? "active" : ""}`} type="button" onClick={onToggleFavorite} aria-pressed={favorite}>
              <span aria-hidden="true">{favorite ? "★" : "☆"}</span>
              {favorite ? "En favoritos" : "Favorito"}
            </button>
            <button className="curiosity-button" type="button" onClick={nextCuriosity} disabled={flavorEntries.length < 2}>
              <span aria-hidden="true">✦</span>
              Dato curioso
            </button>
            <button className="curiosity-button" type="button" onClick={() => onOpenMoves?.(pokemon.name)}>
              Ver movimientos disponibles →
            </button>
          </div>

          <div className="overview-extra-grid">
            <article>
              <span>Especie</span>
              <strong>{getCategory(species)}</strong>
            </article>
            <article>
              <span>Proporción de género</span>
              <strong>{formatGenderRatio(species)}</strong>
            </article>
            <article className="pokedex-entry-card">
              <span>Entrada Pokédex</span>
              {flavorEntries.length ? (
                <select
                  aria-label="Entrada Pokédex por juego"
                  value={flavorIndex}
                  onChange={(event: ChangeEvent<HTMLSelectElement>) => setFlavorIndex(Number(event.target.value))}
                >
                  {flavorEntries.map((entry, index) => (
                    <option key={`${entry.version}-${index}`} value={index}>{versionLabel(entry.version)}</option>
                  ))}
                </select>
              ) : <strong>Sin datos</strong>}
            </article>
          </div>
        </div>
      </div>

      {isVariantProfile && (
        <section className="variant-profile-stats" aria-label="Estadísticas de la forma">
          <div className="variant-profile-section-heading">
            <div>
              <span>DATOS PROPIOS DE LA FORMA</span>
              <h3>Estadísticas base</h3>
            </div>
            <strong>BST {pokemon.stats.reduce((total, row) => total + row.base_stat, 0)}</strong>
          </div>
          <div className="variant-profile-stat-grid">
            {pokemon.stats.map((row) => (
              <div className="variant-profile-stat" key={row.stat.name}>
                <span>{statLabel(row.stat.name)}</span>
                <strong>{row.base_stat}</strong>
                <div className="stat-track"><i style={{ width: `${Math.min(100, (row.base_stat / 180) * 100)}%` }} /></div>
              </div>
            ))}
          </div>
        </section>
      )}

      <div className="overview-divider" />
      <h3>{isVariantProfile ? "Datos de la forma" : "Datos Base"}</h3>
      <div className="base-data-grid">
        {data.map(([label, value]) => (
          <article key={label} className="base-data-card">
            <span>{label}</span>
            <strong>{value}</strong>
          </article>
        ))}
      </div>

      <div className="overview-complements-grid">
        <PokePassport bundle={bundle} />
        <PokemonHistory bundle={bundle} />
      </div>
    </section>
  );
}
