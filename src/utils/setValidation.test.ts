import { describe, expect, it } from "vitest";
import type { NamedAPIResource, Pokemon } from "../types/pokemon";
import {
  NATURE_OPTIONS,
  ROLE_OPTIONS,
  getAvailableVersionGroups,
  normalizeEvSpread,
  resolveAbilityKey,
  resolveItemKey,
  resolveMoveKey,
  validateAbility,
  validateEvSpread,
  validateItem,
  validateMoveForVersion,
} from "./setValidation";

function makeCharizard(): Pokemon {
  return {
    id: 6,
    name: "charizard",
    height: 17,
    weight: 905,
    abilities: [
      { is_hidden: false, slot: 1, ability: { name: "blaze", url: "" } },
      { is_hidden: true, slot: 3, ability: { name: "solar-power", url: "" } },
    ],
    forms: [],
    species: { name: "charizard", url: "" },
    sprites: {},
    stats: [],
    types: [],
    moves: [
      {
        move: { name: "flamethrower", url: "" },
        version_group_details: [{ version_group: { name: "scarlet-violet", url: "" } }],
      },
      {
        move: { name: "surf", url: "" },
        version_group_details: [{ version_group: { name: "sword-shield", url: "" } }],
      },
    ],
  };
}

describe("validación de sets personalizados", () => {
  it("usa roles cerrados y naturalezas oficiales", () => {
    expect(ROLE_OPTIONS).toContain("Atacante especial");
    expect(NATURE_OPTIONS.some((nature) => nature.key === "timid")).toBe(true);
  });

  it("solo acepta habilidades de esa especie o forma", () => {
    const charizard = makeCharizard();
    expect(validateAbility(charizard, "blaze")).toBe(true);
    expect(validateAbility(charizard, "Mar Llamas")).toBe(true);
    expect(validateAbility(charizard, "intimidate")).toBe(false);
  });

  it("valida movimientos por grupo de versión", () => {
    const charizard = makeCharizard();
    expect(getAvailableVersionGroups(charizard)).toContain("scarlet-violet");
    expect(validateMoveForVersion(charizard, "flamethrower", "scarlet-violet")).toBe(true);
    expect(validateMoveForVersion(charizard, "surf", "scarlet-violet")).toBe(false);
  });

  it("valida solo objetos presentes en el catálogo sostenible", () => {
    const items: NamedAPIResource[] = [
      { name: "leftovers", url: "" },
      { name: "life-orb", url: "" },
    ];
    expect(validateItem(items, "Restos")).toBe(true);
    expect(resolveItemKey(items, "Vidasfera")).toBe("life-orb");
    expect(validateItem(items, "Objeto Inventado")).toBe(false);
  });


  it("acepta nombres españoles obtenidos dinámicamente de PokéAPI", () => {
    const charizard = makeCharizard();
    const abilityLabels = { "solar-power": "Poder Solar", blaze: "Mar Llamas" };
    const moveLabels = { flamethrower: "Lanzallamas", surf: "Surf" };
    const items: NamedAPIResource[] = [{ name: "light-clay", url: "" }];
    const itemLabels = { "light-clay": "Refleluz" };

    expect(resolveAbilityKey(charizard, "Poder Solar", abilityLabels)).toBe("solar-power");
    expect(resolveMoveKey(charizard, "Lanzallamas", moveLabels)).toBe("flamethrower");
    expect(validateMoveForVersion(charizard, "Lanzallamas", "scarlet-violet", moveLabels)).toBe(true);
    expect(resolveItemKey(items, "Refleluz", itemLabels)).toBe("light-clay");
  });

  it("limita EVs a 252 por estadística y 510 en total", () => {
    expect(validateEvSpread({ hp: 4, attack: 0, defense: 0, specialAttack: 252, specialDefense: 0, speed: 252 }).valid).toBe(true);
    expect(validateEvSpread({ hp: 7, attack: 0, defense: 0, specialAttack: 252, specialDefense: 0, speed: 252 }).valid).toBe(false);
    expect(validateEvSpread({ hp: 0, attack: 253, defense: 0, specialAttack: 0, specialDefense: 0, speed: 0 }).valid).toBe(false);
    expect(normalizeEvSpread("252 At.Esp / 252 Vel / 4 PS").specialAttack).toBe(252);
  });
});
