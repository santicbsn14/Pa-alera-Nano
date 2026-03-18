// src/components/layout/Header.tsx
import { useState, useEffect } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import bebe from '../../assets/bebe.png'
import './Header.css'

export default function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Cerrar menú al cambiar de página
  useEffect(() => {
    return () => setMenuOpen(false)
  }, [location])

  // Bloquear scroll cuando el menú está abierto en mobile
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  return (
    <header className={`header ${scrolled ? 'header--scrolled' : ''}`}>
      <div className="container header__inner">

        {/* Logo */}
        <NavLink to="/" className="header__logo">
          <div className="header__logo-icon">
            <img src={bebe} alt="Nano" className="header__logo-bebe" />
          </div>
          <div className="header__logo-text">
            <span className="header__logo-name">Nano</span>
            <span className="header__logo-sub">Mayorista</span>
          </div>
        </NavLink>

        {/* Nav desktop */}
        <nav className="header__nav">
          <NavLink to="/" end className={({ isActive }) => `header__link ${isActive ? 'header__link--active' : ''}`}>
            Inicio
          </NavLink>
          <NavLink to="/catalogo" className={({ isActive }) => `header__link ${isActive ? 'header__link--active' : ''}`}>
            Catálogo
          </NavLink>
          <a href="/#precios" className="header__link">Precios</a>
          <a href="/#contacto" className="header__link">Contacto</a>
        </nav>

        {/* CTA desktop */}
        <a
          href="https://wa.me/NUMERO"
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary header__cta"
        >
          Hacer pedido
        </a>

        {/* Hamburguesa mobile */}
        <button
          className={`header__burger ${menuOpen ? 'header__burger--open' : ''}`}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
        >
          <span />
          <span />
          <span />
        </button>
      </div>

      {/* Menú mobile */}
      <div className={`header__mobile ${menuOpen ? 'header__mobile--open' : ''}`}>
        <nav className="header__mobile-nav">
          <NavLink to="/" end className={({ isActive }) => `header__mobile-link ${isActive ? 'header__mobile-link--active' : ''}`}>
            Inicio
          </NavLink>
          <NavLink to="/catalogo" className={({ isActive }) => `header__mobile-link ${isActive ? 'header__mobile-link--active' : ''}`}>
            Catálogo
          </NavLink>
          <a href="/#precios" className="header__mobile-link" onClick={() => setMenuOpen(false)}>Precios</a>
          <a href="/#contacto" className="header__mobile-link" onClick={() => setMenuOpen(false)}>Contacto</a>

          <a
            href="https://wa.me/NUMERO"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary header__mobile-cta"
          >
            Hacer pedido
          </a>
        </nav>
      </div>
    </header>
  )
}