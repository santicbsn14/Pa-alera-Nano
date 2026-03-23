// src/components/catalogo/CatalogoCategorias.tsx
import { useState, useMemo } from 'react'
import { mockProductos, CATEGORIAS } from '../../data/mocks'
import CardProducto from './CardProducto'
import './CatalogoCategorias.css'

export default function CatalogoCategorias() {
  const [abierta, setAbierta] = useState<string | null>(null)
  const [busqueda, setBusqueda] = useState('')

  const toggle = (valor: string) => {
    setAbierta((prev) => (prev === valor ? null : valor))
  }

  const categoriasFiltradas = useMemo(() => {
    const q = busqueda.toLowerCase().trim()
    return CATEGORIAS.filter((cat) => cat.value !== 'todas').map((cat) => ({
      ...cat,
      productos: mockProductos.filter((p) => {
        const matchCategoria = p.categoria === cat.value
        const matchBusqueda = q === '' || p.nombre.toLowerCase().includes(q)
        return matchCategoria && matchBusqueda
      }),
    })).filter((cat) => cat.productos.length > 0)
  }, [busqueda])

  // Si hay búsqueda activa, abrir automáticamente las categorías con resultados
  const categoriaAbierta = busqueda.trim()
    ? categoriasFiltradas.length === 1
      ? categoriasFiltradas[0].value
      : abierta
    : abierta

  return (
    <div className="cat-mobile">

      {/* Buscador */}
      <div className="cat-mobile__search">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
        </svg>
        <input
          type="text"
          placeholder="Buscar producto..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="cat-mobile__search-input"
        />
        {busqueda && (
          <button
            className="cat-mobile__search-clear"
            onClick={() => setBusqueda('')}
            aria-label="Limpiar búsqueda"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Sin resultados */}
      {categoriasFiltradas.length === 0 && (
        <div className="cat-mobile__empty">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
          </svg>
          <p>No encontramos productos para "{busqueda}"</p>
          <button className="btn-secondary" onClick={() => setBusqueda('')}>
            Limpiar búsqueda
          </button>
        </div>
      )}

      {/* Categorías */}
      {categoriasFiltradas.map((cat) => {
        const isOpen = categoriaAbierta === cat.value
        const disponibles = cat.productos.filter((p) => p.enStock).length

        return (
          <div key={cat.value} className={`cat-mobile__seccion ${isOpen ? 'cat-mobile__seccion--open' : ''}`}>
            <button
              className="cat-mobile__header"
              onClick={() => toggle(cat.value)}
              aria-expanded={isOpen}
            >
              <div className="cat-mobile__header-left">
                <span className="cat-mobile__emoji">{cat.label.split(' ')[0]}</span>
                <div className="cat-mobile__header-info">
                  <span className="cat-mobile__nombre">
                    {cat.label.split(' ').slice(1).join(' ')}
                  </span>
                  <span className="cat-mobile__count">
                    {disponibles} producto{disponibles !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>
              <div className="cat-mobile__icono">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </div>
            </button>

            <div className="cat-mobile__productos-wrap">
              <div className="cat-mobile__productos">
                {cat.productos.map((producto) => (
                  <CardProducto key={producto._id} producto={producto} />
                ))}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}