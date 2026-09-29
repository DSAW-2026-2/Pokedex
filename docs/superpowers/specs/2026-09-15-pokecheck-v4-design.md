# PokéCheck v4 Design

## Goal
Expand PokéCheck without turning it into an overloaded wiki. Keep the current desktop-first dark interface and add optional interactive information for exploration and a focused competitive-analysis area.

## Existing foundation
- React + TypeScript + Vite.
- React Router routes for Overview and Forms.
- PokéAPI data, caching, fuzzy search, type/category filters, variants, and evolution line.
- CSS-based styling in `src/index.css`; no Tailwind dependency.

## Overview additions
The Overview remains the concise default screen. Add:
- Species category from `pokemon-species.genera`.
- Gender ratio from `pokemon-species.gender_rate`, including genderless species.
- Normal/Shiny artwork toggle using PokéAPI sprite fallbacks.
- Pokédex entry selector by game/version. Prefer Spanish entries, fall back to English only when Spanish is unavailable for that version.
- “Dato curioso” button that cycles through alternate Pokédex flavor-text entries; it must not invent facts.
- Favorite star stored in `localStorage`.

## Favorites
Favorites are local-only, require no account, and persist through `localStorage`. The top filter area gets a compact Favorites control that can show the saved Pokémon list. Favorites never affect PokéAPI data.

## Type symbols
Replace plain colored dots in type filters with compact local visual symbols. Symbols are bundled/generated in the project and do not hotlink WikiDex or other third-party visual assets. Type names and colors remain visible for accessibility.

## Combat tab
Add `/pokemon/:pokemonName/combate` as a third tab.

Show:
- Pokémon identity, image, types, and first ability.
- Six base stats and BST.
- Defensive effectiveness calculated from all of the Pokémon’s types: weaknesses, resistances (including x0.25), immunities.
- Offensive STAB advantages per current type, based on PokéAPI type damage relations.
- Link/button into comparison mode.

All effectiveness calculations must be data-driven from PokéAPI, not hardcoded per Pokémon.

## Compare / VS
Add `/comparar/:pokemonA/:pokemonB` and a compact comparison form to replace either Pokémon.

For any two Pokémon, show:
- Images, types, height, weight, generation.
- Base stat bars and per-stat advantage/tie.
- Defensive type profiles for each.
- Objective STAB matchup summary between their current types. Do not claim a battle winner.

## Competitive presets
PokéAPI does not provide canonical competitive builds. Keep curated optional presets in `src/data/competitiveSets.ts`.

Initial presets:
- Rillaboom: support/offensive-support example.
- Incineroar: support/pivot example.

A preset contains role, ability, item, nature, EV text, four moves, and short functional tags. If no preset exists, the comparison still works and displays “No hay set competitivo curado para este Pokémon.”

Competitive copy must say it is an example/preset rather than “the current metagame” or a current regulation.

## Routing
- `/pokemon/:pokemonName` → Overview
- `/pokemon/:pokemonName/formas` → Forms and evolution line
- `/pokemon/:pokemonName/combate` → Combat
- `/comparar/:pokemonA/:pokemonB` → Compare / VS

Browser Back/Forward and direct reloads must continue to work.

## Launch behavior
- `npm.cmd run dev` should call `vite --open`.
- `INICIAR_POKECHECK.bat` should install dependencies only when `node_modules` is missing, then start the dev server which opens the browser automatically.

## Out of scope
- Accounts/cloud favorites.
- Automated “best competitive set” generation.
- Live tournament regulation/metagame claims.
- Battle simulator or damage calculator.
- Tailwind or a new styling framework.
