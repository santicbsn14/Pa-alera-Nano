// src/components/catalogo/PromosMini.tsx
// Mini carrusel de promos arriba del catálogo de NanoYA (solo minorista, lo monta Catalogo.tsx).
// - Franja apaisada 40:9, un banner por vista, scroll horizontal nativo con scroll-snap.
// - Autoplay cada 5 s (vuelve al primero al llegar al último). Se pausa con mouse encima,
//   foco adentro, interacción sobre el track (retoma 6 s después), pestaña oculta.
//   Sin autoplay con prefers-reduced-motion. Con 1 solo banner: sin puntitos ni autoplay.
// - Sin listeners globales en window: el catálogo tiene mucho scroll y toques.
// Origen de las imágenes:
//   1. MODO_MAQUETA → banners estáticos de src/assets/nanoya/banners/ (orden por nombre).
//   2. Si no hay estáticos (o no es maqueta) → getPromos() de Sanity.
// En el brief 06 los banners pasan a salir de Sanity (`promo.canal` minorista/ambas) y se
// borra la carpeta estática.
import { useCallback, useEffect, useRef, useState } from 'react'
import { getPromos, urlFor } from '../../lib/sanity'
import { MODO_MAQUETA } from '../../config/canal'
import './PromosMini.css'

const AUTOPLAY_MS = 5000
const REANUDAR_MS = 6000

interface Banner {
  key: string
  src: string
  alt: string
}

// Banners estáticos de la maqueta (eager: quedan como URLs en el bundle).
const ARCHIVOS_ESTATICOS = import.meta.glob('../../assets/nanoya/banners/*.{png,jpg,jpeg,webp}', {
  eager: true,
  import: 'default',
}) as Record<string, string>

const BANNERS_ESTATICOS: Banner[] = MODO_MAQUETA
  ? Object.keys(ARCHIVOS_ESTATICOS)
      .sort()
      .map((ruta) => ({ key: ruta, src: ARCHIVOS_ESTATICOS[ruta], alt: 'NanoYA' }))
  : []

export default function PromosMini() {
  // null = cargando (se muestra el placeholder del mismo tamaño)
  const [banners, setBanners] = useState<Banner[] | null>(
    BANNERS_ESTATICOS.length > 0 ? BANNERS_ESTATICOS : null
  )
  const [activo, setActivo] = useState(0)

  const trackRef = useRef<HTMLDivElement>(null)
  const rootRef = useRef<HTMLElement>(null)
  const autoplayRef = useRef<number | null>(null)
  const reanudarRef = useRef<number | null>(null)
  const hoverRef = useRef(false)
  const focoRef = useRef(false)
  const interaccionRef = useRef(false)
  const activoRef = useRef(0)

  const [reducedMotion] = useState(
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )

  // ── Carga desde Sanity si no hay banners estáticos ────────────────
  useEffect(() => {
    if (BANNERS_ESTATICOS.length > 0) return
    let cancelado = false
    getPromos()
      .then((promos) => {
        if (cancelado) return
        setBanners(
          promos
            .filter((p) => !!p.imagen)
            .map((p) => ({
              key: p._id,
              src: urlFor(p.imagen!).width(1600).height(360).fit('crop').auto('format').quality(80).url(),
              alt: p.alt || 'NanoYA',
            }))
        )
      })
      .catch(() => {
        if (!cancelado) setBanners([])
      })
    return () => {
      cancelado = true
    }
  }, [])

  const total = banners?.length ?? 0
  const multiple = total > 1

  // ── Navegación ────────────────────────────────────────────────────
  const irA = useCallback((indice: number) => {
    const track = trackRef.current
    if (!track) return
    track.scrollTo({ left: indice * track.clientWidth, behavior: reducedMotion ? 'auto' : 'smooth' })
  }, [reducedMotion])

  const onScroll = useCallback(() => {
    const track = trackRef.current
    if (!track || track.clientWidth === 0) return
    const indice = Math.round(track.scrollLeft / track.clientWidth)
    if (indice !== activoRef.current) {
      activoRef.current = indice
      setActivo(indice)
    }
  }, [])

  // ── Autoplay ──────────────────────────────────────────────────────
  const detener = useCallback(() => {
    if (autoplayRef.current !== null) {
      window.clearInterval(autoplayRef.current)
      autoplayRef.current = null
    }
  }, [])

  const arrancar = useCallback(() => {
    detener()
    if (!multiple || reducedMotion) return
    if (hoverRef.current || focoRef.current || interaccionRef.current || document.hidden) return
    autoplayRef.current = window.setInterval(() => {
      const siguiente = activoRef.current + 1 >= total ? 0 : activoRef.current + 1
      irA(siguiente)
    }, AUTOPLAY_MS)
  }, [detener, irA, multiple, reducedMotion, total])

  // Pausa por interacción sobre el track; retoma REANUDAR_MS después de la última.
  const onInteraccion = useCallback(() => {
    interaccionRef.current = true
    detener()
    if (reanudarRef.current !== null) window.clearTimeout(reanudarRef.current)
    reanudarRef.current = window.setTimeout(() => {
      interaccionRef.current = false
      reanudarRef.current = null
      arrancar()
    }, REANUDAR_MS)
  }, [arrancar, detener])

  useEffect(() => {
    arrancar()
    const onVisibilidad = () => (document.hidden ? detener() : arrancar())
    document.addEventListener('visibilitychange', onVisibilidad)
    return () => {
      document.removeEventListener('visibilitychange', onVisibilidad)
      detener()
    }
  }, [arrancar, detener])

  // Listeners de interacción sobre el track (no en window).
  useEffect(() => {
    const track = trackRef.current
    if (!track || !multiple) return
    track.addEventListener('pointerdown', onInteraccion)
    track.addEventListener('touchstart', onInteraccion, { passive: true })
    track.addEventListener('wheel', onInteraccion, { passive: true })
    return () => {
      track.removeEventListener('pointerdown', onInteraccion)
      track.removeEventListener('touchstart', onInteraccion)
      track.removeEventListener('wheel', onInteraccion)
    }
  }, [multiple, onInteraccion, banners])

  useEffect(() => {
    return () => {
      if (reanudarRef.current !== null) window.clearTimeout(reanudarRef.current)
    }
  }, [])

  // ── Render ────────────────────────────────────────────────────────
  if (banners === null) {
    return (
      <section className="promos-mini container" aria-hidden="true">
        <div className="promos-mini__placeholder" />
      </section>
    )
  }

  if (total === 0) return null

  return (
    <section
      ref={rootRef}
      className="promos-mini container"
      aria-roledescription="carrusel"
      aria-label="Promociones"
      onMouseEnter={() => { hoverRef.current = true; detener() }}
      onMouseLeave={() => { hoverRef.current = false; arrancar() }}
      onFocus={() => { focoRef.current = true; detener() }}
      onBlur={(e) => {
        if (rootRef.current && e.relatedTarget instanceof Node && rootRef.current.contains(e.relatedTarget)) return
        focoRef.current = false
        arrancar()
      }}
    >
      <div className="promos-mini__track" ref={trackRef} onScroll={onScroll}>
        {banners.map((b, i) => (
          <div
            key={b.key}
            className="promos-mini__slide"
            aria-roledescription="slide"
            aria-label={`${i + 1} de ${total}`}
          >
            <img
              src={b.src}
              alt={b.alt}
              className="promos-mini__img"
              loading={i === 0 ? 'eager' : 'lazy'}
              draggable={false}
            />
          </div>
        ))}
      </div>

      {multiple && (
        <div className="promos-mini__dots">
          {banners.map((b, i) => (
            <button
              key={b.key}
              type="button"
              className={`promos-mini__dot ${i === activo ? 'promos-mini__dot--active' : ''}`}
              onClick={() => irA(i)}
              aria-label={`Ir al banner ${i + 1}`}
              aria-current={i === activo}
            />
          ))}
        </div>
      )}
    </section>
  )
}
