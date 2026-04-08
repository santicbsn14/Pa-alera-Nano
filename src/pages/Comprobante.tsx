// src/pages/Comprobante.tsx
import { useEffect, useState } from 'react'
import './Comprobante.css'

interface ItemPedido {
  nombre: string
  talle?: string
  presentacion?: string
  descripcion?: string
  precio: number
  cantidad: number
}

interface DatosPedido {
  _id: string
  numeroPedido: string
  fecha: string
  nombre: string
  ciudad: string
  direccion: string
  fecha_retiro:string
  turno: string
  envio: string
  aclaracion: string
  items: ItemPedido[]
  total: number
}

const ENVIOS: Record<string, string> = {
  viacargo: 'Via Cargo',
  elsalvador: 'Comisiones El Salvador',
  davidromano: 'David Romano Comisión',
  personal: 'Lo retiro personalmente',
}

const SERVER_URL = 'https://nano-server-h25x.onrender.com'

export default function Comprobante() {
  const [pedido, setPedido] = useState<DatosPedido | null>(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const id = params.get('id')

    if (!id) {
      setError(true)
      setCargando(false)
      return
    }

    fetch(`${SERVER_URL}/pedido/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) setError(true)
        else setPedido(data)
      })
      .catch(() => setError(true))
      .finally(() => setCargando(false))
  }, [])

  useEffect(() => {
    if (pedido) {
      document.title = `Comprobante #${pedido.numeroPedido} — Pañalera Nano`
    }
  }, [pedido])

  if (cargando) {
    return (
      <div className="comprobante-vacio">
        <p>Cargando comprobante...</p>
      </div>
    )
  }

  if (error || !pedido) {
    return (
      <div className="comprobante-vacio">
        <p>No se pudo cargar el comprobante.</p>
      </div>
    )
  }

  const fecha = new Date(pedido.fecha).toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <div className="comprobante">
      <div className="comprobante__doc">

        {/* Header */}
        <div className="comprobante__header">
          <div className="comprobante__marca">
            <strong>Pañalera Nano Mayorista</strong>
            <span>panaleranano.com</span>
          </div>
          <div className="comprobante__meta">
            <span>{fecha}</span>
            <span>Pedido #{pedido.numeroPedido}</span>
          </div>
        </div>

        <hr />

        {/* Datos del cliente */}
        <div className="comprobante__seccion">
          <h3>Datos del pedido</h3>
          <div className="comprobante__fila">
            <span className="comprobante__label">Nombre y apellido</span>
            <span>{pedido.nombre}</span>
          </div>
          <div className="comprobante__fila">
            <span className="comprobante__label">Ciudad</span>
            <span>{pedido.ciudad}</span>
          </div>
          <div className="comprobante__fila">
            <span className="comprobante__label">Dirección</span>
            <span>{pedido.direccion}</span>
          </div>
          {pedido.fecha_retiro && (
  <div className="comprobante__fila">
    <span className="comprobante__label">Fecha de retiro</span>
    <span>{pedido.fecha_retiro}</span>
  </div>
)}
          <div className="comprobante__fila">
            <span className="comprobante__label">Turno de retiro</span>
            <span>{pedido.turno === 'mañana' ? 'Mañana' : 'Tarde'}</span>
          </div>
          <div className="comprobante__fila">
            <span className="comprobante__label">Envío</span>
            <span>{ENVIOS[pedido.envio] ?? pedido.envio}</span>
          </div>
          {pedido.aclaracion && (
            <div className="comprobante__fila">
              <span className="comprobante__label">Aclaración</span>
              <span>{pedido.aclaracion}</span>
            </div>
          )}
        </div>

        <hr />

        {/* Productos */}
        <div className="comprobante__seccion">
          <h3>Productos</h3>
          {pedido.items.map((item, i) => (
            <div key={i} className="comprobante__item">
              <div className="comprobante__item-info">
                <strong>{item.cantidad} x {item.nombre}</strong>
                {item.descripcion && <span className="comprobante__codbar">{item.descripcion}</span>}
                {(item.talle || item.presentacion) && (
                  <span className="comprobante__detalle">
                    {[item.talle !== 'unico' ? item.talle : null, item.presentacion].filter(Boolean).join(' · ')}
                  </span>
                )}
              </div>
              <div className="comprobante__item-precio">
                <span>Subtotal: ${(item.precio * item.cantidad).toLocaleString('es-AR')}</span>
              </div>
            </div>
          ))}
        </div>

        <hr />

        {/* Total */}
        <div className="comprobante__total">
          <span>Cant. artículos: {pedido.items.reduce((a, i) => a + i.cantidad, 0)}</span>
          <strong>Total pedido: ${pedido.total.toLocaleString('es-AR')}</strong>
        </div>

        {/* Botón imprimir */}
        <div className="comprobante__print-btn">
          <button onClick={() => window.print()}>🖨️ Imprimir / Guardar PDF</button>
        </div>

      </div>
    </div>
  )
}