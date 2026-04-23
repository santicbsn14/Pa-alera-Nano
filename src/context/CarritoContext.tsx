// src/context/CarritoContext.tsx
import { createContext, useContext, useState, useCallback } from 'react'
import type { Producto } from '../types'

export interface ItemCarrito {
  itemId: string // único por item — para combos es _id+timestamp, para el resto es _id
  producto: Producto
  cantidad: number
  tallesCombo?: { producto: string; talle: string }[]
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
  agregar: (producto: Producto, tallesCombo?: { producto: string; talle: string }[]) => void
  quitar: (itemId: string) => void
  cambiarCantidad: (itemId: string, cantidad: number) => void
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

  const agregar = useCallback((producto: Producto, tallesCombo?: { producto: string; talle: string }[]) => {
    const esCombo = producto.categoria === 'combos'

    setItems((prev) => {
      if (esCombo) {
        // Cada combo es un item separado con id único
        const itemId = `${producto._id}-${Date.now()}`
        return [...prev, { itemId, producto, cantidad: 1, tallesCombo }]
      } else {
        // Productos normales se agrupan por _id
        const existe = prev.find((i) => i.itemId === producto._id)
        if (existe) {
          return prev.map((i) =>
            i.itemId === producto._id ? { ...i, cantidad: i.cantidad + 1 } : i
          )
        }
        return [...prev, { itemId: producto._id, producto, cantidad: 1 }]
      }
    })

    const id = Date.now()
    setToast({ mensaje: producto.nombre, id })
    setTimeout(() => setToast((prev) => prev?.id === id ? null : prev), 2500)
  }, [])

  const quitar = useCallback((itemId: string) => {
    setItems((prev) => prev.filter((i) => i.itemId !== itemId))
  }, [])

  const cambiarCantidad = useCallback((itemId: string, cantidad: number) => {
    if (cantidad < 1) return
    setItems((prev) =>
      prev.map((i) => (i.itemId === itemId ? { ...i, cantidad } : i))
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