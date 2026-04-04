// src/components/catalogo/CardProducto.tsx
import { useCarrito } from '../../context/CarritoContext'
import { urlFor } from '../../lib/sanity'
import type { Producto } from '../../types'
import { CATEGORIAS } from '../../data/mocks'
import './CardProducto.css'

interface Props {
  producto: Producto
}

export default function CardProducto({ producto }: Props) {
  const { agregar, quitar, cambiarCantidad, items } = useCarrito()
  const categoriaLabel = CATEGORIAS.find((c) => c.value === producto.categoria)?.label ?? producto.categoria
  const itemEnCarrito = items.find((i) => i.producto._id === producto._id)
  const cantidad = itemEnCarrito?.cantidad ?? 0

  return (
    <div className="card">
      <div className="card__img-wrap">
        {producto.foto ? (
          <img
            src={urlFor(producto.foto).width(400).height(400).fit('crop').url()}
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
        {/* Badge cantidad en carrito */}
        {cantidad > 0 && (
          <span className="card__cantidad-badge">{cantidad}</span>
        )}
      </div>

      <div className="card__info">
        <h3 className="card__nombre">{producto.nombre}</h3>

        {/* Presentación en lugar de descripción */}
        {producto.presentacion && (
          <p className="card__presentacion">{producto.presentacion}</p>
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

        {/* Botón o contador según si está en carrito */}
        {cantidad === 0 ? (
          <button
            className="card__btn"
            onClick={() => agregar(producto)}
            disabled={!producto.enStock}
          >
            Agregar al pedido
          </button>
        ) : (
          <div className="card__contador">
            <button
              className="card__contador-btn"
              onClick={() => cantidad === 1 ? quitar(producto._id) : cambiarCantidad(producto._id, cantidad - 1)}
              aria-label="Restar"
            >
              −
            </button>
            <span className="card__contador-num">{cantidad}</span>
            <button
              className="card__contador-btn"
              onClick={() => cambiarCantidad(producto._id, cantidad + 1)}
              aria-label="Sumar"
            >
              +
            </button>
          </div>
        )}
      </div>
    </div>
  )
}