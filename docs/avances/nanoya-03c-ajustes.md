# NanoYA 03c — Segundo banner, footer sin navegación y "Cómo comprar" sin pasos

Rama: `feature/nanoya` · Fecha: 2026-11-19

## Qué se hizo

- **Segundo banner provisorio:** se agregó `banner-nanoya-uber.png` (1600×360) en `src/assets/nanoya/banners/`. No se tocó `PromosMini`: su `import.meta.glob` toma todos los `png/jpg/jpeg/webp` de la carpeta ordenados por nombre, así que queda `banner-nanoya-maqueta.png` primero y `banner-nanoya-uber.png` segundo. Con 2 imágenes el carrusel muestra los puntitos y el autoplay. El build `--mode nanoya` empaqueta los dos banners.
- **Footer (minorista):** se sacó la columna de navegación completa (título "Navegación" + lista). En minorista `.footer__inner` lleva además el modificador `footer__inner--minorista` (`grid-template-columns: 2fr 1fr`): quedan marca + contacto sin hueco. En mobile (≤768 px) sigue siendo 1 columna.
- **Mayorista:** muestra la misma columna de navegación con los mismos 6 links que antes y el mismo grid de 3 columnas.
- **Cómo comprar:** se sacaron el array `pasos` y el `<ol className="como-comprar__pasos">`. En el CSS se borraron `.como-comprar__pasos`, `__paso` (+ `:hover`), `__numero`, `__paso-titulo`, `__paso-texto` y las media queries de 1024 px y 600 px, que solo tocaban esas clases. Quedan el badge, el título, el subtítulo, las 3 tarjetas (zonas, horarios, WhatsApp) y el botón "Hacer mi pedido".

## Archivos

- Nuevo: `src/assets/nanoya/banners/banner-nanoya-uber.png`
- Modificados: `src/components/layout/Footer.tsx`, `src/components/layout/Footer.css`, `src/components/home/ComoComprar.tsx`, `src/components/home/ComoComprar.css`

## Decisiones

- **Footer:** antes había un solo `<div className="footer__links">` con un ternario `ES_MINORISTA ? … : …` dentro del `<ul>`. Ahora el bloque entero se renderiza con `{!ES_MINORISTA && (…)}`. Como el bloque quedó envuelto en la condición, sus líneas tienen un nivel más de sangría. La mayorista recibe exactamente el mismo HTML que antes.
- **Espacio en Cómo comprar:** se sacó el `margin-top: var(--spacing-xl)` de `.como-comprar__info`, que separaba los pasos de las tarjetas. Ahora la distancia entre el subtítulo y las tarjetas es el `margin-bottom` global de `.section-subtitle` (`--spacing-xl`), la misma que hay entre el subtítulo y el contenido en las demás secciones. Si quedaban los dos márgenes juntos, se veía el hueco.

## Desvíos

Ninguno.

## Pendientes

- Revisión visual en 1440 y 375 px (footer, `/como-comprar` y el swipe del carrusel en mobile): no la hice desde acá, solo verifiqué los dos builds.
- `banner-nanoya-uber.png` es provisorio. El banner de Lean (`banner-nanoya-maqueta.png`) es 663×142: tiene la misma proporción de 40:9 pero baja resolución, así que en 1440 px puede verse borroso.

## Cómo probarlo

1. `npm run build` y `npx vite build --mode nanoya`: los dos terminan sin errores.
2. `npx vite --mode nanoya`:
   - En `/`, el mini carrusel tiene 2 banners (el de Lean primero), puntitos y autoplay cada 5 s. En mobile se puede pasar con swipe.
   - El footer muestra marca + contacto en 2 columnas a 1440 px y en 1 columna a 375 px, sin "Navegación".
   - `/como-comprar` muestra el título, el subtítulo, las 3 tarjetas y el botón, sin pasos numerados.
3. `npm run dev` (mayorista): el footer sigue con 3 columnas y los links Inicio, Catálogo, Precios, Envíos, Preguntas frecuentes y Contacto.
