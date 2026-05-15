// src/pages/Comprobante.tsx
import { useEffect, useState } from 'react'
import './Comprobante.css'

interface ItemPedido {
  nombre: string
  talle?: string
  tallesCombo?: { producto: string; talle: string }[]
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
  telefono?: string
  ciudad: string
  direccion: string
  fecha_retiro: string
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

function agruparItems(items: ItemPedido[]): ItemPedido[] {
  const mapa = new Map<string, ItemPedido>()
  for (const item of items) {
    const tallesKey = item.tallesCombo && item.tallesCombo.length > 0
      ? item.tallesCombo.map((t) => `${t.producto}:${t.talle}`).join('|')
      : ''
    const key = `${item.nombre}__${item.talle ?? ''}__${tallesKey}`
    if (mapa.has(key)) {
      const existing = mapa.get(key)!
      mapa.set(key, { ...existing, cantidad: existing.cantidad + item.cantidad })
    } else {
      mapa.set(key, { ...item })
    }
  }
  return Array.from(mapa.values())
}

export default function Comprobante() {
  const [pedido, setPedido] = useState<DatosPedido | null>(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const id = params.get('id')
    if (!id) { setError(true); setCargando(false); return }
    fetch(`${SERVER_URL}/pedido/${id}`)
      .then((res) => res.json())
      .then((data) => { if (data.error) setError(true); else setPedido(data) })
      .catch(() => setError(true))
      .finally(() => setCargando(false))
  }, [])

  useEffect(() => {
    if (pedido) document.title = `Comprobante #${pedido.numeroPedido} — Pañalera Nano`
  }, [pedido])

  if (cargando) return <div className="comprobante-vacio"><p>Cargando comprobante...</p></div>
  if (error || !pedido) return <div className="comprobante-vacio"><p>No se pudo cargar el comprobante.</p></div>

  const fecha = new Date(pedido.fecha).toLocaleDateString('es-AR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })

  const itemsAgrupados = agruparItems(pedido.items)

  const imprimir = () => {
    const ventana = window.open('', '_blank', 'width=800,height=600')
    if (!ventana) return

    const itemsHtml = itemsAgrupados.map((item) => `
      <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px dashed #eee;gap:16px;">
        <div>
          <strong>${item.cantidad} x ${item.nombre}</strong>
          <div style="font-size:12px;color:#666">P/U: $${item.precio.toLocaleString('es-AR')}</div>
          ${item.talle && item.talle !== 'unico' ? `<div style="font-size:12px;color:#666">${item.talle}</div>` : ''}
          ${item.tallesCombo && item.tallesCombo.length > 0
            ? `<div style="font-size:12px;color:#666">${item.tallesCombo.map((t) => `${t.producto}: ${t.talle}`).join(' / ')}</div>`
            : ''}
          ${item.presentacion ? `<div style="font-size:12px;color:#666">${item.presentacion}</div>` : ''}
          ${item.descripcion ? `<div style="font-size:11px;color:#999">CB: ${item.descripcion}</div>` : ''}
        </div>
        <span style="font-weight:700;white-space:nowrap;">$${(item.precio * item.cantidad).toLocaleString('es-AR')}</span>
      </div>
    `).join('')

    ventana.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Pedido #${pedido.numeroPedido}</title>
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { font-family: Arial, sans-serif; font-size: 13px; color: #222; padding: 40px; }
          .header { display: flex; justify-content: space-between; margin-bottom: 16px; }
          .marca strong { font-size: 15px; } .marca span { font-size: 12px; color: #666; display: block; }
          .meta { text-align: right; font-size: 12px; color: #666; }
          hr { border: none; border-top: 1px solid #ddd; margin: 16px 0; }
          h3 { font-size: 13px; font-weight: 700; text-transform: uppercase; color: #444; margin-bottom: 12px; }
          .fila { display: flex; flex-direction: column; margin-bottom: 8px; }
          .fila strong { font-weight: 700; font-size: 12px; }
          .total { display: flex; justify-content: space-between; font-size: 14px; padding: 4px 0; }
          .total strong { font-size: 16px; }
          .celeste { color: #4DC8E8; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="marca">
            <strong>Pañalera Nano Mayorista</strong>
            <span>panaleranano.com</span>
          </div>
          <div class="meta">
            <div>${fecha}</div>
            <div>Pedido #${pedido.numeroPedido}</div>
          </div>
        </div>
        <hr>
        <h3>Datos del cliente</h3>
        <div class="fila"><strong>Nombre</strong><span>${pedido.nombre}</span></div>
        ${pedido.telefono ? `<div class="fila"><strong>Teléfono</strong><span>${pedido.telefono}</span></div>` : ''}
        <div class="fila"><strong>Ciudad</strong><span>${pedido.ciudad}</span></div>
        <div class="fila"><strong>Dirección</strong><span>${pedido.direccion}</span></div>
        ${pedido.fecha_retiro ? `<div class="fila"><strong>Fecha retiro</strong><span>${pedido.fecha_retiro}</span></div>` : ''}
        <div class="fila"><strong>Envío</strong><span>${ENVIOS[pedido.envio] ?? pedido.envio}</span></div>
        ${pedido.aclaracion ? `<div class="fila"><strong>Aclaración</strong><span>${pedido.aclaracion}</span></div>` : ''}
        <hr>
        <h3>Productos</h3>
        ${itemsHtml}
        <hr>
        <div class="total">
          <span>Total del pedido</span>
          <strong class="celeste">$${pedido.total.toLocaleString('es-AR')}</strong>
        </div>
        <script>window.onload = () => { window.print(); }</script>
      </body>
      </html>
    `)
    ventana.document.close()
  }

  return (
    <div className="comprobante">
      <div className="comprobante__doc">

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

        <div className="comprobante__seccion">
          <h3>Datos del pedido</h3>
          <div className="comprobante__fila">
            <span className="comprobante__label">Nombre y apellido</span>
            <span>{pedido.nombre}</span>
          </div>
          {pedido.telefono && (
            <div className="comprobante__fila">
              <span className="comprobante__label">Teléfono</span>
              <span>{pedido.telefono}</span>
            </div>
          )}
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

        <div className="comprobante__seccion">
          <h3>Productos</h3>
          {itemsAgrupados.map((item, i) => (
            <div key={i} className="comprobante__item">
              <div className="comprobante__item-info">
                <strong>{item.cantidad} x {item.nombre}</strong>
                {item.descripcion && <span className="comprobante__codbar">{item.descripcion}</span>}
                {(item.talle || item.presentacion) && (
                  <span className="comprobante__detalle">
                    {[item.talle !== 'unico' ? item.talle : null, item.presentacion].filter(Boolean).join(' · ')}
                  </span>
                )}
                {item.tallesCombo && item.tallesCombo.length > 0 && (
                  <span className="comprobante__detalle">
                    {item.tallesCombo.map((t) => `${t.producto}: ${t.talle}`).join(' / ')}
                  </span>
                )}
              </div>
              <div className="comprobante__item-precio">
                <span>P/U: ${item.precio.toLocaleString('es-AR')}</span>
                <span>Subtotal: ${(item.precio * item.cantidad).toLocaleString('es-AR')}</span>
              </div>
            </div>
          ))}
        </div>

        <hr />

        <div className="comprobante__total">
          <span>Cant. artículos: {itemsAgrupados.reduce((a, i) => a + i.cantidad, 0)}</span>
          <strong>Total pedido: ${pedido.total.toLocaleString('es-AR')}</strong>
        </div>

        <div className="comprobante__print-btn">
          <button onClick={imprimir}>🖨️ Imprimir / Guardar PDF</button>
        </div>

      </div>
    </div>
  )
}