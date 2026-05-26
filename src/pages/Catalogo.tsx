// src/pages/Catalogo.tsx
import { useState, useEffect, useMemo } from 'react'
import { getProductos } from '../lib/sanity'
import { tieneDescuento } from '../lib/precio'
import type { Producto } from '../types'
import GridProductos from '../components/catalogo/GridProductos'
import CatalogoCategorias from '../components/catalogo/CatalogoCategorias'
import './Catalogo.css'

export default function Catalogo() {
  const [productos, setProductos] = useState<Producto[]>([])
  const [soloOfertas, setSoloOfertas] = useState(false)

  useEffect(() => {
    getProductos()
      .then(setProductos)
      .catch(() => setProductos([]))
  }, [])

  const cantidadOfertas = useMemo(() =>
    productos.filter((p) => p.enStock && tieneDescuento(p)).length,
    [productos]
  )

  return (
    <>
      {/* Banner ofertas — completamente fuera del layout del catálogo */}
      {cantidadOfertas > 0 && (
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
              onClick={() => setSoloOfertas((prev) => !prev)}
            >
              {soloOfertas ? 'Ver todos los productos' : 'Ver ofertas'}
            </button>
          </div>
        </div>
      )}

      <GridProductos soloOfertas={soloOfertas} onVerOfertas={setSoloOfertas} />
      <CatalogoCategorias />
    </>
  )
}