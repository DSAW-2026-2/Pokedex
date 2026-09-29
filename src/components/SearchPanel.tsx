import type { ChangeEvent, FormEvent } from "react";
import type { RarityFilter } from "../types/pokemon";
import TypeIcon from "./TypeIcon";

interface SearchPanelProps {
  query: string;
  typeFilter: string;
  rarityFilter: RarityFilter;
  favoritesOnly: boolean;
  favoritesCount: number;
  onQueryChange: (value: string) => void;
  onTypeChange: (value: string) => void;
  onRarityChange: (value: RarityFilter) => void;
  onFavoritesChange: (value: boolean) => void;
  onCompare: () => void;
  onExplore: () => void;
  onSearch: () => void;
  onClear: () => void;
  disabled?: boolean;
}

const TYPES = [
  ["", "Todos"],
  ["fire", "Fuego"],
  ["water", "Agua"],
  ["grass", "Planta"],
  ["electric", "Eléctrico"],
  ["psychic", "Psíquico"],
  ["ghost", "Fantasma"],
  ["normal", "Normal"],
  ["fighting", "Lucha"],
  ["poison", "Veneno"],
  ["ground", "Tierra"],
  ["flying", "Volador"],
  ["bug", "Bicho"],
  ["rock", "Roca"],
  ["ice", "Hielo"],
  ["dragon", "Dragón"],
  ["dark", "Siniestro"],
  ["steel", "Acero"],
  ["fairy", "Hada"],
] as const;

export default function SearchPanel({
  query,
  typeFilter,
  rarityFilter,
  favoritesOnly,
  favoritesCount,
  onQueryChange,
  onTypeChange,
  onRarityChange,
  onFavoritesChange,
  onCompare,
  onExplore,
  onSearch,
  onClear,
  disabled = false,
}: SearchPanelProps) {
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (query.trim()) onSearch();
  }

  return (
    <section className="search-zone" aria-label="Búsqueda y filtros">
      <form onSubmit={submit} className="search-form-new">
        <div className="search-bar-wrap">
          <span className="search-icon" aria-hidden="true" />
          <label className="sr-only" htmlFor="searchInput">Nombre o número de Pokédex</label>
          <input
            id="searchInput"
            type="search"
            value={query}
            onChange={(event: ChangeEvent<HTMLInputElement>) => onQueryChange(event.target.value)}
            placeholder="Buscar por nombre o número..."
            autoComplete="off"
            disabled={disabled}
          />
          <button className="search-submit" type="submit" disabled={disabled || !query.trim()}>Buscar</button>
          <button className="clear-button" type="button" onClick={onClear}>Limpiar</button>
        </div>

        <div className="filter-row-new">
          <div className="type-chip-strip" aria-label="Filtrar por tipo">
            {TYPES.map(([value, label]) => (
              <button
                key={value || "all"}
                type="button"
                className={`filter-chip ${typeFilter === value && !favoritesOnly ? "active" : ""}`}
                onClick={() => {
                  onFavoritesChange(false);
                  onTypeChange(value);
                }}
                disabled={disabled}
              >
                {value && <TypeIcon type={value} />}
                {label}
              </button>
            ))}
          </div>

          <div className="filter-actions-right">
            <button
              type="button"
              className={`favorites-filter ${favoritesOnly ? "active" : ""}`}
              onClick={() => onFavoritesChange(!favoritesOnly)}
              disabled={disabled}
              aria-pressed={favoritesOnly}
            >
              <span aria-hidden="true">★</span>
              Favoritos
              <small>{favoritesCount}</small>
            </button>

            <label className="category-select">
              <span className="sr-only">Categoría</span>
              <select
                aria-label="Categoría"
                value={rarityFilter}
                onChange={(event: ChangeEvent<HTMLSelectElement>) => {
                  onFavoritesChange(false);
                  onRarityChange(event.target.value as RarityFilter);
                }}
                disabled={disabled || favoritesOnly}
              >
                <option value="">Cualquiera</option>
                <option value="legendary">Legendario</option>
                <option value="mythical">Mítico</option>
              </select>
            </label>

            <button className="explore-top-button" type="button" onClick={onExplore} disabled={disabled}>
              <span aria-hidden="true">◈</span> Generaciones
            </button>
            <button className="compare-top-button" type="button" onClick={onCompare} disabled={disabled}>
              <span aria-hidden="true">⇄</span> Comparar / VS
            </button>
          </div>
        </div>
      </form>
    </section>
  );
}
