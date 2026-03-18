// src/components/catalogo/GridProductos.tsx
import { useState, useMemo, useCallback } from 'react'
import { mockProductos } from '../../data/mocks'
import type { FiltrosCatalogo } from '../../types'
import FiltrosComp from './FiltrosCatalogo'
import CardProducto from './CardProducto'
import './GridProductos.css'

const ITEMS_INICIALES = 12
const ITEMS_POR_CARGA = 12

const filtrosIniciales: FiltrosCatalogo = {
  categoria: 'todas',
  talle: 'todos',
  marca: '',
  soloStock: false,
  busqueda: '',
}

export default function GridProductos() {
  const [filtros, setFiltros] = useState<FiltrosCatalogo>(filtrosIniciales)
  const [cantidad, setCantidad] = useState(ITEMS_INICIALES)

  const productosFiltrados = useMemo(() => {
    return mockProductos.filter((p) => {
      if (filtros.soloStock && !p.enStock) return false
      if (filtros.categoria !== 'todas' && p.categoria !== filtros.categoria) return false
      if (filtros.talle !== 'todos' && p.talle !== filtros.talle) return false
      if (filtros.busqueda) {
        const q = filtros.busqueda.toLowerCase()
        if (!p.nombre.toLowerCase().includes(q)) return false
      }
      return true
    })
  }, [filtros])

  const productosVisibles = productosFiltrados.slice(0, cantidad)
  const hayMas = cantidad < productosFiltrados.length

  const handleFiltros = useCallback((nuevos: FiltrosCatalogo) => {
    setFiltros(nuevos)
    setCantidad(ITEMS_INICIALES)
  }, [])

  const cargarMas = () => {
    setCantidad((prev) => prev + ITEMS_POR_CARGA)
  }

  return (
    <div className="catalogo__wrap container">

      <FiltrosComp
        filtros={filtros}
        onChange={handleFiltros}
        total={productosFiltrados.length}
      />

      <div className="catalogo__main">
        {productosVisibles.length > 0 ? (
          <>
            <div className="catalogo__grid">
              {productosVisibles.map((producto) => (
                <CardProducto key={producto._id} producto={producto} />
              ))}
            </div>

            {hayMas && (
              <div className="catalogo__mas">
                <p className="catalogo__mas-info">
                  Mostrando {productosVisibles.length} de {productosFiltrados.length} productos
                </p>
                <button className="btn-secondary catalogo__mas-btn" onClick={cargarMas}>
                  Cargar más productos
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="catalogo__empty">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
            </svg>
            <p>No encontramos productos con esos filtros.</p>
            <button
              className="btn-secondary"
              onClick={() => handleFiltros(filtrosIniciales)}
            >
              Limpiar filtros
            </button>
          </div>
        )}
      </div>

    </div>
  )
}