// src/components/layout/Header.tsx
import { useState, useEffect } from 'react'
import { NavLink, useLocation, Link } from 'react-router-dom'
import { useCarrito } from '../../context/CarritoContext'
import bebe from '../../assets/bebe.png'
import './Header.css'

export default function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const { totalItems, abrirCarrito } = useCarrito()
  const location = useLocation()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    return () => setMenuOpen(false)
  }, [location])

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

        {/* Carrito */}
        <button className="header__carrito" onClick={abrirCarrito} aria-label="Ver pedido">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
            <path d="M1 1h4l2.68 13.39a2 2 0 001.99 1.61h9.72a2 2 0 001.99-1.61L23 6H6" />
          </svg>
          {totalItems > 0 && (
            <span className="header__carrito-badge">{totalItems}</span>
          )}
        </button>

        {/* CTA desktop */}
        <Link to="/catalogo" className="btn-primary header__cta">
          Ver catálogo
        </Link>

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

          <Link to="/catalogo" className="btn-primary header__mobile-cta" onClick={() => setMenuOpen(false)}>
            Ver catálogo
          </Link>
        </nav>
      </div>
    </header>
  )
}