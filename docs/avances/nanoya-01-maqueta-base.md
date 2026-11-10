# NanoYA 01 — Maqueta base: canal, catálogo minorista y marca

Rama: `feature/nanoya` (desde `develop` en `d25d6e7`). Sin merge a `develop` ni `main`.

## Qué se hizo

- Configuración por canal en `src/config/canal.ts`: lee `VITE_CANAL` (`'minorista'` → NanoYA; sin setear o cualquier otro valor → `'mayorista'`) y `VITE_MAQUETA` (`'true'` → modo maqueta). Exporta `CANAL`, `ES_MINORISTA`, `MODO_MAQUETA`, `CONFIG_POR_CANAL` (los dos canales) y `config` (el del canal activo).
- Queries de Sanity: en minorista, `getProductos()` y `getBolsonPorSlug()` proyectan `precio`/`descuento` con `coalesce(precioMinorista, precio)` / `coalesce(descuentoMinorista, descuento)`, excluyen `categoriasExcluidas` y ordenan por el precio proyectado. `getCategorias()` no devuelve las excluidas. En mayorista el texto de las queries no cambió.
- El carrito usa `config.storageKeyCarrito` (`nano_carrito_v2` / `nanoya_carrito_v1`).
- El botón de bulto/caja de `CardProducto` solo aparece si `config.ventaPorCaja` es true.
- Header y Footer toman nombre, sub y texto del footer de `config`. `document.title` se setea desde `config.tituloPagina` en `main.tsx`.
- `BannerMaqueta`: franja fija arriba con "Versión de prueba de NanoYA — los precios son de ejemplo", solo si `MODO_MAQUETA`.
- Script `npm run dev:nanoya`.

## Archivos creados y modificados

Creados:
- `src/config/canal.ts`
- `src/components/layout/BannerMaqueta.tsx`
- `src/components/layout/BannerMaqueta.css`
- `.env.nanoya` (solo `VITE_CANAL=minorista` y `VITE_MAQUETA=true`, nada sensible)
- `docs/avances/nanoya-01-maqueta-base.md`

Modificados:
- `src/lib/sanity.ts`: import de `canal` + rama minorista al principio de `getCategorias`, `getProductos` y `getBolsonPorSlug`. Las queries minoristas están en funciones privadas aparte (`getProductosMinorista`, `getBolsonPorSlugMinorista`).
- `src/context/CarritoContext.tsx`: `STORAGE_KEY = config.storageKeyCarrito` + el import.
- `src/components/catalogo/CardProducto.tsx`: `config.ventaPorCaja &&` en `muestraBtnCaja` + el import.
- `src/components/layout/Header.tsx`, `Footer.tsx`: textos de marca/footer desde `config` + el import.
- `src/components/layout/Layout.tsx`: monta `<BannerMaqueta />` antes del `<Header />`.
- `src/main.tsx`: `document.title = config.tituloPagina`.
- `package.json`: script `dev:nanoya`.

## Decisiones tomadas

- **Script sin `cross-env`**: `"dev:nanoya": "vite --mode nanoya"` + archivo `.env.nanoya`. Vite carga `.env` (Sanity, server) y después `.env.nanoya`, así que funciona en Windows sin dependencias nuevas. `.env.nanoya` no está ignorado por `.gitignore` (solo `.env` y `*.local`) y se commitea porque no tiene secretos.
- **Valores mayoristas copiados del código actual**: título `'Pañalera Nano'` (`index.html`), WhatsApp `5493412479055` (`ModalCarrito`/`Footer`/`Contacto`), mínimo `150000` (`ModalCarrito`/`CarritoFlotante`). El texto del footer se pasó a un string con un espacio donde antes había un salto de línea dentro del JSX. JSX ya colapsaba ese salto a un espacio, así que el render es idéntico.
- **`document.title` sin condición**: en mayorista vale `'Pañalera Nano'`, que es lo mismo que el `<title>` de `index.html`, así que no cambia nada. `Comprobante.tsx` lo sigue pisando con su propio título igual que antes.
- **Exclusión con `!coalesce(categoria->slug.current in $excluidas, false)`**: el `coalesce` hace que un producto sin categoría no se excluya por un `null`. Hoy hay 0 productos sin categoría, pero se cubre el caso. Las categorías excluidas se pasan como parámetro GROQ (`$excluidas`), no interpoladas.
- **Orden minorista**: primero proyección y después `| order(precio asc)`, para ordenar por el precio ya resuelto con `coalesce`.
- **`getBolsonPorSlug` minorista** también aplica la exclusión, por consistencia: un slug de combo devuelve `null` en NanoYA.
- **Banner con `position: sticky; top: 0`** en vez de `fixed`: queda pegado arriba al scrollear sin tapar el header (que es `position: relative`) y sin tener que compensar alturas en otros CSS.
- Los links de WhatsApp de Footer/Contacto/FAQ siguen hardcodeados al número mayorista. El brief no los incluía y el número de NanoYA todavía no existe.

## Desvíos respecto al brief

- El script usa `vite --mode nanoya` + `.env.nanoya` en lugar de `cross-env` (el brief lo permitía como alternativa sin dependencias). Hay un archivo nuevo (`.env.nanoya`) que no figuraba en la lista.

## Pendientes / problemas

- ⚠️ **El checkout de la maqueta NO es seguro todavía.** Con `dev:nanoya`, `VITE_SERVER_URL` sale del `.env` (server de **producción**) y `ModalCarrito.tsx` (fuera de alcance de este brief) sigue haciendo `POST /pedido` y armando el WhatsApp al número mayorista. Si alguien envía un pedido desde la maqueta, **se registra un pedido real en producción** con precios de ejemplo. Hasta el brief 03: no tocar "Enviar pedido" en la maqueta, y no deployar NanoYA a Vercel en un lugar público.
- `ModalCarrito` y `CarritoFlotante` siguen con el mínimo de $150.000 hardcodeado, así que en la maqueta minorista se ve el aviso de mínimo. Va en el brief 03.
- En minorista, `config.whatsapp` está vacío (placeholder). Falta el número de Lean.
- Cuando existan `precioMinorista`/`descuentoMinorista` en Sanity, ajustar el filtro (por ejemplo, no mostrar productos sin precio minorista fuera del modo maqueta).
- El bundle mayorista incluye los textos de `CONFIG_POR_CANAL.minorista` (son unos bytes, no se ejecutan). El banner se elimina por dead-code porque `MODO_MAQUETA` es constante.

## Cómo probarlo

1. `npm run build`: sin errores (verificado).
2. `npm run dev` (sin variables): header/footer "Nano / Mayorista", mismo texto de footer, catálogo con combos y categoría Combos, botón "📦 Agregar bulto", carrito en `localStorage` → `nano_carrito_v2`, sin banner, pestaña "Pañalera Nano".
3. `npm run dev:nanoya`: banner amarillo arriba, header/footer "Nano / YA", texto de footer minorista, pestaña "NanoYA — Pañalera Nano", sin combos ni categoría Combos, sin botón de bulto, carrito en `nanoya_carrito_v1` (agregar algo en un modo y comprobar que no aparece en el otro, en el mismo navegador).
4. Network: solo GETs a `*.apicdn.sanity.io`. Ningún cambio de este brief agrega escrituras (ver el pendiente de arriba sobre "Enviar pedido").

Verificado con queries de solo lectura contra `production`: 1172 productos en total, 17 combos, la query minorista devuelve 1155, 0 combos, ordenados por precio. `getCategorias` minorista no trae `combos`.
