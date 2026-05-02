// src/components/home/Hero.tsx
import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { getPromos } from '../../lib/sanity'
import { urlFor } from '../../lib/sanity'
import type { Promo } from '../../types'
import './Hero.css'

export default function Hero() {
  const [slides, setSlides] = useState<Promo[]>([])
  const [current, setCurrent] = useState(0)
  const [transitioning, setTransitioning] = useState(false)
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    getPromos()
      .then((data) => setSlides(data))
      .catch(() => setSlides([]))
      .finally(() => setCargando(false))
  }, [])

  const goTo = useCallback((index: number) => {
    if (transitioning) return
    setTransitioning(true)
    setCurrent(index)
    setTimeout(() => setTransitioning(false), 500)
  }, [transitioning])

  const prev = useCallback(() => {
    goTo(current === 0 ? slides.length - 1 : current - 1)
  }, [current, goTo, slides.length])

  const next = useCallback(() => {
    goTo(current === slides.length - 1 ? 0 : current + 1)
  }, [current, goTo, slides.length])

  useEffect(() => {
    if (slides.length === 0) return
    const timer = setInterval(next, 5000)
    return () => clearInterval(timer)
  }, [next, slides.length])

  useEffect(() => {
    let startX = 0
    const onTouchStart = (e: TouchEvent) => { startX = e.touches[0].clientX }
    const onTouchEnd = (e: TouchEvent) => {
      const diff = startX - e.changedTouches[0].clientX
      if (Math.abs(diff) > 50) diff > 0 ? next() : prev()
    }
    window.addEventListener('touchstart', onTouchStart, { passive: true })
    window.addEventListener('touchend', onTouchEnd, { passive: true })
    return () => {
      window.removeEventListener('touchstart', onTouchStart)
      window.removeEventListener('touchend', onTouchEnd)
    }
  }, [next, prev])

  return (
    <>
      <section className="hero">
        {cargando || slides.length === 0 ? (
          <div className="hero__placeholder" />
        ) : (
          <>
            <div className="hero__track">
              {slides.map((slide, i) => (
                <div key={slide._id} className={`hero__slide ${i === current ? 'hero__slide--active' : ''}`}>
                  {slide.imagen && (
                    <img
                      src={urlFor(slide.imagen).width(1200).fit('max').url()}
                      alt={slide.alt ?? 'Promo'}
                      className="hero__img"
                      loading={i === 0 ? 'eager' : 'lazy'}
                    />
                  )}
                </div>
              ))}
            </div>

            <button className="hero__arrow hero__arrow--prev" onClick={prev} aria-label="Anterior">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
            <button className="hero__arrow hero__arrow--next" onClick={next} aria-label="Siguiente">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>

            <div className="hero__dots">
              {slides.map((_, i) => (
                <button
                  key={i}
                  className={`hero__dot ${i === current ? 'hero__dot--active' : ''}`}
                  onClick={() => goTo(i)}
                  aria-label={`Ir al slide ${i + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </section>

      {/* Barra CTA */}
      <div className="hero__bar">
        <p className="hero__bar-text">
          <span>Abastecé tu negocio al mejor precio!</span>
          Armá tu pedido en Pedidos Nano.
        </p>
        <div className="hero__bar-actions">
          <Link to="/catalogo" className="btn-primary">
            Ir a Pedidos Nano
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </>
  )
}