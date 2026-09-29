import fs from 'node:fs';

const required = [
  ['src/components/EvolutionComparePage.tsx', ['Comparar evolución', 'Qué cambió']],
  ['src/components/FormChangesPage.tsx', ['Cambios de forma', 'No es una comparación competitiva']],
  ['src/components/GenerationExplorerPage.tsx', ['Explorar por generación', 'Generación IX']],
  ['src/components/ShinyGalleryPage.tsx', ['Galería Normal y Variocolor', 'Variocolor']],
  ['src/components/PokePassport.tsx', ['PokéPassport', 'Región de origen']],
  ['src/components/PokemonHistory.tsx', ['Historia del Pokémon', 'Generación']],
];

let failed = false;
for (const [file, needles] of required) {
  if (!fs.existsSync(file)) {
    console.error('FAIL falta', file); failed = true; continue;
  }
  const text = fs.readFileSync(file,'utf8');
  for (const needle of needles) {
    const ok = text.includes(needle);
    console.log(`${ok ? 'PASS' : 'FAIL'} ${file}: ${needle}`);
    if (!ok) failed = true;
  }
}

const pkg = JSON.parse(fs.readFileSync('package.json','utf8'));
const app = fs.readFileSync('src/App.tsx','utf8');
const compare = fs.readFileSync('src/components/ComparePage.tsx','utf8');
const variants = fs.readFileSync('src/components/VariantsPanel.tsx','utf8');
const overview = fs.readFileSync('src/components/OverviewPanel.tsx','utf8');
const css = fs.readFileSync('src/index.css','utf8');

const checks = [
  ['versión 15.0.0', pkg.version === '15.0.0'],
  ['rutas v15 conectadas', app.includes('EvolutionComparePage') && app.includes('FormChangesPage') && app.includes('GenerationExplorerPage') && app.includes('ShinyGalleryPage')],
  ['comparador competitivo heredado', compare.includes('Juego / Generación') && compare.includes('Set válido') && compare.includes('Recomendados por PokéCheck')],
  ['acciones de formas separadas', variants.includes('Qué cambió') && variants.includes('>VS<')],
  ['complementos en ficha', overview.includes('<PokePassport') && overview.includes('<PokemonHistory')],
  ['estilos v15', css.includes('.poke-passport') && css.includes('.generation-grid') && css.includes('.shiny-gallery-grid')],
];
for (const [name, ok] of checks) {
  console.log(`${ok ? 'PASS' : 'FAIL'} ${name}`);
  if (!ok) failed = true;
}

if (failed) process.exit(1);
console.log('PASS UI v15');
