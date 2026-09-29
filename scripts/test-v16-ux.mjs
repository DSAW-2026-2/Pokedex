import assert from 'node:assert/strict';
import fs from 'node:fs';

function read(path) {
  return fs.readFileSync(new URL(path, import.meta.url), 'utf8');
}

const app = read('../src/App.tsx');
const routes = read('../src/utils/routes.ts');
const generations = read('../src/data/generations.ts');
const generationExplorer = read('../src/components/GenerationExplorerPage.tsx');
const workspace = read('../src/hooks/usePokemonWorkspace.ts');
const suggestions = read('../src/components/SearchSuggestions.tsx');
const pkg = JSON.parse(read('../package.json'));

const homeUrl = new URL('../src/components/HomePage.tsx', import.meta.url);
const generationListUrl = new URL('../src/components/GenerationPokemonPage.tsx', import.meta.url);

assert.equal(fs.existsSync(homeUrl), true, 'v16 debe tener una pantalla de inicio propia.');
assert.equal(fs.existsSync(generationListUrl), true, 'v16 debe tener una página que liste los Pokémon de una generación.');

if (fs.existsSync(homeUrl)) {
  const home = fs.readFileSync(homeUrl, 'utf8');
  for (const label of ['Buscar Pokémon', 'Explorar por generación', 'Comparar Pokémon', 'Favoritos']) {
    assert.equal(home.includes(label), true, `Inicio debe mostrar la opción: ${label}`);
  }
  assert.equal(home.includes('PokéDetective'), true, 'Inicio debe mostrar PokéDetective como función creativa.');
  assert.equal(home.includes('Team Builder'), true, 'Inicio debe mostrar Team Builder como función creativa.');
}

assert.equal(routes.includes('return "/pokedex"'), true, 'v16 necesita una ruta /pokedex.');
assert.equal(routes.includes('/explorar/generaciones/'), true, 'v16 necesita rutas para cada generación.');
assert.equal(generations.includes('[252, 386]'), true, 'v16 debe conocer el rango nacional de Hoenn.');
assert.equal(generations.includes('#${String(value).padStart(4, "0")}'), true, 'Los rangos deben usar número Pokédex con cuatro dígitos.');

assert.equal(generationExplorer.includes('Iniciales'), false, 'Las tarjetas de generación ya no deben mostrar Iniciales.');
assert.equal(generationExplorer.includes('Legendarios / míticos destacados'), false, 'Las tarjetas ya no deben listar legendarios/míticos.');
assert.equal(generationExplorer.includes('Ver Pokémon de esta generación'), true, 'Cada generación debe llevar a su lista de Pokémon.');
assert.equal(generationExplorer.includes('getGenerationDexRange'), true, 'Cada tarjeta debe mostrar el rango de Pokédex nacional.');

if (fs.existsSync(generationListUrl)) {
  const generationList = fs.readFileSync(generationListUrl, 'utf8');
  assert.equal(generationList.includes('pokemon_species'), true, 'La lista de generación debe usar las especies de PokéAPI.');
  assert.equal(generationList.includes('Ver ficha'), true, 'Cada Pokémon de la generación debe poder abrir su ficha.');
}

assert.equal(app.includes('<HomePage'), true, 'La ruta raíz debe usar la nueva pantalla de inicio.');
assert.match(app, /path="\/pokedex"[^\n]*<PokedexPage/, 'La Pokédex debe quedar accesible en /pokedex.');
assert.equal(app.includes('GenerationPokemonPage'), true, 'App debe registrar la lista de Pokémon de cada generación.');
assert.equal(app.includes('path="/explorar/generaciones/:generationName"'), true, 'Debe existir una ruta dinámica por generación.');

assert.equal(workspace.includes('“Picachu”'), false, 'La búsqueda no debe mostrar ejemplos de errores como consejo inicial.');
assert.equal(workspace.includes('¿Quisiste decir'), true, 'Los errores tipográficos deben usar ¿Quisiste decir...?');
assert.equal(suggestions.includes('prompt ||'), true, 'La caja de corrección debe poder mostrar el texto ¿Quisiste decir...?');
assert.equal(app.includes('prompt={workspace.suggestionPrompt}'), true, 'La interfaz debe mostrar el prompt de corrección del buscador.');

assert.equal(pkg.version, '16.0.0', 'El paquete debe identificarse como v16.');
assert.equal(typeof pkg.scripts?.['verify:v16'], 'string', 'v16 debe incluir su verificación rápida.');

console.log('v16 UX tests: OK');
