// src/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { CarritoProvider } from './context/CarritoContext'
import ErrorBoundary from './components/ErrorBoundary'
import Layout from './components/layout/Layout'
import ModalCarrito from './components/carrito/ModalCarrito'
import Toast from './components/carrito/Toast'
import Home from './pages/Home'
import Catalogo from './pages/Catalogo'
import Comprobante from './pages/Comprobante'
import BolsonDetalle from './pages/BolsonDetalle'
import CarritoFlotante from './components/carrito/CarritoFlotante'
import Admin from './pages/Admin'
import ComoComprarPage from './pages/ComoComprarPage'
import { ES_MINORISTA } from './config/canal'

export default function App() {

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <CarritoProvider>
          <Toast />
          <ModalCarrito />
          <CarritoFlotante />
          {ES_MINORISTA ? (
            // NanoYA: no hay Home, se entra directo al catálogo.
            // /catalogo redirige a / para que los links viejos sigan andando.
            <Routes>
              <Route path="/admin" element={<Admin />} />
              <Route path="/" element={<Layout />}>
                <Route index element={<Catalogo />} />
                <Route path="catalogo" element={<Navigate to="/" replace />} />
                <Route path="como-comprar" element={<ComoComprarPage />} />
                <Route path="comprobante" element={<Comprobante />} />
                <Route path="bolson/:slug" element={<BolsonDetalle />} />
              </Route>
            </Routes>
          ) : (
            <Routes>
              <Route path="/admin" element={<Admin />} />
              <Route path="/" element={<Layout />}>
                <Route index element={<Home />} />
                <Route path="catalogo" element={<Catalogo />} />
                <Route path="comprobante" element={<Comprobante />} />
                <Route path="bolson/:slug" element={<BolsonDetalle />} />
              </Route>
            </Routes>
          )}
        </CarritoProvider>
      </BrowserRouter>
    </ErrorBoundary>
  )
}
