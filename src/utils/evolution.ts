import type { EvolutionDetail, EvolutionNode } from "../types/pokemon";
import { extractId, titleCase, typeLabel } from "./text";

export interface EvolutionRow {
  id: number;
  name: string;
  parent: string | null;
  details: EvolutionDetail[];
}

export function describeEvolution(detail: EvolutionDetail = {}, localized: Record<string, string> = {}): string {
  const resourceLabel = (resource: { name: string; url: string } | null | undefined) => resource ? (localized[resource.url || resource.name] || titleCase(resource.name)) : "";
  const timeLabel = (value: string) => ({ day: "Día", night: "Noche", dusk: "Atardecer" }[value] || titleCase(value));
  const parts: string[] = [];
  if (detail.min_level) parts.push(`Nivel ${detail.min_level}`);
  if (detail.item?.name) parts.push(`Usar ${resourceLabel(detail.item)}`);
  if (detail.held_item?.name) parts.push(`Llevar ${resourceLabel(detail.held_item)}`);
  if (detail.trigger?.name === "trade") parts.push("Intercambio");
  if (detail.trigger?.name === "shed") parts.push("Condición especial");
  if (detail.min_happiness) parts.push(`Felicidad ≥ ${detail.min_happiness}`);
  if (detail.min_affection) parts.push(`Afecto ≥ ${detail.min_affection}`);
  if (detail.min_beauty) parts.push(`Belleza ≥ ${detail.min_beauty}`);
  if (detail.time_of_day) parts.push(`Momento: ${timeLabel(detail.time_of_day)}`);
  if (detail.location?.name) parts.push(`Lugar: ${resourceLabel(detail.location)}`);
  if (detail.known_move?.name) parts.push(`Conoce ${resourceLabel(detail.known_move)}`);
  if (detail.known_move_type?.name) parts.push(`Conoce movimiento ${typeLabel(detail.known_move_type.name)}`);
  if (detail.party_species?.name) parts.push(`Con ${resourceLabel(detail.party_species)} en el equipo`);
  if (detail.party_type?.name) parts.push(`Con Pokémon ${typeLabel(detail.party_type.name)} en el equipo`);
  if (detail.gender === 1) parts.push("Hembra");
  if (detail.gender === 2) parts.push("Macho");
  if (detail.needs_overworld_rain) parts.push("Mientras llueve");
  if (detail.turn_upside_down) parts.push("Consola invertida");
  if (detail.relative_physical_stats === 1) parts.push("Ataque > Defensa");
  if (detail.relative_physical_stats === 0) parts.push("Ataque = Defensa");
  if (detail.relative_physical_stats === -1) parts.push("Ataque < Defensa");
  if (parts.length) return parts.join(" · ");
  const trigger = detail.trigger?.name || "evolución";
  return ({ "level-up": "Subir de nivel", "use-item": "Usar objeto", trade: "Intercambio", shed: "Condición especial" }[trigger] || titleCase(trigger));
}

function toRow(node: EvolutionNode, parent: string | null): EvolutionRow {
  return {
    id: extractId(node.species.url) || 0,
    name: node.species.name,
    parent,
    details: node.evolution_details || [],
  };
}

export function flattenEvolution(node: EvolutionNode): EvolutionRow[] {
  const rows: EvolutionRow[] = [];
  function walk(current: EvolutionNode, parent: string | null = null) {
    rows.push(toRow(current, parent));
    (current.evolves_to || []).forEach((child) => walk(child, current.species.name));
  }
  walk(node);
  return rows;
}

export function buildEvolutionPaths(node: EvolutionNode): EvolutionRow[][] {
  function walk(current: EvolutionNode, parent: string | null): EvolutionRow[][] {
    const currentRow = toRow(current, parent);
    if (!current.evolves_to?.length) return [[currentRow]];
    return current.evolves_to.flatMap((child) =>
      walk(child, current.species.name).map((path) => [currentRow, ...path]),
    );
  }
  return walk(node, null);
}
