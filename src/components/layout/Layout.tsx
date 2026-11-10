// src/components/layout/Layout.tsx
import { Outlet } from 'react-router-dom'
import Header from './Header'
import Footer from './Footer'
import BannerMaqueta from './BannerMaqueta'
import './Layout.css'

export default function Layout() {
  return (
    <div className="layout">
      <BannerMaqueta />
      <Header />
      <main className="main">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}