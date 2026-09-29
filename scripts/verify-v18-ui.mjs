import fs from 'node:fs';

const checks = [
  ['Explorador Pokémon', 'src/components/PokemonExplorerPage.tsx', ['Explorador Pokémon', 'Limpiar filtros', 'Estadísticas mínimas', 'Ver ficha →']],
  ['Movepedia', 'src/components/MoveDexPage.tsx', ['Movepedia', 'Buscar movimiento', 'Ver movimiento →']],
  ['Ficha de movimiento', 'src/components/MoveDetailPage.tsx', ['Pokémon que pueden aprenderlo', 'Potencia', 'Precisión', 'Prioridad', 'Prob. efecto']],
  ['Integración ficha Pokémon', 'src/components/OverviewPanel.tsx', ['Ver movimientos disponibles']],
  ['Navegación', 'src/components/Header.tsx', ['Pokédex', 'Explorador', 'Generaciones', 'Movepedia', 'Comparar', 'Favoritos']],
  ['Home v18', 'src/components/HomePage.tsx', ['Explorador Pokémon', 'Movepedia', 'Team Builder', 'PokéDetective']],
];

let failed = false;
for (const [label, file, needles] of checks) {
  if (!fs.existsSync(file)) { console.error(`FAIL ${label}: falta ${file}`); failed = true; continue; }
  const source = fs.readFileSync(file, 'utf8');
  for (const needle of needles) {
    const ok = source.includes(needle);
    console.log(`${ok ? 'PASS' : 'FAIL'} ${label}: ${needle}`);
    if (!ok) failed = true;
  }
}

const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const app = fs.readFileSync('src/App.tsx', 'utf8');
const css = fs.readFileSync('src/index.css', 'utf8');
const api = fs.readFileSync('src/api/pokeApi.ts', 'utf8');
const structural = [
  ['versión compatible con v18', Number(pkg.version.split('.')[0]) >= 18],
  ['rutas nuevas', app.includes('/explorar/pokemon') && app.includes('/movimientos/:moveName')],
  ['API de movimientos', api.includes('getMoveIndex') && api.includes('getMove(')],
  ['API de habilidades', api.includes('getAbilityIndex') && api.includes('getAbility(')],
  ['estilos explorador', css.includes('.explorer-layout') && css.includes('.explorer-card-grid')],
  ['estilos Movepedia', css.includes('.move-card-grid') && css.includes('.move-detail-hero')],
  ['responsive filtros', css.includes('.mobile-filter-toggle') && css.includes('.explorer-filters.is-open')],
];
for (const [label, ok] of structural) {
  console.log(`${ok ? 'PASS' : 'FAIL'} ${label}`);
  if (!ok) failed = true;
}
if (failed) process.exit(1);
console.log('PASS UI v18');
