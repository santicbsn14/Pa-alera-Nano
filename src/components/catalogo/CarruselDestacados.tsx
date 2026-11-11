// src/components/catalogo/CarruselDestacados.tsx
// Carrusel de destacados del catálogo mayorista (singleton "carruselDestacados" en Sanity).
// - Desktop/tablet (> 768px): franja con las CardProducto completas.
// - Mobile (≤ 768px): mosaico compacto; al tocar un item se abre una ficha (bottom sheet)
//   con la CardProducto real.
// ⚠️ Nada que cree containing block (transform, filter, will-change, contain…) alrededor de
//   las cards: el modal de talles de combos es position: fixed y vive dentro de CardProducto.
// ⚠️ Solo canal mayorista: al integrar NanoYA, devolver null en minorista.
import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import { getCarruselDestacados, urlFor } from '../../lib/sanity'
import { precioFinal, precioTachado, tieneDescuento } from '../../lib/precio'
import type { CarruselDestacados as CarruselData, Producto } from '../../types'
import CardProducto from './CardProducto'
import './CarruselDestacados.css'

const AUTOPLAY_MS = 3500
const REANUDAR_MS = 6000
const QUERY_MOBILE = '(max-width: 768px)'

// ── Hook: versión mobile/desktop según ancho ───────────────────────
function useEsMobile(): boolean {
  const [esMobile, setEsMobile] = useState(() => window.matchMedia(QUERY_MOBILE).matches)

  useEffect(() => {
    const mql = window.matchMedia(QUERY_MOBILE)
    const onChange = (e: MediaQueryListEvent) => setEsMobile(e.matches)
    mql.addEventListener('change', onChange)
    return () => mql.removeEventListener('change', onChange)
  }, [])

  return esMobile
}

// ── Hook: scroll nativo + autoplay + pausas + barra de progreso ────
// Todo el estado del autoplay vive en refs para no re-renderizar en cada tick.
function useCarrusel<R extends HTMLElement>(pausaExterna: boolean) {
  const rootRef = useRef<R>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const barRef = useRef<HTMLDivElement>(null)
  const [scrolleable, setScrolleable] = useState(false)

  const timerRef = useRef<number | null>(null)
  const pausas = useRef({ hover: false, foco: false, interaccion: false, oculto: false, externa: false })
  const scrolleableRef = useRef(false)
  const reducedRef = useRef(false)
  const actualizarRef = useRef<() => void>(() => {})

  const pasoSlide = useCallback((): number => {
    const track = trackRef.current
    const primero = track?.firstElementChild as HTMLElement | null
    if (!track || !primero) return 0
    const gap = parseFloat(getComputedStyle(track).columnGap) || 0
    return primero.getBoundingClientRect().width + gap
  }, [])

  const avanzar = useCallback(() => {
    const track = trackRef.current
    if (!track) return
    if (track.scrollLeft + track.clientWidth >= track.scrollWidth - 4) {
      track.scrollTo({ left: 0, behavior: 'smooth' })
    } else {
      track.scrollBy({ left: pasoSlide(), behavior: 'smooth' })
    }
  }, [pasoSlide])

  const retroceder = useCallback(() => {
    const track = trackRef.current
    if (!track) return
    if (track.scrollLeft <= 4) {
      track.scrollTo({ left: track.scrollWidth, behavior: 'smooth' })
    } else {
      track.scrollBy({ left: -pasoSlide(), behavior: 'smooth' })
    }
  }, [pasoSlide])

  // Arranca o frena el timer según las pausas activas.
  useEffect(() => {
    const limpiar = () => {
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current)
        timerRef.current = null
      }
    }
    const programar = () => {
      limpiar()
      timerRef.current = window.setTimeout(() => {
        timerRef.current = null
        avanzar()
        actualizarRef.current()
      }, AUTOPLAY_MS)
    }
    actualizarRef.current = () => {
      const p = pausas.current
      const pausado =
        p.hover || p.foco || p.interaccion || p.oculto || p.externa ||
        reducedRef.current || !scrolleableRef.current
      if (pausado) limpiar()
      else if (timerRef.current === null) programar()
    }
    return () => {
      limpiar()
      actualizarRef.current = () => {}
    }
  }, [avanzar])

  // Pausa externa (ficha mobile abierta).
  useEffect(() => {
    pausas.current.externa = pausaExterna
    actualizarRef.current()
  }, [pausaExterna])

  // Listeners: hover, foco, interacción, pestaña oculta, reduced motion, resize, scroll.
  useEffect(() => {
    const root = rootRef.current
    const track = trackRef.current
    if (!root || !track) return
    const p = pausas.current
    let reanudarId: number | null = null
    let rafId: number | null = null

    const set = (k: 'hover' | 'foco' | 'interaccion' | 'oculto', v: boolean) => {
      p[k] = v
      actualizarRef.current()
    }

    // Hover solo con mouse real: en touch el mouseenter emulado dejaría la pausa colgada.
    const onEnter = (e: PointerEvent) => { if (e.pointerType === 'mouse') set('hover', true) }
    const onLeave = (e: PointerEvent) => { if (e.pointerType === 'mouse') set('hover', false) }
    // Solo foco de teclado: el foco que deja un tap/click no debe frenar el autoplay para siempre.
    const onFocusIn = (e: FocusEvent) => {
      const t = e.target as HTMLElement | null
      if (t?.matches?.(':focus-visible')) set('foco', true)
    }
    const onFocusOut = (e: FocusEvent) => {
      if (!root.contains(e.relatedTarget as Node | null)) set('foco', false)
    }
    const onInteraccion = () => {
      set('interaccion', true)
      if (reanudarId !== null) window.clearTimeout(reanudarId)
      reanudarId = window.setTimeout(() => {
        reanudarId = null
        set('interaccion', false)
      }, REANUDAR_MS)
    }
    const onVisibilidad = () => set('oculto', document.hidden)

    const mqlReduced = window.matchMedia('(prefers-reduced-motion: reduce)')
    reducedRef.current = mqlReduced.matches
    const onReduced = (e: MediaQueryListEvent) => {
      reducedRef.current = e.matches
      actualizarRef.current()
    }

    const pintarProgreso = () => {
      rafId = null
      const bar = barRef.current
      if (!bar || track.scrollWidth === 0) return
      const pct = Math.min(100, ((track.scrollLeft + track.clientWidth) / track.scrollWidth) * 100)
      bar.style.width = `${pct}%`
    }
    const onScroll = () => {
      if (rafId === null) rafId = window.requestAnimationFrame(pintarProgreso)
    }

    // Se recalcula en cada resize del track (ResizeObserver también dispara al observar).
    const medir = () => {
      const s = track.scrollWidth > track.clientWidth
      scrolleableRef.current = s
      setScrolleable(s)
      actualizarRef.current()
      onScroll()
    }
    const ro = new ResizeObserver(medir)
    ro.observe(track)
    window.addEventListener('resize', medir)

    p.oculto = document.hidden
    root.addEventListener('pointerenter', onEnter)
    root.addEventListener('pointerleave', onLeave)
    root.addEventListener('focusin', onFocusIn)
    root.addEventListener('focusout', onFocusOut)
    track.addEventListener('pointerdown', onInteraccion)
    track.addEventListener('touchstart', onInteraccion, { passive: true })
    track.addEventListener('wheel', onInteraccion, { passive: true })
    track.addEventListener('scroll', onScroll, { passive: true })
    document.addEventListener('visibilitychange', onVisibilidad)
    mqlReduced.addEventListener('change', onReduced)

    return () => {
      ro.disconnect()
      window.removeEventListener('resize', medir)
      root.removeEventListener('pointerenter', onEnter)
      root.removeEventListener('pointerleave', onLeave)
      root.removeEventListener('focusin', onFocusIn)
      root.removeEventListener('focusout', onFocusOut)
      track.removeEventListener('pointerdown', onInteraccion)
      track.removeEventListener('touchstart', onInteraccion)
      track.removeEventListener('wheel', onInteraccion)
      track.removeEventListener('scroll', onScroll)
      document.removeEventListener('visibilitychange', onVisibilidad)
      mqlReduced.removeEventListener('change', onReduced)
      if (reanudarId !== null) window.clearTimeout(reanudarId)
      if (rafId !== null) window.cancelAnimationFrame(rafId)
      p.hover = false
      p.foco = false
      p.interaccion = false
    }
  }, [])

  // Pinta la barra apenas aparece (antes del primer scroll).
  useEffect(() => {
    const track = trackRef.current
    const bar = barRef.current
    if (!scrolleable || !track || !bar || track.scrollWidth === 0) return
    bar.style.width = `${Math.min(100, ((track.scrollLeft + track.clientWidth) / track.scrollWidth) * 100)}%`
  }, [scrolleable])

  // Flechas: mueven y reinician el timer.
  const reiniciar = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current)
      timerRef.current = null
    }
    actualizarRef.current()
  }, [])
  const siguiente = useCallback(() => { avanzar(); reiniciar() }, [avanzar, reiniciar])
  const anterior = useCallback(() => { retroceder(); reiniciar() }, [retroceder, reiniciar])

  return { rootRef, trackRef, barRef, scrolleable, siguiente, anterior }
}

// ── Íconos ─────────────────────────────────────────────────────────
function IconoPlaceholder() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <path d="M21 15l-5-5L5 21" />
    </svg>
  )
}

// ── Desktop / tablet ───────────────────────────────────────────────
function DestacadosDesktop({ titulo, productos }: CarruselData) {
  const { rootRef, trackRef, barRef, scrolleable, siguiente, anterior } = useCarrusel<HTMLElement>(false)

  return (
    <section ref={rootRef} className="destacados" aria-roledescription="carrusel" aria-label={titulo}>
      <div className="container">
        <div className="destacados__head">
          <div>
            <span className="destacados__eyebrow">Selección Nano</span>
            <h2 className="destacados__titulo">{titulo}</h2>
          </div>
          {scrolleable && (
            <div className="destacados__nav">
              <button type="button" className="destacados__flecha" onClick={anterior} aria-label="Anterior">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 18l-6-6 6-6" />
                </svg>
              </button>
              <button type="button" className="destacados__flecha" onClick={siguiente} aria-label="Siguiente">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </button>
            </div>
          )}
        </div>

        <div ref={trackRef} className="destacados__track">
          {productos.map((p) => (
            <div key={p._id} className="destacados__slide">
              <CardProducto producto={p} />
            </div>
          ))}
        </div>

        {scrolleable && (
          <div className="destacados__progress">
            <div ref={barRef} className="destacados__progress-bar" />
          </div>
        )}
      </div>
    </section>
  )
}

// ── Mobile: ficha (bottom sheet) ───────────────────────────────────
function FichaMobile({ producto, onCerrar }: { producto: Producto; onCerrar: () => void }) {
  const cerrarRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null
    cerrarRef.current?.focus()
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCerrar()
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('keydown', onKey)
      // Se restaura al cerrar Y al desmontar (ej. "Ver pack" navega fuera de /catalogo).
      document.body.style.overflow = ''
      if (opener?.isConnected) opener.focus({ preventScroll: true })
    }
  }, [onCerrar])

  return createPortal(
    <div
      className="destacados-sheet"
      onClick={(e) => {
        if (e.target === e.currentTarget) onCerrar()
      }}
    >
      <div className="destacados-sheet__panel" role="dialog" aria-modal="true" aria-label={producto.nombre}>
        <span className="destacados-sheet__handle" aria-hidden="true" />
        <button ref={cerrarRef} type="button" className="destacados-sheet__cerrar" onClick={onCerrar} aria-label="Cerrar">
          <span className="destacados-sheet__cerrar-circulo">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </span>
        </button>
        <div className="destacados-sheet__card">
          <CardProducto producto={producto} />
        </div>
      </div>
    </div>,
    document.body
  )
}

// ── Mobile: mosaico compacto ───────────────────────────────────────
function DestacadosMobile({ titulo, productos }: CarruselData) {
  const navigate = useNavigate()
  const [sel, setSel] = useState<Producto | null>(null)
  const { rootRef, trackRef, barRef, scrolleable } = useCarrusel<HTMLDivElement>(sel !== null)
  const cerrar = useCallback(() => setSel(null), [])

  const tocar = (p: Producto) => {
    if (p.categoria?.slug === 'bolsones') {
      if (p.slug) navigate('/bolson/' + p.slug)
      return
    }
    setSel(p)
  }

  return (
    <section className="destacados-m">
      <div ref={rootRef} className="destacados-m__tile" aria-roledescription="carrusel" aria-label={titulo}>
        <div className="destacados-m__head">
          <span className="destacados-m__head-titulo">
            <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true">
              <path fill="var(--color-celeste-dark)" d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
            <h2 className="destacados-m__titulo">{titulo}</h2>
          </span>
        </div>

        <div ref={trackRef} className="destacados-m__track">
          {productos.map((p) => {
            const conDescuento = tieneDescuento(p)
            return (
              <button key={p._id} type="button" className="destacados-m__item" aria-label={`Ver ${p.nombre}`} onClick={() => tocar(p)}>
                <span className="destacados-m__img">
                  {p.foto ? (
                    <img
                      src={urlFor(p.foto).width(176).height(176).fit('crop').auto('format').quality(70).url()}
                      alt=""
                      loading="lazy"
                    />
                  ) : (
                    <IconoPlaceholder />
                  )}
                  {conDescuento && <span className="destacados-m__badge">-{p.descuento}%</span>}
                </span>
                <span className="destacados-m__texto">
                  <span className="destacados-m__nombre">{p.nombre}</span>
                  <span className="destacados-m__precios">
                    {conDescuento && (
                      <span className="destacados-m__tachado">${precioTachado(p).toLocaleString('es-AR')}</span>
                    )}
                    <span className={`destacados-m__precio ${conDescuento ? 'destacados-m__precio--rebajado' : ''}`}>
                      ${precioFinal(p).toLocaleString('es-AR')}
                    </span>
                  </span>
                </span>
                <svg className="destacados-m__chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </button>
            )
          })}
        </div>

        {scrolleable && (
          <div className="destacados-m__progress">
            <div ref={barRef} className="destacados-m__progress-bar" />
          </div>
        )}
      </div>

      {sel && <FichaMobile producto={sel} onCerrar={cerrar} />}
    </section>
  )
}

// ── Componente principal ───────────────────────────────────────────
export default function CarruselDestacados() {
  const [data, setData] = useState<CarruselData | null>(null)
  const esMobile = useEsMobile()

  useEffect(() => {
    let cancelado = false
    getCarruselDestacados()
      .then((d) => {
        if (!cancelado) setData(d)
      })
      .catch(() => {
        if (!cancelado) setData(null)
      })
    return () => {
      cancelado = true
    }
  }, [])

  // Cargando, error o sin doc activo / sin productos en stock → el catálogo queda igual.
  if (!data) return null

  return esMobile
    ? <DestacadosMobile titulo={data.titulo} productos={data.productos} />
    : <DestacadosDesktop titulo={data.titulo} productos={data.productos} />
}
