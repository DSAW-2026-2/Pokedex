import {
  ROLE_OPTIONS,
  NATURE_OPTIONS,
  getAvailableVersionGroups,
  validateAbility,
  validateEvSpread,
  validateMoveForVersion,
  normalizeEvSpread,
} from "../src/utils/setValidation";
import type { Pokemon } from "../src/types/pokemon";

function assert(condition: unknown, message: string) {
  if (!condition) throw new Error(message);
}

const charizard: Pokemon = {
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
      version_group_details: [
        { version_group: { name: "scarlet-violet", url: "" }, move_learn_method: { name: "machine", url: "" } },
      ],
    },
    {
      move: { name: "surf", url: "" },
      version_group_details: [
        { version_group: { name: "sword-shield", url: "" }, move_learn_method: { name: "machine", url: "" } },
      ],
    },
  ],
};

assert(ROLE_OPTIONS.includes("Atacante especial"), "Debe haber roles predeterminados");
assert(NATURE_OPTIONS.some((nature) => nature.key === "timid"), "Debe incluir naturaleza Miedosa/Timid");
assert(validateAbility(charizard, "blaze"), "Mar Llamas/Blaze debe ser válida para Charizard");
assert(!validateAbility(charizard, "intimidate"), "Intimidación no debe ser válida para Charizard");
assert(validateMoveForVersion(charizard, "flamethrower", "scarlet-violet"), "Lanzallamas debe ser legal en Escarlata/Púrpura en este fixture");
assert(!validateMoveForVersion(charizard, "surf", "scarlet-violet"), "Surf no debe validarse cuando el fixture no lo permite en Escarlata/Púrpura");
assert(getAvailableVersionGroups(charizard).includes("scarlet-violet"), "Debe detectar grupos de versión aprendibles");
assert(validateEvSpread({ hp: 4, attack: 0, defense: 0, specialAttack: 252, specialDefense: 0, speed: 252 }).valid, "4/252/252 debe ser válido");
assert(!validateEvSpread({ hp: 7, attack: 0, defense: 0, specialAttack: 252, specialDefense: 0, speed: 252 }).valid, "Más de 510 EVs debe ser inválido");
assert(!validateEvSpread({ hp: 0, attack: 253, defense: 0, specialAttack: 0, specialDefense: 0, speed: 0 }).valid, "Más de 252 en un stat debe ser inválido");
assert(normalizeEvSpread("252 At.Esp / 252 Vel / 4 PS").specialAttack === 252, "Debe leer EVs existentes para recomendaciones");

console.log("PASS v14 set legality");
