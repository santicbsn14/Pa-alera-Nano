// src/components/catalogo/CardProducto.tsx
import { useState } from 'react'
import { useCarrito } from '../../context/CarritoContext'
import { urlFor } from '../../lib/sanity'
import type { Producto } from '../../types'
import './CardProducto.css'

const TALLES_DEFAULT = ['RN', 'P', 'M', 'G', 'XG', 'XXG', 'XXXG']

interface Props {
  producto: Producto
}

/** "6 Unidades x Bulto" → 6 */
function parsearUnidadesBulto(presentacion?: string): number | null {
  if (!presentacion) return null
  const match = presentacion.match(/^(\d+)\s+unidades?\s+x\s+bulto/i)
  return match ? parseInt(match[1], 10) : null
}

export default function CardProducto({ producto }: Props) {
  const { agregar, quitar, cambiarCantidad, items } = useCarrito()

  // categoria ahora es un objeto — usamos slug para lógica y nombre para mostrar
  const esCombo = producto.categoria?.slug === 'combos'
  const categoriaLabel = producto.categoria?.nombre ?? ''

  const itemsCombo = items.filter((i) => i.producto._id === producto._id)
  const cantidadCombo = itemsCombo.length

  const itemNormal = items.find((i) => i.itemId === producto._id)
  const cantidadNormal = itemNormal?.cantidad ?? 0

  const cantidad = esCombo ? cantidadCombo : cantidadNormal

  const [modalCombo, setModalCombo] = useState(false)
  const [tallesSeleccionados, setTallesSeleccionados] = useState<Record<string, string>>({})

  // ── Venta por caja ──────────────────────────────────────────────
  const unidadesBulto = parsearUnidadesBulto(producto.presentacion)
  const muestraBtnCaja = producto.vendePorCaja === true && unidadesBulto !== null

  const handleAgregarCaja = () => {
    agregar(producto, undefined, unidadesBulto!)
  }
  // ───────────────────────────────────────────────────────────────

  const productosCombo = esCombo
    ? producto.nombre.split('+').map((p) => p.trim())
    : []

  const todosSeleccionados = productosCombo.every((p) => tallesSeleccionados[p])

  const handleAgregar = () => {
    if (esCombo) {
      setTallesSeleccionados({})
      setModalCombo(true)
    } else {
      agregar(producto)
    }
  }

  const confirmarCombo = () => {
    const talles = productosCombo.map((p) => ({
      producto: p,
      talle: tallesSeleccionados[p],
    }))
    agregar(producto, talles)
    setModalCombo(false)
    setTallesSeleccionados({})
  }

  return (
    <>
      <div className="card">
        <div className="card__img-wrap">
          {producto.foto ? (
            <img
              src={urlFor(producto.foto)
                .width(400)
                .height(400)
                .fit('crop')
                .auto('format')
                .quality(70)
                .url()}
              alt={producto.nombre}
              className="card__img"
              loading="lazy"
            />
          ) : (
            <div className="card__img-placeholder">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <path d="M21 15l-5-5L5 21" />
              </svg>
            </div>
          )}
          <span className="card__cat">{categoriaLabel}</span>
          {!producto.enStock && (
            <span className="card__sin-stock">Sin stock</span>
          )}
          {cantidad > 0 && (
            <span className="card__cantidad-badge">{cantidad}</span>
          )}
        </div>

        <div className="card__info">
          <h3 className="card__nombre">{producto.nombre}</h3>
          {producto.descripcion && (
            <span className="card__codbar">CB: {producto.descripcion}</span>
          )}
          <div className="card__footer">
            <div className="card__meta">
              {producto.talle && producto.talle !== 'unico' && (
                <span className="card__talle">{producto.talle}</span>
              )}
            </div>
            <span className="card__precio">
              ${producto.precio.toLocaleString('es-AR')}
            </span>
          </div>

          {esCombo ? (
            <button
              className="card__btn"
              onClick={handleAgregar}
              disabled={!producto.enStock}
            >
              {cantidad > 0 ? `+ Agregar otro (${cantidad} en pedido)` : 'Agregar al pedido'}
            </button>
          ) : cantidad === 0 ? (
            <div className={muestraBtnCaja ? 'card__btns' : undefined}>
              <button
                className="card__btn"
                onClick={handleAgregar}
                disabled={!producto.enStock}
              >
                Agregar al pedido
              </button>
              {muestraBtnCaja && (
                <button
                  className="card__btn card__btn--caja"
                  onClick={handleAgregarCaja}
                  disabled={!producto.enStock}
                  title={`Agrega ${unidadesBulto} unidades (1 bulto)`}
                >
                  📦 Agregar caja ({unidadesBulto} u.)
                </button>
              )}
            </div>
          ) : (
            <div className={muestraBtnCaja ? 'card__contador-wrap' : undefined}>
              <div className="card__contador">
                <button
                  className="card__contador-btn"
                  onClick={() => cantidadNormal === 1 ? quitar(producto._id) : cambiarCantidad(producto._id, cantidadNormal - 1)}
                  aria-label="Restar"
                >
                  −
                </button>
                <span className="card__contador-num">{cantidadNormal}</span>
                <button
                  className="card__contador-btn"
                  onClick={() => cambiarCantidad(producto._id, cantidadNormal + 1)}
                  aria-label="Sumar"
                >
                  +
                </button>
              </div>
              {muestraBtnCaja && (
                <button
                  className="card__btn card__btn--caja card__btn--caja-sm"
                  onClick={handleAgregarCaja}
                  disabled={!producto.enStock}
                  title={`Agrega ${unidadesBulto} unidades más`}
                >
                  📦 +{unidadesBulto} u.
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Modal talles combo ── */}
      {modalCombo && (
        <div className="combo-overlay" onClick={() => setModalCombo(false)}>
          <div className="combo-modal" onClick={(e) => e.stopPropagation()}>
            <div className="combo-modal__header">
              <h3>Seleccioná los talles</h3>
              <button className="combo-modal__close" onClick={() => setModalCombo(false)}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
            <p className="combo-modal__nombre">{producto.nombre}</p>
            <div className="combo-modal__productos">
              {productosCombo.map((nombreProducto) => {
                const tallesEntry = producto.tallesCombo?.find(
                  (t) => t.nombreProducto.toLowerCase().trim() === nombreProducto.toLowerCase().trim()
                )
                const tallesDisponibles = tallesEntry
                  ? tallesEntry.talles.split(',').map((t) => t.trim()).filter(Boolean)
                  : TALLES_DEFAULT

                return (
                  <div key={nombreProducto} className="combo-modal__producto">
                    <span className="combo-modal__producto-nombre">{nombreProducto}</span>
                    <div className="combo-modal__talles">
                      {tallesDisponibles.map((talle) => (
                        <button
                          key={talle}
                          className={`combo-modal__talle ${tallesSeleccionados[nombreProducto] === talle ? 'combo-modal__talle--active' : ''}`}
                          onClick={() => setTallesSeleccionados((prev) => ({ ...prev, [nombreProducto]: talle }))}
                        >
                          {talle}
                        </button>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
            <button
              className="combo-modal__confirmar"
              onClick={confirmarCombo}
              disabled={!todosSeleccionados}
            >
              Agregar al pedido
            </button>
          </div>
        </div>
      )}
    </>
  )
}