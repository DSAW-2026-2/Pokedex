import fs from 'node:fs';

const read = (file) => fs.readFileSync(file, 'utf8');
const exists = (file) => fs.existsSync(file);
let failed = false;
function check(label, ok) {
  console.log(`${ok ? 'PASS' : 'FAIL'} ${label}`);
  if (!ok) failed = true;
}
function includes(file, needles) {
  if (!exists(file)) return false;
  const source = read(file);
  return needles.every((needle) => source.includes(needle));
}

const pkg = JSON.parse(read('package.json'));
check('versión compatible con v19', Number(pkg.version.split('.')[0]) >= 19);
check('Team Builder existe', includes('src/components/TeamBuilderPage.tsx', [
  'Team Builder', 'Agregar Pokémon', 'Limpiar equipo', 'Aventura', 'Competitivo',
  'Cobertura ofensiva por STAB', 'Debilidades repetidas', 'Candidatos para completar el equipo',
]));
check('PokéDetective existe', includes('src/components/PokeDetectivePage.tsx', [
  'PokéDetective', 'intentos restantes', 'Tu respuesta', 'Jugar de nuevo',
]) && includes('src/utils/detective.ts', ['Fácil', 'Medio', 'Difícil']));
check('rutas v19', includes('src/utils/routes.ts', ['/team-builder', '/pokedetective']));
check('App monta v19', includes('src/App.tsx', ['TeamBuilderPage', 'PokeDetectivePage', 'path="/team-builder"', 'path="/pokedetective"']));
check('Home activa ambas funciones', includes('src/components/HomePage.tsx', ['route: teamBuilderPath()', 'route: pokeDetectivePath()', 'Crear equipo →', 'Jugar →']));
check('Home sin Próximamente', !read('src/components/HomePage.tsx').includes('Próximamente'));
check('Header enlaza herramientas', includes('src/components/Header.tsx', ['Team Builder', 'PokéDetective']));
check('estilos Team Builder', includes('src/index.css', ['.team-slots', '.team-analysis-grid', '.team-suggestion-grid']));
check('estilos PokéDetective', includes('src/index.css', ['.detective-board', '.detective-clue-list', '.detective-answer-panel']));
check('Explorador v18 conservado', exists('src/components/PokemonExplorerPage.tsx'));
check('Movepedia v18 conservada', exists('src/components/MoveDexPage.tsx') && exists('src/components/MoveDetailPage.tsx'));

if (failed) process.exit(1);
console.log('PASS UI v19');
