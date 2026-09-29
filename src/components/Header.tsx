import { Link } from "react-router-dom";
import { generationExplorerPath, moveDexPath, pokedexPath, pokemonExplorerPath, teamBuilderPath, pokeDetectivePath } from "../utils/routes";

interface HeaderProps {
  contextLabel?: string;
  version?: string;
}

const NAV_ITEMS = [
  ["Inicio", "/"],
  ["Pokédex", pokedexPath()],
  ["Explorador", pokemonExplorerPath()],
  ["Generaciones", generationExplorerPath()],
  ["Movepedia", moveDexPath()],
  ["Comparar", "/comparar/pikachu/raichu"],
  ["Favoritos", `${pokedexPath()}?favoritos=1`],
  ["Team Builder", teamBuilderPath()],
  ["PokéDetective", pokeDetectivePath()],
] as const;

export default function Header({ contextLabel, version }: HeaderProps) {
  return (
    <header className="app-header">
      <Link className="brand brand-link" to="/" aria-label="Ir al inicio de PokéCheck">
        <span className="pokeball-logo" aria-hidden="true"><span /></span>
        <div>
          <h1>PokéCheck</h1>
          <p>Explora. Consulta. Conoce.</p>
        </div>
      </Link>
      <div className="header-right">
        <nav className="header-nav" aria-label="Navegación principal">
          {NAV_ITEMS.map(([label, route]) => <Link key={label} to={route}>{label}</Link>)}
        </nav>
        <details className="header-mobile-menu">
          <summary>Menú</summary>
          <nav>{NAV_ITEMS.map(([label, route]) => <Link key={label} to={route}>{label}</Link>)}</nav>
        </details>
        {contextLabel || version ? (
          <div className="header-context">
            {contextLabel && <span>{contextLabel}</span>}
            {version && <b className="version-badge">{version}</b>}
          </div>
        ) : (
          <p className="header-note">Pokédex interactiva · Datos principales desde PokéAPI</p>
        )}
      </div>
    </header>
  );
}
