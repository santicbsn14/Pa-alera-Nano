// src/components/carrito/ModalCarrito.tsx
import { useEffect } from 'react'
import { useCarrito } from '../../context/CarritoContext'
import './ModalCarrito.css'

const WHATSAPP = 'NUMERO'

function armarMensaje(items: ReturnType<typeof useCarrito>['items']): string {
  const lineas = items.map((i) => {
    const talle = i.producto.talle && i.producto.talle !== 'unico' ? ` ${i.producto.talle}` : ''
    const subtotal = (i.producto.precio * i.cantidad).toLocaleString('es-AR')
    return `• ${i.producto.nombre}${talle} x${i.cantidad} — $${subtotal}`
  })

  const total = items
    .reduce((acc, i) => acc + i.producto.precio * i.cantidad, 0)
    .toLocaleString('es-AR')

  return [
    'Hola! Te hago el siguiente pedido:',
    '',
    ...lineas,
    '',
    `Total estimado: $${total}`,
    '',
    'Quedo a la espera, gracias!',
  ].join('\n')
}

export default function ModalCarrito() {
  const { items, abierto, cerrarCarrito, quitar, cambiarCantidad, vaciar } = useCarrito()

  const total = items.reduce((acc, i) => acc + i.producto.precio * i.cantidad, 0)

  // Bloquear scroll cuando está abierto
  useEffect(() => {
    document.body.style.overflow = abierto ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [abierto])

  if (!abierto) return null

  const realizarPedido = () => {
    const mensaje = armarMensaje(items)
    const url = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(mensaje)}`
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="modal-overlay" onClick={cerrarCarrito}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className="modal__header">
          <div className="modal__titulo">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 001.99 1.61h9.72a2 2 0 001.99-1.61L23 6H6" />
            </svg>
            <h2>Tu pedido</h2>
            {items.length > 0 && (
              <span className="modal__count">{items.reduce((a, i) => a + i.cantidad, 0)}</span>
            )}
          </div>
          <button className="modal__close" onClick={cerrarCarrito} aria-label="Cerrar">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Contenido */}
        {items.length === 0 ? (
          <div className="modal__empty">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 001.99 1.61h9.72a2 2 0 001.99-1.61L23 6H6" />
            </svg>
            <p>Tu pedido está vacío</p>
            <span>Agregá productos desde el catálogo</span>
            <button className="btn-primary modal__empty-btn" onClick={cerrarCarrito}>
              Ver catálogo
            </button>
          </div>
        ) : (
          <>
            <div className="modal__items">
              {items.map((item) => {
                const talle = item.producto.talle && item.producto.talle !== 'unico'
                  ? ` · ${item.producto.talle}`
                  : ''
                return (
                  <div key={item.producto._id} className="modal__item">
                    <div className="modal__item-info">
                      <p className="modal__item-nombre">
                        {item.producto.nombre}{talle}
                      </p>
                      <p className="modal__item-precio">
                        ${item.producto.precio.toLocaleString('es-AR')} c/u
                      </p>
                    </div>

                    <div className="modal__item-controles">
                      <div className="modal__cantidad">
                        <button
                          onClick={() => cambiarCantidad(item.producto._id, item.cantidad - 1)}
                          disabled={item.cantidad === 1}
                          aria-label="Restar"
                        >
                          −
                        </button>
                        <span>{item.cantidad}</span>
                        <button
                          onClick={() => cambiarCantidad(item.producto._id, item.cantidad + 1)}
                          aria-label="Sumar"
                        >
                          +
                        </button>
                      </div>

                      <p className="modal__item-subtotal">
                        ${(item.producto.precio * item.cantidad).toLocaleString('es-AR')}
                      </p>

                      <button
                        className="modal__item-quitar"
                        onClick={() => quitar(item.producto._id)}
                        aria-label="Quitar producto"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M18 6 6 18M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Footer */}
            <div className="modal__footer">
              <div className="modal__total">
                <span>Total estimado</span>
                <span className="modal__total-valor">${total.toLocaleString('es-AR')}</span>
              </div>

              <button className="modal__pedido-btn" onClick={realizarPedido}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                  <path d="M12 0C5.373 0 0 5.373 0 12c0 2.124.556 4.118 1.528 5.845L.057 23.535a.75.75 0 00.916.919l5.764-1.463A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.9 0-3.68-.513-5.208-1.408l-.372-.22-3.862.981.999-3.778-.242-.389A9.956 9.956 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
                </svg>
                Realizar pedido por WhatsApp
              </button>

              <button className="modal__vaciar" onClick={vaciar}>
                Vaciar pedido
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}