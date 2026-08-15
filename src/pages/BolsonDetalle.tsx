// src/pages/BolsonDetalle.tsx
import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { getBolsonPorSlug, urlFor} from '../lib/sanity'
import { useCarrito } from '../context/CarritoContext'
import { precioFinal, tieneDescuento } from '../lib/precio'
import type { Producto } from '../types'
import './BolsonDetalle.css'

export default function BolsonDetalle() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const { agregar, cambiarCantidad, items } = useCarrito()

  const [bolson, setBolson] = useState<Producto | null>(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(false)
  const [imagenActiva, setImagenActiva] = useState(0)

useEffect(() => {
  if (!slug) {
    setError(true)
    setCargando(false)
    return
  }
  setCargando(true)
  setError(false)
  setImagenActiva(0)

  getBolsonPorSlug(slug)
    .then((data) => {
      if (!data) setError(true)
      else setBolson(data)
    })
    .catch(() => setError(true))
    .finally(() => setCargando(false))
}, [slug])

  if (cargando) {
    return (
      <div className="bolson-detalle__wrap container">
        <div className="bolson-detalle__loading">
          <div className="bolson-detalle__spinner" />
          <p>Cargando bolsón...</p>
        </div>
      </div>
    )
  }

  if (error || !bolson) {
    return (
      <div className="bolson-detalle__wrap container">
        <div className="bolson-detalle__empty">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <p>No encontramos este bolsón. Puede que ya no esté disponible.</p>
          <Link to="/catalogo" className="btn-secondary">Volver al catálogo</Link>
        </div>
      </div>
    )
  }

  // Galería: foto principal primero, después las de cada producto interno
  const imagenes = [
    ...(bolson.foto ? [{ img: bolson.foto, alt: bolson.nombre }] : []),
    ...(bolson.productosInternos ?? [])
      .filter((p) => p.imagen)
      .map((p) => ({ img: p.imagen!, alt: p.nombre })),
  ]

  const conDescuento = tieneDescuento(bolson)
  const precioMostrar = precioFinal(bolson)

  const itemEnCarrito = items.find((i) => i.itemId === bolson._id)
  const cantidad = itemEnCarrito?.cantidad ?? 0

  return (
    <div className="bolson-detalle__wrap container">
      <button className="bolson-detalle__volver" onClick={() => navigate(-1)}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 12H5M12 5l-7 7 7 7" />
        </svg>
        Volver
      </button>

      <div className="bolson-detalle__grid">

        {/* ── Galería ── */}
        <div className="bolson-detalle__galeria">
          <div className="bolson-detalle__img-principal">
            <span className="bolson-detalle__badge">Bolsón</span>
            {imagenes.length > 0 ? (
              <img
                src={urlFor(imagenes[imagenActiva].img).width(600).height(600).fit('crop').auto('format').quality(80).url()}
                alt={imagenes[imagenActiva].alt}
              />
            ) : (
              <div className="bolson-detalle__img-placeholder">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <path d="M21 15l-5-5L5 21" />
                </svg>
              </div>
            )}
          </div>

          {imagenes.length > 1 && (
            <div className="bolson-detalle__thumbs">
              {imagenes.map((im, i) => (
                <button
                  key={i}
                  className={`bolson-detalle__thumb ${i === imagenActiva ? 'bolson-detalle__thumb--active' : ''}`}
                  onClick={() => setImagenActiva(i)}
                  aria-label={`Ver imagen ${i + 1}`}
                >
                  <img src={urlFor(im.img).width(120).height(120).fit('crop').auto('format').quality(60).url()} alt={im.alt} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── Info ── */}
        <div className="bolson-detalle__info">
          <h1 className="bolson-detalle__nombre">{bolson.nombre}</h1>

          {bolson.descripcion && (
            <p className="bolson-detalle__descripcion">{bolson.descripcion}</p>
          )}

          <div className="bolson-detalle__precios">
            {conDescuento && (
              <span className="bolson-detalle__precio-original">
                ${bolson.precio.toLocaleString('es-AR')}
              </span>
            )}
            <span className={`bolson-detalle__precio ${conDescuento ? 'bolson-detalle__precio--rebajado' : ''}`}>
              ${precioMostrar.toLocaleString('es-AR')}
            </span>
            {conDescuento && (
              <span className="bolson-detalle__badge-descuento">-{bolson.descuento}%</span>
            )}
          </div>

          {!bolson.enStock && (
            <p className="bolson-detalle__sin-stock">Sin stock por el momento</p>
          )}

          {/* ── Agregar al carrito ── */}
          {cantidad === 0 ? (
            <button
              className="bolson-detalle__btn-agregar"
              onClick={() => agregar(bolson)}
              disabled={!bolson.enStock}
            >
              Agregar al pedido
            </button>
          ) : (
            <div className="bolson-detalle__contador">
              <button
                onClick={() => cambiarCantidad(bolson._id, cantidad - 1)}
                aria-label="Restar"
              >
                −
              </button>
              <span>{cantidad}</span>
              <button
                onClick={() => cambiarCantidad(bolson._id, cantidad + 1)}
                aria-label="Sumar"
              >
                +
              </button>
            </div>
          )}

          {/* ── Qué incluye ── */}
          {bolson.productosInternos && bolson.productosInternos.length > 0 && (
            <div className="bolson-detalle__incluye">
              <h2>Este bolsón incluye</h2>
              <div className="bolson-detalle__incluye-lista">
                {bolson.productosInternos.map((p, i) => (
                  <div key={p._key ?? i} className="bolson-detalle__incluye-item">
                    {p.imagen ? (
                      <img
                        src={urlFor(p.imagen).width(100).height(100).fit('crop').auto('format').quality(60).url()}
                        alt={p.nombre}
                      />
                    ) : (
                      <div className="bolson-detalle__incluye-placeholder" />
                    )}
                    <div>
                      <strong>{p.nombre}</strong>
                      {p.descripcionCorta && <p>{p.descripcionCorta}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}