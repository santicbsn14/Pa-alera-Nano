# Pañalera Nano Mayorista — nano-web (React/Vite)

## ⚠️ Reglas de trabajo — NO NEGOCIABLES

Sitio en producción con pedidos reales entrando todos los días. Seguí
esto siempre, en cualquier tarea:

- NUNCA toques `main` directo. Creá una rama nueva desde `develop`
  antes de tocar cualquier archivo.
- NUNCA hagas commit/push a `main` sin confirmación explícita humana,
  paso a paso.
- Los archivos `.tsx`/`.ts` se devuelven SIEMPRE completos, listos
  para pegar — nunca diffs ni snippets parciales. Un snippet parcial
  ya causó un bug real de carrito (un badge de descuento que se
  perdió al aplicar un cambio incompleto en `ModalCarrito.tsx`).
- No toques `.env` sin avisar antes de sacar cualquier variable del
  tracking de git — Hostinger depende de que esas variables estén
  configuradas en su panel, no solo en el repo.
- No asumas el contenido de un archivo — pedilo o leelo del repo real
  antes de generar un reemplazo.
- Alcance quirúrgico: tocá solo lo que pide el brief de la tarea. No
  refactorices ni reordenes imports sin que se te pida.
- No mergees ni deployes en horario de alto tráfico del cliente
  (jueves ~17hs Argentina).
- Si tenés dudas sobre si algo puede afectar producción, PARÁ Y
  PREGUNTÁ.

## Sobre este repo

- React + TypeScript + Vite, deploy en Hostinger vía auto-deploy
  desde GitHub (rama `main`)
- Sanity como CMS/DB — `VITE_SANITY_PROJECT_ID` / `VITE_SANITY_DATASET`
  en `.env`
- CSS custom, sin UI libraries

## Patrones establecidos (para no re-inventarlos)

- `ItemCarrito.producto` guarda el objeto `Producto` COMPLETO tal
  como llegó de Sanity al momento de `agregar()` — es la forma en
  que hoy se "congela" el precio con descuento
  (`precioFinal()`/`tieneDescuento()` en `lib/precio.ts`), y por
  extensión, cualquier campo que el producto tenga en ese momento
  queda snapshoteado automáticamente dentro del carrito.
- ⚠️ IMPORTANTE — invariante frágil: `getProductos()` (catálogo
  general) NO trae `productosInternos` por performance. Solo
  `getBolsonPorSlug()` (detalle de Pack) lo trae. El único lugar del
  código que llama `agregar()` para un Pack es `BolsonDetalle.tsx`,
  que usa el producto de `getBolsonPorSlug()` — por eso el snapshot
  de `productosInternos` funciona sin código adicional. Si se agrega
  en el futuro un botón "agregar rápido" para bolsones desde
  `CardProducto.tsx` (usando el producto de `getProductos()`), ROMPE
  este snapshot silenciosamente (queda `undefined`, sin error). Si
  se toca esto, hay que traer `productosInternos` en `getProductos()`
  también, o bloquear el agregado rápido para bolsones.
- Combos generan `_key` por elemento de `tallesCombo` con
  `Math.random().toString(36).substring(2, 9)` — mismo patrón que va
  a usar `productosInternos` cuando se arme en el POST `/pedido`
  (capa 3).
- El carrito persiste en `localStorage` bajo la key `nano_carrito`.

## Qué NO hacer

- No re-decidir el shape de un campo si ya viene definido en el brief.
- No refactorizar `CardProducto.tsx` / `CarritoContext.tsx` sin que
  se pida explícitamente — son archivos sensibles con historial de
  bugs reales.