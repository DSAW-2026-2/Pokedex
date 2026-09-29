import fs from 'node:fs';
import assert from 'node:assert/strict';

const source = fs.readFileSync(new URL('../src/components/VariantsPanel.tsx', import.meta.url), 'utf8');

assert.match(source, /shinyArtwork/, 'Formas y Variantes debe usar la imagen variocolor propia de cada forma');
assert.match(source, /Variocolor/, 'Debe existir un selector visible Normal\/Variocolor');
assert.match(source, /Variocolor no disponible/, 'No debe sustituir silenciosamente un variocolor ausente por la imagen normal');
assert.match(source, /showShiny/, 'El selector debe mantener un estado de visualización variocolor');

console.log('VARIANT_SHINY_UI_CHECK: PASS');
