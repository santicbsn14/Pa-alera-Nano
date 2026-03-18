// src/lib/sanity.ts
import { createClient } from '@sanity/client'
import imageUrlBuilder from '@sanity/image-url'
import type { Producto, Flete, PreguntaFrecuente, Promo } from '../types'
import type { SanityImageSource } from '@sanity/image-url'
export const client = createClient({
  projectId: import.meta.env.VITE_SANITY_PROJECT_ID,
  dataset: import.meta.env.VITE_SANITY_DATASET ?? 'production',
  useCdn: true, // CDN para queries de solo lectura — más rápido
  apiVersion: '2024-01-01',
})

// ── Optimizador de imágenes ────────────────────────────────────────
const builder = imageUrlBuilder(client)

export function urlFor(source: SanityImageSource) {
  return builder.image(source)
}

// ── Queries ────────────────────────────────────────────────────────

export async function getProductos(): Promise<Producto[]> {
  return client.fetch(`
    *[_type == "producto" && enStock == true] | order(categoria asc, nombre asc) {
      _id,
      idSistema,
      nombre,
      descripcion,
      foto,
      precio,
      categoria,
      talle,
      enStock
    }
  `)
}

export async function getFletes(): Promise<Flete[]> {
  return client.fetch(`
    *[_type == "flete" && activo == true] | order(nombre asc) {
      _id,
      nombre,
      logo,
      descripcion,
      whatsapp,
      activo
    }
  `)
}

export async function getPreguntas(): Promise<PreguntaFrecuente[]> {
  return client.fetch(`
    *[_type == "preguntaFrecuente"] | order(orden asc) {
      _id,
      pregunta,
      respuesta,
      orden
    }
  `)
}

export async function getPromos(): Promise<Promo[]> {
  return client.fetch(`
    *[_type == "promo" && activa == true] {
      _id,
      titulo,
      imagen,
      activa
    }
  `)
}

// ── Búsqueda y filtros (para el catálogo) ─────────────────────────
export async function getProductosFiltrados(params: {
  categoria?: string
  talle?: string
  busqueda?: string
}): Promise<Producto[]> {
  const { categoria, talle, busqueda } = params

  let filtros = `_type == "producto" && enStock == true`

  if (categoria && categoria !== 'todas') {
    filtros += ` && categoria == "${categoria}"`
  }

  if (talle && talle !== 'todos') {
    filtros += ` && talle == "${talle}"`
  }

  if (busqueda) {
    filtros += ` && nombre match "*${busqueda}*"`
  }

  return client.fetch(`
    *[${filtros}] | order(categoria asc, nombre asc) {
      _id,
      idSistema,
      nombre,
      descripcion,
      foto,
      precio,
      categoria,
      talle,
      enStock
    }
  `)
}