# PokéCheck v4 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Expand the existing PokéCheck React app with richer Overview interactions, favorites, a Combat tab, and a general Pokémon VS comparison page while preserving the current Figma-based visual language.

**Architecture:** Extend existing route-driven detail views instead of replacing the app shell. Keep PokéAPI as the source of Pokémon/species/type data, put pure matchup calculations in focused utilities, local favorites in a small hook, and optional competitive examples in a static curated data module.

**Tech Stack:** React, TypeScript, React Router, Vite, Vitest, Testing Library, CSS.

**Spec:** `docs/superpowers/specs/2026-09-15-pokecheck-v4-design.md`

## Global Constraints
- Desktop-first web interface.
- No Tailwind dependency.
- Do not hotlink WikiDex/Champions type icons.
- Competitive presets are examples, not current-meta claims.
- PokéAPI remains the source for stats, species, sprites, and type effectiveness.
- Existing search, forms, evolution, filters, caching, and routes must keep working.

---

### Task 1: Combat calculation utilities
**Files:**
- Create: `src/utils/combat.ts`
- Test: `src/utils/combat.test.ts`
- Modify: `src/types/pokemon.ts`

**Interfaces:**
- Produces `calculateDefensiveProfile(typeNames, resources)`.
- Produces `getOffensiveAdvantages(typeNames, resources)`.
- Produces `compareBaseStats(a, b)`.

- [ ] Write tests for dual-type multiplication, immunity precedence, x0.25 resistance, STAB advantage lists, and stat comparison.
- [ ] Run `npm.cmd run test:run -- src/utils/combat.test.ts` and confirm RED.
- [ ] Add missing PokéAPI type relation fields and implement utility functions.
- [ ] Re-run focused test and confirm GREEN.

### Task 2: Overview enrichment and favorites
**Files:**
- Create: `src/hooks/useFavorites.ts`
- Create: `src/components/TypeIcon.tsx`
- Modify: `src/components/OverviewPanel.tsx`
- Modify: `src/components/SearchPanel.tsx`
- Modify: `src/App.tsx`
- Modify: `src/types/pokemon.ts`
- Modify: `src/utils/text.ts`
- Test: `src/utils/text.test.ts`

**Interfaces:**
- Favorites expose `favorites`, `isFavorite`, `toggleFavorite`, `clearFavorites`.
- Overview receives favorite state/callback.

- [ ] Add tests for flavor-entry grouping and gender-ratio formatting.
- [ ] Run focused tests and confirm RED.
- [ ] Implement helpers, shiny toggle, version selector, curiosity cycling, species category, gender display, star action, and local type symbols.
- [ ] Add Favorites filter using stored ResultItems.
- [ ] Re-run tests and confirm GREEN.

### Task 3: Combat tab and route
**Files:**
- Create: `src/components/CombatPanel.tsx`
- Modify: `src/components/Tabs.tsx`
- Modify: `src/utils/routes.ts`
- Modify: `src/utils/routes.test.ts`
- Modify: `src/App.tsx`
- Modify: `src/types/pokemon.ts`

**Interfaces:**
- New `PokemonTab = "overview" | "variants" | "combat"`.
- New `pokemonCombatPath(name)`.

- [ ] Add route test for `/pokemon/gengar/combate` and tab behavior expectations.
- [ ] Run route tests and confirm RED.
- [ ] Implement route helper, third tab, dynamic CombatPanel data loading, and Compare CTA.
- [ ] Re-run route/tests and confirm GREEN.

### Task 4: General VS comparison and competitive presets
**Files:**
- Create: `src/data/competitiveSets.ts`
- Create: `src/components/ComparePage.tsx`
- Modify: `src/App.tsx`
- Modify: `src/utils/routes.ts`
- Modify: `src/utils/routes.test.ts`

**Interfaces:**
- New `comparePokemonPath(a, b)`.
- `getCompetitivePreset(pokemonName, role?)` returns curated data or undefined.

- [ ] Add compare-route tests and preset lookup tests.
- [ ] Run tests and confirm RED.
- [ ] Add curated Rillaboom/Incineroar support presets.
- [ ] Implement route-driven comparison page with editable Pokémon A/B inputs, base-stat differences, type matchup summary, and optional preset cards.
- [ ] Re-run tests and confirm GREEN.

### Task 5: Figma-aligned styling and launch behavior
**Files:**
- Modify: `src/index.css`
- Modify: `package.json`
- Modify: `INICIAR_POKECHECK.bat`
- Modify: `README.md`

**Interfaces:**
- `npm.cmd run dev` opens browser automatically.

- [ ] Add CSS for Overview quick controls, Combat grid, VS columns, stat bars, type icons, and responsive desktop fallback.
- [ ] Change `dev` script to `vite --open`.
- [ ] Make BAT install dependencies only when needed and run `npm.cmd run dev`.
- [ ] Update README routes/features/run instructions.

### Task 6: Verification and package
**Files:**
- All production/test files.
- Output: `/mnt/data/pokecheck_react_web_v4.zip`

- [ ] Run `npm.cmd run test:run` and confirm 0 failed tests.
- [ ] Run `npm.cmd run build` and confirm exit 0.
- [ ] Inspect ZIP contents and confirm source/docs/launcher are included and `node_modules` is excluded.
- [ ] Create final ZIP.
