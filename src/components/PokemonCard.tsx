import { useEffect, useState } from "react";
import { getPokemon } from "../api/pokeApi";
import type { ResultItem } from "../types/pokemon";
import { directSpriteUrl, sortTypes } from "../utils/pokemon";
import { padDex, titleCase, typeLabel } from "../utils/text";

interface PokemonCardProps {
  item: ResultItem;
  selected?: boolean;
  onSelect: (name: string) => void;
}

export default function PokemonCard({ item, selected = false, onSelect }: PokemonCardProps) {
  const [types, setTypes] = useState<string[]>([]);

  useEffect(() => {
    const controller = new AbortController();
    getPokemon(item.name, controller.signal)
      .then((pokemon) => setTypes(sortTypes(pokemon.types).map((entry) => entry.type.name)))
      .catch(() => setTypes([]));
    return () => controller.abort();
  }, [item.name]);

  return (
    <button
      className={`sidebar-result ${selected ? "selected" : ""}`}
      type="button"
      onClick={() => onSelect(item.name)}
      aria-current={selected ? "true" : undefined}
    >
      <img src={directSpriteUrl(item.id)} alt="" loading="lazy" />
      <div className="sidebar-result-copy">
        <span className="sidebar-number">{item.id >= 10000 ? "Forma" : padDex(item.speciesId || item.id)}</span>
        <strong>{titleCase(item.name)}</strong>
        <div className="mini-types">
          {types.slice(0, 2).map((type) => (
            <span key={`${item.name}-${type}`} className={`mini-type type-${type}`}>{typeLabel(type)}</span>
          ))}
        </div>
      </div>
      {selected && <span className="selection-dot" aria-hidden="true" />}
    </button>
  );
}
