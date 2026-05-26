// src/components/catalogo/GridProductos.tsx
import { useState, useMemo, useCallback, useEffect } from 'react'
import { getProductos, getCategorias } from '../../lib/sanity'
import type { Producto, Categoria, FiltrosCatalogo } from '../../types'
import FiltrosComp from './FiltrosCatalogo'
import CardProducto from './CardProducto'
import './GridProductos.css'
import { tieneDescuento } from '../../lib/precio'

const ITEMS_INICIALES = 12
const ITEMS_POR_CARGA = 12

const filtrosIniciales: FiltrosCatalogo = {
  categoria: 'todas',
  talle: 'todos',
  marca: '',
  soloStock: false,
  soloOfertas: false,
  busqueda: '',
}

interface Props {
  soloOfertas: boolean
  onVerOfertas: (val: boolean) => void
}

export default function GridProductos({ soloOfertas, onVerOfertas }: Props) {
  const [productos, setProductos] = useState<Producto[]>([])
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(false)
  const [filtros, setFiltros] = useState<FiltrosCatalogo>(filtrosIniciales)
  const [cantidad, setCantidad] = useState(ITEMS_INICIALES)

  useEffect(() => {
    setCargando(true)
    setError(false)
    Promise.all([getProductos(), getCategorias()])
      .then(([prods, cats]) => {
        setProductos(prods)
        setCategorias(cats)
      })
      .catch(() => setError(true))
      .finally(() => setCargando(false))
  }, [])

  const productosFiltrados = useMemo(() => {
    return productos.filter((p) => {
      if (soloOfertas && !tieneDescuento(p)) return false
      if (filtros.soloStock && !p.enStock) return false
      if (filtros.categoria !== 'todas' && p.categoria?.slug !== filtros.categoria) return false
      if (filtros.talle !== 'todos' && p.talle !== filtros.talle) return false
      if (filtros.busqueda) {
        const q = filtros.busqueda.toLowerCase()
        if (!p.nombre.toLowerCase().includes(q) && !p.descripcion?.toLowerCase().includes(q)) return false
      }
      return true
    })
  }, [filtros, productos, soloOfertas])

  const productosVisibles = productosFiltrados.slice(0, cantidad)
  const hayMas = cantidad < productosFiltrados.length

  const handleFiltros = useCallback((nuevos: FiltrosCatalogo) => {
    setFiltros(nuevos)
    setCantidad(ITEMS_INICIALES)
  }, [])

  const cargarMas = () => setCantidad((prev) => prev + ITEMS_POR_CARGA)

  if (cargando) {
    return (
      <div className="catalogo__wrap container">
        <div className="catalogo__loading">
          <div className="catalogo__spinner" />
          <p>Cargando productos...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="catalogo__wrap container">
        <div className="catalogo__empty">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <p>No se pudieron cargar los productos.</p>
          <button className="btn-secondary" onClick={() => window.location.reload()}>
            Reintentar
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="catalogo__wrap container">

      <FiltrosComp
        filtros={filtros}
        onChange={handleFiltros}
        total={productosFiltrados.length}
        categorias={categorias}
        soloOfertas={soloOfertas}
        onToggleOfertas={() => onVerOfertas(!soloOfertas)}
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
            <button className="btn-secondary" onClick={() => handleFiltros(filtrosIniciales)}>
              Limpiar filtros
            </button>
          </div>
        )}
      </div>

    </div>
  )
}