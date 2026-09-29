# PokéCheck v19.1


## Novedad v19.1: formas en Team Builder

En modo **Competitivo**, cada miembro puede cambiar entre sus formas disponibles. Las formas presentes en PokéAPI se cargan directamente y las formas recientes todavía ausentes de PokéAPI pueden definirse en una capa local. El primer caso incluido es **Mega-Staraptor**, cuyo cambio actualiza imagen, tipos, habilidad, stats y todo el análisis del equipo.

Verificación específica:

```powershell
npm.cmd run verify:v19.1
```

## Novedades v19: Team Builder + PokéDetective

PokéCheck v19 conserva Explorador Pokémon, Movepedia y todo lo incluido en v18, y activa las dos herramientas que antes estaban en “Próximamente”.

- **Team Builder**: equipo de hasta 6 Pokémon, modos Aventura/Competitivo, roles, cobertura, debilidades repetidas, balance físico/especial, velocidad y sugerencias.
- **PokéDetective**: minijuego con dificultades Fácil/Medio/Difícil, pistas reales de PokéAPI, intentos limitados y silueta revelable.

### Rutas nuevas

```text
/team-builder
/pokedetective
```

### Ejecutar

```powershell
npm.cmd install
npm.cmd run test:run
npm.cmd run build
npm.cmd run dev
```

### Verificación específica v19

```powershell
npm.cmd run verify:v19
```

---

## Historial v18
## Novedades v18: exploración avanzada y Movepedia

PokéCheck v18 conserva todo lo incluido en v17 y añade:

- **Explorador Pokémon** con filtros por nombre, generación, tipo, categoría, habilidad y estadísticas mínimas.
- Orden por Nº Pokédex, nombre, stats o BST.
- **Movepedia** con buscador, datos de combate y ficha propia por movimiento.
- Lista de Pokémon que pueden aprender cada movimiento, con filtros por nombre, generación y tipo.
- Acceso **Ver movimientos disponibles** desde la ficha de cada Pokémon.
- Navegación v18 y adaptación responsive de las nuevas pantallas.

### Rutas nuevas

```text
/explorar/pokemon
/movimientos
/movimientos/:moveName
/movimientos?pokemon=lucario
```

### Ejecutar

```powershell
npm.cmd install
npm.cmd run dev
```

### Verificación rápida

```powershell
npm.cmd run verify:v18
npm.cmd run test:run
npm.cmd run build
```

---

## Historial v17

Pokédex web educativa construida con **React + TypeScript + TSX + Vite**, conectada a PokéAPI.

## Novedades v17: home visual con iconos y jerarquía

### Nueva pantalla de inicio
La ruta `/` ahora funciona como un portal de entrada. Desde allí se puede:
- buscar un Pokémon directamente;
- abrir la Pokédex completa;
- explorar por generación;
- abrir el comparador;
- acceder a favoritos;
- ver como próximas funciones Team Builder y PokéDetective.

La idea es que una persona que no conozca PokéCheck pueda entender qué hace cada sección antes de entrar.

### Búsqueda más natural
- Una coincidencia exacta abre directamente la ficha.
- Un error probable muestra **¿Quisiste decir ...?** con una única corrección clara.
- Se eliminaron los ejemplos de errores tipográficos que antes aparecían como consejo inicial.
- Si no hay coincidencia razonable, la interfaz simplemente indica que no se encontró el Pokémon.

### Explorar por generación simplificado
Las tarjetas ya no muestran listas de iniciales ni legendarios/míticos. Ahora priorizan:
- región;
- cantidad de Pokémon introducidos;
- rango de Pokédex Nacional;
- botón **Ver Pokémon de esta generación →**;
- seña de identidad de la generación.

Ejemplo para Hoenn:

```text
135 Pokémon introducidos
Pokémon #0252 – #0386
[ Ver Pokémon de esta generación → ]
```

### Pokédex propia de cada generación
Cada generación abre una página con todas las especies introducidas en ella. La lista:
- se obtiene de PokéAPI;
- se ordena por número de Pokédex Nacional;
- permite filtrar por nombre o número;
- permite abrir la ficha de cada Pokémon.

## Funciones heredadas
Se conservan las funciones de v15 y v14.1: formas relevantes, Normal/Variocolor, línea evolutiva, comparación evolutiva, cambios de forma, PokéPassport, historia, galería Variocolor, combate, comparación VS, favoritos y editor de sets personalizados con validación.

## Rutas principales

```text
/                                      Inicio
/pokedex                               Pokédex
/pokemon/:pokemonName                  Ficha
/explorar/generaciones                 Generaciones
/explorar/generaciones/:generationName Pokémon de una generación
/comparar/:pokemonA/:pokemonB          Comparador VS
/evolucion/:pokemonA/:pokemonB         Comparar evolución
/formas/comparar/:baseName/:variantName Cambios de forma
```

## Ejecutar en Windows

Doble clic en `INICIAR_POKECHECK.bat` o desde PowerShell:

```powershell
npm.cmd install
npm.cmd run test:run
npm.cmd run build
npm.cmd run dev
```

## Verificación rápida

```powershell
npm.cmd run verify:v17
```

## Fuente de datos
PokéAPI. Las recomendaciones y textos educativos de PokéCheck no sustituyen un verificador oficial de reglamentos competitivos.
