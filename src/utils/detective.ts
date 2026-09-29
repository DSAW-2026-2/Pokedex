function normalizeGuess(value: string): string {
  return String(value || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().toLowerCase().replace(/[’']/g, "").replace(/[_\s]+/g, "-").replace(/-+/g, "-");
}

export type DetectiveDifficulty = "easy" | "medium" | "hard";

export interface DetectiveConfig {
  attempts: number;
  initialClues: number;
  label: string;
}

const CONFIG: Record<DetectiveDifficulty, DetectiveConfig> = {
  easy: { attempts: 6, initialClues: 4, label: "Fácil" },
  medium: { attempts: 5, initialClues: 3, label: "Medio" },
  hard: { attempts: 4, initialClues: 2, label: "Difícil" },
};

export function getDetectiveConfig(difficulty: DetectiveDifficulty): DetectiveConfig {
  return CONFIG[difficulty];
}

export interface DetectiveClueSource {
  generation: string;
  types: string[];
  heightM: number;
  weightKg: number;
  ability: string;
  topStat: string;
  topStatValue: number;
}

export function buildDetectiveClues(source: DetectiveClueSource): string[] {
  return [
    `Debutó en la Generación ${source.generation}.`,
    `Sus tipos son ${source.types.join(" / ")}.`,
    `Mide aproximadamente ${source.heightM.toFixed(1)} m.`,
    `Pesa aproximadamente ${source.weightKg.toFixed(1)} kg.`,
    `Puede tener la habilidad ${source.ability}.`,
    `Su estadística base más alta es ${source.topStat} (${source.topStatValue}).`,
  ];
}

export function visibleClueCount(difficulty: DetectiveDifficulty, wrongAttempts: number): number {
  const config = getDetectiveConfig(difficulty);
  return Math.min(6, config.initialClues + Math.max(0, wrongAttempts));
}

export function isCorrectGuess(guess: string, pokemonName: string, speciesName?: string): boolean {
  const normalized = normalizeGuess(guess);
  return normalized === normalizeGuess(pokemonName) || Boolean(speciesName && normalized === normalizeGuess(speciesName));
}

export function randomNationalDexId(random: () => number = Math.random): number {
  return 1 + Math.floor(random() * 1025);
}
