import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';

const root = process.cwd();
const compare = fs.readFileSync(path.join(root, 'src/components/ComparePage.tsx'), 'utf8');
const api = fs.readFileSync(path.join(root, 'src/api/pokeApi.ts'), 'utf8');

assert.match(api, /getLocalizedResourceNames/, 'Debe existir un localizador por lote para opciones competitivas.');
assert.match(compare, /localizedAbilityOptions/, 'Las habilidades visibles deben usar nombres localizados.');
assert.match(compare, /localizedMoveOptions/, 'Los movimientos visibles deben usar nombres localizados.');
assert.match(compare, /localizedItemOptions/, 'Las recomendaciones de objetos visibles deben usar nombres localizados.');
assert.match(compare, /displaySet/, 'Las configuraciones ya guardadas también deben mostrarse localizadas.');
assert.doesNotMatch(compare, /value=\{moveLabel\(move\)\}/, 'El datalist de movimientos no debe depender del diccionario parcial en inglés.');

console.log('OK: editor competitivo usa opciones visibles en español.');
