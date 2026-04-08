// src/components/carrito/CarritoFlotante.tsx
import { useCarrito } from '../../context/CarritoContext'
import './CarritoFlotante.css'

const MINIMO = 150000

export default function CarritoFlotante() {
  const { items, abrirCarrito } = useCarrito()

  const total = items.reduce((acc, i) => acc + i.producto.precio * i.cantidad, 0)

  if (items.length === 0) return null

  const progreso = Math.min((total / MINIMO) * 100, 100)
  const minimoAlcanzado = total >= MINIMO
  const falta = MINIMO - total

  return (
    <div className="carrito-flotante">
      <div className="carrito-flotante__inner">

        <div className="carrito-flotante__info">
          <div className="carrito-flotante__textos">
            <span className="carrito-flotante__total">
              ${total.toLocaleString('es-AR')}
            </span>
            {minimoAlcanzado ? (
              <span className="carrito-flotante__estado carrito-flotante__estado--ok">
                ✓ Mínimo alcanzado
              </span>
            ) : (
              <span className="carrito-flotante__estado">
                Faltan ${falta.toLocaleString('es-AR')} para el mínimo
              </span>
            )}
          </div>

          <button className="carrito-flotante__btn" onClick={abrirCarrito}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 001.99 1.61h9.72a2 2 0 001.99-1.61L23 6H6" />
            </svg>
            Ver pedido
          </button>
        </div>

        <div className="carrito-flotante__barra-wrap">
          <div
            className={`carrito-flotante__barra ${minimoAlcanzado ? 'carrito-flotante__barra--ok' : ''}`}
            style={{ width: `${progreso}%` }}
          />
        </div>

      </div>
    </div>
  )
}