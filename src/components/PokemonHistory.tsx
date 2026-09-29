import type { PokemonBundle } from "../types/pokemon";
import { getVariantContext } from "../utils/pokemon";
import { generationRoman, titleCase } from "../utils/text";

interface PokemonHistoryProps {
  bundle: PokemonBundle;
}

interface HistoryEvent {
  generation: string;
  title: string;
  detail: string;
}

function variantGeneration(name: string): string | null {
  if (name.includes("-mega") || name.includes("-primal")) return "generation-vi";
  if (name.includes("-alola") || name.includes("-cap") || name.includes("-partner")) return "generation-vii";
  if (name.includes("-galar") || name.includes("-hisui") || name.includes("-gmax")) return "generation-viii";
  if (name.includes("-paldea") || name.includes("-bloodmoon")) return "generation-ix";
  return null;
}

function buildEvents(bundle: PokemonBundle): HistoryEvent[] {
  const events: HistoryEvent[] = [];
  const debut = bundle.species.generation?.name || "";
  if (debut) {
    events.push({
      generation: debut,
      title: `Debut de ${titleCase(bundle.species.name)}`,
      detail: "Primera generación registrada para esta especie en PokéAPI.",
    });
  }

  const seen = new Set<string>();
  for (const variety of bundle.species.varieties || []) {
    if (variety.is_default) continue;
    const generation = variantGeneration(variety.pokemon.name);
    if (!generation) continue;
    const key = `${generation}:${getVariantContext(variety.pokemon.name)}`;
    if (seen.has(key)) continue;
    seen.add(key);
    events.push({
      generation,
      title: getVariantContext(variety.pokemon.name),
      detail: `Se registra una variante como ${titleCase(variety.pokemon.name)}.`,
    });
  }

  const order: Record<string, number> = {
    "generation-i": 1, "generation-ii": 2, "generation-iii": 3, "generation-iv": 4,
    "generation-v": 5, "generation-vi": 6, "generation-vii": 7, "generation-viii": 8, "generation-ix": 9,
  };
  return events.sort((a, b) => (order[a.generation] || 99) - (order[b.generation] || 99));
}

export default function PokemonHistory({ bundle }: PokemonHistoryProps) {
  const events = buildEvents(bundle);
  return (
    <section className="pokemon-history" aria-labelledby="pokemon-history-title">
      <div className="history-heading">
        <span>RECORRIDO POR GENERACIONES</span>
        <h3 id="pokemon-history-title">Historia del Pokémon</h3>
        <p>Hitos detectados a partir de su generación y formas registradas.</p>
      </div>
      <div className="history-timeline">
        {events.map((event, index) => (
          <article key={`${event.generation}-${event.title}-${index}`}>
            <div className="history-generation">Generación {generationRoman(event.generation)}</div>
            <div className="history-dot" aria-hidden="true" />
            <div className="history-event-copy">
              <strong>{event.title}</strong>
              <p>{event.detail}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
