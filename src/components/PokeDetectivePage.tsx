import { FormEvent, useEffect, useMemo, useState } from "react";
import Header from "./Header";
import { getLocalizedResourceName, getPokemonBundle, getSearchIndex } from "../api/pokeApi";
import type { PokemonBundle, SearchIndexItem } from "../types/pokemon";
import { spriteArtwork, sortTypes } from "../utils/pokemon";
import {
  buildDetectiveClues,
  getDetectiveConfig,
  isCorrectGuess,
  randomNationalDexId,
  visibleClueCount,
  type DetectiveDifficulty,
} from "../utils/detective";
import { compactText, generationRoman, statLabel, titleCase, typeLabel } from "../utils/text";

interface DetectiveRound {
  bundle: PokemonBundle;
  clues: string[];
}

function reorderClues(clues: string[], difficulty: DetectiveDifficulty): string[] {
  if (difficulty === "hard") return [clues[2], clues[3], clues[5], clues[4], clues[0], clues[1]];
  if (difficulty === "medium") return [clues[0], clues[2], clues[3], clues[5], clues[1], clues[4]];
  return clues;
}

export default function PokeDetectivePage() {
  const [difficulty, setDifficulty] = useState<DetectiveDifficulty>("easy");
  const [round, setRound] = useState<DetectiveRound | null>(null);
  const [index, setIndex] = useState<SearchIndexItem[]>([]);
  const [query, setQuery] = useState("");
  const [attemptsLeft, setAttemptsLeft] = useState(getDetectiveConfig("easy").attempts);
  const [wrongAttempts, setWrongAttempts] = useState(0);
  const [guesses, setGuesses] = useState<string[]>([]);
  const [state, setState] = useState<"playing" | "won" | "lost">("playing");
  const [message, setMessage] = useState("Lee las pistas y escribe tu respuesta.");
  const [busy, setBusy] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    getSearchIndex(controller.signal).then(setIndex).catch(() => setIndex([]));
    return () => controller.abort();
  }, []);

  async function startRound(nextDifficulty: DetectiveDifficulty = difficulty) {
    setBusy(true);
    setState("playing");
    setQuery("");
    setWrongAttempts(0);
    setGuesses([]);
    setMessage("Preparando un nuevo caso…");
    setAttemptsLeft(getDetectiveConfig(nextDifficulty).attempts);
    try {
      const bundle = await getPokemonBundle(randomNationalDexId());
      const firstAbility = bundle.pokemon.abilities[0]?.ability;
      const ability = await getLocalizedResourceName(firstAbility, "ability");
      const top = [...bundle.pokemon.stats].sort((a, b) => b.base_stat - a.base_stat)[0];
      const clues = buildDetectiveClues({
        generation: generationRoman(bundle.species.generation?.name || ""),
        types: sortTypes(bundle.pokemon.types).map((entry) => typeLabel(entry.type.name)),
        heightM: bundle.pokemon.height / 10,
        weightKg: bundle.pokemon.weight / 10,
        ability,
        topStat: statLabel(top?.stat.name || ""),
        topStatValue: top?.base_stat || 0,
      });
      setRound({ bundle, clues: reorderClues(clues, nextDifficulty) });
      setMessage("Caso listo. Usa las pistas y encuentra al Pokémon.");
    } catch (error) {
      setRound(null);
      setMessage(error instanceof Error ? error.message : "No fue posible preparar el caso.");
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => { void startRound("easy"); }, []);

  const suggestions = useMemo(() => {
    const needle = compactText(query);
    if (!needle || state !== "playing") return [];
    return index.filter((item) => item.id && item.id <= 1025 && compactText(item.name).includes(needle)).slice(0, 6);
  }, [index, query, state]);

  const visibleClues = round ? round.clues.slice(0, visibleClueCount(difficulty, wrongAttempts)) : [];

  function chooseDifficulty(next: DetectiveDifficulty) {
    setDifficulty(next);
    void startRound(next);
  }

  function submitGuess(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!round || !query.trim() || state !== "playing") return;
    const guess = query.trim();
    if (guesses.some((item) => compactText(item) === compactText(guess))) {
      setMessage("Ya intentaste con ese nombre. Prueba otro Pokémon.");
      return;
    }
    setGuesses((current) => [...current, guess]);
    if (isCorrectGuess(guess, round.bundle.pokemon.name, round.bundle.species.name)) {
      setState("won");
      setMessage(`¡Caso resuelto! Era ${titleCase(round.bundle.pokemon.name)}.`);
      return;
    }
    const nextAttempts = attemptsLeft - 1;
    const beforeClues = visibleClueCount(difficulty, wrongAttempts);
    const afterClues = visibleClueCount(difficulty, wrongAttempts + 1);
    setAttemptsLeft(nextAttempts);
    setWrongAttempts((current) => current + 1);
    setQuery("");
    if (nextAttempts <= 0) {
      setState("lost");
      setMessage(`Se acabaron los intentos. Era ${titleCase(round.bundle.pokemon.name)}.`);
    } else {
      setMessage(afterClues > beforeClues ? `No es ${titleCase(guess)}. Se reveló una pista adicional.` : `No es ${titleCase(guess)}. Sigue usando las pistas disponibles.`);
    }
  }

  const revealed = state !== "playing";

  return (
    <div className="tool-page-shell">
      <Header contextLabel="PokéDetective" version="v19.1" />
      <main className="detective-page">
        <section className="tool-page-heading detective-heading">
          <div><span className="home-kicker">CASO POKÉMON</span><h2>PokéDetective</h2><p>Adivina el Pokémon usando únicamente pistas obtenidas de datos reales.</p></div>
          <div className="difficulty-switch" aria-label="Dificultad">
            {(["easy", "medium", "hard"] as DetectiveDifficulty[]).map((value) => <button type="button" key={value} disabled={busy} className={difficulty === value ? "active" : ""} onClick={() => chooseDifficulty(value)}>{getDetectiveConfig(value).label}</button>)}
          </div>
        </section>

        <section className="detective-board">
          <article className="detective-mystery-card">
            <span className="detective-case-label">POKÉMON DESCONOCIDO</span>
            <div className={`detective-art ${revealed ? "revealed" : "hidden"}`}>
              {round && <img src={spriteArtwork(round.bundle.pokemon)} alt={revealed ? titleCase(round.bundle.pokemon.name) : "Silueta del Pokémon misterioso"} />}
              {!round && <div className="detective-art-placeholder" />}
            </div>
            <h3>{revealed && round ? titleCase(round.bundle.pokemon.name) : "¿Quién es?"}</h3>
            <div className="attempt-counter"><strong>{attemptsLeft}</strong><span>intentos restantes</span></div>
            <button type="button" className="secondary-button" onClick={() => void startRound()} disabled={busy}>{busy ? "Preparando…" : "Jugar de nuevo"}</button>
          </article>

          <article className="detective-clues-panel">
            <div className="detective-panel-title"><div><span>PISTAS</span><h3>Lo que sabemos</h3></div><b>{visibleClues.length}/6</b></div>
            {busy ? <p>Consultando el expediente en PokéAPI…</p> : (
              <ol className="detective-clue-list">{visibleClues.map((clue, indexClue) => <li key={`${clue}-${indexClue}`}><span>{indexClue + 1}</span><p>{clue}</p></li>)}</ol>
            )}
          </article>
        </section>

        <section className="detective-answer-panel">
          <form onSubmit={submitGuess}>
            <label htmlFor="detective-answer">Tu respuesta</label>
            <div className="detective-answer-row"><input id="detective-answer" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Escribe el nombre del Pokémon" disabled={busy || state !== "playing"} autoComplete="off" /><button type="submit" disabled={busy || state !== "playing" || !query.trim()}>Intentar</button></div>
            {suggestions.length > 0 && <div className="detective-suggestions">{suggestions.map((item) => <button type="button" key={item.name} onClick={() => setQuery(titleCase(item.name))}>{titleCase(item.name)}</button>)}</div>}
          </form>
          <p className={`detective-message ${state}`}>{message}</p>
          {guesses.length > 0 && <div className="detective-history"><span>Intentos:</span>{guesses.map((guess) => <b key={guess}>{titleCase(guess)}</b>)}</div>}
        </section>
      </main>
    </div>
  );
}
