import { describe, expect, it } from "vitest";
import type { Pokemon, PokemonTypeResource } from "../types/pokemon";
import { calculateDefensiveProfile, compareBaseStats, getOffensiveAdvantages, matchupMultiplier } from "./combat";

const relation = (
  name: string,
  from: { double?: string[]; half?: string[]; none?: string[] } = {},
  to: { double?: string[]; half?: string[]; none?: string[] } = {},
): PokemonTypeResource => ({
  name,
  damage_relations: {
    double_damage_from: (from.double || []).map((type) => ({ name: type, url: "" })),
    half_damage_from: (from.half || []).map((type) => ({ name: type, url: "" })),
    no_damage_from: (from.none || []).map((type) => ({ name: type, url: "" })),
    double_damage_to: (to.double || []).map((type) => ({ name: type, url: "" })),
    half_damage_to: (to.half || []).map((type) => ({ name: type, url: "" })),
    no_damage_to: (to.none || []).map((type) => ({ name: type, url: "" })),
  },
});

function pokemon(name: string, stats: number[]): Pokemon {
  const statNames = ["hp", "attack", "defense", "special-attack", "special-defense", "speed"];
  return {
    id: 1,
    name,
    height: 10,
    weight: 10,
    abilities: [],
    forms: [],
    species: { name, url: "" },
    sprites: {},
    stats: stats.map((base_stat, index) => ({ base_stat, effort: 0, stat: { name: statNames[index], url: "" } })),
    types: [],
  };
}

describe("combat utilities", () => {
  it("combines dual-type resistances into x0.25", () => {
    const resources = [
      relation("ghost", { half: ["poison", "bug"], none: ["normal", "fighting"] }),
      relation("poison", { half: ["poison", "bug", "grass", "fairy"], double: ["ground", "psychic"] }),
    ];
    const profile = calculateDefensiveProfile(["ghost", "poison"], resources);
    expect(profile.find((row) => row.type === "poison")?.multiplier).toBe(0.25);
    expect(profile.find((row) => row.type === "bug")?.multiplier).toBe(0.25);
  });

  it("gives immunity precedence", () => {
    const resources = [
      relation("ghost", { none: ["normal", "fighting"] }),
      relation("dark", { half: ["dark", "ghost"], none: ["psychic"] }),
    ];
    expect(calculateDefensiveProfile(["ghost", "dark"], resources).find((row) => row.type === "normal")?.multiplier).toBe(0);
  });

  it("lists offensive STAB advantages for each type", () => {
    const resources = [
      relation("ghost", {}, { double: ["ghost", "psychic"] }),
      relation("poison", {}, { double: ["grass", "fairy"] }),
    ];
    expect(getOffensiveAdvantages(["ghost", "poison"], resources)).toEqual([
      { sourceType: "ghost", strongAgainst: ["ghost", "psychic"] },
      { sourceType: "poison", strongAgainst: ["grass", "fairy"] },
    ]);
  });

  it("calculates a direct type matchup multiplier", () => {
    const resources = [relation("grass", {}, { half: ["fire"] })];
    expect(matchupMultiplier("grass", ["fire"], resources)).toBe(0.5);
  });

  it("compares all six base stats", () => {
    const rows = compareBaseStats(pokemon("a", [100, 125, 90, 60, 70, 85]), pokemon("b", [95, 115, 90, 80, 90, 60]));
    expect(rows.find((row) => row.stat === "hp")).toMatchObject({ winner: "a", difference: 5 });
    expect(rows.find((row) => row.stat === "defense")).toMatchObject({ winner: "tie", difference: 0 });
    expect(rows.find((row) => row.stat === "special-attack")).toMatchObject({ winner: "b", difference: 20 });
  });
});
