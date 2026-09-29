import fs from 'node:fs';

const checks = [
  ['inicio visual', 'src/components/HomePage.tsx', ['Explora, compara y descubre Pokémon de forma simple.', 'home-tool-badge', 'Abrir sección →', 'Abrir Pokédex completa', 'home-future-grid']],
  ['inicio con iconos', 'src/components/HomePage.tsx', ['searchIcon', 'generationsIcon', 'compareIcon', 'favoritesIcon', 'teamBuilderIcon', 'detectiveIcon']],
  ['lista de generación', 'src/components/GenerationPokemonPage.tsx', ['pokemon_species', 'Ver ficha', 'Filtrar por nombre o número']],
  ['explorador simplificado', 'src/components/GenerationExplorerPage.tsx', ['Pokémon introducidos', 'POKÉDEX NACIONAL', 'Ver Pokémon de esta generación']],
  ['comparar evolución', 'src/components/EvolutionComparePage.tsx', ['Comparar evolución', 'Qué cambió']],
  ['cambios de forma', 'src/components/FormChangesPage.tsx', ['Cambios de forma', 'No es una comparación competitiva']],
  ['galería variocolor', 'src/components/ShinyGalleryPage.tsx', ['Galería Normal y Variocolor', 'Variocolor']],
  ['pasaporte', 'src/components/PokePassport.tsx', ['PokéPassport', 'Región de origen']],
];

let failed = false;
for (const [label, file, needles] of checks) {
  if (!fs.existsSync(file)) {
    console.error(`FAIL ${label}: falta ${file}`);
    failed = true;
    continue;
  }
  const text = fs.readFileSync(file, 'utf8');
  for (const needle of needles) {
    const ok = text.includes(needle);
    console.log(`${ok ? 'PASS' : 'FAIL'} ${label}: ${needle}`);
    if (!ok) failed = true;
  }
}

const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const app = fs.readFileSync('src/App.tsx', 'utf8');
const css = fs.readFileSync('src/index.css', 'utf8');
const generationExplorer = fs.readFileSync('src/components/GenerationExplorerPage.tsx', 'utf8');

const structural = [
  ['versión compatible con v17', Number(pkg.version.split('.')[0]) >= 17],
  ['inicio en /', app.includes('path="/" element={<HomePage />}')],
  ['Pokédex en /pokedex', app.includes('path="/pokedex" element={<PokedexPage />}')],
  ['ruta por generación', app.includes('path="/explorar/generaciones/:generationName"')],
  ['sin iniciales en tarjetas', !generationExplorer.includes('Iniciales')],
  ['sin destacados legendarios en tarjetas', !generationExplorer.includes('Legendarios / míticos destacados')],
  ['sin seña de identidad en tarjetas', !generationExplorer.includes('SEÑA DE IDENTIDAD')],
  ['estilos de inicio enriquecidos', css.includes('.home-tool-badge') && css.includes('.home-hero-tags') && css.includes('.home-future-grid') && !css.includes('.home-tool-card.featured')],
  ['acentos visuales', css.includes('.accent-generations') && css.includes('.accent-analysis') && css.includes('.accent-favorites') && css.includes('.accent-team') && css.includes('.accent-detective')],
];

for (const [label, ok] of structural) {
  console.log(`${ok ? 'PASS' : 'FAIL'} ${label}`);
  if (!ok) failed = true;
}

if (failed) process.exit(1);
console.log('PASS UI v17');
