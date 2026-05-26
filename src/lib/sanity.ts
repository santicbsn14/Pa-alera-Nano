// src/lib/sanity.ts
import { createClient } from '@sanity/client'
import { createImageUrlBuilder } from '@sanity/image-url'
import type { Producto, Flete, PreguntaFrecuente, Promo, Categoria } from '../types'
import type { SanityImageSource } from '@sanity/image-url'

export const client = createClient({
  projectId: import.meta.env.VITE_SANITY_PROJECT_ID,
  dataset: import.meta.env.VITE_SANITY_DATASET ?? 'production',
  useCdn: true,
  apiVersion: '2024-01-01',
})

// ── Optimizador de imágenes ────────────────────────────────────────
const builder = createImageUrlBuilder(client)

export function urlFor(source: SanityImageSource) {
  return builder.image(source)
}

// ── Queries ────────────────────────────────────────────────────────

export async function getCategorias(): Promise<Categoria[]> {
  return client.fetch(`
    *[_type == "categoria" && activa == true] | order(orden asc, nombre asc) {
      _id,
      nombre,
      "slug": slug.current,
      orden,
      activa
    }
  `)
}

export async function getProductos(): Promise<Producto[]> {
  return client.fetch(`
    *[_type == "producto"] | order(precio asc) {
      _id,
      idSistema,
      nombre,
      marca,
      descripcion,
      foto,
      precio,
      descuento,
      categoria->{
        _id,
        nombre,
        "slug": slug.current,
        orden,
        activa
      },
      talle,
      tallesCombo,
      presentacion,
      enStock,
      vendePorCaja
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
    *[_type == "promo" && activa == true] | order(orden asc) {
      _id,
      alt,
      imagen,
      orden,
      activa
    }
  `)
}