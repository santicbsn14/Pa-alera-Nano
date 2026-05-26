// src/types/index.ts

export interface Categoria {
  _id: string
  nombre: string
  slug: string   // slug.current expandido en la query
  orden?: number
  activa: boolean
}

export interface Producto {
  _id: string
  idSistema: string
  nombre: string
  marca: string
  descripcion?: string
  foto?: {
    asset: {
      _ref: string
    }
  }
  precio: number
  descuento?: number
  categoria: Categoria
  talle?: string
  tallesCombo?: {
    nombreProducto: string
    talles: string
  }[]
  presentacion?: string
  enStock: boolean
  vendePorCaja?: boolean
}

export interface Flete {
  _id: string
  nombre: string
  logo?: {
    asset: {
      _ref: string
    }
  }
  descripcion?: string
  whatsapp?: string
  activo: boolean
}

export interface PreguntaFrecuente {
  _id: string
  pregunta: string
  respuesta: string
  orden?: number
}

export interface Promo {
  _id: string
  alt?: string
  imagen?: {
    asset: {
      _ref: string
    }
  }
  orden?: number
  activa: boolean
}

// Tipos auxiliares para filtros del catálogo
export type CategoriaFilter = string | 'todas'  // ahora es el slug dinámico
export type TalleFilter = Producto['talle'] | 'todos'

export interface FiltrosCatalogo {
  categoria: CategoriaFilter
  talle: TalleFilter
  marca: string
  soloStock: boolean
  soloOfertas: boolean  // ← NUEVO
  busqueda: string
}