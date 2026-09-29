import { useEffect, useMemo, useState } from "react";
import type { ChangeEvent, FormEvent, MouseEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getHoldableItemIndex, getLocalizedResourceNames, getPokemonBundle, getSearchIndex, getTypeRelations } from "../api/pokeApi";
import {
  findSimilarCompetitivePresets,
  getCompetitivePreset,
  suggestCompetitiveSet,
  type CompetitiveSet,
  type CompetitiveSetSource,
} from "../data/competitiveSets";
import { useCustomCompetitiveSets } from "../hooks/useCustomCompetitiveSets";
import type { NamedAPIResource, Pokemon, PokemonBundle, PokemonTypeResource, SearchIndexItem } from "../types/pokemon";
import { calculateDefensiveProfile, compareBaseStats, matchupMultiplier } from "../utils/combat";
import { comparePokemonPath, pokemonOverviewPath } from "../utils/routes";
import { getComparisonSuggestions, resolveComparisonName } from "../utils/comparisonSearch";
import { localizeCompetitiveSet } from "../utils/competitiveLocalization";
import { abilityLabel, generationRoman, getDisplayName, moveLabel, padDex, statLabel, titleCase, typeLabel } from "../utils/text";
import { sortTypes, spriteArtwork } from "../utils/pokemon";
import {
  COMPETITIVE_ITEM_SUGGESTION_KEYS,
  EMPTY_EV_SPREAD,
  NATURE_OPTIONS,
  ROLE_OPTIONS,
  formatEvSpread,
  getAvailableVersionGroups,
  getMoveOptionsForVersion,
  itemLabel,
  normalizeEvSpread,
  resolveAbilityKey,
  resolveItemKey,
  resolveMoveKey,
  resolveNatureKey,
  validateAbility,
  validateEvSpread,
  validateItem,
  validateMoveForVersion,
  validateNature,
  versionGroupLabel,
  type EvSpread,
} from "../utils/setValidation";
import Header from "./Header";
import TypeIcon from "./TypeIcon";

interface LoadedComparison {
  a: PokemonBundle;
  b: PokemonBundle;
  resources: PokemonTypeResource[];
}

const TAG_COPY: Record<string, [string, string]> = {
  "control-turno": ["Control de turno", "Ambas configuraciones incluyen herramientas para aliviar presión inmediata."],
  pivot: ["Capacidad de pivote", "Ambos pueden reposicionarse y conservar la iniciativa para el equipo."],
  "presion-fisica": ["Presión ofensiva física", "Ambos mantienen amenaza de daño físico además de su utilidad."],
  "presion-especial": ["Presión ofensiva especial", "Ambos dependen principalmente de su Ataque Especial para presionar."],
  prioridad: ["Prioridad", "Ambas configuraciones incluyen herramientas que pueden ganar tiempo o actuar antes."],
  debilitacion: ["Debilitación", "Las configuraciones comparten herramientas para reducir la presión rival."],
  soporte: ["Soporte", "Ambas configuraciones priorizan utilidad además del daño."],
};

function typesOf(bundle: PokemonBundle): string[] {
  return sortTypes(bundle.pokemon.types).map((row) => row.type.name);
}

function sourceDisclaimer(source: CompetitiveSetSource): string {
  if (source === "curated") return "";
  if (source === "custom") return "Configuración personalizada guardada localmente en este navegador.";
  return "Generada según estadísticas, tipos, habilidades y movimientos disponibles. No representa una regulación o contexto competitivo específico.";
}

function roleFromSet(role: string): string {
  const value = role.toLowerCase();
  if (value.includes("físico") && !value.includes("muralla")) return "Atacante físico";
  if (value.includes("especial") && !value.includes("muralla")) return "Atacante especial";
  if (value.includes("mixto")) return "Atacante mixto";
  if (value.includes("muralla") && value.includes("física")) return "Muralla física";
  if (value.includes("muralla") && value.includes("especial")) return "Muralla especial";
  if (value.includes("velocidad")) return "Control de velocidad";
  if (value.includes("setup") || value.includes("sweeper") || value.includes("preparación") || value.includes("barrido")) return "Preparación / Barrido";
  if (value.includes("campo")) return "Control de campo";
  if (value.includes("pivote")) return "Pivote";
  return "Soporte";
}

function blankCustomSet(base: CompetitiveSet, pokemon: Pokemon): CompetitiveSet {
  const availableVersions = getAvailableVersionGroups(pokemon);
  const versionGroup = base.versionGroup && availableVersions.includes(base.versionGroup)
    ? base.versionGroup
    : availableVersions[0] || "";
  return {
    ...base,
    source: "custom",
    label: "Mi configuración",
    role: ROLE_OPTIONS.includes(base.role as (typeof ROLE_OPTIONS)[number]) ? base.role : roleFromSet(base.role),
    tags: [],
    moves: [...base.moves].slice(0, 4),
    versionGroup,
    evValues: base.evValues ? normalizeEvSpread(base.evValues) : normalizeEvSpread(base.evs),
  };
}

const SOURCE_BUTTON_LABEL: Record<CompetitiveSetSource, string> = {
  curated: "✓ Curada",
  suggested: "⚙ Sugerida",
  custom: "✏ Personalizada",
};

function CompetitiveCard({
  set,
  recommendedSet,
  source,
  hasCurated,
  hasCustom,
  pokemon,
  pokemonName,
  onSourceChange,
  onSaveCustom,
  onRemoveCustom,
}: {
  set: CompetitiveSet;
  recommendedSet: CompetitiveSet;
  source: CompetitiveSetSource;
  hasCurated: boolean;
  hasCustom: boolean;
  pokemon: Pokemon;
  pokemonName: string;
  onSourceChange: (source: CompetitiveSetSource) => void;
  onSaveCustom: (set: CompetitiveSet) => void;
  onRemoveCustom: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [displaySet, setDisplaySet] = useState<CompetitiveSet>(set);
  const [draft, setDraft] = useState<CompetitiveSet>(() => blankCustomSet(set, pokemon));
  const [itemResources, setItemResources] = useState<NamedAPIResource[]>([]);
  const [itemLoading, setItemLoading] = useState(false);
  const [itemError, setItemError] = useState("");
  const [localizedAbilityOptions, setLocalizedAbilityOptions] = useState<Record<string, string>>({});
  const [localizedMoveOptions, setLocalizedMoveOptions] = useState<Record<string, string>>({});
  const [localizedItemOptions, setLocalizedItemOptions] = useState<Record<string, string>>({});
  const [localizedOptionsLoading, setLocalizedOptionsLoading] = useState(false);

  useEffect(() => {
    setDraft(blankCustomSet(set, pokemon));
    setDisplaySet(set);
    const controller = new AbortController();
    void localizeCompetitiveSet(pokemon, set, controller.signal)
      .then((localized) => { if (!controller.signal.aborted) setDisplaySet(localized); })
      .catch((reason: unknown) => {
        if (reason instanceof Error && reason.name === "AbortError") return;
      });
    return () => controller.abort();
  }, [set, pokemon]);

  useEffect(() => {
    if (source === "custom" && !hasCustom) setEditing(true);
  }, [source, hasCustom]);

  useEffect(() => {
    if (!editing || itemResources.length) return;
    const controller = new AbortController();
    setItemLoading(true);
    setItemError("");
    void getHoldableItemIndex(controller.signal)
      .then((items) => {
        if (!controller.signal.aborted) setItemResources(items);
      })
      .catch((reason: unknown) => {
        if (reason instanceof Error && reason.name === "AbortError") return;
        if (!controller.signal.aborted) setItemError("No fue posible validar el catálogo de objetos equipables.");
      })
      .finally(() => {
        if (!controller.signal.aborted) setItemLoading(false);
      });
    return () => controller.abort();
  }, [editing, itemResources.length]);

  const versionGroups = useMemo(() => getAvailableVersionGroups(pokemon), [pokemon]);
  const selectedVersion = draft.versionGroup || versionGroups[0] || "";
  const moveOptions = useMemo(
    () => getMoveOptionsForVersion(pokemon, selectedVersion),
    [pokemon, selectedVersion],
  );
  const moveOptionResources = useMemo(() => {
    const allowed = new Set(moveOptions);
    return (pokemon.moves || []).filter((entry) => allowed.has(entry.move.name)).map((entry) => entry.move);
  }, [pokemon, moveOptions]);
  const itemSuggestionResources = useMemo(() => {
    const preferred = new Set<string>(COMPETITIVE_ITEM_SUGGESTION_KEYS);
    if (set.itemKey) preferred.add(set.itemKey);
    if (recommendedSet.itemKey) preferred.add(recommendedSet.itemKey);
    if (draft.itemKey) preferred.add(draft.itemKey);
    return itemResources.filter((item) => preferred.has(item.name));
  }, [itemResources, set.itemKey, recommendedSet.itemKey, draft.itemKey]);

  useEffect(() => {
    if (!editing) return;
    const controller = new AbortController();
    setLocalizedOptionsLoading(true);
    void Promise.all([
      getLocalizedResourceNames(pokemon.abilities.map((entry) => entry.ability), "ability", controller.signal),
      getLocalizedResourceNames(moveOptionResources, "move", controller.signal),
      getLocalizedResourceNames(itemSuggestionResources, "generic", controller.signal),
    ])
      .then(([abilities, moves, items]) => {
        if (controller.signal.aborted) return;
        setLocalizedAbilityOptions(abilities);
        setLocalizedMoveOptions(moves);
        setLocalizedItemOptions(items);
      })
      .catch((reason: unknown) => {
        if (reason instanceof Error && reason.name === "AbortError") return;
      })
      .finally(() => {
        if (!controller.signal.aborted) setLocalizedOptionsLoading(false);
      });
    return () => controller.abort();
  }, [editing, pokemon, moveOptionResources, itemSuggestionResources]);

  useEffect(() => {
    if (!editing) return;
    setDraft((current) => {
      let changed = false;
      const next = { ...current, moves: [...current.moves] };
      const abilityKey = current.abilityKey || resolveAbilityKey(pokemon, current.ability, localizedAbilityOptions);
      if (abilityKey && localizedAbilityOptions[abilityKey] && current.ability !== localizedAbilityOptions[abilityKey]) {
        next.ability = localizedAbilityOptions[abilityKey];
        next.abilityKey = abilityKey;
        changed = true;
      }
      const itemKey = current.itemKey || resolveItemKey(itemResources, current.item, localizedItemOptions);
      if (itemKey && localizedItemOptions[itemKey] && current.item !== localizedItemOptions[itemKey]) {
        next.item = localizedItemOptions[itemKey];
        next.itemKey = itemKey;
        changed = true;
      }
      const keys = current.moveKeys?.length
        ? current.moveKeys
        : current.moves.map((move) => resolveMoveKey(pokemon, move, localizedMoveOptions) || "");
      next.moves = current.moves.map((move, index) => {
        const key = keys[index];
        const label = key ? localizedMoveOptions[key] : "";
        if (label && move !== label) { changed = true; return label; }
        return move;
      });
      next.moveKeys = keys.filter(Boolean);
      return changed ? next : current;
    });
  }, [editing, pokemon, itemResources, localizedAbilityOptions, localizedMoveOptions, localizedItemOptions]);

  const evValues = draft.evValues || EMPTY_EV_SPREAD;
  const evCheck = useMemo(() => validateEvSpread(evValues), [evValues]);

  const validation = useMemo(() => {
    const roleValid = ROLE_OPTIONS.includes(draft.role as (typeof ROLE_OPTIONS)[number]);
    const abilityKey = resolveAbilityKey(pokemon, draft.ability, localizedAbilityOptions);
    const abilityValid = validateAbility(pokemon, draft.ability, localizedAbilityOptions);
    const itemKey = resolveItemKey(itemResources, draft.item, localizedItemOptions);
    const itemValid = itemResources.length > 0 && validateItem(itemResources, draft.item, localizedItemOptions);
    const natureKey = resolveNatureKey(draft.nature);
    const natureValid = validateNature(draft.nature);
    const moves = [...draft.moves].slice(0, 4);
    while (moves.length < 4) moves.push("");
    const moveKeys = moves.map((move) => resolveMoveKey(pokemon, move, localizedMoveOptions));
    const moveValidity = moves.map((move) => Boolean(move.trim()) && validateMoveForVersion(pokemon, move, selectedVersion, localizedMoveOptions));
    const canonicalMoves = moveKeys.filter((move): move is string => Boolean(move));
    const duplicateMoves = new Set(canonicalMoves).size !== canonicalMoves.length;
    const versionValid = Boolean(selectedVersion) && versionGroups.includes(selectedVersion);
    const readyForItemValidation = !itemLoading && !itemError && itemResources.length > 0;
    const valid = roleValid
      && abilityValid
      && readyForItemValidation
      && itemValid
      && natureValid
      && evCheck.valid
      && evCheck.total <= 510
      && versionValid
      && moveValidity.every(Boolean)
      && canonicalMoves.length === 4
      && !duplicateMoves;
    return {
      valid,
      roleValid,
      abilityKey,
      abilityValid,
      itemKey,
      itemValid,
      natureKey,
      natureValid,
      moveKeys,
      moveValidity,
      duplicateMoves,
      versionValid,
      readyForItemValidation,
    };
  }, [draft, pokemon, itemResources, itemLoading, itemError, evCheck, selectedVersion, versionGroups, localizedAbilityOptions, localizedMoveOptions, localizedItemOptions]);

  function updateField(field: keyof CompetitiveSet, value: string) {
    setDraft((current) => ({ ...current, [field]: value }));
  }

  function updateMove(index: number, value: string) {
    setDraft((current) => {
      const moves = [...current.moves];
      while (moves.length < 4) moves.push("");
      moves[index] = value;
      return { ...current, moves };
    });
  }

  function updateEv(field: keyof EvSpread, value: string) {
    const numeric = Math.max(0, Math.min(999, Number(value) || 0));
    setDraft((current) => ({
      ...current,
      evValues: { ...(current.evValues || EMPTY_EV_SPREAD), [field]: numeric },
    }));
  }

  function applyRecommended() {
    setDraft(blankCustomSet(recommendedSet, pokemon));
  }

  function saveCustom() {
    if (!validation.valid || !validation.abilityKey || !validation.itemKey || !validation.natureKey) return;
    const nature = NATURE_OPTIONS.find((option) => option.key === validation.natureKey);
    const canonicalMoves = validation.moveKeys.filter((move): move is string => Boolean(move));
    onSaveCustom({
      ...draft,
      source: "custom",
      label: "Mi configuración",
      role: draft.role,
      ability: localizedAbilityOptions[validation.abilityKey] || abilityLabel(validation.abilityKey),
      abilityKey: validation.abilityKey,
      item: localizedItemOptions[validation.itemKey] || itemLabel(validation.itemKey),
      itemKey: validation.itemKey,
      nature: nature?.label || draft.nature,
      natureKey: validation.natureKey,
      evValues,
      evs: formatEvSpread(evValues),
      moves: canonicalMoves.map((move) => localizedMoveOptions[move] || moveLabel(move)),
      moveKeys: canonicalMoves,
      versionGroup: selectedVersion,
      tags: [],
    });
    setEditing(false);
  }

  function chooseSource(next: CompetitiveSetSource) {
    if (next === "curated" && !hasCurated) return;
    onSourceChange(next);
    if (next === "custom" && !hasCustom) {
      setDraft(blankCustomSet(recommendedSet, pokemon));
      setEditing(true);
    }
  }

  const abilityDatalistId = `ability-options-${pokemon.id}`;
  const itemDatalistId = `item-options-${pokemon.id}`;
  const moveDatalistId = `move-options-${pokemon.id}`;

  return (
    <>
      <div className="competitive-card">
        <div className="competitive-card-head">
          <strong>Configuración competitiva</strong>
          <span>{displaySet.label}</span>
        </div>

        <div className="set-source-tabs" role="group" aria-label={`Origen de la configuración de ${pokemonName}`}>
          {(["curated", "suggested", "custom"] as CompetitiveSetSource[]).map((option) => (
            <button
              key={option}
              type="button"
              className={source === option ? "active" : ""}
              disabled={option === "curated" && !hasCurated}
              onClick={() => chooseSource(option)}
            >
              {SOURCE_BUTTON_LABEL[option]}
            </button>
          ))}
        </div>

        {source === "suggested" && (
          <div className="suggested-set-note">
            <strong>Configuración sugerida por PokéCheck</strong>
            <p>{sourceDisclaimer(source)}</p>
          </div>
        )}
        {source === "custom" && hasCustom && <p className="custom-set-note">{sourceDisclaimer(source)}</p>}

        <dl>
          <div><dt>Rol</dt><dd>{displaySet.role}</dd></div>
          <div><dt>Habilidad</dt><dd>{displaySet.ability}</dd></div>
          <div><dt>Objeto</dt><dd>{displaySet.item}</dd></div>
          <div><dt>Naturaleza</dt><dd>{displaySet.nature}</dd></div>
          <div><dt>Repartición EVs</dt><dd>{displaySet.evs}</dd></div>
          {displaySet.versionGroup && <div><dt>Juego / Generación</dt><dd>{versionGroupLabel(displaySet.versionGroup)}</dd></div>}
        </dl>
        <div className="competitive-moves"><span>MOVIMIENTOS CLAVE</span><div>{displaySet.moves.map((move, index) => <b key={`${move}-${index}`}>{move || "Movimiento libre"}</b>)}</div></div>
        <div className="custom-set-actions">
          <button type="button" onClick={() => { setDraft(blankCustomSet(set, pokemon)); setEditing(true); }}>Editar configuración</button>
          {hasCustom && <button type="button" className="danger" onClick={onRemoveCustom}>Borrar configuración</button>}
        </div>
      </div>

      {editing && (
        <div className="custom-set-drawer-backdrop" role="presentation" onMouseDown={(event: MouseEvent<HTMLDivElement>) => {
          if (event.currentTarget === event.target) setEditing(false);
        }}>
          <aside className="custom-set-drawer" role="dialog" aria-modal="true" aria-label={`Editar configuración personalizada de ${pokemonName}`}>
            <div className="custom-set-drawer-head">
              <div>
                <h2>Editar configuración personalizada</h2>
                <p>Crea un set propio para {pokemonName}. PokéCheck valida que habilidad, objeto, EVs y movimientos correspondan a datos reales disponibles.</p>
              </div>
              <button type="button" className="drawer-close" onClick={() => setEditing(false)} aria-label="Cerrar editor">×</button>
            </div>

            <div className="custom-set-editor">
              <section className="recommended-set-box">
                <div>
                  <strong>Recomendados por PokéCheck</strong>
                  <span>Rellena el editor con una base sugerida y luego ajústala.</span>
                </div>
                <button type="button" onClick={applyRecommended}>Aplicar recomendados</button>
              </section>

              <label>Juego / Generación
                <select value={selectedVersion} onChange={(e: ChangeEvent<HTMLSelectElement>) => updateField("versionGroup", e.target.value)}>
                  {versionGroups.length ? versionGroups.map((version) => <option value={version} key={version}>{versionGroupLabel(version)}</option>) : <option value="">Sin datos disponibles</option>}
                </select>
                {!validation.versionValid && <small className="field-validation invalid">⚠ No hay un grupo de versión válido para comprobar este set.</small>}
              </label>

              <label>Rol
                <select value={draft.role} onChange={(e: ChangeEvent<HTMLSelectElement>) => updateField("role", e.target.value)}>
                  {ROLE_OPTIONS.map((role) => <option key={role} value={role}>{role}</option>)}
                </select>
              </label>

              <label>Habilidad
                <input list={abilityDatalistId} value={draft.ability} onChange={(e: ChangeEvent<HTMLInputElement>) => updateField("ability", e.target.value)} autoComplete="off" />
                <datalist id={abilityDatalistId}>{pokemon.abilities.map((entry) => localizedAbilityOptions[entry.ability.name] ? <option key={entry.ability.name} value={localizedAbilityOptions[entry.ability.name]} /> : null)}</datalist>
                {localizedOptionsLoading && !Object.keys(localizedAbilityOptions).length && <small className="field-validation pending">Cargando habilidades en español...</small>}
                {!validation.abilityValid && <small className="field-validation invalid">✕ Esta habilidad no pertenece a esta especie o forma.</small>}
              </label>

              <label>Objeto
                <input list={itemDatalistId} value={draft.item} onChange={(e: ChangeEvent<HTMLInputElement>) => updateField("item", e.target.value)} autoComplete="off" placeholder={itemLoading ? "Cargando objetos reales..." : "Busca un objeto equipable"} />
                <datalist id={itemDatalistId}>{itemSuggestionResources.map((item) => localizedItemOptions[item.name] ? <option key={item.name} value={localizedItemOptions[item.name]} /> : null)}</datalist>
                {itemLoading && <small className="field-validation pending">Validando catálogo de objetos equipables...</small>}
                {!itemLoading && localizedOptionsLoading && !Object.keys(localizedItemOptions).length && <small className="field-validation pending">Cargando recomendaciones de objetos en español...</small>}
                {itemError && <small className="field-validation invalid">⚠ {itemError}</small>}
                {!itemLoading && !itemError && itemResources.length > 0 && !validation.itemValid && <small className="field-validation invalid">✕ Objeto no reconocido como objeto equipable real.</small>}
              </label>

              <label>Naturaleza
                <select value={resolveNatureKey(draft.nature) || ""} onChange={(e: ChangeEvent<HTMLSelectElement>) => {
                  const option = NATURE_OPTIONS.find((nature) => nature.key === e.target.value);
                  updateField("nature", option?.label || "");
                }}>
                  <option value="" disabled>Selecciona una naturaleza</option>
                  {NATURE_OPTIONS.map((nature) => <option key={nature.key} value={nature.key}>{nature.label}</option>)}
                </select>
                {!validation.natureValid && <small className="field-validation invalid">✕ Selecciona una naturaleza oficial.</small>}
              </label>

              <fieldset className="ev-editor">
                <legend>EVs <span>{evCheck.total} / 510</span></legend>
                <div className="ev-grid">
                  {([
                    ["hp", "PS"],
                    ["attack", "Atq"],
                    ["defense", "Def"],
                    ["specialAttack", "At.Esp"],
                    ["specialDefense", "Def.Esp"],
                    ["speed", "Vel"],
                  ] as Array<[keyof EvSpread, string]>).map(([key, label]) => (
                    <label key={key}>{label}<input type="number" min="0" max="252" step="1" value={evValues[key]} onChange={(e: ChangeEvent<HTMLInputElement>) => updateEv(key, e.target.value)} /></label>
                  ))}
                </div>
                {!evCheck.valid && evCheck.errors.map((message) => <small className="field-validation invalid" key={message}>✕ {message}</small>)}
                {evCheck.valid && <small className="field-validation valid">✓ EVs dentro del límite competitivo.</small>}
              </fieldset>

              <div className="move-editor-block">
                <div className="move-editor-title"><strong>Movimientos 1-4</strong><span>{localizedOptionsLoading && !Object.keys(localizedMoveOptions).length ? "Cargando nombres en español..." : `Solo movimientos aprendibles en ${selectedVersion ? versionGroupLabel(selectedVersion) : "el juego seleccionado"}`}</span></div>
                <datalist id={moveDatalistId}>{moveOptions.map((move) => localizedMoveOptions[move] ? <option key={move} value={localizedMoveOptions[move]} /> : null)}</datalist>
                <div className="custom-move-grid">
                  {[0, 1, 2, 3].map((index) => (
                    <label key={index}>Movimiento {index + 1}
                      <input list={moveDatalistId} value={draft.moves[index] || ""} onChange={(e: ChangeEvent<HTMLInputElement>) => updateMove(index, e.target.value)} autoComplete="off" />
                      {!validation.moveValidity[index] && <small className="field-validation invalid">✕ Este Pokémon no puede aprender este movimiento en el juego seleccionado.</small>}
                    </label>
                  ))}
                </div>
                {validation.duplicateMoves && <small className="field-validation invalid">✕ Un set no puede repetir el mismo movimiento.</small>}
              </div>

              <div className={`set-legality-status ${validation.valid ? "valid" : "invalid"}`}>
                <strong>{validation.valid ? "✓ Set válido" : "✕ Set con datos pendientes o inválidos"}</strong>
                <span>{validation.valid ? `Compatible con los datos de ${versionGroupLabel(selectedVersion)} disponibles en PokéAPI.` : "No se puede guardar hasta corregir los campos marcados."}</span>
              </div>
            </div>

            <div className="custom-set-drawer-actions">
              <button type="button" onClick={() => setEditing(false)}>Cancelar</button>
              <button type="button" className="primary" disabled={!validation.valid} onClick={saveCustom}>Guardar set</button>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}

function PokemonVsColumn({
  bundle,
  side,
  set,
  recommendedSet,
  source,
  customSet,
  onSourceChange,
  onSaveCustom,
  onRemoveCustom,
}: {
  bundle: PokemonBundle;
  side: "a" | "b";
  set: CompetitiveSet;
  recommendedSet: CompetitiveSet;
  source: CompetitiveSetSource;
  customSet?: CompetitiveSet;
  onSourceChange: (source: CompetitiveSetSource) => void;
  onSaveCustom: (set: CompetitiveSet) => void;
  onRemoveCustom: () => void;
}) {
  const { pokemon, species } = bundle;
  const artwork = spriteArtwork(pokemon);
  const types = typesOf(bundle);
  const curated = getCompetitivePreset(pokemon.name);
  const displayName = getDisplayName(species, pokemon.name);

  return (
    <article className={`vs-pokemon-column side-${side}`}>
      <div className="vs-pokemon-head">
        <div>
          <span>{padDex(species.id)} · GENERACIÓN {generationRoman(species.generation?.name || "")}</span>
          <h2>{displayName}</h2>
        </div>
        <em>{set.role}</em>
      </div>
      <div className="vs-artwork">{artwork ? <img src={artwork} alt={`Ilustración de ${displayName}`} /> : <span>Sin imagen</span>}</div>
      <section className="vs-field-data">
        <h3>Datos de campo</h3>
        <div className="vs-field-grid">
          <div><span>TIPOS</span><div className="effect-pills">{types.map((type) => <b key={type} className={`effect-pill type-${type}`}><TypeIcon type={type} />{typeLabel(type)}</b>)}</div></div>
          <div><span>ALTURA / PESO</span><strong>{(pokemon.height / 10).toFixed(1)} m / {(pokemon.weight / 10).toFixed(1)} kg</strong></div>
        </div>
      </section>
      <section className="vs-stats">
        <h3>Estadísticas de combate</h3>
        <div className="vs-stats-card">
          {pokemon.stats.map((row) => (
            <div className="stat-row" key={row.stat.name}>
              <span>{statLabel(row.stat.name)}</span><strong>{row.base_stat}</strong>
              <div className="stat-track"><i style={{ width: `${Math.min(100, (row.base_stat / 180) * 100)}%` }} /></div>
            </div>
          ))}
        </div>
      </section>
      <CompetitiveCard
        set={set}
        recommendedSet={recommendedSet}
        source={source}
        hasCurated={Boolean(curated)}
        hasCustom={Boolean(customSet)}
        pokemon={pokemon}
        pokemonName={displayName}
        onSourceChange={onSourceChange}
        onSaveCustom={onSaveCustom}
        onRemoveCustom={onRemoveCustom}
      />
    </article>
  );
}

export default function ComparePage() {
  const navigate = useNavigate();
  const customSets = useCustomCompetitiveSets();
  const { pokemonA = "rillaboom", pokemonB = "incineroar" } = useParams<{ pokemonA?: string; pokemonB?: string }>();
  const [queryA, setQueryA] = useState(pokemonA);
  const [queryB, setQueryB] = useState(pokemonB);
  const [data, setData] = useState<LoadedComparison | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchIndex, setSearchIndex] = useState<SearchIndexItem[]>([]);
  const [inputError, setInputError] = useState("");
  const [inputNote, setInputNote] = useState("");
  const [sourceA, setSourceA] = useState<CompetitiveSetSource>("suggested");
  const [sourceB, setSourceB] = useState<CompetitiveSetSource>("suggested");

  useEffect(() => {
    const controller = new AbortController();
    void getSearchIndex(controller.signal)
      .then((index) => {
        if (!controller.signal.aborted) setSearchIndex(index);
      })
      .catch(() => {
        // El comparador sigue funcionando con nombres exactos aunque el índice no cargue.
      });
    return () => controller.abort();
  }, []);

  useEffect(() => {
    setQueryA(pokemonA);
    setQueryB(pokemonB);
    const controller = new AbortController();
    setLoading(true);
    setError("");
    Promise.all([getPokemonBundle(pokemonA, controller.signal), getPokemonBundle(pokemonB, controller.signal)])
      .then(async ([a, b]) => {
        const unionTypes = [...new Set([...typesOf(a), ...typesOf(b)])];
        const resources = await getTypeRelations(unionTypes, controller.signal);
        if (!controller.signal.aborted) setData({ a, b, resources });
      })
      .catch((reason) => {
        if (!controller.signal.aborted) setError(reason instanceof Error ? reason.message : "No se pudo cargar la comparación.");
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [pokemonA, pokemonB]);

  const customA = data ? customSets.get(data.a.pokemon.name) : undefined;
  const customB = data ? customSets.get(data.b.pokemon.name) : undefined;

  useEffect(() => {
    if (!data) return;
    setSourceA(getCompetitivePreset(data.a.pokemon.name) ? "curated" : customSets.get(data.a.pokemon.name) ? "custom" : "suggested");
    setSourceB(getCompetitivePreset(data.b.pokemon.name) ? "curated" : customSets.get(data.b.pokemon.name) ? "custom" : "suggested");
  }, [data?.a.pokemon.name, data?.b.pokemon.name]);

  const baseSuggestedA = useMemo(() => data ? suggestCompetitiveSet(data.a.pokemon) : null, [data?.a.pokemon]);
  const baseSuggestedB = useMemo(() => data ? suggestCompetitiveSet(data.b.pokemon) : null, [data?.b.pokemon]);
  const [localizedSuggestedA, setLocalizedSuggestedA] = useState<{ name: string; set: CompetitiveSet } | null>(null);
  const [localizedSuggestedB, setLocalizedSuggestedB] = useState<{ name: string; set: CompetitiveSet } | null>(null);

  useEffect(() => {
    if (!data || !baseSuggestedA || !baseSuggestedB) return;
    const controller = new AbortController();
    setLocalizedSuggestedA({ name: data.a.pokemon.name, set: baseSuggestedA });
    setLocalizedSuggestedB({ name: data.b.pokemon.name, set: baseSuggestedB });
    void localizeCompetitiveSet(data.a.pokemon, baseSuggestedA, controller.signal)
      .then((set) => { if (!controller.signal.aborted) setLocalizedSuggestedA({ name: data.a.pokemon.name, set }); });
    void localizeCompetitiveSet(data.b.pokemon, baseSuggestedB, controller.signal)
      .then((set) => { if (!controller.signal.aborted) setLocalizedSuggestedB({ name: data.b.pokemon.name, set }); });
    return () => controller.abort();
  }, [data?.a.pokemon.name, data?.b.pokemon.name, baseSuggestedA, baseSuggestedB]);

  const suggestedA = data && localizedSuggestedA?.name === data.a.pokemon.name ? localizedSuggestedA.set : baseSuggestedA;
  const suggestedB = data && localizedSuggestedB?.name === data.b.pokemon.name ? localizedSuggestedB.set : baseSuggestedB;

  const selectedSetA = useMemo(() => {
    if (!data || !suggestedA) return null;
    if (sourceA === "curated") return getCompetitivePreset(data.a.pokemon.name) || suggestedA;
    if (sourceA === "custom") return customA || suggestedA;
    return suggestedA;
  }, [data, suggestedA, sourceA, customA]);

  const selectedSetB = useMemo(() => {
    if (!data || !suggestedB) return null;
    if (sourceB === "curated") return getCompetitivePreset(data.b.pokemon.name) || suggestedB;
    if (sourceB === "custom") return customB || suggestedB;
    return suggestedB;
  }, [data, suggestedB, sourceB, customB]);

  const analysis = useMemo(() => {
    if (!data) return null;
    const typesA = typesOf(data.a);
    const typesB = typesOf(data.b);
    const aMultipliers = typesA.map((type) => ({ type, value: matchupMultiplier(type, typesB, data.resources) }));
    const bMultipliers = typesB.map((type) => ({ type, value: matchupMultiplier(type, typesA, data.resources) }));
    const bestA = [...aMultipliers].sort((x, y) => y.value - x.value)[0] || { type: "", value: 1 };
    const bestB = [...bMultipliers].sort((x, y) => y.value - x.value)[0] || { type: "", value: 1 };
    return {
      typesA,
      typesB,
      stats: compareBaseStats(data.a.pokemon, data.b.pokemon),
      profileA: calculateDefensiveProfile(typesA, data.resources),
      profileB: calculateDefensiveProfile(typesB, data.resources),
      bestA,
      bestB,
    };
  }, [data]);

  const suggestionsA = useMemo(() => getComparisonSuggestions(queryA, searchIndex, 5), [queryA, searchIndex]);
  const suggestionsB = useMemo(() => getComparisonSuggestions(queryB, searchIndex, 5), [queryB, searchIndex]);

  function submit(event: FormEvent) {
    event.preventDefault();
    if (!queryA.trim() || !queryB.trim()) return;
    setInputError("");
    setInputNote("");

    if (!searchIndex.length) {
      navigate(comparePokemonPath(queryA, queryB));
      return;
    }

    const resolvedA = resolveComparisonName(queryA, searchIndex);
    const resolvedB = resolveComparisonName(queryB, searchIndex);

    if (!resolvedA.name || !resolvedB.name) {
      const side = !resolvedA.name ? "A" : "B";
      setInputError(`No pude resolver el Pokémon ${side}. Elige una sugerencia o escribe un nombre parecido.`);
      return;
    }

    const notes = [resolvedA.correction, resolvedB.correction].filter(Boolean);
    if (notes.length) setInputNote(notes.join(" "));
    setQueryA(resolvedA.name);
    setQueryB(resolvedB.name);
    navigate(comparePokemonPath(resolvedA.name, resolvedB.name));
  }

  if (loading) {
    return <div className="app-shell"><Header contextLabel="Guía de Combate & Análisis VS" version="v19.1" /><div className="compare-loading">Preparando análisis VS...</div></div>;
  }
  if (error || !data || !analysis || !selectedSetA || !selectedSetB) {
    return <div className="app-shell"><Header contextLabel="Guía de Combate & Análisis VS" version="v19.1" /><div className="compare-loading error-state">{error || "No se pudo preparar la comparación."}</div></div>;
  }

  const nameA = getDisplayName(data.a.species, data.a.pokemon.name);
  const nameB = getDisplayName(data.b.species, data.b.pokemon.name);
  const sharedTags = selectedSetA.tags.filter((tag) => selectedSetB.tags.includes(tag));
  const matchupSummary = `${nameA} alcanza hasta x${analysis.bestA.value} con ataques de tipo ${typeLabel(analysis.bestA.type)} contra ${nameB}. ${nameB} alcanza hasta x${analysis.bestB.value} con ataques de tipo ${typeLabel(analysis.bestB.type)} contra ${nameA}. Esto describe solo la relación de tipos, no predice el ganador de una batalla.`;

  return (
    <div className="app-shell compare-shell">
      <Header contextLabel="Guía de Combate & Análisis VS" version="v19.1" />
      <section className="compare-title-row">
        <div><span>HERRAMIENTA DE ANÁLISIS COMPETITIVO</span><h1>Comparar Pokémon / VS</h1></div>
        <div className="compare-title-actions">
          <span className="analysis-scope-badge">Análisis general · sin regulación fija</span>
          <button type="button" onClick={() => navigate(pokemonOverviewPath(data.a.pokemon.name))}>← Volver a Pokédex</button>
        </div>
      </section>

      <form className="compare-picker" onSubmit={submit}>
        <label className="compare-field">Pokémon A
          <input value={queryA} onChange={(e: ChangeEvent<HTMLInputElement>) => { setQueryA(e.target.value); setInputError(""); }} autoComplete="off" placeholder="Ej. Rillaboom o Rillabon" />
          {queryA.trim().toLowerCase() !== pokemonA.toLowerCase() && suggestionsA.length > 0 && (
            <div className="compare-input-suggestions">
              <small>Coincidencias</small>
              {suggestionsA.map((match) => <button key={`a-${match.name}`} type="button" onClick={() => setQueryA(match.name)}><span>{titleCase(match.name)}</span><em>{match.id ? padDex(match.id) : "Forma"}</em></button>)}
            </div>
          )}
        </label>
        <b>VS</b>
        <label className="compare-field">Pokémon B
          <input value={queryB} onChange={(e: ChangeEvent<HTMLInputElement>) => { setQueryB(e.target.value); setInputError(""); }} autoComplete="off" placeholder="Escribe aunque no recuerdes el nombre exacto" />
          {queryB.trim().toLowerCase() !== pokemonB.toLowerCase() && suggestionsB.length > 0 && (
            <div className="compare-input-suggestions">
              <small>¿Quizá buscabas?</small>
              {suggestionsB.map((match) => <button key={`b-${match.name}`} type="button" onClick={() => setQueryB(match.name)}><span>{titleCase(match.name)}</span><em>{match.id ? padDex(match.id) : "Forma"}</em></button>)}
            </div>
          )}
        </label>
        <button type="submit">Comparar</button>
        {(inputError || inputNote) && <p className={`compare-picker-message ${inputError ? "error" : "note"}`}>{inputError || inputNote}</p>}
        {findSimilarCompetitivePresets(data.a.pokemon.name).length > 0 && (
          <div className="similar-compare-row">
            <span>¿Quieres comparar a {nameA} con un Pokémon de rol similar?</span>
            {findSimilarCompetitivePresets(data.a.pokemon.name).map((item) => (
              <button key={item.name} type="button" className="similar-pokemon-chip" onClick={() => navigate(comparePokemonPath(data.a.pokemon.name, item.name))}>
                {titleCase(item.name)} · {item.preset.role}
              </button>
            ))}
          </div>
        )}
      </form>

      <main className="vs-layout">
        <PokemonVsColumn
          bundle={data.a}
          side="a"
          set={selectedSetA}
          recommendedSet={getCompetitivePreset(data.a.pokemon.name) || suggestedA || selectedSetA}
          source={sourceA}
          customSet={customA}
          onSourceChange={setSourceA}
          onSaveCustom={(set) => { customSets.save(data.a.pokemon.name, set); setSourceA("custom"); }}
          onRemoveCustom={() => { customSets.remove(data.a.pokemon.name); setSourceA(getCompetitivePreset(data.a.pokemon.name) ? "curated" : "suggested"); }}
        />
        <section className="vs-center">
          <div className="vs-badge"><strong>VS</strong><span>MÉTRICAS FRENTE A FRENTE</span></div>
          <article className="vs-analysis-card">
            <h3>Ventaja por estadística</h3>
            {analysis.stats.map((row) => <div className="stat-advantage" key={row.stat}><span>{statLabel(row.stat)}</span><strong className={row.winner}>{row.winner === "tie" ? `Empate (${row.a})` : `${row.winner === "a" ? nameA : nameB} (+${row.difference})`}</strong></div>)}
          </article>
          <article className="vs-analysis-card">
            <h3>Relación de tipos</h3>
            <p>{matchupSummary}</p>
            <div className="matchup-mini-grid">
              {[[nameA, analysis.profileA], [nameB, analysis.profileB]].map(([name, profile]) => (
                <div key={String(name)}>
                  <strong>{String(name)}</strong>
                  <div className="mini-profile">
                    {(profile as ReturnType<typeof calculateDefensiveProfile>).map((row) => <span key={`${name}-${row.type}`} className={row.multiplier > 1 ? "weak" : row.multiplier === 0 ? "immune" : "resist"}>x{row.multiplier} <TypeIcon type={row.type} /> {typeLabel(row.type)}</span>)}
                  </div>
                </div>
              ))}
            </div>
          </article>
          <article className="vs-analysis-card">
            <h3>Coincidencias funcionales</h3>
            {sharedTags.length ? sharedTags.map((tag) => {
              const copy = TAG_COPY[tag] || [tag, "Ambas configuraciones comparten esta función."];
              return <div className="functional-match" key={tag}><strong>{copy[0]}</strong><p>{copy[1]}</p></div>;
            }) : <p>Las configuraciones seleccionadas no comparten funciones etiquetadas por PokéCheck.</p>}
          </article>
        </section>
        <PokemonVsColumn
          bundle={data.b}
          side="b"
          set={selectedSetB}
          recommendedSet={getCompetitivePreset(data.b.pokemon.name) || suggestedB || selectedSetB}
          source={sourceB}
          customSet={customB}
          onSourceChange={setSourceB}
          onSaveCustom={(set) => { customSets.save(data.b.pokemon.name, set); setSourceB("custom"); }}
          onRemoveCustom={() => { customSets.remove(data.b.pokemon.name); setSourceB(getCompetitivePreset(data.b.pokemon.name) ? "curated" : "suggested"); }}
        />
      </main>

      <section className="vs-conclusion">
        <h2>Lectura rápida de PokéCheck</h2>
        <p>{matchupSummary}</p>
        <p>Las configuraciones pueden ser curadas, sugeridas automáticamente o personalizadas. Ninguna opción sustituye el análisis de una regulación, equipo o metajuego concreto.</p>
      </section>
    </div>
  );
}
