import assert from 'node:assert/strict';
import fs from 'node:fs';

function read(path) {
  return fs.readFileSync(new URL(path, import.meta.url), 'utf8');
}

const app = read('../src/App.tsx');
const routes = read('../src/utils/routes.ts');
const generations = read('../src/data/generations.ts');
const generationExplorer = read('../src/components/GenerationExplorerPage.tsx');
const home = read('../src/components/HomePage.tsx');
const css = read('../src/index.css');
const pkg = JSON.parse(read('../package.json'));

assert.equal(home.includes('Buscar Pokémon'), true, 'Inicio debe mostrar Buscar Pokémon.');
assert.equal(home.includes('Explorar por generación'), true, 'Inicio debe mostrar Explorar por generación.');
assert.equal(home.includes('Comparar Pokémon'), true, 'Inicio debe mostrar Comparar Pokémon.');
assert.equal(home.includes('Favoritos'), true, 'Inicio debe mostrar Favoritos.');
assert.equal(home.includes('featured: true'), false, 'El buscador principal no debe duplicarse como tarjeta destacada.');
assert.equal(home.includes('home-tool-badge'), true, 'La home debe usar iconos por tarjeta.');
assert.equal(home.includes('Abrir Pokédex completa'), true, 'El buscador principal debe dar acceso a la Pokédex completa.');
assert.equal(home.includes('home-future-grid'), true, 'Las funciones futuras deben estar separadas de las herramientas activas.');
assert.equal(home.includes('Abrir sección →'), true, 'Los botones deben ser más compactos.');

assert.equal(routes.includes('return "/pokedex"'), true, 'Debe existir la ruta /pokedex.');
assert.equal(routes.includes('/explorar/generaciones/'), true, 'Debe existir la ruta por generaciones.');
assert.equal(generations.includes('[252, 386]'), true, 'Debe existir el rango nacional de Hoenn.');
assert.equal(generationExplorer.includes('Ver Pokémon de esta generación'), true, 'Cada tarjeta de generación debe abrir su lista.');
assert.equal(generationExplorer.includes('Iniciales'), false, 'Las tarjetas de generación no deben mostrar iniciales.');
assert.equal(generationExplorer.includes('Legendarios / míticos destacados'), false, 'Las tarjetas de generación no deben mostrar legendarios o míticos destacados.');
assert.equal(generationExplorer.includes('SEÑA DE IDENTIDAD'), false, 'Las tarjetas de generación no deben recuperar la sección de seña de identidad.');
assert.equal(generations.includes('starters:'), false, 'Los datos de generación no deben conservar iniciales que ya no se usan.');
assert.equal(generations.includes('legendaryHighlights:'), false, 'Los datos de generación no deben conservar destacados que ya no se usan.');
assert.equal(generations.includes('signature:'), false, 'Los datos de generación no deben conservar la seña de identidad eliminada.');

assert.equal(css.includes('.home-tool-card.featured'), false, 'CSS no debe conservar la tarjeta destacada duplicada.');
assert.equal(css.includes('.home-future-grid'), true, 'CSS debe separar visualmente las funciones futuras.');
assert.equal(css.includes('@media (max-width: 680px)'), true, 'El Home debe tener cierre responsive para móvil.');
assert.equal(css.includes('.home-tool-badge'), true, 'CSS debe dibujar el bloque de icono.');
assert.equal(css.includes('.accent-analysis'), true, 'CSS debe tener colores de acento por categoría.');
assert.equal(css.includes('.home-hero-tags'), true, 'CSS debe incluir chips visuales en el hero.');

assert.equal(app.includes('<HomePage'), true, 'La ruta raíz debe usar la pantalla de inicio.');
assert.ok(Number(pkg.version.split('.')[0]) >= 17, 'El paquete debe conservar la base introducida en v17.');
assert.equal(typeof pkg.scripts?.['verify:v17'], 'string', 'Debe existir el script verify:v17.');

console.log('v17 home tests: OK');
