# PokéCheck v18 — Exploración avanzada

## Objetivo
Extender PokéCheck v17 sin reemplazar sus pantallas existentes. v18 añade dos caminos de consulta: Explorador Pokémon y Movepedia, ambos integrados con las fichas actuales.

## Alcance
- Home v18 con Explorador Pokémon y Movepedia como herramientas activas.
- Explorador Pokémon con filtros por nombre, generación, tipo, categoría, habilidad y stats mínimos; orden por Pokédex, nombre, stats o BST.
- Movepedia con búsqueda, resultados y ficha de movimiento.
- Ficha de movimiento con datos de combate, efecto y Pokémon compatibles.
- Acceso “Ver movimientos disponibles” desde la ficha Pokémon.
- Navegación y estilos responsive.
- Team Builder y PokéDetective siguen como Próximamente.

## Datos
PokéAPI sigue siendo la fuente principal. El Explorador evita descargar todas las fichas por defecto: primero reduce candidatos con nombre/generación/tipo/habilidad y solo obtiene detalles cuando los filtros o tarjetas los necesitan. Los resultados se cachean mediante la capa actual de cache.

## Rutas
- /explorar/pokemon
- /movimientos
- /movimientos/:moveName
- /movimientos?pokemon=:pokemonName

## Estados UX
Todas las pantallas nuevas contemplan carga, error, vacío y sin resultados. La interfaz visible permanece en español.

## Compatibilidad
No se eliminan rutas ni funciones de v17. Las fichas, formas, combate, VS, evolución, generaciones, PokéPassport, historia, galería y favoritos siguen operativas.
