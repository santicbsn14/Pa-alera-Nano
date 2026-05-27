// src/components/catalogo/CatalogoCategorias.tsx
import { useState, useMemo, useEffect } from 'react'
import { getProductos, getCategorias } from '../../lib/sanity'
import type { Producto, Categoria } from '../../types'
import CardProducto from './CardProducto'
import { tieneDescuento } from '../../lib/precio'
import './CatalogoCategorias.css'

export default function CatalogoCategorias() {
  const [productos, setProductos] = useState<Producto[]>([])
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [cargando, setCargando] = useState(true)
  const [categoriaAbierta, setCategoriaAbierta] = useState<string | null>(null)
  const [marcaAbierta, setMarcaAbierta] = useState<string | null>(null)
  const [busqueda, setBusqueda] = useState('')

  useEffect(() => {
    Promise.all([getProductos(), getCategorias()])
      .then(([prods, cats]) => {
        setProductos(prods)
        setCategorias(cats)
      })
      .catch(() => {
        setProductos([])
        setCategorias([])
      })
      .finally(() => setCargando(false))
  }, [])

  const toggleCategoria = (slug: string) => {
    setCategoriaAbierta((prev) => (prev === slug ? null : slug))
    setMarcaAbierta(null)
  }

  const toggleMarca = (marca: string) => {
    setMarcaAbierta((prev) => (prev === marca ? null : marca))
  }

  // ── Ofertas ────────────────────────────────────────────────────
  const productosOferta = useMemo(() =>
    productos.filter((p) => p.enStock && tieneDescuento(p)),
    [productos]
  )
  // ──────────────────────────────────────────────────────────────

  const categoriasFiltradas = useMemo(() => {
    const q = busqueda.toLowerCase().trim()
    return categorias.map((cat) => {
      const productosCat = productos.filter((p) => {
        const matchCat = p.categoria?.slug === cat.slug
        const matchBusqueda = q === '' || p.nombre.toLowerCase().includes(q) || p.descripcion?.toLowerCase().includes(q)
        return matchCat && matchBusqueda
      })

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
  }, [busqueda, productos, categorias])

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

  const isOfertasOpen = categoriaAbierta === '__ofertas__'

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

      {/* ── Sección Ofertas — solo si hay productos con descuento ── */}
      {productosOferta.length > 0 && !busqueda && (
        <div className={`cat-mobile__seccion cat-mobile__seccion--ofertas ${isOfertasOpen ? 'cat-mobile__seccion--open' : ''}`}>
          <button
            className="cat-mobile__header cat-mobile__header--ofertas"
            onClick={() => toggleCategoria('__ofertas__')}
            aria-expanded={isOfertasOpen}
          >
            <div className="cat-mobile__header-left">
              <div className="cat-mobile__header-info">
                <span className="cat-mobile__nombre">🔥 Ofertas</span>
                <span className="cat-mobile__count">{productosOferta.length} producto{productosOferta.length !== 1 ? 's' : ''} con descuento</span>
              </div>
            </div>
            <div className="cat-mobile__icono">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 9l6 6 6-6" />
              </svg>
            </div>
          </button>

          <div className="cat-mobile__productos-wrap">
            <div className="cat-mobile__productos cat-mobile__productos--ofertas">
              {isOfertasOpen && productosOferta.map((producto) => (
                <CardProducto key={producto._id} producto={producto} />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Categorías */}
      {categoriasFiltradas.map((cat) => {
        const isCatOpen = categoriaAbierta === cat.slug

        return (
          <div key={cat._id} className={`cat-mobile__seccion ${isCatOpen ? 'cat-mobile__seccion--open' : ''}`}>

            <button className="cat-mobile__header" onClick={() => toggleCategoria(cat.slug)} aria-expanded={isCatOpen}>
              <div className="cat-mobile__header-left">
                <div className="cat-mobile__header-info">
                  <span className="cat-mobile__nombre">{cat.nombre}</span>
                  <span className="cat-mobile__count">{cat.totalDisponibles} producto{cat.totalDisponibles !== 1 ? 's' : ''}</span>
                </div>
              </div>
              <div className="cat-mobile__icono">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </div>
            </button>

            <div className="cat-mobile__productos-wrap">
              <div className="cat-mobile__marcas">
                {cat.marcas.map((marca) => {
                  const isMarcaOpen = marcaAbierta === `${cat.slug}-${marca.nombre}`

                  return (
                    <div key={marca.nombre} className={`cat-mobile__marca ${isMarcaOpen ? 'cat-mobile__marca--open' : ''}`}>

                      <button
                        className="cat-mobile__marca-header"
                        onClick={() => toggleMarca(`${cat.slug}-${marca.nombre}`)}
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