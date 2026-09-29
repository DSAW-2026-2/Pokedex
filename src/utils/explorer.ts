export type ExplorerSortKey =
  | "id"
  | "name"
  | "hp"
  | "attack"
  | "defense"
  | "specialAttack"
  | "specialDefense"
  | "speed"
  | "bst";

export interface ExplorerStats {
  hp: number;
  attack: number;
  defense: number;
  specialAttack: number;
  specialDefense: number;
  speed: number;
}

export interface ExplorerSortableRow {
  id: number;
  name: string;
  stats: ExplorerStats;
  bst: number;
}

export type ExplorerStatMinimums = Partial<ExplorerStats>;

const GENERATION_RANGES: Array<[number, number, number]> = [
  [1, 1, 151],
  [2, 152, 251],
  [3, 252, 386],
  [4, 387, 493],
  [5, 494, 649],
  [6, 650, 721],
  [7, 722, 809],
  [8, 810, 905],
  [9, 906, 1025],
];

export function generationForNationalId(id: number): number | null {
  if (!Number.isFinite(id) || id < 1 || id >= 10000) return null;
  return GENERATION_RANGES.find(([, start, end]) => id >= start && id <= end)?.[0] ?? null;
}

export function meetsStatMinimums(row: ExplorerSortableRow, minimums: ExplorerStatMinimums): boolean {
  return (Object.entries(minimums) as Array<[keyof ExplorerStats, number | undefined]>).every(([key, minimum]) => {
    if (minimum === undefined || minimum <= 0) return true;
    return row.stats[key] >= minimum;
  });
}

export function sortExplorerRows<T extends ExplorerSortableRow>(rows: T[], sortKey: ExplorerSortKey): T[] {
  return [...rows].sort((a, b) => {
    if (sortKey === "name") return a.name.localeCompare(b.name);
    if (sortKey === "id") return a.id - b.id;
    if (sortKey === "bst") return b.bst - a.bst || a.id - b.id;
    return b.stats[sortKey] - a.stats[sortKey] || a.id - b.id;
  });
}
