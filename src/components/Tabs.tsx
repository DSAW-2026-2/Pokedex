import type { PokemonTab } from "../types/pokemon";

interface TabsProps {
  active: PokemonTab;
  onChange: (tab: PokemonTab) => void;
}

export default function Tabs({ active, onChange }: TabsProps) {
  const tabs: Array<[PokemonTab, string]> = [
    ["overview", "Resumen"],
    ["variants", "Formas y Variantes"],
    ["combat", "Combate"],
  ];

  return (
    <div className="detail-tabs" role="tablist" aria-label="Información del Pokémon">
      {tabs.map(([value, label]) => (
        <button
          key={value}
          role="tab"
          aria-selected={active === value}
          className={active === value ? "active" : ""}
          onClick={() => onChange(value)}
          type="button"
        >
          {label}
        </button>
      ))}
    </div>
  );
}
