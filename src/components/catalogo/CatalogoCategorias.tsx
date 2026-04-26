// src/components/catalogo/CatalogoCategorias.tsx
import { useState, useMemo, useEffect } from 'react'
import { getProductos } from '../../lib/sanity'
import { CATEGORIAS } from '../../data/mocks'
import type { Producto } from '../../types'
import CardProducto from './CardProducto'
import './CatalogoCategorias.css'

export default function CatalogoCategorias() {
  const [productos, setProductos] = useState<Producto[]>([])
  const [cargando, setCargando] = useState(true)
  const [categoriaAbierta, setCategoriaAbierta] = useState<string | null>(null)
  const [marcaAbierta, setMarcaAbierta] = useState<string | null>(null)
  const [busqueda, setBusqueda] = useState('')

  useEffect(() => {
    getProductos()
      .then((data) => setProductos(data))
      .catch(() => setProductos([]))
      .finally(() => setCargando(false))
  }, [])

  const toggleCategoria = (valor: string) => {
    setCategoriaAbierta((prev) => (prev === valor ? null : valor))
    setMarcaAbierta(null)
  }

  const toggleMarca = (marca: string) => {
    setMarcaAbierta((prev) => (prev === marca ? null : marca))
  }

  const categoriasFiltradas = useMemo(() => {
    const q = busqueda.toLowerCase().trim()
    return CATEGORIAS.filter((cat) => cat.value !== 'todas').map((cat) => {
      const productosCat = productos.filter((p) => {
        const matchCat = p.categoria === cat.value
        const matchBusqueda = q === '' || p.nombre.toLowerCase().includes(q) || p.descripcion?.toLowerCase().includes(q)
        return matchCat && matchBusqueda
      })

      // Agrupar por marca
      const marcasMap: Record<string, Producto[]> = {}
      productosCat.forEach((p) => {
        const marca = p.marca ?? 'Sin marca'
        if (!marcasMap[marca]) marcasMap[marca] = []
        marcasMap[marca].push(p)
      })

      const marcas = Object.entries(marcasMap).map(([nombre, prods]) => ({
        nombre,
        productos: prods,
        disponibles: prods.filter((p) => p.enStock).length,
      }))

      return {
        ...cat,
        marcas,
        totalDisponibles: productosCat.filter((p) => p.enStock).length,
      }
    }).filter((cat) => cat.marcas.length > 0)
  }, [busqueda, productos])

  // Si hay búsqueda y queda una sola categoría, abrirla automáticamente
  const catAbiertaEfectiva = categoriaAbierta

  if (cargando) {
    return (
      <div className="cat-mobile">
        <div className="cat-mobile__loading">
          <div className="cat-mobile__spinner" />
          <p>Cargando productos...</p>
        </div>
      </div>
    )
  }

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
          <button className="cat-mobile__search-clear" onClick={() => setBusqueda('')} aria-label="Limpiar búsqueda">
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
          <button className="btn-secondary" onClick={() => setBusqueda('')}>Limpiar búsqueda</button>
        </div>
      )}

      {/* Categorías */}
      {categoriasFiltradas.map((cat) => {
        const isCatOpen = catAbiertaEfectiva === cat.value

        return (
          <div key={cat.value} className={`cat-mobile__seccion ${isCatOpen ? 'cat-mobile__seccion--open' : ''}`}>

            {/* Header categoría */}
            <button className="cat-mobile__header" onClick={() => toggleCategoria(cat.value)} aria-expanded={isCatOpen}>
              <div className="cat-mobile__header-left">
                <span className="cat-mobile__emoji">{cat.label.split(' ')[0]}</span>
                <div className="cat-mobile__header-info">
                  <span className="cat-mobile__nombre">{cat.label.split(' ').slice(1).join(' ')}</span>
                  <span className="cat-mobile__count">{cat.totalDisponibles} producto{cat.totalDisponibles !== 1 ? 's' : ''}</span>
                </div>
              </div>
              <div className="cat-mobile__icono">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </div>
            </button>

            {/* Marcas dentro de la categoría */}
            <div className="cat-mobile__productos-wrap">
              <div className="cat-mobile__marcas">
                {cat.marcas.map((marca) => {
                  const isMarcaOpen = marcaAbierta === `${cat.value}-${marca.nombre}`

                  return (
                    <div key={marca.nombre} className={`cat-mobile__marca ${isMarcaOpen ? 'cat-mobile__marca--open' : ''}`}>

                      {/* Header marca */}
                      <button
                        className="cat-mobile__marca-header"
                        onClick={() => toggleMarca(`${cat.value}-${marca.nombre}`)}
                        aria-expanded={isMarcaOpen}
                      >
                        <span className="cat-mobile__marca-nombre">{marca.nombre}</span>
                        <div className="cat-mobile__marca-right">
                          <span className="cat-mobile__marca-count">{marca.disponibles} prod.</span>
                          <div className="cat-mobile__marca-icono">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M6 9l6 6 6-6" />
                            </svg>
                          </div>
                        </div>
                      </button>

                      {/* Productos de la marca */}
                      <div className="cat-mobile__marca-productos-wrap">
                        <div className="cat-mobile__productos">
                          {isMarcaOpen && marca.productos.map((producto) => (
                            <CardProducto key={producto._id} producto={producto} />
                          ))}
                        </div>
                      </div>

                    </div>
                  )
                })}
              </div>
            </div>

          </div>
        )
      })}
    </div>
  )
}