import fs from 'node:fs';

const compare = fs.readFileSync(new URL('../src/components/ComparePage.tsx', import.meta.url), 'utf8');
const css = fs.readFileSync(new URL('../src/index.css', import.meta.url), 'utf8');
const pkg = JSON.parse(fs.readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
const variants = fs.readFileSync(new URL('../src/components/VariantsPanel.tsx', import.meta.url), 'utf8');
const pokemonUtils = fs.readFileSync(new URL('../src/utils/pokemon.ts', import.meta.url), 'utf8');
const functionalVariants = fs.readFileSync(new URL('../src/data/functionalVariants.ts', import.meta.url), 'utf8');

const checks = [
  ['versión 14.1.0', pkg.version === '14.1.0'],
  ['selector Juego / Generación', compare.includes('Juego / Generación') && compare.includes('versionGroup')],
  ['rol predeterminado', compare.includes('ROLE_OPTIONS') && compare.includes('<select')],
  ['habilidad validada', compare.includes('validateAbility')],
  ['objetos sostenibles reales', compare.includes('getHoldableItemIndex') && compare.includes('validateItem')],
  ['naturalezas oficiales', compare.includes('NATURE_OPTIONS')],
  ['EVs estructurados 510', compare.includes('510') && compare.includes('ev-grid')],
  ['movimientos por versión', compare.includes('validateMoveForVersion') && compare.includes('getMoveOptionsForVersion')],
  ['estado de legalidad', compare.includes('Set válido') && compare.includes('No se puede guardar')],
  ['recomendados PokéCheck', compare.includes('Recomendados por PokéCheck')],
  ['CSS editor v14', css.includes('.set-legality-status') && css.includes('.ev-grid')],
  ['formas por cambios de movepool', variants.includes('hasMovePoolChange') && pokemonUtils.includes('hasMovePoolChange')],
  ['Pikachu Coqueta y gorras', functionalVariants.includes('pikachu-rock-star') && functionalVariants.includes('pikachu-original-cap')],
  ['variantes funcionales especiales', functionalVariants.includes('basculin-white-striped') && functionalVariants.includes('floette-eternal') && functionalVariants.includes('genesect-douse')],
];

const failed = checks.filter(([, ok]) => !ok);
for (const [name, ok] of checks) console.log(`${ok ? 'PASS' : 'FAIL'} ${name}`);
if (failed.length) process.exit(1);
