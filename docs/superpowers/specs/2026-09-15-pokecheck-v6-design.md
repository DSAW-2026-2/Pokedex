# PokéCheck v6 Design

## Goal
Ensure every Pokémon can participate in the competitive comparison experience without pretending PokéAPI provides canonical sets, while surfacing concise similar-Pokémon recommendations in the Pokédex sidebar.

## Competitive set tiers
PokéCheck exposes three clearly labeled set sources:
- **Curado**: manually reviewed educational preset stored in the project.
- **Sugerido por PokéCheck**: deterministic automatic proposal derived from the Pokémon's real base stats, abilities, types, and learnable move names returned by PokéAPI. It is not a metagame claim.
- **Personalizado**: locally edited user set stored in `localStorage` with no account or cloud sync.

If a curated preset exists it is the default. Otherwise a saved custom set is preferred, then the automatic suggestion.

## Suggested-set rules
Suggested sets must be transparent and conservative. Role, nature, EV text, item, and four moves are generated from base-stat shape plus the learnset exposed by PokéAPI. Move selection prefers known utility moves and same-type move candidates from a small built-in priority catalogue, then falls back to learnable moves. The UI always displays the automatic-set disclaimer.

## Custom sets
The VS column provides a compact source selector and an inline editor for role, ability, item, nature, EVs, and four moves. Save/remove actions persist per Pokémon in `localStorage`.

## Similar recommendations
The Pokédex results sidebar may show up to three “Pokémon similares” beneath normal results when the selected Pokémon has curated similarity data. Each recommendation has a short reason derived from shared functional tags and two actions:
- open that Pokémon in the Pokédex;
- open a direct VS comparison with the current Pokémon.

Do not overload the sidebar and do not fabricate similarity when there is insufficient curated evidence.

## Existing behavior preserved
Overview, forms/evolution, Combat, fuzzy search, filters, favorites, type icons, route navigation, and the general VS comparison continue to work.
