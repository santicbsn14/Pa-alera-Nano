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
  categoria:
    | 'combos'
    | 'paniales'
    | 'paniales_adulto'
    | 'apositos_adultos'
    | 'toallitas'
    | 'algodones'
    | 'oleo_calcareo'
    | 'desodorantes_cannon'
    | 'perfumes_cannon'
    | 'perfumeria_bebes'
    | 'mamaderas'
    | 'maternidad'
    | 'proteccion_femenina'
    | 'papeles_higienicos'
    | 'papeles_cocina'
    | 'panuelos_servilletas'
    | 'filos_gillette'
    | 'perfumeria_adultos'
    | 'tinturas_nantyr'
  talle?: string
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