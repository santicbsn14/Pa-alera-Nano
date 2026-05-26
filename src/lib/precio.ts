// src/lib/precio.ts

/** Devuelve el precio final aplicando descuento si existe */
export function precioFinal(producto: { precio: number; descuento?: number }): number {
  if (!producto.descuento || producto.descuento <= 0) return producto.precio
  return Math.round(producto.precio * (1 - producto.descuento / 100))
}

/** True si el producto tiene descuento activo */
export function tieneDescuento(producto: { descuento?: number }): boolean {
  return !!producto.descuento && producto.descuento > 0
}