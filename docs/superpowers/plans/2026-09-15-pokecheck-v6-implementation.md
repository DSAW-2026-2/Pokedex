# PokéCheck v6 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add curated/suggested/custom competitive sets and concise sidebar similarity recommendations to PokéCheck.

**Architecture:** Keep curated presets as static data, add a pure suggested-set generator driven by the existing PokéAPI `Pokemon` payload, persist custom sets through a focused localStorage hook, and let the VS page select among sources. Reuse curated shared-role tags for sidebar recommendations so the app never invents similarity.

**Tech Stack:** React, TypeScript, React Router, Vite, Vitest, Testing Library, CSS.

**Spec:** `docs/superpowers/specs/2026-09-15-pokecheck-v6-design.md`

## Global Constraints
- No new runtime dependencies.
- PokéAPI remains the source of Pokémon base data and learnable move names.
- Automatic sets are educational suggestions, never current-meta claims.
- Custom sets remain local-only in localStorage.
- Sidebar shows at most three similar recommendations.
- Preserve existing routes and features.

---

### Task 1: Competitive set model and automatic generator
**Files:**
- Modify: `src/types/pokemon.ts`
- Modify: `src/data/competitiveSets.ts`
- Modify: `src/data/competitiveSets.test.ts`

- [ ] Write failing tests for generated role, 4-move output, curated source, and fallback behavior.
- [ ] Extend Pokémon move typing and competitive-set source typing.
- [ ] Implement deterministic suggested-set generation.
- [ ] Run focused tests.

### Task 2: Local custom-set persistence
**Files:**
- Create: `src/hooks/useCustomCompetitiveSets.ts`
- Create: `src/utils/customSets.ts`
- Create: `src/utils/customSets.test.ts`

- [ ] Write failing serialization/update/remove tests.
- [ ] Implement safe localStorage-backed data helpers and hook.
- [ ] Run focused tests.

### Task 3: VS source selector and editor
**Files:**
- Modify: `src/components/ComparePage.tsx`
- Modify: `src/index.css`

- [ ] Render Curado/Sugerido/Personalizado source controls per column.
- [ ] Add compact custom-set editor and save/remove actions.
- [ ] Keep all existing stat/type comparisons working without a curated preset.

### Task 4: Sidebar similar recommendations
**Files:**
- Modify: `src/components/ResultsSidebar.tsx`
- Modify: `src/App.tsx`
- Modify: `src/index.css`

- [ ] Feed up to three curated similar Pokémon for the currently selected Pokémon.
- [ ] Show short shared-role reason.
- [ ] Add open-Pokédex and VS actions.

### Task 5: Version/docs/package
**Files:**
- Modify: `package.json`
- Modify: `README.md`
- Modify: `INICIAR_POKECHECK.bat`
- Output: `/mnt/data/pokecheck_react_web_v6.zip`

- [ ] Bump to v6.
- [ ] Document set tiers and sidebar recommendations.
- [ ] Run available static/test/build verification.
- [ ] Zip without `node_modules` or build output.
