# NanoYA 02 — Maqueta: merge de develop, Home y "Cómo comprar"

Rama: `feature/nanoya`. Sin merge a `develop` ni `main`.

## Qué se hizo

### Paso 0 — merge de develop
- `git merge origin/develop` sobre `feature/nanoya` (develop en `8df4ba4`, PR #5 del carrusel de destacados; el PR #6 es develop → main, no agrega nada más). **Sin conflictos**: `sanity.ts` se auto-mergeó y quedan las ramas `ES_MINORISTA` del brief 01 y `getCarruselDestacados()` al final.
- `src/pages/Catalogo.tsx`: `{!ES_MINORISTA && <CarruselDestacados />}` + import de `ES_MINORISTA`. El componente, su CSS y la query no se tocaron.
- Commit `eafa712` — `merge: develop en feature/nanoya + carrusel de destacados oculto en minorista` (el cambio de `Catalogo.tsx` va dentro del commit de merge).
- Se releyó `CLAUDE.md` post-merge: la regla "el carrusel de destacados es SOLO mayorista" queda cumplida con la condición en `Catalogo.tsx`.

### Home
- `config/canal.ts`: campos nuevos `whatsappVisible`, `horarios`, `zonasEnvio` y `textos` (`linkCatalogo`, `ctaHeader`, `heroBarDestacado`, `heroBarTexto`, `heroBarBoton`, `contactoSubtitulo`). Valores mayoristas copiados del código actual. `whatsapp` minorista = `5493400588073` (antes vacío).
- `Home.tsx`: en minorista `Hero` → `ComoComprar` → `Contacto`. Mayorista sin cambios.
- `Hero.tsx`: solo la barra CTA toma los textos de `config.textos`. El carrusel de promos no se tocó.
- Nueva sección `ComoComprar` (`id="como-comprar"`): badge, título, subtítulo, 4 pasos numerados, 3 tarjetas (zonas como chips, horarios, WhatsApp con botón "Escribinos") y CTA "Hacer mi pedido" → `/catalogo`.
- `Contacto.tsx`: WhatsApp (link y valor visible), horarios y subtítulo desde `config`.
- `Header.tsx`: link al catálogo y CTA desde `config.textos`; anclas por canal (minorista: Cómo comprar + Contacto).
- `Footer.tsx`: los dos links de WhatsApp, horarios y link al catálogo desde `config`; navegación por canal.
- `PreguntasFrecuentes.tsx`: link del CTA a `config.whatsapp`.

## Archivos creados y modificados

Creados:
- `src/components/home/ComoComprar.tsx`
- `src/components/home/ComoComprar.css`
- `docs/avances/nanoya-02-maqueta-home.md`

Modificados:
- Merge: `CLAUDE.md`, `docs/avances/carrusel-destacados-B-front.md`, `src/components/catalogo/CarruselDestacados.tsx/.css`, `src/lib/sanity.ts`, `src/pages/Catalogo.tsx`, `src/types/index.ts` (lo que trajo develop).
- `src/pages/Catalogo.tsx` (condición + import)
- `src/config/canal.ts`, `src/pages/Home.tsx`, `src/components/home/Hero.tsx`, `src/components/home/Contacto.tsx`, `src/components/home/PreguntasFrecuentes.tsx`, `src/components/layout/Header.tsx`, `src/components/layout/Footer.tsx`

## Decisiones tomadas

- **CTA del menú mobile**: en mayorista hoy dice "Armá tu pedido ahora" (distinto del CTA desktop "Pedidos Nano"). Como `textos` no tiene un campo para eso y el brief fija el shape, quedó `ES_MINORISTA ? config.textos.ctaHeader : 'Armá tu pedido ahora'`. Mayorista idéntico; minorista "Hacer mi pedido" en desktop y mobile.
- **Contacto mayorista**: el valor visible pasa de `` `+${WHATSAPP}` `` a `config.whatsappVisible` (`'+5493412479055'`), mismo string renderizado. Se mantuvo la constante local `WHATSAPP` (ahora `= config.whatsapp`) para no reescribir el array.
- **Home con early return** (`if (ES_MINORISTA) return …`) en vez de ternario dentro del JSX: el bloque mayorista queda textual igual al original.
- **ComoComprar con `section-alt`** para alternar fondo con la barra del hero y Contacto. Tarjetas blancas (`--color-bg`) sobre el fondo gris, mismo radio/borde/hover que Logística. Botón de WhatsApp verde igual a `logistica__btn`.
- **Breakpoints**: pasos 4 → 2 columnas a ≤1024px → 1 a ≤600px; info 3 → 1 a ≤900px (mismo corte que Logística, centrado con `max-width: 480px`).
- Pasos como `<ol>` (semántica de lista ordenada; el reset global ya saca el `list-style`).

## Desvíos respecto al brief

- El merge se hizo con commit automático y después se **amendó** (local, antes de pushear) para sumar el cambio de `Catalogo.tsx` y poner el mensaje pedido. Queda un único commit de merge con todo el paso 0.
- Ninguno más.

## Pendientes

- ⚠️ Sigue vigente lo del brief 01: **"Enviar pedido" en la maqueta pega al server de producción** y arma el WhatsApp al número mayorista (`ModalCarrito.tsx`, brief 03). No usar el checkout en la maqueta.
- El bundle mayorista incluye el código de `ComoComprar` y los textos minoristas (no se ejecutan). Lo mismo al revés con `CarruselDestacados`.
- Filtro de promos del hero por canal (brief posterior).
- No se probó a mano el scroll de las anclas en un navegador real (ver "Cómo probarlo").

## Cómo probarlo

1. `npm run build`: sin errores (verificado, también `vite build --mode nanoya`).
2. `npm run dev`: `/catalogo` con el carrusel de destacados (si el doc está activo). Home con ListaPrecios/Logística/FAQ, header "Pedidos Nano" + anclas Precios/Envios/Preguntas Frecuentes/Contacto, CTA mobile "Armá tu pedido ahora", WhatsApp `5493412479055` en footer, contacto y FAQ.
3. `npm run dev:nanoya`: `/catalogo` sin carrusel de destacados. Home = promos + barra "Todo para tu bebé, sin salir de casa." + Cómo comprar + Contacto. Header: Inicio, Productos, Cómo comprar, Contacto + "Hacer mi pedido". Todos los WhatsApp a `5493400588073`. Probar las anclas desde `/catalogo` y desde `/`.
4. Responsive: verificado con Chrome headless sobre el build minorista a 1440, 768 y 375 px. A 375 y 768 `scrollWidth === clientWidth` (sin scroll horizontal); los únicos elementos que exceden el ancho son los del menú mobile cerrado (off-canvas, ya existía).
5. Network: sin escrituras nuevas (la sección es estática; solo los GET de Sanity que ya existían).
