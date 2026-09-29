import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { getSearchIndex } from "../api/pokeApi";
import { comparePokemonPath, generationExplorerPath, moveDexPath, pokedexPath, pokemonExplorerPath, pokemonOverviewPath, teamBuilderPath, pokeDetectivePath } from "../utils/routes";
import { resolveSearchQuery } from "../utils/search";
import { titleCase } from "../utils/text";
import Header from "./Header";
import searchIcon from "../assets/home-icons/search.png";
import generationsIcon from "../assets/home-icons/generations.png";
import compareIcon from "../assets/home-icons/compare.png";
import favoritesIcon from "../assets/home-icons/favorites.png";
import teamBuilderIcon from "../assets/home-icons/team-builder.png";
import detectiveIcon from "../assets/home-icons/detective.png";

interface HomeAction {
  title: string;
  description: string;
  eyebrow: string;
  route: string;
  buttonLabel?: string;
  accent: "explorer" | "generations" | "moves" | "analysis" | "favorites" | "team" | "detective";
  icon: string;
}

const HOME_ACTIONS: HomeAction[] = [
  {
    title: "Explorador Pokémon",
    eyebrow: "DESCUBRE",
    description: "Filtra por generación, tipo, categoría, habilidad y estadísticas para encontrar Pokémon que encajen contigo.",
    route: pokemonExplorerPath(),
    accent: "explorer",
    icon: searchIcon,
  },
  {
    title: "Explorar por generación",
    eyebrow: "REGIONES",
    description: "Entra a Kanto, Johto, Hoenn y las demás generaciones para ver todos sus Pokémon.",
    route: generationExplorerPath(),
    accent: "generations",
    icon: generationsIcon,
  },
  {
    title: "Movepedia",
    eyebrow: "MOVIMIENTOS",
    description: "Consulta potencia, precisión, PP, categoría y qué Pokémon pueden aprender cada movimiento.",
    route: moveDexPath(),
    accent: "moves",
    icon: detectiveIcon,
  },
  {
    title: "Comparar Pokémon",
    eyebrow: "ANÁLISIS",
    description: "Compara estadísticas, tipos y perfiles de combate entre dos Pokémon.",
    route: comparePokemonPath("pikachu", "raichu"),
    accent: "analysis",
    icon: compareIcon,
  },
  {
    title: "Favoritos",
    eyebrow: "TU COLECCIÓN",
    description: "Vuelve rápidamente a los Pokémon que guardaste en este navegador.",
    route: `${pokedexPath()}?favoritos=1`,
    accent: "favorites",
    icon: favoritesIcon,
  },
  {
    title: "Team Builder",
    eyebrow: "EQUIPOS",
    description: "Construcción y análisis de equipos para aventura y competitivo.",
    route: teamBuilderPath(),
    buttonLabel: "Crear equipo →",
    accent: "team",
    icon: teamBuilderIcon,
  },
  {
    title: "PokéDetective",
    eyebrow: "RETO",
    description: "Adivina el Pokémon usando pistas obtenidas de sus datos reales.",
    route: pokeDetectivePath(),
    buttonLabel: "Jugar →",
    accent: "detective",
    icon: detectiveIcon,
  },
];

export default function HomePage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState(false);
  const [correction, setCorrection] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  async function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = query.trim();
    if (!trimmed || busy) return;

    setBusy(true);
    setCorrection(null);
    setMessage("");

    try {
      const index = await getSearchIndex();
      const result = resolveSearchQuery(trimmed, index);

      if (result.identifier !== null) {
        navigate(pokemonOverviewPath(String(result.identifier)));
        return;
      }

      if (result.correction) {
        setCorrection(result.correction);
        setMessage(`No encontramos “${trimmed}” exactamente.`);
      } else {
        setMessage(`No encontramos un Pokémon llamado “${trimmed}”. Revisa cómo está escrito.`);
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "No fue posible realizar la búsqueda.");
    } finally {
      setBusy(false);
    }
  }

  function renderToolCard(action: HomeAction) {
    return (
      <article
        className={`home-tool-card accent-${action.accent}`}
        key={action.title}
      >
        <div className="home-tool-top">
          <div className="home-tool-badge">
            <img src={action.icon} alt="" aria-hidden="true" />
          </div>
          <span>{action.eyebrow}</span>
        </div>
        <h4>{action.title}</h4>
        <p>{action.description}</p>
        <div className="home-tool-footer">
          <button type="button" onClick={() => navigate(action.route)}>{action.buttonLabel || "Abrir sección →"}</button>
        </div>
      </article>
    );
  }

  return (
    <div className="home-shell">
      <Header version="v19.1" />
      <main className="home-page">
        <section className="home-hero">
          <div className="home-hero-copy">
            <span className="home-kicker">POKÉCHECK HUB</span>
            <h2>Explora, compara y descubre Pokémon de forma simple.</h2>
            <p>
              Busca una especie directamente o entra a las herramientas de exploración,
              comparación, equipos y minijuegos sin tener que conocer la app de memoria.
            </p>
            <div className="home-hero-tags">
              <span>Rápido de entender</span>
              <span>Búsqueda directa</span>
              <span>Diseñado para fans y curiosos</span>
            </div>
          </div>

          <form className="home-search" onSubmit={submitSearch}>
            <div className="home-search-title">
              <img src={searchIcon} alt="" aria-hidden="true" />
              <label htmlFor="home-search-input">Buscar Pokémon</label>
            </div>
            <div className="home-search-row">
              <input
                id="home-search-input"
                type="search"
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setCorrection(null);
                  setMessage("");
                }}
                placeholder="Ej. Pikachu, Lucario o #448"
                autoComplete="off"
                disabled={busy}
              />
              <button type="submit" disabled={busy || !query.trim()}>{busy ? "Buscando…" : "Buscar"}</button>
            </div>
            <p className="home-search-help">Si el nombre coincide exactamente, PokéCheck te lleva directo a su ficha.</p>
            <button className="home-pokedex-link" type="button" onClick={() => navigate(pokedexPath())}>
              Abrir Pokédex completa →
            </button>
            {message && <p className={`home-search-message ${correction ? "has-correction" : ""}`}>{message}</p>}
            {correction && (
              <button
                className="home-correction"
                type="button"
                onClick={() => navigate(pokemonOverviewPath(correction))}
              >
                ¿Quisiste decir <strong>{titleCase(correction)}</strong>? →
              </button>
            )}
          </form>
        </section>

        <section className="home-tools" aria-labelledby="home-tools-title">
          <div className="home-section-heading">
            <span>EXPLORA POKÉCHECK</span>
            <h3 id="home-tools-title">Elige qué quieres hacer</h3>
            <p>Las herramientas activas están separadas para que cada camino tenga una función clara.</p>
          </div>

          <div className="home-tool-grid">
            {HOME_ACTIONS.map(renderToolCard)}
          </div>
        </section>

      </main>
      <footer className="app-footer">Datos: PokéAPI · Proyecto educativo en React + TypeScript</footer>
    </div>
  );
}
