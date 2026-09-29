import type { PokemonMoveResource } from "../types/pokemon";
import { moveLabel, sanitizeFlavorText, titleCase } from "./text";

export function localizedMoveName(move: PokemonMoveResource): string {
  return move.names?.find((entry) => entry.language?.name === "es")?.name || moveLabel(move.name);
}

export function moveDamageClassLabel(name = ""): string {
  if (name === "physical") return "Físico";
  if (name === "special") return "Especial";
  if (name === "status") return "Estado";
  return titleCase(name);
}

export function moveDescription(move: PokemonMoveResource): string {
  const spanishFlavor = move.flavor_text_entries?.find((entry) => entry.language?.name === "es")?.flavor_text;
  if (spanishFlavor) return sanitizeFlavorText(spanishFlavor);
  const spanishEffect = move.effect_entries?.find((entry) => entry.language?.name === "es")?.short_effect;
  if (spanishEffect) return sanitizeFlavorText(spanishEffect.replace(/\$effect_chance/g, String(move.effect_chance ?? "")));
  return "PokéAPI no tiene una descripción en español disponible para este movimiento.";
}
