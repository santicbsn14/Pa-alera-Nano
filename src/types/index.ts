// src/types/index.ts

export interface Producto {
  _id: string
  idSistema: string
  nombre: string
  descripcion?: string
  foto?: {
    asset: {
      _ref: string
    }
  }
  precio: number
  categoria: 'paniales' | 'toallitas' | 'higiene' | 'combos' | 'otros'
  talle?: 'RN' | 'P' | 'M' | 'G' | 'XG' | 'XXG' | 'XXXG' | 'unico'
  enStock: boolean
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
  titulo: string
  imagen?: {
    asset: {
      _ref: string
    }
  }
  activa: boolean
}

// Tipos auxiliares para filtros del catálogo
export type CategoriaFilter = Producto['categoria'] | 'todas'
export type TalleFilter = Producto['talle'] | 'todos'

export interface FiltrosCatalogo {
  categoria: CategoriaFilter
  talle: TalleFilter
  marca: string
  soloStock: boolean
  busqueda: string
}