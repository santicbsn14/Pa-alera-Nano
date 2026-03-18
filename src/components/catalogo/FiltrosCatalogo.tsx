// src/components/catalogo/FiltrosCatalogo.tsx
import { useState } from 'react'
import { CATEGORIAS, TALLES } from '../../data/mocks'
import type { FiltrosCatalogo as FiltrosType } from '../../types'
import './FiltrosCatalogo.css'

interface Props {
  filtros: FiltrosType
  onChange: (filtros: FiltrosType) => void
  total: number
}

export default function FiltrosCatalogo({ filtros, onChange, total }: Props) {
  const [mobileOpen, setMobileOpen] = useState(false)

  const update = (key: keyof FiltrosType, value: string | boolean) => {
    onChange({ ...filtros, [key]: value, ...(key !== 'busqueda' ? {} : {}) })
  }

  const limpiar = () => {
    onChange({ categoria: 'todas', talle: 'todos', marca: '', soloStock: false, busqueda: '' })
  }

  const hayFiltros = filtros.categoria !== 'todas' || filtros.talle !== 'todos' || filtros.busqueda !== '' || filtros.soloStock

  const contenidoFiltros = (
    <div className="filtros__contenido">

      {/* Buscador */}
      <div className="filtros__grupo">
        <label className="filtros__label">Buscar</label>
        <div className="filtros__search">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
          </svg>
          <input
            type="text"
            placeholder="Nombre del producto..."
            value={filtros.busqueda}
            onChange={(e) => update('busqueda', e.target.value)}
            className="filtros__input"
          />
          {filtros.busqueda && (
            <button onClick={() => update('busqueda', '')} className="filtros__clear" aria-label="Limpiar">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Categoría */}
      <div className="filtros__grupo">
        <label className="filtros__label">Categoría</label>
        <div className="filtros__opciones">
          {CATEGORIAS.map((cat) => (
            <button
              key={cat.value}
              className={`filtros__opcion ${filtros.categoria === cat.value ? 'filtros__opcion--active' : ''}`}
              onClick={() => update('categoria', cat.value)}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Talle */}
      <div className="filtros__grupo">
        <label className="filtros__label">Talle</label>
        <div className="filtros__opciones filtros__opciones--talles">
          {TALLES.map((t) => (
            <button
              key={t.value}
              className={`filtros__opcion filtros__opcion--talle ${filtros.talle === t.value ? 'filtros__opcion--active' : ''}`}
              onClick={() => update('talle', t.value)}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Solo en stock */}
      <div className="filtros__grupo">
        <label className="filtros__label">Disponibilidad</label>
        <button
          className={`filtros__toggle ${filtros.soloStock ? 'filtros__toggle--active' : ''}`}
          onClick={() => update('soloStock', !filtros.soloStock)}
        >
          <div className="filtros__toggle-dot" />
          Solo productos en stock
        </button>
      </div>

      {/* Limpiar */}
      {hayFiltros && (
        <button className="filtros__limpiar" onClick={limpiar}>
          Limpiar filtros
        </button>
      )}

      <p className="filtros__total">{total} productos encontrados</p>

    </div>
  )

  return (
    <>
      {/* Sidebar desktop */}
      <aside className="filtros filtros--desktop">
        <h3 className="filtros__titulo">Filtros</h3>
        {contenidoFiltros}
      </aside>

      {/* Botón mobile */}
      <div className="filtros--mobile-trigger">
        <button
          className={`filtros__mobile-btn ${hayFiltros ? 'filtros__mobile-btn--active' : ''}`}
          onClick={() => setMobileOpen(true)}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="4" y1="6" x2="20" y2="6" /><line x1="8" y1="12" x2="20" y2="12" /><line x1="12" y1="18" x2="20" y2="18" />
          </svg>
          Filtros {hayFiltros && <span className="filtros__mobile-dot" />}
        </button>
        <span className="filtros__total-mobile">{total} productos</span>
      </div>

      {/* Sheet mobile */}
      {mobileOpen && (
        <div className="filtros__sheet-overlay" onClick={() => setMobileOpen(false)}>
          <div className="filtros__sheet" onClick={(e) => e.stopPropagation()}>
            <div className="filtros__sheet-header">
              <h3 className="filtros__titulo">Filtros</h3>
              <button onClick={() => setMobileOpen(false)} className="filtros__sheet-close" aria-label="Cerrar">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
            {contenidoFiltros}
            <button className="filtros__sheet-aplicar btn-primary" onClick={() => setMobileOpen(false)}>
              Ver {total} productos
            </button>
          </div>
        </div>
      )}
    </>
  )
}