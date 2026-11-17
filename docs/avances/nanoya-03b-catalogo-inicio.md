# NanoYA 03b — El catálogo es el inicio + mini carrusel de promos + Novedades minoristas

Rama: `feature/nanoya` · Fecha: 2026-11-17

## Qué se hizo

- **Paso 0:** `git merge origin/develop` en `feature/nanoya` (orden aleatorio del carrusel, PR #7). Entró sin conflictos. Commit `merge: develop (carrusel aleatorio) en feature/nanoya`.
- **Rutas (minorista):** `/` = catálogo; `/catalogo` → `<Navigate to="/" replace />`; nueva `/como-comprar` (Cómo comprar + Contacto). `comprobante`, `bolson/:slug` y `/admin` igual. Las rutas mayoristas quedaron en un bloque `<Routes>` aparte, textualmente iguales.
- **`Home.tsx`** vuelve a ser idéntico al de `develop` (se sacó la rama minorista del brief 02).
- **Mini carrusel de promos (`PromosMini`)**, solo en minorista, arriba del catálogo:
  - En maqueta usa los banners estáticos de `src/assets/nanoya/banners/` (`import.meta.glob` eager, orden por nombre). Si no hay, `getPromos()` con `urlFor(...).width(1600).height(360).fit('crop')`. Con 0 imágenes no renderiza nada.
  - Slides 40:9, ancho del `container`, `object-fit: cover`, `--radius-lg`. Mientras carga desde Sanity se muestra un placeholder del mismo tamaño (`--color-celeste-subtle`).
  - Scroll nativo con `scroll-snap`, scrollbar oculta, punto activo calculado del `scrollLeft`. Autoplay 5 s con vuelta al primero; pausa con hover, foco, `pointerdown`/`touchstart`/`wheel` sobre el track (retoma a los 6 s) y pestaña oculta; sin autoplay con `prefers-reduced-motion`. Con 1 banner: sin puntitos ni autoplay. Sin listeners en `window`.
- **Novedades minoristas:** `getCarruselDestacados()` delega en minorista a la nueva `getCarruselDestacadosMinorista()`: mismo singleton, proyección minorista (`coalesce(precioMinorista, precio)`, `coalesce(descuentoMinorista, descuento)`), excluye `config.categoriasExcluidas` (combos) y mismo post-filtro (`enStock`, `null` si queda vacío).
- **`Catalogo.tsx`:** early return minorista `PromosMini → OfertasBanner → CarruselDestacados → GridProductos → CatalogoCategorias`; el return mayorista volvió a ser el de `develop`.
- **Header (minorista):** "Productos" (`/`, `end`) y "Cómo comprar" (`/como-comprar`), sin "Inicio" y sin CTA (desktop ni menú mobile). **Footer (minorista):** Productos + Cómo comprar. **ComoComprar:** el CTA final va a `/`.
- `CarruselDestacados.tsx`: solo se actualizó el comentario de cabecera. `CLAUDE.md`: regla del carrusel reemplazada por la del brief.

## Archivos creados y modificados

Creados:
- `src/components/catalogo/PromosMini.tsx`, `src/components/catalogo/PromosMini.css`
- `src/pages/ComoComprarPage.tsx`
- `src/assets/nanoya/banners/banner-nanoya-maqueta.png` (pasado por Santiago, 663×142)
- `docs/avances/nanoya-03b-catalogo-inicio.md`

Modificados:
- `src/App.tsx`, `src/pages/Catalogo.tsx`, `src/pages/Home.tsx` (vuelve a develop), `src/lib/sanity.ts`
- `src/components/catalogo/CarruselDestacados.tsx` (solo comentario)
- `src/components/layout/Header.tsx`, `src/components/layout/Footer.tsx`, `src/components/home/ComoComprar.tsx`
- `CLAUDE.md`

## Decisiones tomadas

- **Filtro de combos en GROQ** sobre el array de referencias: `productos[!coalesce(@->categoria->slug.current in $excluidas, false)]->{…}`. Como hoy el carrusel no tiene combos, se validó (solo lectura) excluyendo otras categorías: de 20 productos quedaron 17 y desaparecieron las categorías excluidas.
- En `getCarruselDestacados()` la única línea nueva es `if (ES_MINORISTA) return getCarruselDestacadosMinorista()` al principio (mismo patrón que `getProductos()`); la query mayorista no cambió.
- **Header/Footer:** los links "Inicio" y catálogo pasaron adentro de la rama mayorista del condicional, para que en minorista no aparezcan. El HTML mayorista resultante es el mismo (verificado en navegador).
- **Separación abajo del banner en desktop** (`margin-bottom: --spacing-lg`): sin eso, con 1 solo banner (sin puntitos) quedaba pegado a la franja roja de ofertas. En mobile es 0 porque esa franja está oculta y Novedades ya tiene su padding arriba.
- El slide tiene `border-radius` + `overflow: hidden` además del track, para que la esquina se vea redondeada también durante el swipe.
- Los selectores CSS por orden de hermanos (`.destacados + .catalogo__wrap`, `.destacados-m ~ .cat-mobile`) siguen funcionando porque `PromosMini` va antes de todo: no se metió entre Novedades y el catálogo.

## Desvíos respecto al brief

- **`git diff origin/develop -- src/pages/Catalogo.tsx` no queda vacío.** El punto 4 pide el early return minorista en ese mismo archivo, así que el diff es solo el import de `PromosMini` y el bloque `if (ES_MINORISTA) {…}`; el return mayorista es textualmente el de `develop`. `Home.tsx` sí queda con diff vacío.
- `margin-bottom` del mini carrusel en desktop (ver Decisiones): el brief solo especificaba la separación de arriba.

## Pendientes

- **Scroll al cambiar de ruta:** no hay "scroll to top" en el router. Ir a "Cómo comprar" desde el footer (abajo de todo) deja la página nueva scrolleada. No se arregló (según el brief).
- El `import.meta.glob` eager hace que `banner-nanoya-maqueta.png` (125 KB) se emita en `dist/` también en el build mayorista, aunque nunca se pide (en mayorista `PromosMini` no se monta). Se resuelve solo en el brief 06 al borrar la carpeta estática; tenerlo en cuenta si esto llegara a `develop` antes.
- Brief 06: banners desde Sanity con `promo.canal` y borrar `src/assets/nanoya/banners/`.
- Lint: `npm run lint` sigue marcando 2 errores y 1 warning preexistentes (`BolsonDetalle.tsx`, `Comprobante.tsx`, `Admin.tsx`); los archivos nuevos no suman ninguno.

## Cómo probarlo

1. `npm run build` y `npx vite build --mode nanoya` → ambos sin errores (verificado).
2. Mayorista (`npm run dev`, puerto 5173): `/` = Hero + precios + logística + FAQ + contacto; `/catalogo` = ofertas + Novedades + catálogo; header con Inicio / Pedidos Nano / anclas + CTA; footer igual. Verificado a 375 y 1440 px.
3. NanoYA (`npm run dev:nanoya`, puerto 5173 por CORS de Sanity):
   - `/` → banner + Novedades + buscador/acordeón (375 px) o grilla (1440 px). `/catalogo` redirige a `/`.
   - Banner medido: 343×77 a 375 px y 1160×261 a 1440 px (4,44:1). Sin scroll horizontal a 375 px.
   - Header: Productos + Cómo comprar, sin CTA. `/como-comprar` = Cómo comprar + Contacto.
   - Con un segundo banner temporal en la carpeta: 2 puntitos, autoplay a los 5 s, vuelve al primero, el clic en un punto navega y pausa el autoplay; la página no se mueve. (El archivo de prueba se borró.)
   - Pestaña Network: ningún POST/PUT/PATCH/DELETE, en ninguno de los dos canales.
