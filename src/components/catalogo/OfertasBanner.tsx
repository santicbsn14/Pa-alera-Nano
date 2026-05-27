// src/components/catalogo/OfertasBanner.tsx
import { useState, useEffect, useMemo } from 'react'
import { getProductos } from '../../lib/sanity'
import { tieneDescuento } from '../../lib/precio'
import './OfertasBanner.css'

interface Props {
  soloOfertas: boolean
  onToggle: (val: boolean) => void
}

export default function OfertasBanner({ soloOfertas, onToggle }: Props) {
  const [productos, setProductos] = useState<{ descuento?: number; enStock: boolean }[]>([])

  useEffect(() => {
    getProductos()
      .then(setProductos)
      .catch(() => setProductos([]))
  }, [])

  const cantidadOfertas = useMemo(() =>
    productos.filter((p) => p.enStock && tieneDescuento(p)).length,
    [productos]
  )

  if (cantidadOfertas === 0) return null

  return (
    <div className={`ofertas-banner ${soloOfertas ? 'ofertas-banner--active' : ''}`}>
      <div className="ofertas-banner__inner container">
        <div className="ofertas-banner__texto">
          <span className="ofertas-banner__fuego">🔥</span>
          <span className="ofertas-banner__msg">
            {soloOfertas
              ? `Mostrando ${cantidadOfertas} producto${cantidadOfertas !== 1 ? 's' : ''} en oferta`
              : `¡Tenemos ${cantidadOfertas} producto${cantidadOfertas !== 1 ? 's' : ''} en oferta!`
            }
          </span>
        </div>
        <button
          className="ofertas-banner__btn"
          onClick={() => onToggle(!soloOfertas)}
        >
          {soloOfertas ? 'Ver todos los productos' : 'Ver ofertas'}
        </button>
      </div>
    </div>
  )
}