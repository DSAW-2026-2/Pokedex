import { isMeaningfulVariant } from "../src/utils/pokemon";
import type { Pokemon } from "../src/types/pokemon";

function makePokemon(name: string, moves: string[] = [], id = 1): Pokemon {
  return {
    id,
    name,
    height: 10,
    weight: 10,
    abilities: [{ is_hidden: false, slot: 1, ability: { name: "static", url: "" } }],
    forms: [],
    species: { name: "pikachu", url: "https://pokeapi.co/api/v2/pokemon-species/25/" },
    sprites: {},
    stats: [35,55,40,50,50,90].map((base_stat, index) => ({ base_stat, effort: 0, stat: { name: String(index), url: "" } })),
    types: [{ slot: 1, type: { name: "electric", url: "" } }],
    moves: moves.map((name) => ({ move: { name, url: "" }, version_group_details: [] })),
  };
}

function assert(condition: unknown, message: string) {
  if (!condition) throw new Error(message);
}

const base = makePokemon("pikachu", ["thunderbolt", "quick-attack"], 25);
const cap = makePokemon("pikachu-original-cap", ["thunderbolt", "quick-attack"], 10080);
assert(isMeaningfulVariant(base, cap), "Pikachu con gorra debe considerarse una forma funcional relevante");

const cosplay = makePokemon("pikachu-rock-star", ["thunderbolt", "meteor-mash"], 10081);
assert(isMeaningfulVariant(base, cosplay), "Pikachu Coqueta con movimiento exclusivo debe considerarse relevante");

const customMoveVariant = makePokemon("testmon-special", ["thunderbolt", "surf"], 10082);
assert(isMeaningfulVariant(base, customMoveVariant), "Un cambio de movepool debe volver relevante a la forma");

console.log("PASS v14 variant behavior");
