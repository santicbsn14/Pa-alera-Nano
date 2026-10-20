# Avance — Fix pedidos no registrados · FASE B (nano-web)

## Qué se hizo
- **idPedido del lado del cliente:** `idPedidoRef` (`useRef<string | null>`). Se genera la primera vez que se toca "Confirmar pedido" (`crypto.randomUUID()`, con fallback `Date.now().toString(36)-Math.random().toString(36).slice(2)` para contextos no seguros) y se reusa en todos los reintentos, automáticos y manuales. Se limpia al cerrar el modal (en el `useEffect` de reset) y después de un envío exitoso.
- **Envío con timeout y reintentos:**
  - `intentarEnvio()` usa un `AbortController` con 15s por intento. Es éxito solo si se cumplen `response.ok && data.ok && data.pedidoId`.
  - `enviarPedido()` hace hasta 3 intentos, con esperas de 1s y 3s entre ellos.
  - Se reintenta ante timeout/abort, error de red, 5xx o respuesta que no es JSON. **Ante un 4xx no se reintenta:** se pasa directo a 'error'.
- El botón muestra "Procesando..." en el primer intento y "Reintentando (2/3)..." y "(3/3)..." después. Queda deshabilitado mientras `enviando`.
- `idPedido` se agregó al body del POST. El resto del payload no cambió.
- **Éxito:** igual que antes, pasa a 'listo' con el link al comprobante.
- **Paso nuevo 'error'** (el header dice "Algo salió mal"):
  - Muestra ⚠️, "No pudimos registrar tu pedido" y el texto de conexión.
  - **"Reintentar"** reusa el mismo `idPedido`.
  - **"Enviar igual por WhatsApp"** usa el estilo outline, manda el mensaje marcado como no registrado y hace `vaciar(); cerrarCarrito()`.
  - El carrito NO se vacía al entrar a 'error'.
- `armarMensaje(items, datos, pedidoId: string | null)`: con `null` reemplaza la línea del comprobante por `⚠️ PEDIDO NO REGISTRADO EN EL SISTEMA — cargar manualmente`. Se eliminó todo uso de `'sin-id'`.
- Se sigue usando `VITE_SERVER_URL` como hasta ahora.

## Archivos creados / modificados
- `src/components/carrito/ModalCarrito.tsx`
- `src/components/carrito/ModalCarrito.css`: solo bloques nuevos (`.modal__error-paso`, `.modal__error-icono`, `.modal__reintentar-btn`, `.modal__wsp-btn--secundario`).
- `CLAUDE.md`: patrón de envío con `idPedido` y reintentos, y la regla de nunca pasar a 'listo' sin `pedidoId`.
- `docs/avances/fix-pedidos-no-registrados-B-front.md`: este archivo.

## Decisiones tomadas durante la implementación
- **Respuestas de intentos viejos (aprobado):** si el modal se cierra mientras se envía, el ref cambia. El loop deja de reintentar y la respuesta que llegue se descarta. Así nunca queda 'listo' seteado con el modal cerrado.
- **"Enviar igual por WhatsApp" se deshabilita mientras "Reintentar" está en curso** (`aria-disabled` y `preventDefault`). Si no, un reintento que sí se registra más un WhatsApp "NO REGISTRADO" harían que Lean lo cargue a mano dos veces.
- **4xx sin reintento** (ajuste pedido en la revisión del plan): un 400 del server no cambia con otro intento.
- **Estilos:**
  - "Reintentar" usa `--color-celeste`, para no confundirse con el verde de WhatsApp.
  - El secundario es outline con `--color-border-light` y `--color-text-secondary`.
  - Los dos tienen `min-height: 44px`.
  - No se crearon variables nuevas.
- El mensaje de WhatsApp "no registrado" se arma al entrar a 'error' y se guarda en el mismo estado `urlWhatsapp`.

## Desvíos respecto al brief
- **Timeout simulado desde Playwright y no con un delay en nano-server** (aprobado). El primer request llega de verdad al server y se guarda en staging; Playwright retiene la respuesta 16s, el front aborta a los 15s y reintenta. nano-server no se tocó.

## Pendientes / problemas encontrados
- **Lint:** con este cambio, `eslint` marca `react-hooks/set-state-in-effect` en el `useEffect` de reset al cerrar el modal (`setPaso('carrito')`, código que ya existía). En `develop` ese archivo no daba error, probablemente porque el compilador de React se salteaba el componente por el `try/finally` anterior y ahora lo analiza. No se refactorizó porque queda fuera del alcance. `npm run build` no corre el lint y pasa sin errores. El repo ya tenía otros 5 errores de lint en otros archivos.
- **Pedido huérfano:** si el cliente cierra el modal justo cuando el server ya guardó el pedido pero antes de que llegue la respuesta, el pedido queda en Sanity sin WhatsApp. Pasaba igual antes del fix; ahora al menos queda logueado en el server con `[pedido] guardado`.
- **Sin merge:** la rama queda pusheada para revisión. Al mergear, recordar que `main` auto-deploya en Hostinger y que no se deploya los jueves ~17hs.

## Cómo probarlo
1. Levantar nano-server local contra staging: `SANITY_DATASET=staging node index.js` (puerto 3001).
2. Levantar el front apuntando a ese server: `VITE_SERVER_URL=http://localhost:3001 npx vite`. Nunca contra el server de producción.
3. Viewport mobile. Cargar un carrito de al menos $150.000 y completar el checkout.
4. Casos:
   - Server andando: pasa a 'listo', el link apunta a `comprobante?id=pedido-<uuid>` y el pedido aparece en staging.
   - Server apagado: Procesando → Reintentando (2/3) → (3/3) → paso 'error' con el carrito intacto.
   - Prender el server y tocar "Reintentar": se guarda con el mismo `idPedido` y pasa a 'listo'.
   - Server que responde 400: un solo intento y paso 'error'.
   - "Enviar igual por WhatsApp": el mensaje tiene la línea NO REGISTRADO y no tiene link; el carrito se vacía y el modal se cierra.
   - Cerrar y reabrir el modal: el siguiente intento manda un `idPedido` nuevo.
5. Borrar de staging los pedidos de prueba.

**Verificación hecha** (20/10/2026, Playwright 390×844, server local con staging; bloqueados `onrender.com` y `wa.me`):
- Regresiones: badge -10%, confirmación de vaciar y cancelar.
- Listo con link y comprobante en staging; payload igual al anterior más `idPedido`.
- Server apagado: 3 intentos con el mismo id, los 3 textos del botón, paso 'error', header y carrito intacto.
- Reintentar después de prender el server: mismo id y un solo doc en staging.
- Timeout: 2 intentos con el mismo id, un solo doc y log `ya existía (reintento)`.
- 400: un solo intento.
- WhatsApp no registrado: línea correcta, carrito vacío y modal cerrado.
- Reabrir: id nuevo.
- Cerrar a mitad del envío: no sigue reintentando y al reabrir arranca en el carrito.
- 0 requests a producción.
- Staging limpio al final.
- Venta por caja vive en `CardProducto.tsx`, que no está en el diff, así que no se ve afectada.
