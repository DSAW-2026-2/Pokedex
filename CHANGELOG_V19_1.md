# PokéCheck v19.1

## Team Builder: formas competitivas

- Selector **Forma** por miembro en modo Competitivo.
- Las variedades disponibles en PokéAPI se pueden cargar directamente y actualizan imagen, tipos, stats y análisis.
- Registro local para formas recientes que todavía no estén disponibles en PokéAPI.
- Primer caso local: **Mega-Staraptor** (Lucha/Volador, Respondón, stats base de Champions).
- Cambiar a modo Aventura devuelve el análisis a las formas base.
- El análisis de cobertura, debilidades, orientación ofensiva y velocidad se recalcula con la forma seleccionada.

### Nota de datos
Mega-Staraptor se mantiene en una capa local para evitar depender de que PokéAPI publique la forma inmediatamente. El resto de formas presentes en PokéAPI se leen desde `species.varieties`.
