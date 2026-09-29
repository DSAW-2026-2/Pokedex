import fs from 'node:fs';

const checks = [
  ['inicio', 'src/components/HomePage.tsx', ['¿Qué quieres descubrir hoy?', 'Buscar Pokémon', 'Explorar por generación', 'Comparar Pokémon', 'Favoritos']],
  ['lista de generación', 'src/components/GenerationPokemonPage.tsx', ['pokemon_species', 'Ver ficha', 'Filtrar por nombre o número']],
  ['explorador simplificado', 'src/components/GenerationExplorerPage.tsx', ['Pokémon introducidos', 'POKÉDEX NACIONAL', 'Ver Pokémon de esta generación']],
  ['corrección de búsqueda', 'src/hooks/usePokemonWorkspace.ts', ['¿Quisiste decir', 'Busca por nombre, número de Pokédex o usa los filtros.']],
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
  ['versión 16.0.0', pkg.version === '16.0.0'],
  ['inicio en /', app.includes('path="/" element={<HomePage />}')],
  ['Pokédex en /pokedex', app.includes('path="/pokedex" element={<PokedexPage />}')],
  ['ruta por generación', app.includes('path="/explorar/generaciones/:generationName"')],
  ['sin iniciales en tarjetas', !generationExplorer.includes('Iniciales')],
  ['sin destacados legendarios en tarjetas', !generationExplorer.includes('Legendarios / míticos destacados')],
  ['estilos de inicio', css.includes('.home-tool-grid') && css.includes('.home-search')],
  ['estilos de lista generacional', css.includes('.generation-pokemon-grid') && css.includes('.generation-open-button')],
];

for (const [label, ok] of structural) {
  console.log(`${ok ? 'PASS' : 'FAIL'} ${label}`);
  if (!ok) failed = true;
}

if (failed) process.exit(1);
console.log('PASS UI v16');
