// src/components/catalogo/CardProducto.tsx
import { useCarrito } from '../../context/CarritoContext'
import type { Producto } from '../../types'
import { CATEGORIAS } from '../../data/mocks'
import './CardProducto.css'

interface Props {
  producto: Producto
}

export default function CardProducto({ producto }: Props) {
  const { agregar, items } = useCarrito()
  const categoriaLabel = CATEGORIAS.find((c) => c.value === producto.categoria)?.label ?? producto.categoria
  const enCarrito = items.some((i) => i.producto._id === producto._id)

  return (
    <div className="card">
      <div className="card__img-wrap">
        {producto.foto ? (
          <img
            src={producto.foto.asset._ref}
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
      </div>

      <div className="card__info">
        <h3 className="card__nombre">{producto.nombre}</h3>
        {producto.descripcion && (
          <p className="card__desc">{producto.descripcion}</p>
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

        <button
          className={`card__btn ${enCarrito ? 'card__btn--agregado' : ''}`}
          onClick={() => agregar(producto)}
          disabled={!producto.enStock}
        >
          {enCarrito ? '✓ Agregado' : 'Agregar al pedido'}
        </button>
      </div>
    </div>
  )
}