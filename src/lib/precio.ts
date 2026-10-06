// src/lib/precio.ts

/**
 * Devuelve el precio real de venta. El descuento es solo visual (ver precioTachado),
 * así que el precio de Sanity se cobra tal cual.
 */
export function precioFinal(producto: { precio: number; descuento?: number }): number {
  return producto.precio
}

/**
 * Precio tachado "inflado" a partir del precio real: precio * (1 + descuento/100).
 * Es intencional que la diferencia real no coincida exacto con el badge -X%.
 */
export function precioTachado(producto: { precio: number; descuento?: number }): number {
  if (!producto.descuento || producto.descuento <= 0) return producto.precio
  return Math.round(producto.precio * (1 + producto.descuento / 100))
}

/** True si el producto tiene descuento activo */
export function tieneDescuento(producto: { descuento?: number }): boolean {
  return !!producto.descuento && producto.descuento > 0
}
