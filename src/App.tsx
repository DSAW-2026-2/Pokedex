import { useEffect, useState } from "react";
import { Navigate, Route, Routes, useLocation, useNavigate, useParams } from "react-router-dom";
import Header from "./components/Header";
import SearchPanel from "./components/SearchPanel";
import SearchSuggestions from "./components/SearchSuggestions";
import ResultsSidebar from "./components/ResultsSidebar";
import Tabs from "./components/Tabs";
import OverviewPanel from "./components/OverviewPanel";
import VariantsPanel from "./components/VariantsPanel";
import CombatPanel from "./components/CombatPanel";
import ComparePage from "./components/ComparePage";
import EvolutionComparePage from "./components/EvolutionComparePage";
import FormChangesPage from "./components/FormChangesPage";
import GenerationExplorerPage from "./components/GenerationExplorerPage";
import GenerationPokemonPage from "./components/GenerationPokemonPage";
import HomePage from "./components/HomePage";
import ShinyGalleryPage from "./components/ShinyGalleryPage";
import PokemonExplorerPage from "./components/PokemonExplorerPage";
import MoveDexPage from "./components/MoveDexPage";
import MoveDetailPage from "./components/MoveDetailPage";
import TeamBuilderPage from "./components/TeamBuilderPage";
import PokeDetectivePage from "./components/PokeDetectivePage";
import LoadingState from "./components/LoadingState";
import { usePokemonWorkspace } from "./hooks/usePokemonWorkspace";
import { useFavorites } from "./hooks/useFavorites";
import type { PokemonTab } from "./types/pokemon";
import {
  comparePokemonPath,
  compareEvolutionPath,
  compareFormChangesPath,
  generationExplorerPath,
  pokedexPath,
  pokemonCombatPath,
  pokemonOverviewPath,
  pokemonVariantsPath,
  shinyGalleryPath,
  moveDexPath,
} from "./utils/routes";
import { titleCase } from "./utils/text";
import { findSimilarCompetitivePresets } from "./data/competitiveSets";

function tabPath(name: string, tab: PokemonTab): string {
  if (tab === "variants") return pokemonVariantsPath(name);
  if (tab === "combat") return pokemonCombatPath(name);
  return pokemonOverviewPath(name);
}

function PokedexPage() {
  const workspace = usePokemonWorkspace();
  const favorites = useFavorites();
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { pokemonName } = useParams<{ pokemonName?: string }>();

  const activeTab: PokemonTab = location.pathname.endsWith("/formas")
    ? "variants"
    : location.pathname.endsWith("/combate")
      ? "combat"
      : "overview";
  const routePokemonName = pokemonName?.trim().toLowerCase();
  const favoritesRequested = new URLSearchParams(location.search).get("favoritos") === "1";

  useEffect(() => {
    setFavoritesOnly(favoritesRequested);
  }, [favoritesRequested]);

  useEffect(() => {
    if (!routePokemonName) return;
    if (workspace.currentBundle?.pokemon.name === routePokemonName) return;

    workspace.setQuery(titleCase(routePokemonName));
    void workspace.loadPokemon(routePokemonName, "", workspace.results.length === 0);
  }, [routePokemonName, workspace.currentBundle?.pokemon.name, workspace.loadPokemon, workspace.results.length, workspace.setQuery]);

  function changeType(value: string) {
    workspace.setTypeFilter(value);
    void workspace.applyFilters(value, workspace.rarityFilter);
  }

  function changeRarity(value: typeof workspace.rarityFilter) {
    workspace.setRarityFilter(value);
    void workspace.applyFilters(workspace.typeFilter, value);
  }

  function openPokemon(name: string, tab: PokemonTab = "overview") {
    workspace.setQuery(titleCase(name));
    navigate(tabPath(name, tab));
  }

  async function searchPokemon() {
    setFavoritesOnly(false);
    const resolvedName = await workspace.handleTextSearch();
    if (resolvedName) navigate(pokemonOverviewPath(resolvedName));
  }

  function changeTab(tab: PokemonTab) {
    const name = workspace.currentBundle?.pokemon.name;
    if (!name) return;
    navigate(tabPath(name, tab));
  }

  function clearAll() {
    setFavoritesOnly(false);
    workspace.clearAll();
    navigate(pokedexPath());
  }

  const sidebarItems = favoritesOnly
    ? favorites.favorites
    : workspace.resultsVisible
      ? workspace.results
      : [];
  const sidebarTitle = favoritesOnly ? "Favoritos" : workspace.resultsTitle;
  const sidebarVisibleCount = favoritesOnly ? Math.max(7, favorites.favorites.length) : workspace.visibleResults;

  const compareOpponent = workspace.currentBundle?.pokemon.name === "rillaboom"
    ? "incineroar"
    : workspace.currentBundle?.pokemon.name === "incineroar"
      ? "rillaboom"
      : "pikachu";

  const similarRecommendations = workspace.currentBundle
    ? findSimilarCompetitivePresets(workspace.currentBundle.pokemon.name, 3).map((item) => ({
        name: titleCase(item.name),
        routeName: item.name,
        role: item.preset.role,
        reason: `Similar por: ${item.sharedTags.slice(0, 3).map((tag) => ({
          "control-turno": "control de turno",
          pivot: "pivote",
          prioridad: "prioridad",
          "presion-fisica": "presión física",
          debilitacion: "debilitación",
        }[tag] || tag)).join(" + ")}`,
      }))
    : [];

  return (
    <div className="app-shell">
      <Header contextLabel={activeTab === "combat" ? "Guía de Combate & Análisis VS" : undefined} version={activeTab === "combat" ? "v19.1" : undefined} />
      <SearchPanel
        query={workspace.query}
        typeFilter={workspace.typeFilter}
        rarityFilter={workspace.rarityFilter}
        favoritesOnly={favoritesOnly}
        favoritesCount={favorites.favorites.length}
        onQueryChange={workspace.setQuery}
        onTypeChange={changeType}
        onRarityChange={changeRarity}
        onFavoritesChange={setFavoritesOnly}
        onCompare={() => navigate(comparePokemonPath(workspace.currentBundle?.pokemon.name || "rillaboom", compareOpponent))}
        onExplore={() => navigate(generationExplorerPath())}
        onSearch={() => void searchPokemon()}
        onClear={clearAll}
        disabled={workspace.busy}
      />

      <div className={`compact-status ${workspace.status.kind}`} aria-live="polite">
        {workspace.busy && <span className="status-spinner" aria-hidden="true" />}
        {favoritesOnly
          ? favorites.favorites.length
            ? `${favorites.favorites.length} Pokémon guardados en favoritos.`
            : "Aún no tienes Pokémon favoritos. Usa ☆ en Resumen para guardar uno."
          : workspace.status.text}
      </div>

      <div className="suggestions-wrap">
        <SearchSuggestions
          matches={workspace.suggestions}
          query={workspace.query.trim()}
          prompt={workspace.suggestionPrompt}
          onSelect={(name) => openPokemon(name, "overview")}
        />
      </div>

      <main className="main-split">
        <ResultsSidebar
          items={sidebarItems}
          title={sidebarTitle}
          visibleCount={sidebarVisibleCount}
          selectedName={workspace.currentBundle?.pokemon.name}
          recommendations={similarRecommendations.map(({ name, role, reason }) => ({ name, role, reason }))}
          onSelect={(name) => openPokemon(name, "overview")}
          onShowMore={workspace.showMore}
          onOpenRecommendation={(displayName) => {
            const target = similarRecommendations.find((item) => item.name === displayName);
            if (target) openPokemon(target.routeName, "overview");
          }}
          onCompareRecommendation={(displayName) => {
            const target = similarRecommendations.find((item) => item.name === displayName);
            const current = workspace.currentBundle?.pokemon.name;
            if (target && current) navigate(comparePokemonPath(current, target.routeName));
          }}
        />

        <section className="detail-card-container" aria-label="Ficha Pokémon">
          {workspace.busy && !workspace.currentBundle ? (
            <LoadingState message="Consultando PokéAPI..." />
          ) : workspace.currentBundle ? (
            <>
              <Tabs active={activeTab} onChange={changeTab} />
              <div className="detail-tab-content">
                {activeTab === "overview" && (
                  <OverviewPanel
                    bundle={workspace.currentBundle}
                    favorite={favorites.isFavorite(workspace.currentBundle.pokemon.name)}
                    onToggleFavorite={() => favorites.toggleFavorite(workspace.currentBundle!)}
                    onOpenBase={(name) => openPokemon(name, "overview")}
                    onCompareBase={(baseName, variantName) => navigate(comparePokemonPath(baseName, variantName))}
                    onOpenRelatedVariant={(name) => openPokemon(name, "overview")}
                    onOpenMoves={(name) => navigate(moveDexPath(name))}
                  />
                )}
                {activeTab === "variants" && (
                  <VariantsPanel
                    bundle={workspace.currentBundle}
                    onSelectPokemon={(name) => openPokemon(name, "variants")}
                    onOpenVariant={(name) => openPokemon(name, "overview")}
                    onCompareVariant={(baseName, variantName) => navigate(comparePokemonPath(baseName, variantName))}
                    onCompareChanges={(baseName, variantName) => navigate(compareFormChangesPath(baseName, variantName))}
                    onCompareEvolution={(fromName, toName) => navigate(compareEvolutionPath(fromName, toName))}
                    onOpenGallery={(name) => navigate(shinyGalleryPath(name))}
                  />
                )}
                {activeTab === "combat" && (
                  <CombatPanel
                    bundle={workspace.currentBundle}
                    onCompare={() => navigate(comparePokemonPath(workspace.currentBundle!.pokemon.name, compareOpponent))}
                  />
                )}
              </div>
            </>
          ) : (
            <div className="detail-empty">
              <span className="empty-pokeball large" aria-hidden="true" />
              <h2>Selecciona un Pokémon</h2>
              <p>Busca por nombre o número, usa los filtros o abre tus favoritos.</p>
            </div>
          )}
        </section>
      </main>

      <footer className="app-footer">Datos: PokéAPI · Proyecto educativo en React + TypeScript</footer>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/pokedex" element={<PokedexPage />} />
      <Route path="/pokemon/:pokemonName" element={<PokedexPage />} />
      <Route path="/pokemon/:pokemonName/formas" element={<PokedexPage />} />
      <Route path="/pokemon/:pokemonName/combate" element={<PokedexPage />} />
      <Route path="/comparar/:pokemonA/:pokemonB" element={<ComparePage />} />
      <Route path="/evolucion/:pokemonA/:pokemonB" element={<EvolutionComparePage />} />
      <Route path="/formas/comparar/:baseName/:variantName" element={<FormChangesPage />} />
      <Route path="/explorar/pokemon" element={<PokemonExplorerPage />} />
      <Route path="/movimientos" element={<MoveDexPage />} />
      <Route path="/movimientos/:moveName" element={<MoveDetailPage />} />
      <Route path="/team-builder" element={<TeamBuilderPage />} />
      <Route path="/pokedetective" element={<PokeDetectivePage />} />
      <Route path="/explorar/generaciones" element={<GenerationExplorerPage />} />
      <Route path="/explorar/generaciones/:generationName" element={<GenerationPokemonPage />} />
      <Route path="/pokemon/:pokemonName/galeria" element={<ShinyGalleryPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
