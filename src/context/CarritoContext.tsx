// src/context/CarritoContext.tsx
import { createContext, useContext, useState, useCallback } from 'react'
import type { Producto } from '../types'

export interface ItemCarrito {
  producto: Producto
  cantidad: number
}

interface ToastInfo {
  mensaje: string
  id: number
}

interface CarritoContextType {
  items: ItemCarrito[]
  abierto: boolean
  totalItems: number
  toast: ToastInfo | null
  agregar: (producto: Producto) => void
  quitar: (id: string) => void
  cambiarCantidad: (id: string, cantidad: number) => void
  vaciar: () => void
  abrirCarrito: () => void
  cerrarCarrito: () => void
}

const CarritoContext = createContext<CarritoContextType | null>(null)

export function CarritoProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ItemCarrito[]>([])
  const [abierto, setAbierto] = useState(false)
  const [toast, setToast] = useState<ToastInfo | null>(null)

  const totalItems = items.reduce((acc, i) => acc + i.cantidad, 0)

  const agregar = useCallback((producto: Producto) => {
    setItems((prev) => {
      const existe = prev.find((i) => i.producto._id === producto._id)
      if (existe) {
        return prev.map((i) =>
          i.producto._id === producto._id
            ? { ...i, cantidad: i.cantidad + 1 }
            : i
        )
      }
      return [...prev, { producto, cantidad: 1 }]
    })

    // Mostrar toast global
    const id = Date.now()
    setToast({ mensaje: producto.nombre, id })
    setTimeout(() => setToast((prev) => prev?.id === id ? null : prev), 2500)
  }, [])

  const quitar = useCallback((id: string) => {
    setItems((prev) => prev.filter((i) => i.producto._id !== id))
  }, [])

  const cambiarCantidad = useCallback((id: string, cantidad: number) => {
    if (cantidad < 1) return
    setItems((prev) =>
      prev.map((i) => (i.producto._id === id ? { ...i, cantidad } : i))
    )
  }, [])

  const vaciar = useCallback(() => setItems([]), [])
  const abrirCarrito = useCallback(() => setAbierto(true), [])
  const cerrarCarrito = useCallback(() => setAbierto(false), [])

  return (
    <CarritoContext.Provider value={{
      items, abierto, totalItems, toast,
      agregar, quitar, cambiarCantidad, vaciar,
      abrirCarrito, cerrarCarrito,
    }}>
      {children}
    </CarritoContext.Provider>
  )
}

export function useCarrito() {
  const ctx = useContext(CarritoContext)
  if (!ctx) throw new Error('useCarrito debe usarse dentro de CarritoProvider')
  return ctx
}