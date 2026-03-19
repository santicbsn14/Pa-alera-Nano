// src/components/carrito/Toast.tsx
import { useCarrito } from '../../context/CarritoContext'
import './Toast.css'

export default function Toast() {
  const { toast } = useCarrito()

  if (!toast) return null

  return (
    <div className="toast" key={toast.id}>
      <div className="toast__icono">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>
      <div className="toast__texto">
        <span className="toast__titulo">Agregado al pedido</span>
        <span className="toast__producto">{toast.mensaje}</span>
      </div>
    </div>
  )
}