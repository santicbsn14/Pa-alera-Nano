// src/components/home/ListaPrecios.tsx
import { useState, useMemo, useEffect } from 'react'
import { getProductos } from '../../lib/sanity'
import { CATEGORIAS } from '../../data/mocks'
import type { Producto, CategoriaFilter } from '../../types'
import './Listaprecios.css'

const ITEMS_POR_PAGINA = 20

export default function ListaPrecios() {
  const [productos, setProductos] = useState<Producto[]>([])
  const [cargando, setCargando] = useState(true)
  const [categoria, setCategoria] = useState<CategoriaFilter>('todas')
  const [busqueda, setBusqueda] = useState('')
  const [pagina, setPagina] = useState(1)

  useEffect(() => {
    setCargando(true)
    getProductos()
      .then((data) => setProductos(data))
      .catch(() => setProductos([]))
      .finally(() => setCargando(false))
  }, [])

  const productosFiltrados = useMemo(() => {
    return productos.filter((p) => {
      const matchCategoria = categoria === 'todas' || p.categoria === categoria
      const matchBusqueda = p.nombre.toLowerCase().includes(busqueda.toLowerCase())
      return matchCategoria && matchBusqueda && p.enStock
    })
  }, [categoria, busqueda, productos])

  const totalPaginas = Math.ceil(productosFiltrados.length / ITEMS_POR_PAGINA)
  const productosPagina = productosFiltrados.slice(
    (pagina - 1) * ITEMS_POR_PAGINA,
    pagina * ITEMS_POR_PAGINA
  )

  const handleCategoria = (val: CategoriaFilter) => {
    setCategoria(val)
    setPagina(1)
  }

  const handleBusqueda = (val: string) => {
    setBusqueda(val)
    setPagina(1)
  }

  return (
    <section className="precios section section-alt" id="precios">
      <div className="container">

        <div className="badge">Lista de precios</div>
        <h2 className="section-title">Precios <span>mayoristas</span></h2>
        <p className="section-subtitle">Actualizados en tiempo real. Todos los precios son finales.</p>

        {cargando ? (
          <div className="precios__loading">
            <div className="precios__spinner" />
            <p>Cargando precios...</p>
          </div>
        ) : (
          <>
            {/* Filtros */}
            <div className="precios__filtros">
              <div className="precios__search">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
                </svg>
                <input
                  type="text"
                  placeholder="Buscar producto..."
                  value={busqueda}
                  onChange={(e) => handleBusqueda(e.target.value)}
                  className="precios__input"
                />
                {busqueda && (
                  <button className="precios__clear" onClick={() => handleBusqueda('')} aria-label="Limpiar búsqueda">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 6 6 18M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>

              <div className="precios__cats">
                {CATEGORIAS.map((cat) => (
                  <button
                    key={cat.value}
                    className={`precios__cat ${categoria === cat.value ? 'precios__cat--active' : ''}`}
                    onClick={() => handleCategoria(cat.value as CategoriaFilter)}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Tabla desktop */}
            <div className="precios__tabla-wrap">
              <table className="precios__tabla">
                <thead>
                  <tr>
                    <th>Producto</th>
                    <th>Categoría</th>
                    <th>Talle</th>
                    <th>Precio mayorista</th>
                  </tr>
                </thead>
                <tbody>
                  {productosPagina.length > 0 ? (
                    productosPagina.map((p) => (
                      <tr key={p._id}>
                        <td className="precios__nombre">{p.nombre}</td>
                        <td>
                          <span className="precios__badge-cat">
                            {CATEGORIAS.find((c) => c.value === p.categoria)?.label ?? p.categoria}
                          </span>
                        </td>
                        <td>{p.talle !== 'unico' ? p.talle : '—'}</td>
                        <td className="precios__precio">
                          ${p.precio.toLocaleString('es-AR')}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="precios__empty">
                        No se encontraron productos con esos filtros.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Cards mobile */}
            <div className="precios__cards">
              {productosPagina.length > 0 ? (
                productosPagina.map((p) => (
                  <div key={p._id} className="precios__card">
                    <div className="precios__card-top">
                      <span className="precios__nombre">{p.nombre}</span>
                      <span className="precios__precio">${p.precio.toLocaleString('es-AR')}</span>
                    </div>
                    <div className="precios__card-bottom">
                      <span className="precios__badge-cat">
                        {CATEGORIAS.find((c) => c.value === p.categoria)?.label ?? p.categoria}
                      </span>
                      {p.talle && p.talle !== 'unico' && (
                        <span className="precios__talle">{p.talle}</span>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="precios__empty">No se encontraron productos con esos filtros.</p>
              )}
            </div>

            {/* Paginación */}
            {totalPaginas > 1 && (
              <div className="precios__paginacion">
                <button
                  className="precios__pag-btn"
                  onClick={() => setPagina((p) => p - 1)}
                  disabled={pagina === 1}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M15 18l-6-6 6-6" />
                  </svg>
                  Anterior
                </button>

                <span className="precios__pag-info">
                  {pagina} / {totalPaginas}
                </span>

                <button
                  className="precios__pag-btn"
                  onClick={() => setPagina((p) => p + 1)}
                  disabled={pagina === totalPaginas}
                >
                  Siguiente
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                </button>
              </div>
            )}

            {/* Contador */}
            <p className="precios__contador">
              Mostrando {productosPagina.length} de {productosFiltrados.length} productos
            </p>
          </>
        )}

      </div>
    </section>
  )
}