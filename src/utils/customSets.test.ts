import { describe, expect, it } from "vitest";
import type { CompetitiveSet } from "../data/competitiveSets";
import { removeCustomSet, upsertCustomSet } from "./customSets";

const custom: CompetitiveSet = {
  source: "custom",
  role: "Soporte personalizado",
  label: "Mi set",
  ability: "Intimidación",
  item: "Baya Zidra",
  nature: "Cauta",
  evs: "252 PS / 4 Def / 252 SpD",
  moves: ["Fake Out", "Parting Shot", "Knock Off", "Protect"],
  tags: [],
};

describe("custom competitive sets", () => {
  it("upserts a set by normalized Pokémon name", () => {
    const next = upsertCustomSet({}, " Incineroar ", custom);
    expect(next.incineroar).toEqual(custom);
  });

  it("removes only the requested Pokémon set", () => {
    const next = removeCustomSet({ incineroar: custom, rillaboom: custom }, "incineroar");
    expect(next.incineroar).toBeUndefined();
    expect(next.rillaboom).toEqual(custom);
  });
});
