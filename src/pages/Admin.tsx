// src/pages/Admin.tsx
import { useState, useCallback } from 'react'
import './Admin.css'

const SERVER_URL = 'https://nano-server-h25x.onrender.com'

const ENVIOS: Record<string, string> = {
  viacargo: 'Via Cargo',
  elsalvador: 'Comisiones El Salvador',
  davidromano: 'David Romano Comisión',
  personal: 'Lo retiro personalmente',
}

interface ItemPedido {
  nombre: string
  talle?: string
  presentacion?: string
  descripcion?: string
  precio: number
  cantidad: number
}

interface Pedido {
  _id: string
  numeroPedido: string
  fecha: string
  nombre: string
  ciudad: string
  direccion: string
  fecha_retiro?: string
  turno: string
  envio: string
  aclaracion?: string
  items: ItemPedido[]
  total: number
}

interface ProductoStock {
  _id: string
  nombre: string
  descripcion?: string
  talle?: string
  categoria: string
  enStock: boolean
  precio: number
}

export default function Admin() {
  const [autenticado, setAutenticado] = useState(false)
  const [clave, setClave] = useState('')
  const [errorLogin, setErrorLogin] = useState('')
  const [loadingLogin, setLoadingLogin] = useState(false)
  const [mostrarClave, setMostrarClave] = useState(false)
  const [pestana, setPestana] = useState<'pedidos' | 'stock'>('pedidos')

  // ── Pedidos ──
  const hoy = new Date().toISOString().split('T')[0]
  const [desde, setDesde] = useState(hoy)
  const [hasta, setHasta] = useState(hoy)
  const [pedidos, setPedidos] = useState<Pedido[]>([])
  const [cargando, setCargando] = useState(false)
  const [buscado, setBuscado] = useState(false)
  const [pedidoDetalle, setPedidoDetalle] = useState<Pedido | null>(null)

  // ── Stock ──
  const [busquedaStock, setBusquedaStock] = useState('')
  const [productosStock, setProductosStock] = useState<ProductoStock[]>([])
  const [cargandoStock, setCargandoStock] = useState(false)
  const [buscadoStock, setBuscadoStock] = useState(false)
  const [actualizando, setActualizando] = useState<string | null>(null)

  const login = async () => {
    setLoadingLogin(true)
    setErrorLogin('')
    try {
      const res = await fetch(`${SERVER_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clave }),
      })
      const data = await res.json()
      if (data.ok) {
        setAutenticado(true)
        consultar()
      } else {
        setErrorLogin('Contraseña incorrecta')
      }
    } catch {
      setErrorLogin('No se pudo conectar con el servidor')
    } finally {
      setLoadingLogin(false)
    }
  }

  const consultar = async () => {
    setCargando(true)
    setBuscado(false)
    setPedidoDetalle(null)
    try {
      const res = await fetch(`${SERVER_URL}/pedidos?desde=${desde}&hasta=${hasta}`)
      const data = await res.json()
      setPedidos(data.pedidos ?? [])
    } catch {
      setPedidos([])
    } finally {
      setCargando(false)
      setBuscado(true)
    }
  }

  const buscarProductos = useCallback(async () => {
    if (!busquedaStock.trim()) return
    setCargandoStock(true)
    setBuscadoStock(false)
    try {
      const res = await fetch(`${SERVER_URL}/productos/buscar?q=${encodeURIComponent(busquedaStock)}`)
      const data = await res.json()
      setProductosStock(data.productos ?? [])
    } catch {
      setProductosStock([])
    } finally {
      setCargandoStock(false)
      setBuscadoStock(true)
    }
  }, [busquedaStock])

  const toggleStock = async (producto: ProductoStock) => {
    setActualizando(producto._id)
    try {
      const res = await fetch(`${SERVER_URL}/producto/${producto._id}/stock`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enStock: !producto.enStock }),
      })
      const data = await res.json()
      if (data.ok) {
        setProductosStock((prev) =>
          prev.map((p) => p._id === producto._id ? { ...p, enStock: !p.enStock } : p)
        )
      }
    } catch {
      // silencioso
    } finally {
      setActualizando(null)
    }
  }

  const totalVentas = pedidos.reduce((acc, p) => acc + p.total, 0)

  const formatFecha = (iso: string) => {
    const d = new Date(iso)
    return d.toLocaleDateString('es-AR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    })
  }

  // ── Login ──
  if (!autenticado) {
    return (
      <div className="admin-login">
        <div className="admin-login__card">
          <div className="admin-login__logo">🛒</div>
          <h1>Panel Nano</h1>
          <p>Ingresá tu contraseña para acceder</p>
          <div className="admin-login__field">
            <input
              type={mostrarClave ? 'text' : 'password'}
              placeholder="Contraseña"
              value={clave}
              onChange={(e) => setClave(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && login()}
              className="admin-login__input"
            />
            <button className="admin-login__toggle" onClick={() => setMostrarClave(!mostrarClave)}>
              {mostrarClave ? '🙈' : '👁'}
            </button>
          </div>
          {errorLogin && <p className="admin-login__error">{errorLogin}</p>}
          <button className="admin-login__btn" onClick={login} disabled={loadingLogin}>
            {loadingLogin ? 'Verificando...' : 'Ingresar'}
          </button>
        </div>
      </div>
    )
  }

  // ── Dashboard ──
  return (
    <div className="admin">

      {/* Header */}
      <div className="admin__header">
        <div className="admin__header-inner">
          <div className="admin__logo">
            <span>🛒</span>
            <div>
              <h1>Panel Nano</h1>
              <span>Pañalera Nano Mayorista</span>
            </div>
          </div>
          {/* Pestañas */}
          <div className="admin__tabs">
            <button
              className={`admin__tab ${pestana === 'pedidos' ? 'admin__tab--active' : ''}`}
              onClick={() => setPestana('pedidos')}
            >
              📋 Pedidos
            </button>
            <button
              className={`admin__tab ${pestana === 'stock' ? 'admin__tab--active' : ''}`}
              onClick={() => setPestana('stock')}
            >
              📦 Stock
            </button>
          </div>
        </div>
      </div>

      <div className="admin__body">

        {/* ── PESTAÑA PEDIDOS ── */}
        {pestana === 'pedidos' && (
          <>
            <div className="admin__filtros">
              <h2>Consultar pedidos</h2>
              <div className="admin__filtros-row">
                <div className="admin__filtro-field">
                  <label>Desde</label>
                  <input type="date" value={desde} onChange={(e) => setDesde(e.target.value)} className="admin__input" />
                </div>
                <div className="admin__filtro-field">
                  <label>Hasta</label>
                  <input type="date" value={hasta} onChange={(e) => setHasta(e.target.value)} className="admin__input" />
                </div>
                <button className="admin__btn-consultar" onClick={consultar} disabled={cargando}>
                  {cargando ? 'Buscando...' : 'Consultar'}
                </button>
              </div>
            </div>

            {buscado && (
              <>
                <div className="admin__resumen">
                  <div className="admin__stat">
                    <span className="admin__stat-label">Pedidos</span>
                    <span className="admin__stat-valor">{pedidos.length}</span>
                  </div>
                  <div className="admin__stat">
                    <span className="admin__stat-label">Total ventas</span>
                    <span className="admin__stat-valor admin__stat-valor--celeste">${totalVentas.toLocaleString('es-AR')}</span>
                  </div>
                  <div className="admin__stat">
                    <span className="admin__stat-label">Ticket promedio</span>
                    <span className="admin__stat-valor">${pedidos.length > 0 ? Math.round(totalVentas / pedidos.length).toLocaleString('es-AR') : '0'}</span>
                  </div>
                </div>

                {pedidos.length === 0 ? (
                  <div className="admin__empty"><p>No hay pedidos en ese período.</p></div>
                ) : (
                  <div className="admin__tabla-wrap">
                    <table className="admin__tabla">
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>Fecha</th>
                          <th>Cliente</th>
                          <th>Ciudad</th>
                          <th>Envío</th>
                          <th>Total</th>
                          <th></th>
                        </tr>
                      </thead>
                      <tbody>
                        {pedidos.map((p) => (
                          <tr key={p._id} onClick={() => setPedidoDetalle(p)} className="admin__tabla-row">
                            <td className="admin__num-pedido">#{p.numeroPedido}</td>
                            <td>{formatFecha(p.fecha)}</td>
                            <td className="admin__cliente">{p.nombre}</td>
                            <td>{p.ciudad}</td>
                            <td>{ENVIOS[p.envio] ?? p.envio}</td>
                            <td className="admin__total">${p.total.toLocaleString('es-AR')}</td>
                            <td><button className="admin__ver-btn">Ver</button></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            )}
          </>
        )}

        {/* ── PESTAÑA STOCK ── */}
        {pestana === 'stock' && (
          <div className="admin__stock">
            <div className="admin__filtros">
              <h2>Gestión de stock</h2>
              <div className="admin__filtros-row">
                <input
                  type="text"
                  className="admin__input admin__input--wide"
                  placeholder="Buscar por nombre o código de barra..."
                  value={busquedaStock}
                  onChange={(e) => setBusquedaStock(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && buscarProductos()}
                />
                <button className="admin__btn-consultar" onClick={buscarProductos} disabled={cargandoStock}>
                  {cargandoStock ? 'Buscando...' : 'Buscar'}
                </button>
              </div>
            </div>

            {buscadoStock && (
              <>
                {productosStock.length === 0 ? (
                  <div className="admin__empty"><p>No se encontraron productos.</p></div>
                ) : (
                  <div className="admin__tabla-wrap">
                    <table className="admin__tabla">
                      <thead>
                        <tr>
                          <th>Producto</th>
                          <th>Talle</th>
                          <th>Precio</th>
                          <th>Estado</th>
                          <th></th>
                        </tr>
                      </thead>
                      <tbody>
                        {productosStock.map((p) => (
                          <tr key={p._id} className="admin__tabla-row">
                            <td>
                              <div className="admin__cliente">{p.nombre}</div>
                              {p.descripcion && <div className="admin__codbar-tabla">CB: {p.descripcion}</div>}
                            </td>
                            <td>{p.talle && p.talle !== 'unico' ? p.talle : '—'}</td>
                            <td>${p.precio.toLocaleString('es-AR')}</td>
                            <td>
                              <span className={`admin__stock-badge ${p.enStock ? 'admin__stock-badge--ok' : 'admin__stock-badge--off'}`}>
                                {p.enStock ? '✓ En stock' : '✗ Sin stock'}
                              </span>
                            </td>
                            <td>
                              <button
                                className={`admin__toggle-btn ${p.enStock ? 'admin__toggle-btn--deshabilitar' : 'admin__toggle-btn--habilitar'}`}
                                onClick={() => toggleStock(p)}
                                disabled={actualizando === p._id}
                              >
                                {actualizando === p._id ? '...' : p.enStock ? 'Deshabilitar' : 'Habilitar'}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            )}
          </div>
        )}

      </div>

      {/* Modal detalle pedido */}
      {pedidoDetalle && (
        <div className="admin__overlay" onClick={() => setPedidoDetalle(null)}>
          <div className="admin__detalle" onClick={(e) => e.stopPropagation()}>
            <div className="admin__detalle-header">
              <div>
                <h3>Pedido #{pedidoDetalle.numeroPedido}</h3>
                <span>{formatFecha(pedidoDetalle.fecha)}</span>
              </div>
              <button className="admin__detalle-close" onClick={() => setPedidoDetalle(null)}>✕</button>
            </div>
            <div className="admin__detalle-body">
              <div className="admin__detalle-seccion">
                <h4>Datos del cliente</h4>
                <div className="admin__detalle-grid">
                  <div><strong>Nombre</strong><span>{pedidoDetalle.nombre}</span></div>
                  <div><strong>Ciudad</strong><span>{pedidoDetalle.ciudad}</span></div>
                  <div><strong>Dirección</strong><span>{pedidoDetalle.direccion}</span></div>
                  <div><strong>Turno</strong><span>{pedidoDetalle.turno === 'mañana' ? 'Mañana' : 'Tarde'}</span></div>
                  {pedidoDetalle.fecha_retiro && (
                    <div><strong>Fecha retiro</strong><span>{pedidoDetalle.fecha_retiro}</span></div>
                  )}
                  <div><strong>Envío</strong><span>{ENVIOS[pedidoDetalle.envio] ?? pedidoDetalle.envio}</span></div>
                  {pedidoDetalle.aclaracion && (
                    <div><strong>Aclaración</strong><span>{pedidoDetalle.aclaracion}</span></div>
                  )}
                </div>
              </div>
              <div className="admin__detalle-seccion">
                <h4>Productos</h4>
                {pedidoDetalle.items.map((item, i) => (
                  <div key={i} className="admin__detalle-item">
                    <div className="admin__detalle-item-info">
                      <strong>{item.cantidad} x {item.nombre}</strong>
                      {item.talle && item.talle !== 'unico' && <span>{item.talle}</span>}
                      {item.presentacion && <span>{item.presentacion}</span>}
                      {item.descripcion && <span className="admin__codbar">CB: {item.descripcion}</span>}
                    </div>
                    <span className="admin__detalle-item-precio">${(item.precio * item.cantidad).toLocaleString('es-AR')}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="admin__detalle-footer">
              <strong>Total del pedido</strong>
              <span className="admin__detalle-total">${pedidoDetalle.total.toLocaleString('es-AR')}</span>
                <button className="admin__print-btn" onClick={() => window.print()}>
    🖨️ Imprimir
  </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}