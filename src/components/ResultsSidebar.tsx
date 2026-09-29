import type { ResultItem } from "../types/pokemon";
import PokemonCard from "./PokemonCard";

export interface SidebarRecommendation {
  name: string;
  role: string;
  reason: string;
}

interface ResultsSidebarProps {
  items: ResultItem[];
  title: string;
  visibleCount: number;
  selectedName?: string;
  recommendations?: SidebarRecommendation[];
  onSelect: (name: string) => void;
  onShowMore: () => void;
  onOpenRecommendation?: (name: string) => void;
  onCompareRecommendation?: (name: string) => void;
}

export default function ResultsSidebar({
  items,
  title,
  visibleCount,
  selectedName,
  recommendations = [],
  onSelect,
  onShowMore,
  onOpenRecommendation,
  onCompareRecommendation,
}: ResultsSidebarProps) {
  const visibleItems = items.slice(0, visibleCount);
  return (
    <aside className="results-sidebar" aria-label="Resultados">
      <div className="results-sidebar-head">
        <div>
          <span>Resultados</span>
          <strong>{title || "Consulta"}</strong>
        </div>
        <span className="result-count">{items.length}</span>
      </div>

      <div className="results-scroll">
        {visibleItems.length ? (
          visibleItems.map((item) => (
            <PokemonCard
              key={`${item.id}-${item.name}`}
              item={item}
              selected={item.name === selectedName}
              onSelect={onSelect}
            />
          ))
        ) : (
          <div className="sidebar-empty">
            <span className="empty-pokeball" aria-hidden="true" />
            <strong>Empieza una consulta</strong>
            <p>Busca un Pokémon o selecciona un filtro.</p>
          </div>
        )}

        {recommendations.length > 0 && (
          <section className="sidebar-recommendations" aria-label="Pokémon similares">
            <div className="sidebar-recommendations-head">
              <span>Pokémon similares</span>
              <small>máx. 3</small>
            </div>
            {recommendations.slice(0, 3).map((item) => (
              <article className="sidebar-recommendation" key={item.name}>
                <button className="recommendation-main" type="button" onClick={() => onOpenRecommendation?.(item.name)}>
                  <strong>{item.name}</strong>
                  <span>{item.role}</span>
                  <small>{item.reason}</small>
                </button>
                <button className="recommendation-vs" type="button" onClick={() => onCompareRecommendation?.(item.name)}>VS</button>
              </article>
            ))}
          </section>
        )}
      </div>

      {visibleCount < items.length && (
        <button className="load-more" type="button" onClick={onShowMore}>Mostrar más</button>
      )}
    </aside>
  );
}
