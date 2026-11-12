# NanoYA 03 — Maqueta: checkout minorista sin escrituras + comprobante de ejemplo

Rama: `feature/nanoya`. Sin merge a `develop` ni `main`.

## Qué se hizo

- `config/canal.ts`: `SIMULAR_PEDIDO = ES_MINORISTA` (no depende de `MODO_MAQUETA`, con el comentario pedido), `webUrl` (mayorista `https://panaleranano.com`, minorista `''`) y `marcaComprobante` por canal.
- `ModalCarrito.tsx`:
  - `WHATSAPP`, `WEB_URL` y `MINIMO_COMPRA` salen de `config`. El aviso de mínimo usa `MINIMO_COMPRA.toLocaleString('es-AR')` (en mayorista renderiza `$150.000`, verificado). Con mínimo 0, `total >= 0` siempre es true: no aparece el aviso y "Continuar" queda habilitado sin tocar la cuenta.
  - Carrito vacío en minorista: "Agregá productos desde el catálogo" / "Ver productos".
  - Checkout minorista: bloque JSX propio (`paso === 'checkout' && ES_MINORISTA`). Nombre, Teléfono, Ciudad como `<select>` con `config.zonasEnvio` (opción vacía "Elegí tu ciudad"), Dirección ("Ej: Mitre 1234, depto 2B"), recuadro "🛵 Envío por Uber…" con `config.horarios` debajo, Aclaración ("Ej: timbre, entre calles, horario en que estás"). Sin fecha ni selector de transporte. El bloque mayorista queda textual igual, solo con `&& !ES_MINORISTA` en la condición.
  - `validar()` minorista: nombre, teléfono, ciudad (tiene que ser una de `zonasEnvio`) y dirección. `envio` arranca en `'uber'` (`datosIniciales`) y `fecha` vacía; `'uber'` agregado al tipo.
  - `armarMensaje()` minorista: early return con `Hola! Te hago el siguiente pedido en NanoYA:`, sin fecha/turno, `Envío: Uber (costo a coordinar)` y la línea `🧪 PEDIDO DE PRUEBA (maqueta) — no despachar` si `SIMULAR_PEDIDO`. El `return` mayorista no cambió.
  - `procesarPedido()`: si `SIMULAR_PEDIDO` llama a `simularPedido()` y sale. Esa función no llama a `enviarPedido` ni hace `fetch`: arma el pedido de ejemplo con la forma de `GET /pedido/:id` (`_id: 'demo'`, `numeroPedido` de 8 caracteres en mayúscula, `fecha` = ahora, datos del form, `fecha_retiro`/`turno` vacíos, `envio: 'uber'`, items con nombre/talle/presentacion/descripcion/precio/cantidad, `total`), lo guarda en `sessionStorage['nanoya_pedido_demo']` (try/catch), espera 600 ms con "Procesando..." y pasa a `'listo'`.
  - Paso `'listo'` con `SIMULAR_PEDIDO`: link secundario "Ver comprobante de ejemplo" → `/comprobante?id=demo` en otra pestaña.
- `CarritoFlotante.tsx`: `MINIMO = config.minimoCompra`. Con 0: sin barra ni estado de mínimo; muestra "Envío por Uber · se coordina por WhatsApp" con `carrito-flotante__estado`.
- `Comprobante.tsx`: con `SIMULAR_PEDIDO` e `id=demo` lee `sessionStorage` en vez de hacer `fetch` (si no está: "No se pudo cargar el comprobante."). Franja "Comprobante de ejemplo — este pedido no se registró" arriba del documento (oculta en `@media print` y no incluida en la ventana de `imprimir()`). Marca del encabezado en pantalla e impresión desde `config.marcaComprobante`. `ENVIOS.uber = 'Uber (se abona aparte)'`.

## Archivos modificados

- `src/config/canal.ts`
- `src/components/carrito/ModalCarrito.tsx`, `ModalCarrito.css` (`.modal__select`, `.modal__envio-uber*`)
- `src/components/carrito/CarritoFlotante.tsx`
- `src/pages/Comprobante.tsx`, `Comprobante.css` (`.comprobante--demo`, `.comprobante__franja-demo`)
- `docs/avances/nanoya-03-maqueta-checkout.md` (nuevo)

## Decisiones tomadas

- **`rel="opener"` en "Ver comprobante de ejemplo"**: un `<a target="_blank">` hoy implica `noopener`, y sin opener Chrome no copia el `sessionStorage` a la pestaña nueva, así que el comprobante demo diría "No se pudo cargar". Con `rel="opener"` (mismo origen, sin riesgo) se copia. Verificado en Chrome: la pestaña nueva muestra el pedido; una pestaña abierta a mano con la misma URL muestra el error.
- **Cierre del modal durante la simulación**: ref aparte (`simulacionRef`) para descartar el resultado si se cierra el modal en esos 600 ms, igual que hace el flujo real con `idPedidoRef`. No se tocó `idPedidoRef` ni nada del envío real; solo se sumó `simulacionRef.current = null` al reset del cierre.
- **Línea del comprobante en minorista sin `SIMULAR_PEDIDO`**: hoy no puede pasar, pero quedó igual que la mayorista (`🔗 Ver comprobante: ${WEB_URL}/…` o `⚠️ PEDIDO NO REGISTRADO…`). Con `webUrl: ''` el link saldría relativo: hay que definir el subdominio antes del brief 06.
- **Horario en el recuadro de Uber**: `config.horarios` ya dice "Lun a Sab · …", así que va en una línea aparte debajo del texto, para no repetir "lunes a sábados" dentro de la misma frase.
- **Validación de ciudad**: se exige que el valor esté en `zonasEnvio` (no solo que no esté vacío). Mensaje: "Elegí tu ciudad".
- **Ítems del pedido demo** sin `tallesCombo`/`productosInternos`: el brief lista los campos y en NanoYA no hay combos.
- **Franja demo**: `.comprobante` pasa a columna solo con el modificador `--demo`, así el layout mayorista no cambia.

## Desvíos respecto al brief

- **`document.title` del comprobante en mayorista**: el brief pide `Comprobante #X — ${marcaComprobante.titulo}` y a la vez "en mayorista: mismos textos de hoy". Hoy el título es `… — Pañalera Nano`, pero `marcaComprobante.titulo` mayorista es `Pañalera Nano Mayorista`. Quedó `ES_MINORISTA ? MARCA.titulo : 'Pañalera Nano'`, así la mayorista no cambia. Si se prefiere `… — Pañalera Nano Mayorista`, es sacar el ternario.

## Pendientes

- `config.webUrl` minorista vacío hasta definir el subdominio (necesario para el brief 06).
- `npx eslint` marca 2 errores `react-hooks/set-state-in-effect` en `ModalCarrito.tsx` (reset al cerrar) y `Comprobante.tsx` (`setError` sin id). Los dos ya estaban antes de este brief (verificado con `git stash`); no se tocaron.
- El carrito flotante también aparece en `/comprobante` (ya pasaba en mayorista).

## Cómo probarlo

1. `npm run build` y `npx vite build --mode nanoya`: sin errores (verificado).
2. `npm run dev:nanoya` con Network abierta (el puerto tiene que ser 5173: Sanity rechaza otros orígenes por CORS):
   - Agregar un producto barato: flotante con el total y "Envío por Uber · se coordina por WhatsApp", sin barra.
   - Modal: sin aviso de mínimo, "Continuar" habilitado. Form con select de 3 ciudades y recuadro de Uber, sin fecha ni transportes. Confirmar vacío marca errores (sin pedir fecha ni envío).
   - Completar y confirmar: "Procesando..." → "¡Tu pedido está listo!". El botón de WhatsApp va a `wa.me/5493400588073` con el mensaje minorista y la línea 🧪.
   - "Ver comprobante de ejemplo": pestaña nueva con la franja demo, marca "NanoYA — Pañalera Nano / Envíos por Uber", envío "Uber (se abona aparte)", título `Comprobante #XXXXXXXX — NanoYA — Pañalera Nano`. Imprimir: sin franja.
   - Network: solo GETs a `*.apicdn.sanity.io` y `cdn.sanity.io`. Cero requests a `VITE_SERVER_URL`, cero no-GET.
3. `npm run dev` (mayorista), **sin confirmar el pedido**: flotante con barra y "Faltan $X para el mínimo", aviso "…mínimo de compra de $150.000", "Continuar" deshabilitado hasta el mínimo, form con fecha, ciudad de texto y los 4 transportes. Ningún request no-GET.

Verificado con Chrome headless (puppeteer-core desde una carpeta temporal, fuera del repo): todo lo de los puntos 2 y 3, con el registro de requests de las dos pestañas.
