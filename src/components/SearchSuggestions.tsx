import type { SearchMatch } from "../types/pokemon";
import { padDex, titleCase } from "../utils/text";

interface SearchSuggestionsProps {
  matches: SearchMatch[];
  query: string;
  prompt?: string;
  onSelect: (name: string) => void;
}

export default function SearchSuggestions({ matches, query, prompt, onSelect }: SearchSuggestionsProps) {
  if (!matches.length) return null;
  return (
    <div className="suggestions">
      <strong>{prompt || `¿Buscabas alguno de estos Pokémon para “${query}”?`}</strong>
      <div className="suggestion-list">
        {matches.map((match) => (
          <button key={`${match.kind}-${match.name}`} type="button" className="suggestion-button" onClick={() => onSelect(match.name)}>
            {titleCase(match.name)} · {match.isVariant || (match.id || 0) >= 10000 ? "Forma / variedad" : padDex(match.id)}
          </button>
        ))}
      </div>
    </div>
  );
}
