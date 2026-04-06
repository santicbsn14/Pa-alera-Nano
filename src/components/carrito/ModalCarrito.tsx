// src/components/carrito/ModalCarrito.tsx
import { useEffect, useState } from 'react'
import { useCarrito } from '../../context/CarritoContext'
import './ModalCarrito.css'

const WHATSAPP = '5493412479055'
const WEB_URL = 'https://pa-alera-nano.vercel.app/'
const SERVER_URL = 'https://nano-server-h25x.onrender.com'
const MINIMO_COMPRA = 150000

interface DatosEnvio {
  nombre: string
  ciudad: string
  direccion: string
  fecha: string
  turno: 'mañana' | 'tarde' | ''
  envio: 'viacargo' | 'elsalvador' | 'davidromano' | 'personal' | ''
  aclaracion: string
}

const datosIniciales: DatosEnvio = {
  nombre: '',
  ciudad: '',
  direccion: '',
  fecha: '',
  turno: '',
  envio: '',
  aclaracion: '',
}

const ENVIOS: { value: DatosEnvio['envio']; label: string }[] = [
  { value: 'viacargo', label: 'Via Cargo' },
  { value: 'elsalvador', label: 'Comisiones El Salvador' },
  { value: 'davidromano', label: 'David Romano Comisión' },
  { value: 'personal', label: 'Lo retiro personalmente' },
]

function armarMensaje(
  items: ReturnType<typeof useCarrito>['items'],
  datos: DatosEnvio,
  pedidoId: string
): string {
  const lineas = items.map((i) => {
    const talle = i.producto.talle && i.producto.talle !== 'unico' ? ` ${i.producto.talle}` : ''
    const presentacion = i.producto.presentacion ? ` (${i.producto.presentacion})` : ''
    const codBarra = i.producto.descripcion ? ` | CB: ${i.producto.descripcion}` : ''
    const subtotal = (i.producto.precio * i.cantidad).toLocaleString('es-AR')
    return `• ${i.producto.nombre}${talle}${presentacion} x${i.cantidad} — $${subtotal}${codBarra}`
  })

  const total = items
    .reduce((acc, i) => acc + i.producto.precio * i.cantidad, 0)
    .toLocaleString('es-AR')

  const envioLabel = ENVIOS.find((e) => e.value === datos.envio)?.label ?? datos.envio

  return [
    'Hola! Te hago el siguiente pedido:',
    '',
    ...lineas,
    '',
    `Total estimado: $${total}`,
    '',
    '——————————————',
    `Nombre: ${datos.nombre}`,
    `Ciudad: ${datos.ciudad}`,
    `Dirección: ${datos.direccion}`,
    `Fecha de retiro: ${datos.fecha}`,
    `Turno: ${datos.turno === 'mañana' ? 'Mañana' : 'Tarde'}`,
    `Envío: ${envioLabel}`,
    ...(datos.aclaracion ? [`Aclaración: ${datos.aclaracion}`] : []),
    '',
    `🔗 Ver comprobante: ${WEB_URL}/comprobante?id=${pedidoId}`,
    '',
    'Quedo a la espera, gracias!',
  ].join('\n')
}

export default function ModalCarrito() {
  const { items, abierto, cerrarCarrito, quitar, cambiarCantidad, vaciar } = useCarrito()
  const [paso, setPaso] = useState<'carrito' | 'checkout' | 'listo'>('carrito')
  const [datos, setDatos] = useState<DatosEnvio>(datosIniciales)
  const [errores, setErrores] = useState<Partial<Record<keyof DatosEnvio, string>>>({})
  const [enviando, setEnviando] = useState(false)
  const [urlWhatsapp, setUrlWhatsapp] = useState('')

  const total = items.reduce((acc, i) => acc + i.producto.precio * i.cantidad, 0)
  const minimoAlcanzado = total >= MINIMO_COMPRA
  const faltaParaMinimo = MINIMO_COMPRA - total

  useEffect(() => {
    document.body.style.overflow = abierto ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [abierto])

  useEffect(() => {
    if (!abierto) {
      setPaso('carrito')
      setDatos(datosIniciales)
      setErrores({})
      setEnviando(false)
      setUrlWhatsapp('')
    }
  }, [abierto])

  if (!abierto) return null

  const actualizar = (key: keyof DatosEnvio, value: string) => {
    setDatos((prev) => ({ ...prev, [key]: value }))
    setErrores((prev) => ({ ...prev, [key]: '' }))
  }

  const validar = (): boolean => {
    const nuevosErrores: Partial<Record<keyof DatosEnvio, string>> = {}
    if (!datos.nombre.trim()) nuevosErrores.nombre = 'Ingresá tu nombre'
    if (!datos.ciudad.trim()) nuevosErrores.ciudad = 'Ingresá tu ciudad'
    if (!datos.direccion.trim()) nuevosErrores.direccion = 'Ingresá tu dirección'
    if (!datos.fecha) nuevosErrores.fecha = 'Seleccioná una fecha'
    if (!datos.turno) nuevosErrores.turno = 'Seleccioná un turno'
    if (!datos.envio) nuevosErrores.envio = 'Seleccioná cómo llega tu pedido'
    setErrores(nuevosErrores)
    return Object.keys(nuevosErrores).length === 0
  }

  const procesarPedido = async () => {
    if (!validar()) return
    setEnviando(true)

    try {
      const response = await fetch(`${SERVER_URL}/pedido`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: datos.nombre,
          ciudad: datos.ciudad,
          direccion: datos.direccion,
          turno: datos.turno,
          envio: datos.envio,
          aclaracion: datos.aclaracion,
          items: items.map((i) => ({
            nombre: i.producto.nombre,
            talle: i.producto.talle,
            presentacion: i.producto.presentacion,
            descripcion: i.producto.descripcion,
            precio: i.producto.precio,
            cantidad: i.cantidad,
          })),
          total,
        }),
      })

      const data = await response.json()
      const pedidoId = data.ok ? data.pedidoId : 'sin-id'
      const mensaje = armarMensaje(items, datos, pedidoId)
      setUrlWhatsapp(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(mensaje)}`)
      setPaso('listo')

    } catch (err) {
      console.error('Error guardando pedido:', err)
      const mensaje = armarMensaje(items, datos, 'sin-id')
      setUrlWhatsapp(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(mensaje)}`)
      setPaso('listo')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={cerrarCarrito}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className="modal__header">
          <div className="modal__titulo">
            {paso === 'checkout' && (
              <button className="modal__back" onClick={() => setPaso('carrito')} aria-label="Volver">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 12H5M12 5l-7 7 7 7" />
                </svg>
              </button>
            )}
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 001.99 1.61h9.72a2 2 0 001.99-1.61L23 6H6" />
            </svg>
            <h2>
              {paso === 'carrito' ? 'Tu pedido' : paso === 'checkout' ? 'Datos de envío' : '¡Pedido listo!'}
            </h2>
            {paso === 'carrito' && items.length > 0 && (
              <span className="modal__count">{items.reduce((a, i) => a + i.cantidad, 0)}</span>
            )}
          </div>
          <button className="modal__close" onClick={cerrarCarrito} aria-label="Cerrar">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* ── PASO 1: Carrito ── */}
        {paso === 'carrito' && (
          <>
            {items.length === 0 ? (
              <div className="modal__empty">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
                  <path d="M1 1h4l2.68 13.39a2 2 0 001.99 1.61h9.72a2 2 0 001.99-1.61L23 6H6" />
                </svg>
                <p>Tu pedido está vacío</p>
                <span>Agregá productos desde Pedidos Nano</span>
                <button className="btn-primary modal__empty-btn" onClick={cerrarCarrito}>
                  Ir a Pedidos Nano
                </button>
              </div>
            ) : (
              <>
                <div className="modal__items">
                  {items.map((item) => {
                    const talle = item.producto.talle && item.producto.talle !== 'unico' ? ` · ${item.producto.talle}` : ''
                    return (
                      <div key={item.producto._id} className="modal__item">
                        <div className="modal__item-info">
                          <p className="modal__item-nombre">{item.producto.nombre}{talle}</p>
                          {item.producto.presentacion && (
                            <p className="modal__item-presentacion">{item.producto.presentacion}</p>
                          )}
                          <p className="modal__item-precio">${item.producto.precio.toLocaleString('es-AR')} c/u</p>
                        </div>
                        <div className="modal__item-controles">
                          <div className="modal__cantidad">
                            <button onClick={() => cambiarCantidad(item.producto._id, item.cantidad - 1)} disabled={item.cantidad === 1} aria-label="Restar">−</button>
                            <span>{item.cantidad}</span>
                            <button onClick={() => cambiarCantidad(item.producto._id, item.cantidad + 1)} aria-label="Sumar">+</button>
                          </div>
                          <p className="modal__item-subtotal">${(item.producto.precio * item.cantidad).toLocaleString('es-AR')}</p>
                          <button className="modal__item-quitar" onClick={() => quitar(item.producto._id)} aria-label="Quitar producto">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M18 6 6 18M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>

                <div className="modal__footer">
                  <div className="modal__total">
                    <span>Total estimado</span>
                    <span className="modal__total-valor">${total.toLocaleString('es-AR')}</span>
                  </div>
                  {!minimoAlcanzado && (
                    <div className="modal__minimo">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                      </svg>
                      <span>Te faltan <strong>${faltaParaMinimo.toLocaleString('es-AR')}</strong> para alcanzar el mínimo de compra de <strong>$150.000</strong></span>
                    </div>
                  )}
                  <button className="modal__pedido-btn" onClick={() => setPaso('checkout')} disabled={!minimoAlcanzado}>
                    Continuar con el pedido
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </button>
                  <button className="modal__vaciar" onClick={vaciar}>Vaciar pedido</button>
                </div>
              </>
            )}
          </>
        )}

        {/* ── PASO 2: Checkout ── */}
        {paso === 'checkout' && (
          <>
            <div className="modal__form">
              <div className="modal__field">
                <label className="modal__label">Nombre y apellido *</label>
                <input type="text" className={`modal__input ${errores.nombre ? 'modal__input--error' : ''}`} placeholder="Ej: Juan Pérez" value={datos.nombre} onChange={(e) => actualizar('nombre', e.target.value)} />
                {errores.nombre && <span className="modal__error">{errores.nombre}</span>}
              </div>
              <div className="modal__field">
                <label className="modal__label">Ciudad *</label>
                <input type="text" className={`modal__input ${errores.ciudad ? 'modal__input--error' : ''}`} placeholder="Ej: Rosario, Santa Fe" value={datos.ciudad} onChange={(e) => actualizar('ciudad', e.target.value)} />
                {errores.ciudad && <span className="modal__error">{errores.ciudad}</span>}
              </div>
              <div className="modal__field">
                <label className="modal__label">Dirección *</label>
                <input type="text" className={`modal__input ${errores.direccion ? 'modal__input--error' : ''}`} placeholder="Ej: Mitre 1234" value={datos.direccion} onChange={(e) => actualizar('direccion', e.target.value)} />
                {errores.direccion && <span className="modal__error">{errores.direccion}</span>}
              </div>
              <div className="modal__field">
                <label className="modal__label">Fecha de retiro *</label>
                <input
                  type="date"
                  className={`modal__input ${errores.fecha ? 'modal__input--error' : ''}`}
                  value={datos.fecha}
                  onChange={(e) => actualizar('fecha', e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                />
                {errores.fecha && <span className="modal__error">{errores.fecha}</span>}
              </div>
              <div className="modal__field">
                <label className="modal__label">Turno de retiro *</label>
                <div className="modal__opciones">
                  {(['mañana', 'tarde'] as const).map((t) => (
                    <button key={t} className={`modal__opcion ${datos.turno === t ? 'modal__opcion--active' : ''}`} onClick={() => actualizar('turno', t)}>
                      {t === 'mañana' ? '🌅 Mañana' : '🌆 Tarde'}
                    </button>
                  ))}
                </div>
                {errores.turno && <span className="modal__error">{errores.turno}</span>}
              </div>
              <div className="modal__field">
                <label className="modal__label">¿Cómo llega el pedido? *</label>
                <div className="modal__opciones modal__opciones--col">
                  {ENVIOS.map((e) => (
                    <button key={e.value} className={`modal__opcion ${datos.envio === e.value ? 'modal__opcion--active' : ''}`} onClick={() => actualizar('envio', e.value ?? '')}>
                      {e.label}
                    </button>
                  ))}
                </div>
                {errores.envio && <span className="modal__error">{errores.envio}</span>}
              </div>
              <div className="modal__field">
                <label className="modal__label">Aclaración <span className="modal__opcional">(opcional)</span></label>
                <textarea className="modal__textarea" placeholder="Ej: Dejar en portería, llamar antes de entregar..." value={datos.aclaracion} onChange={(e) => actualizar('aclaracion', e.target.value)} rows={3} />
              </div>
            </div>

            <div className="modal__footer">
              <div className="modal__total">
                <span>Total estimado</span>
                <span className="modal__total-valor">${total.toLocaleString('es-AR')}</span>
              </div>
              <button className="modal__pedido-btn" onClick={procesarPedido} disabled={enviando}>
                {enviando ? 'Procesando...' : 'Confirmar pedido'}
              </button>
            </div>
          </>
        )}

        {/* ── PASO 3: Listo ── */}
        {paso === 'listo' && (
          <div className="modal__listo">
            <div className="modal__listo-icono">✅</div>
            <h3>¡Tu pedido está listo!</h3>
            <p>Apretá el botón para enviarlo por WhatsApp.</p>
            <a
              href={urlWhatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="modal__wsp-btn"
              onClick={() => { vaciar(); cerrarCarrito() }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                <path d="M12 0C5.373 0 0 5.373 0 12c0 2.124.556 4.118 1.528 5.845L.057 23.535a.75.75 0 00.916.919l5.764-1.463A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.9 0-3.68-.513-5.208-1.408l-.372-.22-3.862.981.999-3.778-.242-.389A9.956 9.956 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
              </svg>
              Enviar pedido por WhatsApp
            </a>
          </div>
        )}

      </div>
    </div>
  )
}