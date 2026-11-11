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
  whatsappVisible: string
  horarios: string
  zonasEnvio: string[]
  textos: {
    linkCatalogo: string
    ctaHeader: string
    heroBarDestacado: string
    heroBarTexto: string
    heroBarBoton: string
    contactoSubtitulo: string
  }
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
    whatsappVisible: '+5493412479055',
    horarios: 'Lun a Sab · 9:00 — 12:30 y 17:00 — 20:30',
    zonasEnvio: [],
    textos: {
      linkCatalogo: 'Pedidos Nano',
      ctaHeader: 'Pedidos Nano',
      heroBarDestacado: 'Abastecé tu negocio al mejor precio!',
      heroBarTexto: 'Armá tu pedido en Pedidos Nano.',
      heroBarBoton: 'Ir a Pedidos Nano',
      contactoSubtitulo: 'Estamos en Villa Constitución, Santa Fe. Hacemos envíos a todo el país.',
    },
  },
  minorista: {
    marca: { nombre: 'Nano', sub: 'YA' },
    tituloPagina: 'NanoYA — Pañalera Nano',
    whatsapp: '5493400588073',
    minimoCompra: 0,
    ventaPorCaja: false,
    categoriasExcluidas: ['combos'],
    storageKeyCarrito: 'nanoya_carrito_v1',
    textoFooter: 'Pañales, artículos de bebé, limpieza y perfumería con envío a domicilio por Uber.',
    whatsappVisible: '+54 9 3400 58-8073',
    horarios: 'Lun a Sab · 9:00 — 12:30 y 17:00 — 20:30',
    zonasEnvio: ['San Nicolás', 'Villa Constitución', 'Empalme Villa Constitución'],
    textos: {
      linkCatalogo: 'Productos',
      ctaHeader: 'Hacer mi pedido',
      heroBarDestacado: 'Todo para tu bebé, sin salir de casa.',
      heroBarTexto: 'Pedí online y te lo llevamos con Uber.',
      heroBarBoton: 'Ver productos',
      contactoSubtitulo:
        'Estamos en Villa Constitución, Santa Fe. Enviamos con Uber a San Nicolás, Villa Constitución y Empalme Villa Constitución.',
    },
  },
}

export const config: ConfigCanal = CONFIG_POR_CANAL[CANAL]
