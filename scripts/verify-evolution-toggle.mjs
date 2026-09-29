import fs from 'node:fs';
import assert from 'node:assert/strict';

const source = fs.readFileSync(new URL('../src/components/EvolutionLine.tsx', import.meta.url), 'utf8');

assert.match(source, /useState\(false\)/, 'Cada tarjeta evolutiva debe iniciar en modo normal');
assert.match(source, /evolutionArtworkForMode\(pokemon, showShiny\)/, 'La tarjeta debe elegir entre imagen normal y variocolor según su propio estado');
assert.match(source, /setShowShiny\(/, 'Cada tarjeta debe poder alternar individualmente a variocolor');
assert.match(source, /Volver a normal|Normal/, 'Debe existir una acción visible para volver a la imagen normal');
assert.doesNotMatch(source, /Vista variocolor de cada etapa para comparar cuál te gusta más\./, 'La línea no debe forzar toda la cadena a variocolor');

console.log('EVOLUTION_TOGGLE_UI: PASS');
