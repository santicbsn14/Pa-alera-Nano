# Avance — Carrusel de destacados · D (orden aleatorio)

## Qué se hizo
- Rama `feature/carrusel-aleatorio` creada desde `origin/develop`. Antes se corrió `git diff --stat origin/develop origin/main`, que no mostró diferencias. `feature/nanoya` no se tocó.
- En `src/components/catalogo/CarruselDestacados.tsx`:
  - Función pura `mezclar<T>(lista: T[]): T[]` arriba del componente principal. Es un Fisher–Yates sobre `lista.slice()`: no muta el array original y no usa `sort(() => Math.random() - 0.5)`.
  - En el `useEffect` de `CarruselDestacados`, cuando llega la respuesta: `setData(d ? { ...d, productos: mezclar(d.productos) } : null)`.
- La mezcla se hace una sola vez por montaje y el resultado queda guardado en `data`, así que:
  - No se vuelve a mezclar en los re-renders, con el autoplay, con las flechas ni al cruzar el breakpoint mobile/desktop. `DestacadosMobile` y `DestacadosDesktop` reciben el mismo array ya mezclado.
  - Al recargar o al volver a entrar a `/catalogo` el componente se monta de nuevo y sale otro orden.

## Archivos creados / modificados
- `src/components/catalogo/CarruselDestacados.tsx`: función `mezclar` + una línea en el `useEffect`.
- `docs/avances/carrusel-destacados-D-aleatorio.md`: este archivo.

## Decisiones
- La mezcla va después del filtro de `getCarruselDestacados()` (stock y referencias rotas), así que ese comportamiento no cambia. Con `null` (doc inactivo, sin productos o error) no se mezcla nada y el componente sigue devolviendo `null`.
- `lib/sanity.ts` no se tocó: la query sigue devolviendo el orden del Studio y la mezcla es solo de presentación.
- No hay límite de cantidad en el front.

## Desvíos respecto al brief
Ninguno.

## Pendientes / problemas
- Las pruebas en el navegador (recargar `/catalogo` en desktop y mobile, autoplay, flechas, resize) quedan para hacer a mano. Lo que sí se verificó: `npm run build` OK, `eslint` del archivo sin errores (igual que en `develop`) y un test en Node de `mezclar`. Ese test confirmó que no muta el original, que devuelve una permutación, que funciona con 0 y 1 elementos y que con 60.000 corridas sobre 3 elementos las 6 permutaciones salen cada una ≈10.000 veces.

## Cómo probarlo
1. `VITE_SANITY_DATASET=staging npx vite` (puerto 5173) y abrir `/catalogo`.
2. Recargar varias veces en desktop y en mobile (DevTools ≤ 768px): el orden de "Novedades" cambia.
3. Sin recargar: dejar correr el autoplay, usar las flechas y redimensionar entre mobile y desktop. El orden no cambia.
4. Confirmar que siguen sin aparecer los productos sin stock ni las referencias rotas.
5. Con un solo producto en el doc, o con el doc inactivo en staging, todo se comporta igual que antes.
