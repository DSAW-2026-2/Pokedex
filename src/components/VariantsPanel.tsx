import { useEffect, useMemo, useState } from "react";
import { getVarietyDetails } from "../api/pokeApi";
import type { Pokemon, PokemonBundle } from "../types/pokemon";
import LoadingState from "./LoadingState";
import ErrorState from "./ErrorState";
import EvolutionLine from "./EvolutionLine";
import TypeIcon from "./TypeIcon";
import {
  getVariantContext,
  hasAbilityChange,
  hasMovePoolChange,
  hasTypeChange,
  isMeaningfulVariant,
  shinyArtwork,
  sortTypes,
  spriteArtwork,
} from "../utils/pokemon";
import { titleCase, typeLabel } from "../utils/text";

interface VariantsPanelProps {
  bundle: PokemonBundle;
  onSelectPokemon: (name: string) => void;
  onOpenVariant: (name: string) => void;
  onCompareVariant: (baseName: string, variantName: string) => void;
  onCompareChanges: (baseName: string, variantName: string) => void;
  onCompareEvolution: (fromName: string, toName: string) => void;
  onOpenGallery: (name: string) => void;
}

function TypeLine({ label, pokemon }: { label?: string; pokemon: Pokemon }) {
  return (
    <div className="variant-type-line">
      {label && <span>{label}</span>}
      <div className="mini-types variant-types">
        {sortTypes(pokemon.types).map((entry) => (
          <span key={`${pokemon.name}-${entry.type.name}`} className={`mini-type type-${entry.type.name}`}>
            <TypeIcon type={entry.type.name} />
            {typeLabel(entry.type.name)}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function VariantsPanel({
  bundle,
  onSelectPokemon,
  onOpenVariant,
  onCompareVariant,
  onCompareChanges,
  onCompareEvolution,
  onOpenGallery,
}: VariantsPanelProps) {
  const [varieties, setVarieties] = useState<Pokemon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showShiny, setShowShiny] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError("");
    getVarietyDetails(bundle.species, controller.signal)
      .then(setVarieties)
      .catch((reason: unknown) => {
        if (reason instanceof Error && reason.name === "AbortError") return;
        setError(reason instanceof Error ? reason.message : "No fue posible cargar las formas.");
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [bundle.species.id]);

  const basePokemon = useMemo(() => {
    const defaultName = bundle.species.varieties?.find((entry) => entry.is_default)?.pokemon?.name;
    return varieties.find((entry) => entry.name === defaultName)
      || (bundle.pokemon.name === defaultName ? bundle.pokemon : varieties[0])
      || bundle.pokemon;
  }, [bundle, varieties]);

  const meaningful = useMemo(
    () => varieties.filter((entry) => isMeaningfulVariant(basePokemon, entry)),
    [basePokemon, varieties],
  );

  if (loading) return <LoadingState message="Cargando formas relevantes..." />;
  if (error) return <ErrorState message={error} />;

  return (
    <section className="variants-panel" role="tabpanel">
      <div className="variants-heading">
        <div>
          <h2>Formas Alternativas</h2>
          <p>Mostramos variantes con cambios relevantes de identidad, tipo, estadísticas, habilidad o funcionamiento.</p>
        </div>
        <div className="variants-heading-actions">
          <button type="button" className="gallery-open-button" onClick={() => onOpenGallery(bundle.pokemon.name)}>Galería Normal / Variocolor</button>
        {meaningful.length > 0 && (
          <div className="variant-shiny-control" aria-label="Vista de color de las formas">
            <span>Visualización</span>
            <div className="variant-shiny-toggle" role="group" aria-label="Normal o variocolor">
              <button
                type="button"
                className={!showShiny ? "active" : ""}
                aria-pressed={!showShiny}
                onClick={() => setShowShiny(false)}
              >
                Normal
              </button>
              <button
                type="button"
                className={showShiny ? "active" : ""}
                aria-pressed={showShiny}
                onClick={() => setShowShiny(true)}
              >
                ✨ Variocolor
              </button>
            </div>
          </div>
        )}
        </div>
      </div>

      {meaningful.length ? (
        <div className="variants-grid">
          {meaningful.map((variant) => {
            const changedType = hasTypeChange(basePokemon, variant);
            const changedAbility = hasAbilityChange(basePokemon, variant);
            const changedMoves = hasMovePoolChange(basePokemon, variant);
            const normalArtwork = spriteArtwork(variant);
            const variocolorArtwork = shinyArtwork(variant);
            const artwork = showShiny ? variocolorArtwork : normalArtwork;
            const selected = variant.name === bundle.pokemon.name;
            const artworkAlt = `${titleCase(variant.name)}${showShiny ? " variocolor" : ""}`;
            return (
              <article key={variant.id} className={`variant-card ${selected ? "selected" : ""}`}>
                <div className={`variant-art ${showShiny ? "is-shiny" : ""}`}>
                  {artwork ? (
                    <img src={artwork} alt={artworkAlt} />
                  ) : (
                    <span className="variant-art-missing">
                      {showShiny ? "Variocolor no disponible" : "Sin imagen disponible"}
                    </span>
                  )}
                  {showShiny && variocolorArtwork && (
                    <span className="variant-shiny-badge">✨ Variocolor</span>
                  )}
                </div>
                <div className="variant-copy">
                  <span className="variant-context">{getVariantContext(variant.name)}</span>
                  <strong>{titleCase(variant.name)}</strong>
                  {changedType ? (
                    <div className="type-change-block">
                      <TypeLine label="Original:" pokemon={basePokemon} />
                      <TypeLine label="Nuevo:" pokemon={variant} />
                    </div>
                  ) : (
                    <TypeLine pokemon={variant} />
                  )}
                  <div className="variant-change-summary">
                    <span className={changedType ? "changed" : "same"}>Tipo: {changedType ? "cambia" : "igual"}</span>
                    <span className={changedAbility ? "changed" : "same"}>Habilidad: {changedAbility ? "cambia" : "igual"}</span>
                    <span className={changedMoves ? "changed" : "same"}>Movimientos: {changedMoves ? "cambian" : "iguales"}</span>
                  </div>
                  <div className="variant-card-actions">
                    <button type="button" className="primary" onClick={() => onOpenVariant(variant.name)}>Ver ficha</button>
                    <button type="button" onClick={() => onCompareChanges(basePokemon.name, variant.name)}>Qué cambió</button>
                    <button type="button" onClick={() => onCompareVariant(basePokemon.name, variant.name)}>VS</button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="variants-empty">No tiene formas alternativas disponibles por el momento.</div>
      )}

      <EvolutionLine bundle={bundle} onSelectPokemon={onSelectPokemon} onCompareEvolution={onCompareEvolution} />
    </section>
  );
}
