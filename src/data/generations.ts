export interface GenerationCardData {
  id: number;
  apiName: string;
  roman: string;
  region: string;
}

export const GENERATION_CARDS: GenerationCardData[] = [
  { id: 1, apiName: "generation-i", roman: "I", region: "Kanto" },
  { id: 2, apiName: "generation-ii", roman: "II", region: "Johto" },
  { id: 3, apiName: "generation-iii", roman: "III", region: "Hoenn" },
  { id: 4, apiName: "generation-iv", roman: "IV", region: "Sinnoh" },
  { id: 5, apiName: "generation-v", roman: "V", region: "Teselia" },
  { id: 6, apiName: "generation-vi", roman: "VI", region: "Kalos" },
  { id: 7, apiName: "generation-vii", roman: "VII", region: "Alola" },
  { id: 8, apiName: "generation-viii", roman: "VIII", region: "Galar / Hisui" },
  { id: 9, apiName: "generation-ix", roman: "IX", region: "Paldea" },
];

const GENERATION_DEX_RANGES: Record<number, [number, number]> = {
  1: [1, 151],
  2: [152, 251],
  3: [252, 386],
  4: [387, 493],
  5: [494, 649],
  6: [650, 721],
  7: [722, 809],
  8: [810, 905],
  9: [906, 1025],
};

export function getGenerationDexRange(id: number): { start: number; end: number; label: string } {
  const [start, end] = GENERATION_DEX_RANGES[id] || [0, 0];
  const pad = (value: number) => `#${String(value).padStart(4, "0")}`;
  return { start, end, label: start && end ? `${pad(start)} – ${pad(end)}` : "Rango no disponible" };
}
