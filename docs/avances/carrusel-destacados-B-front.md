# Avance — Carrusel de destacados · B (nano-web)

## Qué se hizo
- Rama `feature/carrusel-destacados` creada desde `origin/develop`. Antes se corrió `git log --no-merges origin/develop..origin/main`, que no devolvió commits. `feature/nanoya` no se tocó.
- **`getCarruselDestacados()`** al final de `src/lib/sanity.ts`:
  - Query `*[_id == "carruselDestacados" && activo == true][0]`, con la misma proyección de producto que `getProductos()` (sin `productosInternos`).
  - En JS filtra `p && p.enStock`, que descarta las referencias weak rotas (`null`) y los productos sin stock.
  - Devuelve `null` si no hay doc, si está inactivo o si quedan 0 productos.
- **`CarruselDestacados.tsx/.css`**, un solo componente:
  - Hace el fetch en un `useEffect`. Mientras carga, si hay error o si devuelve `null`, retorna `null`: sin spinner, y el catálogo queda igual.
  - `useEsMobile()` usa `matchMedia('(max-width: 768px)')`: estado inicial en el `useState`, listener `change` y limpieza al desmontar. Se renderiza una sola versión.
  - `useCarrusel()` (hook interno compartido) maneja:
    - Scroll nativo con snap.
    - Autoplay cada 3500 ms con `scrollBy` (ancho del primer slide + gap) y vuelta a 0 al final.
    - Todo el estado en refs: el único `setState` es `scrolleable`, que cambia solo en resize.
    - Todas las pausas del brief: hover, foco, `pointerdown`/`touchstart`/`wheel` con reanudación a los 6 s, `document.hidden`, ficha abierta y `prefers-reduced-motion`.
    - Sin scroll no hay autoplay, flechas ni barra. Se recalcula con `ResizeObserver` del track y `resize`.
    - La barra de progreso se actualiza con rAF en `scroll`.
  - **Desktop/tablet:** franja con `CardProducto` completas, 4 visibles en ≥ 1025px y 3 en 769–1024px. Flechas con loop (prev en el inicio va al final, next en el final vuelve a 0) que reinician el timer. Mismos chevrons que `Hero.tsx`.
  - **Mobile:** mosaico de 166px con estrella + título (sin contador) e items de foto 88×88 (`urlFor` 176×176), nombre en 2 líneas, tachado/badge si hay descuento (helpers de `lib/precio.ts`) y chevron.
    - Tocar un bolsón navega a `/bolson/:slug`.
    - Tocar cualquier otro producto abre la ficha.
  - **Ficha (bottom sheet):**
    - `createPortal` a `body`, z-index 250.
    - Se cierra con X, fondo y Escape.
    - Al abrir, el foco va a "Cerrar".
    - `body.overflow` se restaura al cerrar y al desmontar.
    - Adentro está la `CardProducto` real.
- **`Catalogo.tsx`:** import + `<CarruselDestacados />` entre `OfertasBanner` y `GridProductos`.
- **`CLAUDE.md`:** las tres reglas ⚠️ en "Patrones establecidos".

## Archivos creados / modificados
- `src/types/index.ts`: interface `CarruselDestacados` al final.
- `src/lib/sanity.ts`: tipo en el import + función al final.
- `src/components/catalogo/CarruselDestacados.tsx`: nuevo.
- `src/components/catalogo/CarruselDestacados.css`: nuevo.
- `src/pages/Catalogo.tsx`: import + una línea.
- `CLAUDE.md`: tres patrones.
- `docs/avances/carrusel-destacados-B-front.md`: este archivo.

```
$ git diff origin/develop --stat   (antes de sumar este avance)
 CLAUDE.md                                      |  20 ++
 src/components/catalogo/CarruselDestacados.css | 393 ++++++++++++++++++++++
 src/components/catalogo/CarruselDestacados.tsx | 436 +++++++++++++++++++++++++
 src/lib/sanity.ts                              |  43 ++-
 src/pages/Catalogo.tsx                         |   2 +
 src/types/index.ts                             |   7 +-
 6 files changed, 898 insertions(+), 3 deletions(-)
```
Con este avance son 7 archivos.

## Decisiones tomadas durante la implementación
- **Las "deletions" en `sanity.ts` y `types/index.ts`** son la última línea `}`: el archivo no terminaba en salto de línea y, para agregar al final, hubo que sumarlo. No cambia ningún contenido existente.
- **Hover solo con mouse real:** se usa `pointerenter`/`pointerleave` filtrando `pointerType === 'mouse'` en vez de `mouseenter`/`mouseleave`. En celulares, el tap dispara un `mouseenter` emulado que no tiene `mouseleave` hasta tocar otra cosa, y el autoplay quedaba pausado.
- **Pausa por foco solo con foco de teclado (`:focus-visible`):** en Chrome Android el tap deja el foco en el botón tocado. Con la regla literal, el autoplay quedaba frenado hasta tocar fuera del carrusel. Con teclado pausa igual que pide el brief.
- **Al cerrar la ficha, el foco vuelve al item que la abrió** (si sigue en el DOM), por accesibilidad.
- En la ficha, el fondo cierra solo si el click es sobre el overlay mismo (`target === currentTarget`). Así los clicks dentro del modal de combo (portal React) no la cierran.
- La barra de progreso mobile se corre 6px para quedar centrada respecto del tile, compensando el `padding-left` asimétrico.
- El título mobile tiene `ellipsis` por si Lean escribe un título largo, para que no rompa los 18px del head.
- Con `prefers-reduced-motion` tampoco se anima la entrada de la ficha.

## Desvíos respecto al brief
- Pausa por hover con eventos pointer y pausa por foco solo con `:focus-visible` (ver Decisiones). Es el mismo comportamiento en desktop con mouse/teclado y evita la pausa colgada en touch.

## Pendientes / problemas encontrados
- **Título en staging:** el doc de `staging` tiene `titulo = "Productos destacados"`, no "Novedades" como dice el brief. El componente muestra el campo tal cual, así que alcanza con cambiarlo en el Studio. No se tocaron datos de Sanity.
- **Alto del mosaico vs. categorías:** el tile mide 166px exactos, como pide el brief. Medido en Chromium headless, 2 categorías cerradas + gap dan **152px** (72 + 8 + 72) en 360/390/768. Puede ser una diferencia de render de la fuente contra la maqueta. Conviene medirlo en un celular real. Si tiene que coincidir, es cambiar `height` en `.destacados-m__tile`.
- No se probó en un iPhone real (Safari): solo Chromium emulado.
- Al integrar `feature/nanoya`, aplicar la regla ⚠️ 3 de `CLAUDE.md`.

## Cómo probarlo
1. `VITE_SANITY_DATASET=staging npx vite` (puerto 5173; otros puertos no están en los CORS de Sanity) y abrir `/catalogo`.
2. Verificado con Playwright contra staging (los POST bloqueados, no se envió ningún pedido):
   - **1440 / 1024:** franja entre el banner y el grid, 4 / 3 cards visibles, flechas y barra.
     - Autoplay 0 → 294 → 588. Con hover no avanza.
     - Prev en el inicio va al final y next en el final vuelve a 0.
     - Combo desde el carrusel: el modal ocupa todo el viewport (1440×900).
   - **360 / 390 / 768:** tile de 166px arriba del buscador, 6 items, head sin contador. Sin scroll horizontal de página en ningún ancho.
   - **Ficha (390):**
     - Abre con foco en "Cerrar", `body.overflow = hidden` y `transform: none` en reposo.
     - Con la ficha abierta, el autoplay no avanza.
     - Al agregar un producto, el toast queda arriba de la ficha (es el elemento visible en ese punto).
     - Combo: modal de talles centrado y completo; se agregó y la card pasó a "+ Agregar otro (1 en pedido)".
     - Cierra con Escape, fondo y X, y restaura `overflow`.
   - **Sincronía de contadores:** al sumar en el carrusel, la card del grid muestra el mismo número, y al revés.
   - **Resize** 390 → 1200 → 390: cambia de versión sin errores.
   - **Reduced motion:** sin autoplay.
   - **Doc inexistente** (respuesta interceptada con `result: null`): no se renderiza nada y los paddings quedan como hoy (`.catalogo__wrap` 100px, `.cat-mobile` 24px).
3. `npm run build` OK. `eslint` sin errores en los archivos tocados (el error preexistente de `GridProductos.tsx` sigue igual y no se tocó).

## Ajuste C — alto 152px

Solo cambió `src/components/catalogo/CarruselDestacados.css`, con los valores del brief:

| Regla | Antes | Ahora |
|---|---|---|
| `.destacados-m__tile` `height` | 166px | 152px |
| `.destacados-m__tile` `padding` | 10px 0 10px 12px | 8px 0 8px 12px |
| `.destacados-m__tile` `gap` | 8px | 6px |
| `.destacados-m__item` `padding` | 8px | 6px |

### Medidas reales (Chromium headless, staging, 360 y 390, iguales en los dos anchos)
- **Tile:** 152px.
- **Categoría cerrada:** 72px. 2 categorías + gap = **152px** (72 + 8 + 72). Coincide con el tile.
- **Track:** 101px.
- **Item:** 101px (ocupa todo el track; arriba y abajo 0px de diferencia con el track).
- **Foto:** 88×88, con 6.5px libres arriba y abajo dentro del item.
- **Barra de progreso:** 3px de alto, a 140px del borde superior del tile, centrada (0px de desvío) y dentro del tile.

### ⚠️ La fuente Inter no se carga en el sitio
`--font-sans` declara `'Inter'`, pero el repo no la carga en ningún lado: no hay `@font-face`, ni link a Google Fonts, ni paquete `fontsource`. Por eso cada visitante ve la fuente de su sistema: Roboto en Android, San Francisco en iOS y Segoe UI en Windows, salvo que tenga Inter instalada. Medí las tres variantes inyectando la fuente solo en la página de prueba, sin tocar el repo:

| Fuente | Categoría | 2 cat. + gap |
|---|---|---|
| Respaldo de Windows (Segoe UI) | 72px | 152px |
| Roboto (Android) | 72px | 152px |
| Inter (inyectada a mano) | 71px | 150px |

**Decisión: dejé 152px.** El brief pedía medir con Inter, pero hoy ningún visitante la ve, y con Roboto (la mayoría de los clientes, en Android) da 152. Si ponía 150 para que coincidiera con Inter, quedaba 2px corrido de lo que ve la gente y además había que achicar la foto (el track bajaba a 99px). Si en algún momento se carga Inter de verdad, el tile pasa a 150px y la foto a 87px. No probé San Francisco (iOS) porque no se puede cargar en Chromium.

### Contenido del item
- **Nombre:** en 2 líneas (33.8px = 2 × 16.9). Los nombres largos se cortan con `…` en la segunda línea, como antes.
- **Precio:** completo.
- **Badge y tachado:** ningún producto del carrusel de staging tiene descuento. Lo simulé interceptando la respuesta de Sanity en la prueba (`descuento: 25`, sin tocar datos). El badge `-25%` queda sobre la foto, y nombre, tachado y precio entran completos: precio a 12.2px del borde inferior del item. Verificado en 360 y 390.

### Verificación
- `npm run build` OK.
- No se tocó el `.tsx`, desktop ni la ficha.
