// src/App.tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { CarritoProvider } from './context/CarritoContext'
import Layout from './components/layout/Layout'
import ModalCarrito from './components/carrito/ModalCarrito'
import Toast from './components/carrito/Toast'
import Home from './pages/Home'
import Catalogo from './pages/Catalogo'

export default function App() {
  return (
    <BrowserRouter>
      <CarritoProvider>
        <Toast />
        <ModalCarrito />
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="catalogo" element={<Catalogo />} />
          </Route>
        </Routes>
      </CarritoProvider>
    </BrowserRouter>
  )
}