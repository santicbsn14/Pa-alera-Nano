// src/config/canal.ts
// Configuración por canal de venta. El canal sale de VITE_CANAL:
//   - sin setear (Hostinger) o cualquier otro valor → 'mayorista' (comportamiento actual)
//   - 'minorista' → NanoYA
// VITE_MAQUETA === 'true' activa el modo maqueta (banner de prueba, precios de ejemplo).

export type Canal = 'mayorista' | 'minorista'

export const CANAL: Canal = import.meta.env.VITE_CANAL === 'minorista' ? 'minorista' : 'mayorista'
export const ES_MINORISTA = CANAL === 'minorista'
export const MODO_MAQUETA = import.meta.env.VITE_MAQUETA === 'true'

export interface ConfigCanal {
  marca: { nombre: string; sub: string }
  tituloPagina: string
  whatsapp: string
  minimoCompra: number
  ventaPorCaja: boolean
  categoriasExcluidas: string[]
  storageKeyCarrito: string
  textoFooter: string
}

export const CONFIG_POR_CANAL: Record<Canal, ConfigCanal> = {
  mayorista: {
    marca: { nombre: 'Nano', sub: 'Mayorista' },
    tituloPagina: 'Pañalera Nano',
    whatsapp: '5493412479055',
    minimoCompra: 150000,
    ventaPorCaja: true,
    categoriasExcluidas: [],
    storageKeyCarrito: 'nano_carrito_v2',
    textoFooter:
      'Distribuimos pañales, artículos de bebé, limpieza y perfumería al mejor precio mayorista. ' +
      'Trabajamos directo de fábrica con las principales marcas y llegamos a negocios de todo el país.',
  },
  minorista: {
    marca: { nombre: 'Nano', sub: 'YA' },
    tituloPagina: 'NanoYA — Pañalera Nano',
    whatsapp: '', // placeholder: Lean todavía no pasó el número de NanoYA
    minimoCompra: 0,
    ventaPorCaja: false,
    categoriasExcluidas: ['combos'],
    storageKeyCarrito: 'nanoya_carrito_v1',
    textoFooter: 'Pañales, artículos de bebé, limpieza y perfumería con envío a domicilio por Uber.',
  },
}

export const config: ConfigCanal = CONFIG_POR_CANAL[CANAL]
