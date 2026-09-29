# Despliegue de PokéCheck en GitHub Pages

Repositorio: https://github.com/DSAW-2026-2/Pokedex

Sitio esperado: https://dsaw-2026-2.github.io/Pokedex/

## Antes de entregar

1. Sube estos cambios a la rama `main`.
2. En GitHub abre **Settings → Pages**.
3. En **Build and deployment → Source**, selecciona **GitHub Actions**.
4. Abre la pestaña **Actions** y espera a que `Deploy PokéCheck to GitHub Pages` termine en verde.
5. Abre https://dsaw-2026-2.github.io/Pokedex/ y verifica Inicio, una ficha Pokémon y Team Builder.
6. Confirma que el README muestra el autor y el enlace desplegado.

El workflow también crea `404.html` a partir de `index.html` para que las rutas de React funcionen mejor al abrir enlaces directos en GitHub Pages.
