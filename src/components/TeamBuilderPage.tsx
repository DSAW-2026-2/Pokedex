import { FormEvent, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Header from "./Header";
import TypeIcon from "./TypeIcon";
import { getPokemonBundle, getSearchIndex, getTypeRelations } from "../api/pokeApi";
import { applyLocalBattleForm, mergeBattleFormOptions, type BattleFormOption } from "../data/battleForms";
import type { PokemonBundle, PokemonTypeResource, SearchIndexItem } from "../types/pokemon";
import { calculateDefensiveProfile, getOffensiveAdvantages } from "../utils/combat";
import { spriteArtwork, sortTypes } from "../utils/pokemon";
import { pokemonOverviewPath } from "../utils/routes";
import { resolveSearchQuery } from "../utils/search";
import {
  analyzeTeamBasics,
  rankRepeatedWeaknesses,
  suggestTeamCandidates,
  TEAM_ROLES,
  type TeamMode,
  type TeamRole,
} from "../utils/teamBuilder";
import { abilityLabel, compactText, padDex, titleCase, typeLabel } from "../utils/text";

interface BuilderMember {
  baseBundle: PokemonBundle;
  bundle: PokemonBundle;
  role: TeamRole;
  formId: string;
  formKind: BattleFormOption["kind"];
}

function statValue(bundle: PokemonBundle, statName: string): number {
  return bundle.pokemon.stats.find((entry) => entry.stat.name === statName)?.base_stat || 0;
}

export default function TeamBuilderPage() {
  const [mode, setMode] = useState<TeamMode>("adventure");
  const [team, setTeam] = useState<BuilderMember[]>([]);
  const [query, setQuery] = useState("");
  const [index, setIndex] = useState<SearchIndexItem[]>([]);
  const [typeResources, setTypeResources] = useState<PokemonTypeResource[]>([]);
  const [busy, setBusy] = useState(false);
  const [formBusy, setFormBusy] = useState<string | null>(null);
  const [message, setMessage] = useState("Agrega Pokémon para empezar a analizar tu equipo.");

  useEffect(() => {
    const controller = new AbortController();
    getSearchIndex(controller.signal).then(setIndex).catch(() => setIndex([]));
    return () => controller.abort();
  }, []);

  useEffect(() => {
    const uniqueTypes = [...new Set(team.flatMap(({ bundle }) => bundle.pokemon.types.map((entry) => entry.type.name)))];
    if (!uniqueTypes.length) {
      setTypeResources([]);
      return;
    }
    const controller = new AbortController();
    getTypeRelations(uniqueTypes, controller.signal).then(setTypeResources).catch(() => setTypeResources([]));
    return () => controller.abort();
  }, [team]);

  const suggestions = useMemo(() => {
    const needle = compactText(query);
    if (!needle) return [];
    return index
      .filter((item) => item.id && item.id < 10000 && compactText(item.name).includes(needle))
      .slice(0, 8);
  }, [index, query]);

  const basics = useMemo(() => analyzeTeamBasics(team.map(({ bundle, role }) => ({
    name: bundle.pokemon.name,
    role,
    stats: {
      attack: statValue(bundle, "attack"),
      specialAttack: statValue(bundle, "special-attack"),
      speed: statValue(bundle, "speed"),
    },
    types: sortTypes(bundle.pokemon.types).map((entry) => entry.type.name),
  }))), [team]);

  const weaknessProfiles = useMemo(() => team.map(({ bundle }) => ({
    pokemon: bundle.pokemon.name,
    weaknesses: calculateDefensiveProfile(
      sortTypes(bundle.pokemon.types).map((entry) => entry.type.name),
      typeResources,
    ).filter((entry) => entry.multiplier > 1),
  })), [team, typeResources]);

  const repeatedWeaknesses = useMemo(() => rankRepeatedWeaknesses(weaknessProfiles), [weaknessProfiles]);

  const offensiveCoverage = useMemo(() => {
    const uniqueTypes = [...new Set(team.flatMap(({ bundle }) => bundle.pokemon.types.map((entry) => entry.type.name)))];
    return [...new Set(getOffensiveAdvantages(uniqueTypes, typeResources).flatMap((entry) => entry.strongAgainst))].sort();
  }, [team, typeResources]);

  const candidateSuggestions = useMemo(
    () => suggestTeamCandidates(repeatedWeaknesses, team.map((member) => member.bundle.pokemon.name), 3),
    [repeatedWeaknesses, team],
  );

  async function addPokemon(identifier: string | number) {
    if (team.length >= 6 || busy) {
      if (team.length >= 6) setMessage("Tu equipo ya tiene seis Pokémon.");
      return;
    }
    setBusy(true);
    try {
      const bundle = await getPokemonBundle(identifier);
      if (team.some((member) => member.bundle.species.name === bundle.species.name)) {
        setMessage(`${titleCase(bundle.species.name)} ya está representado en el equipo.`);
        return;
      }
      const defaultName = bundle.species.varieties?.find((item) => item.is_default)?.pokemon.name || bundle.pokemon.name;
      const baseBundle = bundle.pokemon.name === defaultName ? bundle : await getPokemonBundle(defaultName);
      const formKind: BattleFormOption["kind"] = bundle.pokemon.name === defaultName ? "base" : "api";
      setTeam((current) => [...current, { baseBundle, bundle, role: "Sin rol", formId: bundle.pokemon.name, formKind }]);
      setQuery("");
      setMessage(`${titleCase(bundle.pokemon.name)} se añadió al equipo.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "No fue posible agregar ese Pokémon.");
    } finally {
      setBusy(false);
    }
  }

  async function submitPokemon(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!query.trim() || !index.length) return;
    try {
      const result = resolveSearchQuery(query, index);
      const identifier = result.identifier ?? result.correction;
      if (!identifier) {
        setMessage("No encontramos ese Pokémon. Prueba con una de las sugerencias.");
        return;
      }
      await addPokemon(identifier);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "No fue posible buscar ese Pokémon.");
    }
  }

  function setRole(speciesName: string, role: TeamRole) {
    setTeam((current) => current.map((member) => member.bundle.species.name === speciesName ? { ...member, role } : member));
  }

  async function setForm(speciesName: string, formId: string) {
    const member = team.find((entry) => entry.bundle.species.name === speciesName);
    if (!member || formBusy) return;
    const option = mergeBattleFormOptions(member.baseBundle.species.name, member.baseBundle.species.varieties)
      .find((item) => item.id === formId);
    if (!option) return;

    setFormBusy(speciesName);
    try {
      let bundle = member.baseBundle;
      if (option.kind === "api" && option.pokemonName) {
        bundle = await getPokemonBundle(option.pokemonName);
      } else if (option.kind === "local" && option.localForm) {
        bundle = { ...member.baseBundle, pokemon: applyLocalBattleForm(member.baseBundle.pokemon, option.localForm) };
      }
      setTeam((current) => current.map((entry) => entry.bundle.species.name === speciesName
        ? { ...entry, bundle, formId: option.id, formKind: option.kind }
        : entry));
      setMessage(`${option.label} quedó seleccionada para el análisis competitivo.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "No fue posible cargar esa forma.");
    } finally {
      setFormBusy(null);
    }
  }

  function changeMode(nextMode: TeamMode) {
    setMode(nextMode);
    if (nextMode === "adventure") {
      setTeam((current) => current.map((member) => ({
        ...member,
        bundle: member.baseBundle,
        formId: member.baseBundle.pokemon.name,
        formKind: "base",
      })));
      setMessage("Modo Aventura: el análisis vuelve a las formas base.");
    }
  }

  function removePokemon(speciesName: string) {
    setTeam((current) => current.filter((member) => member.bundle.species.name !== speciesName));
    setMessage(`${titleCase(speciesName)} salió del equipo.`);
  }

  return (
    <div className="tool-page-shell">
      <Header contextLabel="Team Builder" version="v19.1" />
      <main className="team-builder-page">
        <section className="tool-page-heading">
          <div>
            <span className="home-kicker">CONSTRUYE · ANALIZA · AJUSTA</span>
            <h2>Team Builder</h2>
            <p>Arma un equipo de hasta seis Pokémon y revisa tipos, debilidades, orientación ofensiva, velocidad y roles.</p>
          </div>
          <div className="mode-switch" aria-label="Modo de análisis">
            <button className={mode === "adventure" ? "active" : ""} onClick={() => changeMode("adventure")} type="button">Aventura</button>
            <button className={mode === "competitive" ? "active" : ""} onClick={() => changeMode("competitive")} type="button">Competitivo</button>
          </div>
        </section>

        <section className="team-builder-controls">
          <form className="team-add-form" onSubmit={submitPokemon}>
            <label htmlFor="team-pokemon-search">Agregar Pokémon</label>
            <div className="team-add-row">
              <input
                id="team-pokemon-search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Ej. Lucario, Garchomp o #445"
                disabled={busy || team.length >= 6}
                autoComplete="off"
              />
              <button type="submit" disabled={busy || team.length >= 6 || !query.trim()}>{busy ? "Agregando…" : "Agregar Pokémon"}</button>
              <button className="secondary-button" type="button" disabled={!team.length} onClick={() => { setTeam([]); setMessage("Equipo limpio. Agrega un Pokémon para comenzar."); }}>Limpiar equipo</button>
            </div>
            {suggestions.length > 0 && query.trim() && (
              <div className="team-search-suggestions">
                {suggestions.map((item) => (
                  <button key={item.name} type="button" onClick={() => void addPokemon(item.name)}>
                    {padDex(item.id)} · {titleCase(item.name)}
                  </button>
                ))}
              </div>
            )}
            <p className="tool-inline-status" aria-live="polite">{message}</p>
          </form>
        </section>

        <section className="team-slots" aria-label="Equipo actual">
          {Array.from({ length: 6 }, (_, indexSlot) => {
            const member = team[indexSlot];
            if (!member) return <div className="team-slot empty" key={`empty-${indexSlot}`}><span>{indexSlot + 1}</span><strong>Espacio libre</strong><small>Agrega un Pokémon</small></div>;
            const { pokemon, species } = member.bundle;
            const types = sortTypes(pokemon.types).map((entry) => entry.type.name);
            const formOptions = mergeBattleFormOptions(member.baseBundle.species.name, member.baseBundle.species.varieties);
            const selectedForm = formOptions.find((option) => option.id === member.formId);
            return (
              <article className="team-slot filled" key={species.name}>
                <div className="team-slot-head"><span>{padDex(species.id)}</span><button type="button" onClick={() => removePokemon(species.name)}>Quitar</button></div>
                <img src={spriteArtwork(pokemon)} alt={titleCase(pokemon.name)} />
                <h3>{titleCase(pokemon.name)}</h3>
                <div className="team-type-row">{types.map((type) => <span className="team-type-pill" key={`${pokemon.name}-${type}`}><TypeIcon type={type} size="sm" />{typeLabel(type)}</span>)}</div>
                {mode === "competitive" && formOptions.length > 1 && (
                  <label>Forma
                    <select
                      value={member.formId}
                      disabled={formBusy === species.name}
                      onChange={(event) => void setForm(species.name, event.target.value)}
                    >
                      {formOptions.map((option) => <option value={option.id} key={option.id}>{option.label}</option>)}
                    </select>
                  </label>
                )}
                {mode === "competitive" && selectedForm?.kind === "local" && (
                  <p className="team-form-note"><strong>{selectedForm.label}</strong> · Habilidad: {abilityLabel(pokemon.abilities[0]?.ability.name || "")}</p>
                )}
                <label>Rol
                  <select value={member.role} onChange={(event) => setRole(species.name, event.target.value as TeamRole)}>
                    {TEAM_ROLES.map((role) => <option value={role} key={role}>{role}</option>)}
                  </select>
                </label>
                <Link to={pokemonOverviewPath(member.formKind === "local" ? species.name : pokemon.name)}>Ver ficha →</Link>
              </article>
            );
          })}
        </section>

        <section className="team-analysis-grid">
          <article className="analysis-panel">
            <span>COBERTURA</span><h3>Cobertura ofensiva por STAB</h3>
            {offensiveCoverage.length ? <div className="analysis-tags">{offensiveCoverage.map((type) => <span key={type}>{typeLabel(type)}</span>)}</div> : <p>Agrega Pokémon para calcular qué tipos puedes golpear de forma supereficaz.</p>}
          </article>

          <article className="analysis-panel">
            <span>DEBILIDADES</span><h3>Debilidades repetidas</h3>
            {repeatedWeaknesses.length ? (
              <div className="weakness-list">{repeatedWeaknesses.slice(0, 6).map((entry) => <div key={entry.type}><strong>{typeLabel(entry.type)}</strong><span>{entry.count} miembro{entry.count === 1 ? "" : "s"}{entry.severe ? ` · ${entry.severe} con ×4` : ""}</span></div>)}</div>
            ) : <p>{team.length ? "No hay debilidades repetidas detectadas con los datos cargados." : "Aquí aparecerán las amenazas compartidas del equipo."}</p>}
          </article>

          <article className="analysis-panel">
            <span>OFENSIVA</span><h3>Físico / Especial</h3>
            <div className="analysis-metrics"><b>{basics.orientation.physical}</b><span>Físicos</span><b>{basics.orientation.special}</b><span>Especiales</span><b>{basics.orientation.mixed}</b><span>Mixtos</span></div>
          </article>

          <article className="analysis-panel">
            <span>VELOCIDAD</span><h3>Ritmo del equipo</h3>
            <div className="speed-summary"><strong>{basics.averageSpeed || "—"}</strong><span>Velocidad base media</span><b>{team.length ? basics.speedBand : "Sin datos"}</b></div>
          </article>

          <article className="analysis-panel wide">
            <span>{mode === "competitive" ? "ROLES" : "SINERGIA"}</span>
            <h3>{mode === "competitive" ? "Roles por cubrir" : "Lectura rápida del equipo"}</h3>
            {mode === "competitive" ? (
              basics.roleGaps.length ? <div className="analysis-tags">{basics.roleGaps.map((role) => <span key={role}>{role}</span>)}</div> : <p>Los roles principales de atacante físico, atacante especial, soporte y pivote están representados.</p>
            ) : (
              <div className="synergy-copy">
                <p>{basics.duplicateTypes.length ? `Hay tipos repetidos: ${basics.duplicateTypes.map((item) => `${typeLabel(item.type)} ×${item.count}`).join(", ")}.` : "La diversidad de tipos no muestra repeticiones importantes."}</p>
                <p>{basics.orientation.physical && basics.orientation.special ? "Tienes presencia física y especial." : team.length ? "Tu daño se inclina hacia un solo lado; podría convenir diversificar." : "Agrega miembros para analizar el equilibrio ofensivo."}</p>
              </div>
            )}
          </article>
        </section>

        <section className="team-suggestions-section">
          <div className="home-section-heading"><span>SUGERENCIAS</span><h3>Candidatos para completar el equipo</h3><p>Son opciones orientativas basadas en debilidades repetidas. No son un ranking ni garantizan un formato competitivo concreto.</p></div>
          <div className="team-suggestion-grid">
            {candidateSuggestions.map((candidate) => (
              <article key={candidate.name}>
                <img src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${index.find((item) => item.name === candidate.name)?.id || 0}.png`} alt="" />
                <div><h4>{titleCase(candidate.name)}</h4><p>{candidate.reason}</p><button type="button" disabled={team.length >= 6 || busy} onClick={() => void addPokemon(candidate.name)}>Agregar al equipo</button></div>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
